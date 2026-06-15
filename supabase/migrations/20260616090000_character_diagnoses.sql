create table if not exists public.character_diagnoses (
  id uuid primary key default gen_random_uuid(),
  creator_user_id uuid not null references public.profiles(id) on delete cascade,
  work_title text,
  character_name text not null,
  image_url text,
  description text,
  related_url text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint character_diagnoses_work_title_length
    check (work_title is null or char_length(trim(work_title)) between 1 and 120),
  constraint character_diagnoses_character_name_length
    check (char_length(trim(character_name)) between 1 and 120),
  constraint character_diagnoses_description_length
    check (description is null or char_length(trim(description)) <= 800),
  constraint character_diagnoses_image_url_length
    check (image_url is null or char_length(trim(image_url)) <= 500),
  constraint character_diagnoses_related_url_length
    check (related_url is null or char_length(trim(related_url)) <= 500)
);

create table if not exists public.character_type_votes (
  id uuid primary key default gen_random_uuid(),
  character_diagnosis_id uuid not null
    references public.character_diagnoses(id) on delete cascade,
  voter_user_id uuid not null references public.profiles(id) on delete cascade,
  type_system_id uuid not null references public.type_systems(id) on delete restrict,
  type_value_id uuid not null references public.type_values(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint character_type_votes_unique
    unique (character_diagnosis_id, voter_user_id, type_system_id)
);

create index if not exists character_diagnoses_public_created_idx
  on public.character_diagnoses (is_public, deleted_at, created_at desc);

create index if not exists character_diagnoses_creator_idx
  on public.character_diagnoses (creator_user_id, created_at desc);

create index if not exists character_type_votes_character_idx
  on public.character_type_votes (character_diagnosis_id, type_system_id, updated_at);

drop trigger if exists character_diagnoses_set_updated_at
on public.character_diagnoses;

create trigger character_diagnoses_set_updated_at
before update on public.character_diagnoses
for each row execute function public.set_updated_at();

drop trigger if exists character_type_votes_set_updated_at
on public.character_type_votes;

create trigger character_type_votes_set_updated_at
before update on public.character_type_votes
for each row execute function public.set_updated_at();

alter table public.character_diagnoses enable row level security;
alter table public.character_type_votes enable row level security;

drop policy if exists "public can read character diagnoses"
on public.character_diagnoses;

create policy "public can read character diagnoses"
on public.character_diagnoses
for select
using (is_public = true and deleted_at is null);

drop policy if exists "authenticated users can create character diagnoses"
on public.character_diagnoses;

create policy "authenticated users can create character diagnoses"
on public.character_diagnoses
for insert
to authenticated
with check (auth.uid() = creator_user_id);

drop policy if exists "creators can update character diagnoses"
on public.character_diagnoses;

create policy "creators can update character diagnoses"
on public.character_diagnoses
for update
to authenticated
using (auth.uid() = creator_user_id)
with check (auth.uid() = creator_user_id);

drop policy if exists "public can read character type votes"
on public.character_type_votes;

create policy "public can read character type votes"
on public.character_type_votes
for select
using (
  exists (
    select 1
    from public.character_diagnoses
    where character_diagnoses.id = character_type_votes.character_diagnosis_id
      and character_diagnoses.is_public = true
      and character_diagnoses.deleted_at is null
  )
);

drop policy if exists "authenticated users can vote character types"
on public.character_type_votes;

create policy "authenticated users can vote character types"
on public.character_type_votes
for insert
to authenticated
with check (
  auth.uid() = voter_user_id
  and exists (
    select 1
    from public.character_diagnoses
    where character_diagnoses.id = character_type_votes.character_diagnosis_id
      and character_diagnoses.is_public = true
      and character_diagnoses.deleted_at is null
  )
);

drop policy if exists "voters can update own character type votes"
on public.character_type_votes;

create policy "voters can update own character type votes"
on public.character_type_votes
for update
to authenticated
using (auth.uid() = voter_user_id)
with check (
  auth.uid() = voter_user_id
  and exists (
    select 1
    from public.character_diagnoses
    where character_diagnoses.id = character_type_votes.character_diagnosis_id
      and character_diagnoses.is_public = true
      and character_diagnoses.deleted_at is null
  )
);

drop policy if exists "voters can delete own character type votes"
on public.character_type_votes;

create policy "voters can delete own character type votes"
on public.character_type_votes
for delete
to authenticated
using (auth.uid() = voter_user_id);
