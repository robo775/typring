create table public.pyramid_creations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  background_id text not null,
  placed_parts jsonb not null default '[]'::jsonb,
  total_score integer not null default 0,
  part_count integer not null default 0,
  category_count integer not null default 0,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pyramid_creations_title_length check (char_length(trim(title)) between 1 and 80),
  constraint pyramid_creations_score_positive check (total_score >= 0 and part_count >= 0 and category_count >= 0),
  constraint pyramid_creations_parts_array check (jsonb_typeof(placed_parts) = 'array')
);

create index pyramid_creations_public_score_idx
  on public.pyramid_creations (is_public, total_score desc, created_at asc);

create index pyramid_creations_user_created_idx
  on public.pyramid_creations (user_id, created_at desc);

create trigger pyramid_creations_set_updated_at
before update on public.pyramid_creations
for each row execute function public.set_updated_at();

alter table public.pyramid_creations enable row level security;

create policy "public pyramid creations are readable"
on public.pyramid_creations for select
using (is_public = true or user_id = auth.uid() or public.is_admin());

create policy "authenticated users can create pyramid creations"
on public.pyramid_creations for insert
to authenticated
with check (auth.uid() = user_id);

create policy "owners can update pyramid creations"
on public.pyramid_creations for update
to authenticated
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

create policy "owners can delete pyramid creations"
on public.pyramid_creations for delete
to authenticated
using (auth.uid() = user_id or public.is_admin());
