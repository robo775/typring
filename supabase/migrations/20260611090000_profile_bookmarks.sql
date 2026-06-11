create table if not exists public.profile_bookmarks (
  viewer_user_id uuid not null references public.profiles(id) on delete cascade,
  target_user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (viewer_user_id, target_user_id),
  constraint profile_bookmarks_no_self check (viewer_user_id <> target_user_id)
);

create index if not exists profile_bookmarks_viewer_created_idx
  on public.profile_bookmarks (viewer_user_id, created_at desc);

create index if not exists profile_bookmarks_target_idx
  on public.profile_bookmarks (target_user_id);

alter table public.profile_bookmarks enable row level security;

drop policy if exists "users can read their own profile bookmarks"
on public.profile_bookmarks;

create policy "users can read their own profile bookmarks"
on public.profile_bookmarks
for select
using (auth.uid() = viewer_user_id);

drop policy if exists "users can insert their own profile bookmarks"
on public.profile_bookmarks;

create policy "users can insert their own profile bookmarks"
on public.profile_bookmarks
for insert
with check (
  auth.uid() = viewer_user_id
  and viewer_user_id <> target_user_id
);

drop policy if exists "users can delete their own profile bookmarks"
on public.profile_bookmarks;

create policy "users can delete their own profile bookmarks"
on public.profile_bookmarks
for delete
using (auth.uid() = viewer_user_id);
