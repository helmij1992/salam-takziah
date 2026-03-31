create table if not exists public.subscription_plan_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  requested_plan text not null check (requested_plan in ('premium')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requester_note text,
  reviewer_note text,
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists subscription_plan_requests_one_pending_per_user
on public.subscription_plan_requests (user_id)
where status = 'pending';

alter table public.subscription_plan_requests enable row level security;

drop policy if exists "Users can view their own subscription requests" on public.subscription_plan_requests;
create policy "Users can view their own subscription requests"
on public.subscription_plan_requests
for select
using (auth.uid() = user_id or public.is_superadmin());

drop policy if exists "Users can insert their own subscription requests" on public.subscription_plan_requests;
create policy "Users can insert their own subscription requests"
on public.subscription_plan_requests
for insert
with check (auth.uid() = user_id);

drop policy if exists "Superadmins can update subscription requests" on public.subscription_plan_requests;
create policy "Superadmins can update subscription requests"
on public.subscription_plan_requests
for update
using (public.is_superadmin())
with check (public.is_superadmin());

create table if not exists public.subscription_plan_overrides (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null check (plan in ('free', 'premium')),
  approved_request_id uuid references public.subscription_plan_requests (id) on delete set null,
  approved_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.subscription_plan_overrides enable row level security;

drop policy if exists "Users can view their own subscription overrides" on public.subscription_plan_overrides;
create policy "Users can view their own subscription overrides"
on public.subscription_plan_overrides
for select
using (auth.uid() = user_id or public.is_superadmin());

drop policy if exists "Superadmins can manage subscription overrides" on public.subscription_plan_overrides;
create policy "Superadmins can manage subscription overrides"
on public.subscription_plan_overrides
for all
using (public.is_superadmin())
with check (public.is_superadmin());

create or replace function public.set_subscription_plan_request_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists subscription_plan_requests_set_updated_at on public.subscription_plan_requests;
create trigger subscription_plan_requests_set_updated_at
before update on public.subscription_plan_requests
for each row
execute function public.set_subscription_plan_request_updated_at();

create or replace function public.set_subscription_plan_override_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists subscription_plan_overrides_set_updated_at on public.subscription_plan_overrides;
create trigger subscription_plan_overrides_set_updated_at
before update on public.subscription_plan_overrides
for each row
execute function public.set_subscription_plan_override_updated_at();

create or replace function public.resolve_subscription_plan()
returns text
language plpgsql
stable
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  override_plan text;
  claims jsonb := auth.jwt();
  raw_plan text := lower(coalesce(
    claims -> 'user_metadata' ->> 'plan',
    claims -> 'user_metadata' ->> 'tier',
    claims -> 'app_metadata' ->> 'plan',
    claims -> 'app_metadata' ->> 'tier',
    'free'
  ));
begin
  if current_user_id is not null then
    select lower(plan)
    into override_plan
    from public.subscription_plan_overrides
    where user_id = current_user_id;

    if override_plan in ('premium', 'pro') then
      return 'premium';
    end if;

    if override_plan = 'free' then
      return 'free';
    end if;
  end if;

  if raw_plan in ('premium', 'pro') then
    return 'premium';
  end if;

  if raw_plan in ('diamond', 'enterprise') then
    return 'diamond';
  end if;

  return 'free';
end;
$$;

create or replace function public.get_subscription_access_status()
returns table (
  effective_plan text,
  plan_source text,
  request_status text,
  request_id uuid,
  requested_plan text,
  reviewed_at timestamptz,
  reviewer_note text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  override_plan text;
  latest_request record;
  claims jsonb := auth.jwt();
  raw_plan text := lower(coalesce(
    claims -> 'user_metadata' ->> 'plan',
    claims -> 'user_metadata' ->> 'tier',
    claims -> 'app_metadata' ->> 'plan',
    claims -> 'app_metadata' ->> 'tier',
    'free'
  ));
  resolved_plan text := 'free';
  resolved_source text := 'default';
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select lower(plan)
  into override_plan
  from public.subscription_plan_overrides
  where user_id = current_user_id;

  if override_plan in ('premium', 'pro') then
    resolved_plan := 'premium';
    resolved_source := 'override';
  elsif raw_plan in ('premium', 'pro') then
    resolved_plan := 'premium';
    resolved_source := 'metadata';
  elsif raw_plan in ('diamond', 'enterprise') then
    resolved_plan := 'diamond';
    resolved_source := 'metadata';
  end if;

  select
    request_row.id,
    request_row.status,
    request_row.requested_plan,
    request_row.reviewed_at,
    request_row.reviewer_note
  into latest_request
  from public.subscription_plan_requests as request_row
  where request_row.user_id = current_user_id
  order by request_row.created_at desc
  limit 1;

  return query
  select
    resolved_plan,
    resolved_source,
    latest_request.status,
    latest_request.id,
    latest_request.requested_plan,
    latest_request.reviewed_at,
    latest_request.reviewer_note;
end;
$$;

create or replace function public.submit_subscription_plan_request(requested_plan_value text default 'premium', requester_note_value text default null)
returns table (
  request_id uuid,
  status text,
  requested_plan text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  existing_request_id uuid;
  next_requested_plan text := lower(coalesce(requested_plan_value, 'premium'));
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if next_requested_plan <> 'premium' then
    raise exception 'Unsupported plan request';
  end if;

  if public.resolve_subscription_plan() <> 'free' then
    raise exception 'Your account already has elevated access';
  end if;

  select id
  into existing_request_id
  from public.subscription_plan_requests
  where user_id = current_user_id
    and status = 'pending'
  limit 1;

  if existing_request_id is not null then
    update public.subscription_plan_requests
    set requester_note = coalesce(requester_note_value, requester_note),
        updated_at = timezone('utc', now())
    where id = existing_request_id;
  else
    insert into public.subscription_plan_requests (user_id, requested_plan, requester_note)
    values (current_user_id, next_requested_plan, requester_note_value)
    returning id into existing_request_id;
  end if;

  return query
  select id, status, requested_plan
  from public.subscription_plan_requests
  where id = existing_request_id;
end;
$$;

create or replace function public.admin_list_subscription_plan_requests()
returns table (
  request_id uuid,
  user_id uuid,
  email text,
  requested_plan text,
  status text,
  requester_note text,
  reviewer_note text,
  reviewed_at timestamptz,
  created_at timestamptz
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
    request_row.id,
    request_row.user_id,
    users.email::text,
    request_row.requested_plan,
    request_row.status,
    request_row.requester_note,
    request_row.reviewer_note,
    request_row.reviewed_at,
    request_row.created_at
  from public.subscription_plan_requests as request_row
  join auth.users as users
    on users.id = request_row.user_id
  order by
    case request_row.status when 'pending' then 0 else 1 end,
    request_row.created_at desc;
end;
$$;

create or replace function public.admin_resolve_subscription_plan_request(
  request_id_value uuid,
  approve boolean,
  reviewer_note_value text default null
)
returns table (
  request_id uuid,
  status text,
  effective_plan text,
  user_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_request public.subscription_plan_requests%rowtype;
  next_status text := case when approve then 'approved' else 'rejected' end;
  next_plan text := case when approve then 'premium' else 'free' end;
begin
  if not public.is_superadmin() then
    raise exception 'Access denied';
  end if;

  select *
  into target_request
  from public.subscription_plan_requests
  where id = request_id_value;

  if target_request.id is null then
    raise exception 'Request not found';
  end if;

  update public.subscription_plan_requests
  set status = next_status,
      reviewer_note = reviewer_note_value,
      reviewed_by = current_user_id,
      reviewed_at = timezone('utc', now())
  where id = request_id_value;

  if approve then
    insert into public.subscription_plan_overrides (user_id, plan, approved_request_id, approved_by)
    values (target_request.user_id, 'premium', target_request.id, current_user_id)
    on conflict (user_id)
    do update set
      plan = excluded.plan,
      approved_request_id = excluded.approved_request_id,
      approved_by = excluded.approved_by,
      updated_at = timezone('utc', now());
  end if;

  return query
  select
    target_request.id,
    next_status,
    next_plan,
    target_request.user_id;
end;
$$;

grant execute on function public.get_subscription_access_status() to authenticated;
grant execute on function public.submit_subscription_plan_request(text, text) to authenticated;
grant execute on function public.admin_list_subscription_plan_requests() to authenticated;
grant execute on function public.admin_resolve_subscription_plan_request(uuid, boolean, text) to authenticated;
