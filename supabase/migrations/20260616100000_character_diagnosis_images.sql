insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'character-diagnosis-images',
  'character-diagnosis-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.character_diagnoses
  add column if not exists image_path text;

alter table public.character_diagnoses
  drop constraint if exists character_diagnoses_image_path_length;

alter table public.character_diagnoses
  add constraint character_diagnoses_image_path_length
    check (image_path is null or char_length(trim(image_path)) <= 500);

drop policy if exists "character diagnosis images are publicly readable"
on storage.objects;

create policy "character diagnosis images are publicly readable"
on storage.objects
for select
using (bucket_id = 'character-diagnosis-images');

drop policy if exists "authenticated users can upload character diagnosis images"
on storage.objects;

create policy "authenticated users can upload character diagnosis images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'character-diagnosis-images'
  and owner = auth.uid()
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "owners can update character diagnosis images"
on storage.objects;

create policy "owners can update character diagnosis images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'character-diagnosis-images'
  and owner = auth.uid()
)
with check (
  bucket_id = 'character-diagnosis-images'
  and owner = auth.uid()
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "owners can delete character diagnosis images"
on storage.objects;

create policy "owners can delete character diagnosis images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'character-diagnosis-images'
  and owner = auth.uid()
);
