create table if not exists public.profile_introductions (
  id uuid primary key default gen_random_uuid(),
  target_user_id uuid not null references public.profiles(id) on delete cascade,
  author_user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profile_introductions_target_author_unique unique (target_user_id, author_user_id),
  constraint profile_introductions_no_self check (target_user_id <> author_user_id),
  constraint profile_introductions_body_length check (char_length(trim(body)) between 1 and 300)
);

create index if not exists profile_introductions_target_created_idx
  on public.profile_introductions (target_user_id, created_at desc);

create index if not exists profile_introductions_author_idx
  on public.profile_introductions (author_user_id);

drop trigger if exists profile_introductions_set_updated_at on public.profile_introductions;
create trigger profile_introductions_set_updated_at
before update on public.profile_introductions
for each row execute function public.set_updated_at();

alter table public.profile_introductions enable row level security;

drop policy if exists "profile introductions are publicly readable"
  on public.profile_introductions;
create policy "profile introductions are publicly readable"
on public.profile_introductions for select
using (true);

drop policy if exists "authenticated users can create own introductions"
  on public.profile_introductions;
create policy "authenticated users can create own introductions"
on public.profile_introductions for insert
to authenticated
with check (
  auth.uid() = author_user_id
  and target_user_id <> author_user_id
  and char_length(trim(body)) between 1 and 300
);

drop policy if exists "authors can update their own introductions"
  on public.profile_introductions;
create policy "authors can update their own introductions"
on public.profile_introductions for update
to authenticated
using (auth.uid() = author_user_id)
with check (
  auth.uid() = author_user_id
  and target_user_id <> author_user_id
  and char_length(trim(body)) between 1 and 300
);

drop policy if exists "Authors can delete their own introductions"
  on public.profile_introductions;
create policy "Authors can delete their own introductions"
on public.profile_introductions
for delete
to authenticated
using (auth.uid() = author_user_id);
