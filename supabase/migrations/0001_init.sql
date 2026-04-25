-- ===== users table =====
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text not null,
  photo_url text,
  headline text,
  skills text[] default '{}',
  interests text[] default '{}',
  goal text,
  looking_for text[] default '{}',
  company text,
  college text,
  social jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ===== connections table =====
create table if not exists public.connections (
  id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  peer_id uuid not null references auth.users(id) on delete cascade,
  peer_snapshot jsonb not null,
  match_score int,
  match_reasons text[],
  icebreakers text[],
  collab_idea text,
  met_at text,
  created_at timestamptz default now()
);

create index if not exists connections_owner_idx on public.connections(owner_id);

-- ===== Row Level Security =====
alter table public.users enable row level security;
alter table public.connections enable row level security;

drop policy if exists "users_select_authed" on public.users;
drop policy if exists "users_insert_self" on public.users;
drop policy if exists "users_update_self" on public.users;
create policy "users_select_authed" on public.users for select to authenticated using (true);
create policy "users_insert_self" on public.users for insert to authenticated with check (auth.uid() = id);
create policy "users_update_self" on public.users for update to authenticated using (auth.uid() = id);

drop policy if exists "connections_select_owner" on public.connections;
drop policy if exists "connections_insert_owner" on public.connections;
drop policy if exists "connections_update_owner" on public.connections;
drop policy if exists "connections_delete_owner" on public.connections;
create policy "connections_select_owner" on public.connections for select to authenticated using (auth.uid() = owner_id);
create policy "connections_insert_owner" on public.connections for insert to authenticated with check (auth.uid() = owner_id);
create policy "connections_update_owner" on public.connections for update to authenticated using (auth.uid() = owner_id);
create policy "connections_delete_owner" on public.connections for delete to authenticated using (auth.uid() = owner_id);
