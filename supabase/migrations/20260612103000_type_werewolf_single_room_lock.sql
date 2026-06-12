create index if not exists type_werewolf_rooms_host_user_idx
  on public.type_werewolf_rooms (host_user_id);

create index if not exists type_werewolf_players_user_idx
  on public.type_werewolf_players (user_id);

create or replace function public.prevent_multiple_type_werewolf_host_rooms()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1
    from public.type_werewolf_rooms
    where host_user_id = new.host_user_id
      and id <> new.id
  ) then
    raise exception 'A user can host only one type werewolf room at a time.';
  end if;

  if exists (
    select 1
    from public.type_werewolf_players
    where user_id = new.host_user_id
  ) then
    raise exception 'A user already participating in a type werewolf room cannot create another room.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_multiple_type_werewolf_host_rooms_insert
on public.type_werewolf_rooms;

create trigger prevent_multiple_type_werewolf_host_rooms_insert
before insert or update of host_user_id on public.type_werewolf_rooms
for each row execute function public.prevent_multiple_type_werewolf_host_rooms();

create or replace function public.prevent_multiple_type_werewolf_player_rooms()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1
    from public.type_werewolf_players
    where user_id = new.user_id
      and room_id <> new.room_id
  ) then
    raise exception 'A user can participate in only one type werewolf room at a time.';
  end if;

  if exists (
    select 1
    from public.type_werewolf_rooms
    where host_user_id = new.user_id
      and id <> new.room_id
  ) then
    raise exception 'A user already hosting a type werewolf room cannot join another room.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_multiple_type_werewolf_player_rooms_insert
on public.type_werewolf_players;

create trigger prevent_multiple_type_werewolf_player_rooms_insert
before insert or update of user_id, room_id on public.type_werewolf_players
for each row execute function public.prevent_multiple_type_werewolf_player_rooms();

drop policy if exists "hosts can delete type werewolf rooms"
on public.type_werewolf_rooms;

create policy "hosts can delete type werewolf rooms"
on public.type_werewolf_rooms
for delete
to authenticated
using (auth.uid() = host_user_id);
