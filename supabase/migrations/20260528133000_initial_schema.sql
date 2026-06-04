create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  twitter_id text unique,
  twitter_handle text unique,
  display_name text not null,
  avatar_url text,
  bio text,
  subscription_tier text not null default 'free'
    check (subscription_tier in ('free', 'supporter')),
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.type_systems (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint type_systems_code_format check (code ~ '^[a-z0-9][a-z0-9_-]*$')
);

create table public.type_values (
  id uuid primary key default gen_random_uuid(),
  type_system_id uuid not null references public.type_systems(id) on delete restrict,
  code text not null,
  name text not null,
  description text,
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint type_values_code_format check (code ~ '^[A-Za-z0-9][A-Za-z0-9_-]*$'),
  constraint type_values_system_code_unique unique (type_system_id, code),
  constraint type_values_system_id_unique unique (type_system_id, id)
);

create table public.user_types (
  user_id uuid not null references public.profiles(id) on delete cascade,
  type_system_id uuid not null references public.type_systems(id) on delete restrict,
  type_value_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, type_system_id),
  constraint user_types_value_belongs_to_system
    foreign key (type_system_id, type_value_id)
    references public.type_values(type_system_id, id)
    on delete restrict
);

create table public.type_votes (
  id uuid primary key default gen_random_uuid(),
  target_user_id uuid not null references public.profiles(id) on delete cascade,
  voter_user_id uuid not null references public.profiles(id) on delete cascade,
  type_system_id uuid not null references public.type_systems(id) on delete restrict,
  type_value_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint type_votes_no_self_vote check (target_user_id <> voter_user_id),
  constraint type_votes_target_voter_system_unique
    unique (target_user_id, voter_user_id, type_system_id),
  constraint type_votes_value_belongs_to_system
    foreign key (type_system_id, type_value_id)
    references public.type_values(type_system_id, id)
    on delete restrict
);

create index profiles_twitter_handle_idx on public.profiles (twitter_handle);
create index type_systems_active_position_idx on public.type_systems (is_active, position);
create index type_values_system_active_position_idx
  on public.type_values (type_system_id, is_active, position);
create index user_types_type_value_idx on public.user_types (type_system_id, type_value_id);
create index type_votes_target_system_idx on public.type_votes (target_user_id, type_system_id);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger type_systems_set_updated_at
before update on public.type_systems
for each row execute function public.set_updated_at();

create trigger type_values_set_updated_at
before update on public.type_values
for each row execute function public.set_updated_at();

create trigger user_types_set_updated_at
before update on public.user_types
for each row execute function public.set_updated_at();

create trigger type_votes_set_updated_at
before update on public.type_votes
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select profiles.is_admin
      from public.profiles
      where profiles.id = auth.uid()
    ),
    false
  );
$$;

create or replace function public.prevent_profile_admin_field_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.is_admin is distinct from old.is_admin then
    raise exception 'Only admins can update is_admin';
  end if;

  if new.subscription_tier is distinct from old.subscription_tier then
    raise exception 'Only admins can update subscription_tier';
  end if;

  return new;
end;
$$;

create trigger profiles_prevent_admin_field_update
before update on public.profiles
for each row execute function public.prevent_profile_admin_field_update();

alter table public.profiles enable row level security;
alter table public.type_systems enable row level security;
alter table public.type_values enable row level security;
alter table public.user_types enable row level security;
alter table public.type_votes enable row level security;

create policy "profiles are publicly readable"
on public.profiles for select
using (true);

create policy "users can insert their own profile"
on public.profiles for insert
with check (auth.uid() = id);

create policy "users can update their own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "admins can update profiles"
on public.profiles for update
using (public.is_admin())
with check (public.is_admin());

create policy "type systems are publicly readable"
on public.type_systems for select
using (true);

create policy "admins can insert type systems"
on public.type_systems for insert
with check (public.is_admin());

create policy "admins can update type systems"
on public.type_systems for update
using (public.is_admin())
with check (public.is_admin());

create policy "type values are publicly readable"
on public.type_values for select
using (true);

create policy "admins can insert type values"
on public.type_values for insert
with check (public.is_admin());

create policy "admins can update type values"
on public.type_values for update
using (public.is_admin())
with check (public.is_admin());

create policy "user types are publicly readable"
on public.user_types for select
using (true);

create policy "users can insert their own types"
on public.user_types for insert
with check (auth.uid() = user_id);

create policy "users can update their own types"
on public.user_types for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users can delete their own types"
on public.user_types for delete
using (auth.uid() = user_id);

create policy "authenticated users can vote"
on public.type_votes for insert
with check (
  auth.uid() = voter_user_id
  and target_user_id <> voter_user_id
);

create policy "voters can update their own votes"
on public.type_votes for update
using (auth.uid() = voter_user_id)
with check (
  auth.uid() = voter_user_id
  and target_user_id <> voter_user_id
);

create policy "voters can delete their own votes"
on public.type_votes for delete
using (auth.uid() = voter_user_id);

comment on table public.type_votes is
  'Raw votes are not publicly selectable. Use a future aggregate view or RPC for anonymous percentages.';

