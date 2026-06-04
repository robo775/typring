alter table public.profiles
  add constraint profiles_display_name_length
  check (char_length(display_name) between 1 and 80);

alter table public.profiles
  add constraint profiles_bio_length
  check (bio is null or char_length(bio) <= 500);

