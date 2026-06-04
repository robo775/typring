drop policy if exists "users can insert their own profile" on public.profiles;
drop policy if exists "users can update their own profile" on public.profiles;

create policy "users can insert minimal own profile"
on public.profiles for insert
with check (
  auth.uid() = id
  and twitter_id is null
  and twitter_handle is null
  and avatar_url is null
  and subscription_tier = 'free'
  and is_admin = false
);

create policy "users can update safe own profile fields"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create or replace function public.prevent_profile_protected_field_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' or public.is_admin() then
    return new;
  end if;

  if new.is_admin is distinct from old.is_admin then
    raise exception 'Only admins can update is_admin';
  end if;

  if new.subscription_tier is distinct from old.subscription_tier then
    raise exception 'Only admins can update subscription_tier';
  end if;

  if new.twitter_id is distinct from old.twitter_id then
    raise exception 'Only trusted auth flows can update twitter_id';
  end if;

  if new.twitter_handle is distinct from old.twitter_handle then
    raise exception 'Only trusted auth flows can update twitter_handle';
  end if;

  if new.avatar_url is distinct from old.avatar_url then
    raise exception 'Only trusted auth flows can update avatar_url';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_prevent_admin_field_update on public.profiles;

create trigger profiles_prevent_protected_field_update
before update on public.profiles
for each row execute function public.prevent_profile_protected_field_update();

