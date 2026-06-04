create table public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null default 'twitter'
    check (provider in ('twitter')),
  provider_user_id text not null,
  handle text not null,
  avatar_url text,
  last_follow_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint social_accounts_provider_user_unique unique (provider, provider_user_id),
  constraint social_accounts_provider_user_id_unique unique (provider, user_id),
  constraint social_accounts_handle_format check (handle ~ '^[A-Za-z0-9_]{1,15}$')
);

create table public.x_follow_edges (
  follower_account_id uuid not null references public.social_accounts(id) on delete cascade,
  following_account_id uuid not null references public.social_accounts(id) on delete cascade,
  cached_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  primary key (follower_account_id, following_account_id),
  constraint x_follow_edges_no_self_edge
    check (follower_account_id <> following_account_id)
);

create index social_accounts_user_provider_idx
  on public.social_accounts (user_id, provider);
create index social_accounts_provider_user_id_idx
  on public.social_accounts (provider, provider_user_id);
create index x_follow_edges_following_idx
  on public.x_follow_edges (following_account_id);

create trigger social_accounts_set_updated_at
before update on public.social_accounts
for each row execute function public.set_updated_at();

alter table public.social_accounts enable row level security;
alter table public.x_follow_edges enable row level security;

create policy "social accounts are publicly readable"
on public.social_accounts for select
using (true);

create policy "users can read follow edges involving themselves"
on public.x_follow_edges for select
using (
  exists (
    select 1
    from public.social_accounts
    where social_accounts.id in (
      x_follow_edges.follower_account_id,
      x_follow_edges.following_account_id
    )
    and social_accounts.user_id = auth.uid()
  )
);

create policy "admins can insert social accounts"
on public.social_accounts for insert
with check (public.is_admin());

create policy "admins can update social accounts"
on public.social_accounts for update
using (public.is_admin())
with check (public.is_admin());

create policy "admins can insert follow edges"
on public.x_follow_edges for insert
with check (public.is_admin());

create policy "admins can update follow edges"
on public.x_follow_edges for update
using (public.is_admin())
with check (public.is_admin());

create policy "admins can delete follow edges"
on public.x_follow_edges for delete
using (public.is_admin());

create or replace function public.get_x_mutual_profile_ids(p_user_id uuid)
returns table (mutual_user_id uuid)
language sql
stable
security definer
set search_path = public
as $$
  select target_accounts.user_id as mutual_user_id
  from public.social_accounts viewer_accounts
  join public.x_follow_edges viewer_follows
    on viewer_follows.follower_account_id = viewer_accounts.id
  join public.social_accounts target_accounts
    on target_accounts.id = viewer_follows.following_account_id
  join public.x_follow_edges target_follows
    on target_follows.follower_account_id = target_accounts.id
   and target_follows.following_account_id = viewer_accounts.id
  where auth.uid() = p_user_id
    and viewer_accounts.user_id = p_user_id
    and viewer_accounts.provider = 'twitter'
    and target_accounts.provider = 'twitter'
    and target_accounts.user_id <> p_user_id;
$$;

create or replace function public.is_x_mutual(
  p_viewer_user_id uuid,
  p_target_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.get_x_mutual_profile_ids(p_viewer_user_id) mutuals
    where auth.uid() = p_viewer_user_id
      and mutuals.mutual_user_id = p_target_user_id
  );
$$;

grant execute on function public.get_x_mutual_profile_ids(uuid) to authenticated;
grant execute on function public.is_x_mutual(uuid, uuid) to authenticated;

comment on table public.x_follow_edges is
  'Cached X follow edges between Typring-registered users only. Do not store unregistered X accounts.';

