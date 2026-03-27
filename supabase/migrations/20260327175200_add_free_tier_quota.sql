create table if not exists public.free_tier_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  period_key text not null,
  generation_count integer not null default 0 check (generation_count >= 0 and generation_count <= 5),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, period_key)
);

alter table public.free_tier_usage enable row level security;

create policy "Users can view their own free tier usage"
on public.free_tier_usage
for select
using (auth.uid() = user_id);

create policy "Users can insert their own free tier usage"
on public.free_tier_usage
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own free tier usage"
on public.free_tier_usage
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.set_free_tier_usage_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists free_tier_usage_set_updated_at on public.free_tier_usage;

create trigger free_tier_usage_set_updated_at
before update on public.free_tier_usage
for each row
execute function public.set_free_tier_usage_updated_at();

create or replace function public.resolve_subscription_plan()
returns text
language plpgsql
stable
as $$
declare
  claims jsonb := auth.jwt();
  raw_plan text := lower(coalesce(
    claims -> 'user_metadata' ->> 'plan',
    claims -> 'user_metadata' ->> 'tier',
    claims -> 'app_metadata' ->> 'plan',
    claims -> 'app_metadata' ->> 'tier',
    'free'
  ));
begin
  if raw_plan in ('premium', 'pro') then
    return 'premium';
  end if;

  if raw_plan in ('diamond', 'enterprise') then
    return 'diamond';
  end if;

  return 'free';
end;
$$;

create or replace function public.get_free_poster_quota_status()
returns table (
  allowed boolean,
  generation_count integer,
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

  select usage.generation_count
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
  generation_count integer,
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

  insert into public.free_tier_usage (user_id, period_key, generation_count)
  values (current_user_id, current_period, 0)
  on conflict (user_id, period_key) do nothing;

  update public.free_tier_usage
  set generation_count = generation_count + 1
  where user_id = current_user_id
    and period_key = current_period
    and generation_count < monthly_limit_value
  returning generation_count into next_count;

  select usage.generation_count
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

grant execute on function public.get_free_poster_quota_status() to authenticated;
grant execute on function public.consume_free_poster_quota() to authenticated;
