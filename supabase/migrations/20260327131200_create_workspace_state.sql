create extension if not exists "pgcrypto";

create table if not exists public.workspace_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  drafts jsonb not null default '[]'::jsonb,
  batches jsonb not null default '[]'::jsonb,
  analytics jsonb not null default '[]'::jsonb,
  team jsonb not null default '[]'::jsonb,
  api_credentials jsonb not null default '[]'::jsonb,
  import_jobs jsonb not null default '[]'::jsonb,
  recycle_bin jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.workspace_state enable row level security;

drop policy if exists "Users can view their own workspace state" on public.workspace_state;
create policy "Users can view their own workspace state"
on public.workspace_state
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own workspace state" on public.workspace_state;
create policy "Users can insert their own workspace state"
on public.workspace_state
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own workspace state" on public.workspace_state;
create policy "Users can update their own workspace state"
on public.workspace_state
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.set_workspace_state_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists workspace_state_set_updated_at on public.workspace_state;

create trigger workspace_state_set_updated_at
before update on public.workspace_state
for each row
execute function public.set_workspace_state_updated_at();
