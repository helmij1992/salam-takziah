create table if not exists public.enterprise_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  email text not null,
  requested_plan text not null default 'enterprise',
  status text not null default 'pending',
  source text not null default 'pricing',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.enterprise_requests enable row level security;

create or replace function public.is_superadmin()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  claims jsonb := auth.jwt();
  role_value text := lower(coalesce(
    claims -> 'app_metadata' ->> 'role',
    claims -> 'user_metadata' ->> 'role',
    ''
  ));
  flag_value text := lower(coalesce(
    claims -> 'app_metadata' ->> 'is_superadmin',
    claims -> 'user_metadata' ->> 'is_superadmin',
    'false'
  ));
  email_value text := lower(coalesce(
    claims ->> 'email',
    claims -> 'user_metadata' ->> 'email',
    ''
  ));
begin
  return role_value = 'superadmin'
    or flag_value = 'true'
    or email_value in ('ai.helmij@gmail.com', 'superadmin.test@salamtakziah.com');
end;
$$;

drop policy if exists "Superadmins can view enterprise requests" on public.enterprise_requests;
create policy "Superadmins can view enterprise requests"
on public.enterprise_requests
for select
using (public.is_superadmin());

drop policy if exists "Superadmins can update enterprise requests" on public.enterprise_requests;
create policy "Superadmins can update enterprise requests"
on public.enterprise_requests
for update
using (public.is_superadmin())
with check (public.is_superadmin());

drop policy if exists "Users can view their own enterprise requests" on public.enterprise_requests;
create policy "Users can view their own enterprise requests"
on public.enterprise_requests
for select
using (
  auth.uid() = user_id
  or lower(coalesce(auth.jwt() ->> 'email', '')) = lower(email)
);

create or replace function public.set_enterprise_requests_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists enterprise_requests_set_updated_at on public.enterprise_requests;
create trigger enterprise_requests_set_updated_at
before update on public.enterprise_requests
for each row
execute function public.set_enterprise_requests_updated_at();

create or replace function public.submit_enterprise_request(request_source text default 'pricing')
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  request_id uuid;
  current_email text := lower(coalesce(auth.jwt() ->> 'email', auth.jwt() -> 'user_metadata' ->> 'email', ''));
  current_user_id uuid := auth.uid();
begin
  if current_email = '' then
    raise exception 'Authenticated email is required to request Enterprise access.';
  end if;

  select id
  into request_id
  from public.enterprise_requests
  where lower(email) = current_email
    and status = 'pending'
  order by created_at desc
  limit 1;

  if request_id is not null then
    update public.enterprise_requests
    set user_id = coalesce(current_user_id, user_id),
        source = coalesce(request_source, source),
        updated_at = timezone('utc', now())
    where id = request_id;

    return request_id;
  end if;

  insert into public.enterprise_requests (user_id, email, requested_plan, status, source)
  values (current_user_id, current_email, 'enterprise', 'pending', coalesce(request_source, 'pricing'))
  returning id into request_id;

  return request_id;
end;
$$;

create or replace function public.admin_list_users()
returns table (
  user_id uuid,
  email text,
  subscription_plan text,
  app_role text,
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
    users.created_at,
    users.last_sign_in_at
  from auth.users
  order by users.created_at desc;
end;
$$;

create or replace function public.admin_list_enterprise_requests()
returns table (
  request_id uuid,
  user_id uuid,
  email text,
  requested_plan text,
  status text,
  source text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_superadmin() then
    raise exception 'Access denied';
  end if;

  return query
  select
    enterprise_requests.id,
    enterprise_requests.user_id,
    enterprise_requests.email,
    enterprise_requests.requested_plan,
    enterprise_requests.status,
    enterprise_requests.source,
    enterprise_requests.created_at,
    enterprise_requests.updated_at
  from public.enterprise_requests
  order by enterprise_requests.created_at desc;
end;
$$;

grant execute on function public.submit_enterprise_request(text) to authenticated;
grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_list_enterprise_requests() to authenticated;
