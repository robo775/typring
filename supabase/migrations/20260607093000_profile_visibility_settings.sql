alter table public.profiles
add column if not exists allow_external_typing boolean not null default true;
