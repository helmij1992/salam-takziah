alter table public.free_tier_usage
add column if not exists download_count integer not null default 0 check (download_count >= 0 and download_count <= 5);

update public.free_tier_usage
set download_count = greatest(download_count, generation_count);

create or replace function public.get_free_poster_quota_status()
returns table (
  allowed boolean,
  download_count integer,
  remaining_count integer,
  monthly_limit integer,
  period_key text,
  plan text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_period text := to_char(timezone('utc', now()), 'YYYY-MM');
  resolved_plan text := public.resolve_subscription_plan();
  current_count integer := 0;
  monthly_limit_value constant integer := 5;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if resolved_plan <> 'free' then
    return query
    select true, 0, monthly_limit_value, monthly_limit_value, current_period, resolved_plan;
    return;
  end if;

  select usage.download_count
  into current_count
  from public.free_tier_usage as usage
  where usage.user_id = current_user_id
    and usage.period_key = current_period;

  current_count := coalesce(current_count, 0);

  return query
  select
    current_count < monthly_limit_value,
    current_count,
    greatest(0, monthly_limit_value - current_count),
    monthly_limit_value,
    current_period,
    resolved_plan;
end;
$$;

create or replace function public.consume_free_poster_quota()
returns table (
  allowed boolean,
  download_count integer,
  remaining_count integer,
  monthly_limit integer,
  period_key text,
  plan text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_period text := to_char(timezone('utc', now()), 'YYYY-MM');
  resolved_plan text := public.resolve_subscription_plan();
  current_count integer := 0;
  next_count integer;
  monthly_limit_value constant integer := 5;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if resolved_plan <> 'free' then
    return query
    select true, 0, monthly_limit_value, monthly_limit_value, current_period, resolved_plan;
    return;
  end if;

  insert into public.free_tier_usage (user_id, period_key, generation_count, download_count)
  values (current_user_id, current_period, 0, 0)
  on conflict (user_id, period_key) do nothing;

  update public.free_tier_usage
  set download_count = download_count + 1
  where user_id = current_user_id
    and period_key = current_period
    and download_count < monthly_limit_value
  returning download_count into next_count;

  select usage.download_count
  into current_count
  from public.free_tier_usage as usage
  where usage.user_id = current_user_id
    and usage.period_key = current_period;

  current_count := coalesce(current_count, 0);

  return query
  select
    next_count is not null,
    current_count,
    greatest(0, monthly_limit_value - current_count),
    monthly_limit_value,
    current_period,
    resolved_plan;
end;
$$;

create or replace function public.admin_list_users()
returns table (
  user_id uuid,
  email text,
  subscription_plan text,
  app_role text,
  generated_posters integer,
  downloaded_posters integer,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_superadmin() then
    raise exception 'Access denied';
  end if;

  return query
  select
    users.id,
    users.email::text,
    lower(coalesce(
      users.raw_user_meta_data ->> 'plan',
      users.raw_user_meta_data ->> 'tier',
      users.raw_app_meta_data ->> 'plan',
      users.raw_app_meta_data ->> 'tier',
      'free'
    )) as subscription_plan,
    lower(coalesce(
      users.raw_app_meta_data ->> 'role',
      users.raw_user_meta_data ->> 'role',
      case
        when lower(coalesce(users.email::text, '')) in ('ai.helmij@gmail.com', 'superadmin.test@salamtakziah.com') then 'superadmin'
        else 'user'
      end
    )) as app_role,
    coalesce(usage.generated_posters, 0) as generated_posters,
    coalesce(usage.downloaded_posters, 0) as downloaded_posters,
    users.created_at,
    users.last_sign_in_at
  from auth.users
  left join public.workspace_state as workspace
    on workspace.user_id = users.id
  left join lateral (
    select
      count(*) filter (where event ->> 'type' = 'poster_generated')::integer as generated_posters,
      count(*) filter (where event ->> 'type' = 'poster_downloaded')::integer as downloaded_posters
    from jsonb_array_elements(coalesce(workspace.analytics, '[]'::jsonb)) as event
  ) as usage
    on true
  order by users.created_at desc;
end;
$$;
