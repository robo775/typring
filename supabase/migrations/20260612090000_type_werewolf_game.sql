create table if not exists public.type_werewolf_rooms (
  id uuid primary key default gen_random_uuid(),
  room_code text not null unique,
  host_user_id uuid not null references public.profiles(id) on delete cascade,
  type_system_id uuid not null references public.type_systems(id) on delete restrict,
  status text not null default 'waiting'
    check (status in ('waiting', 'playing', 'finished')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create table if not exists public.type_werewolf_players (
  player_id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.type_werewolf_rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  character_code text not null
    check (
      character_code in (
        'james',
        'victoria',
        'ijun',
        'catherine',
        'masayoshi',
        'clara',
        'xiyue',
        'mohamed'
      )
    ),
  is_alive boolean not null default true,
  remaining_guess_tickets integer not null default 2
    check (remaining_guess_tickets >= 0),
  joined_at timestamptz not null default now(),
  eliminated_at timestamptz,
  unique (room_id, user_id),
  unique (room_id, character_code)
);

create table if not exists public.type_werewolf_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.type_werewolf_rooms(id) on delete cascade,
  player_id uuid not null references public.type_werewolf_players(player_id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 240),
  created_at timestamptz not null default now()
);

create table if not exists public.type_werewolf_guesses (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.type_werewolf_rooms(id) on delete cascade,
  guesser_player_id uuid not null references public.type_werewolf_players(player_id) on delete cascade,
  target_player_id uuid not null references public.type_werewolf_players(player_id) on delete cascade,
  guessed_type_value_id uuid not null references public.type_values(id) on delete restrict,
  is_correct boolean not null,
  created_at timestamptz not null default now(),
  constraint type_werewolf_no_self_guess check (guesser_player_id <> target_player_id)
);

create index if not exists type_werewolf_rooms_code_idx
  on public.type_werewolf_rooms (room_code);

create index if not exists type_werewolf_players_room_idx
  on public.type_werewolf_players (room_id);

create index if not exists type_werewolf_messages_room_created_idx
  on public.type_werewolf_messages (room_id, created_at);

create index if not exists type_werewolf_guesses_room_created_idx
  on public.type_werewolf_guesses (room_id, created_at);

drop trigger if exists type_werewolf_rooms_set_updated_at
on public.type_werewolf_rooms;

create trigger type_werewolf_rooms_set_updated_at
before update on public.type_werewolf_rooms
for each row execute function public.set_updated_at();

create or replace function public.is_type_werewolf_room_participant(p_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.type_werewolf_players
    where room_id = p_room_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.is_type_werewolf_room_host(p_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.type_werewolf_rooms
    where id = p_room_id
      and host_user_id = auth.uid()
  );
$$;

alter table public.type_werewolf_rooms enable row level security;
alter table public.type_werewolf_players enable row level security;
alter table public.type_werewolf_messages enable row level security;
alter table public.type_werewolf_guesses enable row level security;

create policy "authenticated users can create type werewolf rooms"
on public.type_werewolf_rooms
for insert
to authenticated
with check (auth.uid() = host_user_id);

create policy "authenticated users can read type werewolf rooms"
on public.type_werewolf_rooms
for select
to authenticated
using (true);

create policy "hosts can update type werewolf rooms"
on public.type_werewolf_rooms
for update
to authenticated
using (auth.uid() = host_user_id)
with check (auth.uid() = host_user_id);

create policy "authenticated users can read type werewolf players"
on public.type_werewolf_players
for select
to authenticated
using (
  public.is_type_werewolf_room_participant(room_id)
  or public.is_type_werewolf_room_host(room_id)
  or exists (
    select 1
    from public.type_werewolf_rooms
    where type_werewolf_rooms.id = room_id
      and type_werewolf_rooms.status = 'waiting'
  )
);

create policy "users can join type werewolf rooms"
on public.type_werewolf_players
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users can update their waiting type werewolf player"
on public.type_werewolf_players
for update
to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.type_werewolf_rooms
    where type_werewolf_rooms.id = room_id
      and type_werewolf_rooms.status = 'waiting'
  )
)
with check (auth.uid() = user_id);

create policy "users can leave type werewolf rooms"
on public.type_werewolf_players
for delete
to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.type_werewolf_rooms
    where type_werewolf_rooms.id = room_id
      and type_werewolf_rooms.status = 'waiting'
  )
);

create policy "participants can read type werewolf messages"
on public.type_werewolf_messages
for select
to authenticated
using (public.is_type_werewolf_room_participant(room_id));

create policy "participants can send type werewolf messages"
on public.type_werewolf_messages
for insert
to authenticated
with check (
  public.is_type_werewolf_room_participant(room_id)
  and exists (
    select 1
    from public.type_werewolf_players
    where player_id = type_werewolf_messages.player_id
      and room_id = type_werewolf_messages.room_id
      and user_id = auth.uid()
      and is_alive = true
  )
);

create policy "participants can read type werewolf guesses"
on public.type_werewolf_guesses
for select
to authenticated
using (public.is_type_werewolf_room_participant(room_id));

create policy "participants can create type werewolf guesses"
on public.type_werewolf_guesses
for insert
to authenticated
with check (
  public.is_type_werewolf_room_participant(room_id)
  and exists (
    select 1
    from public.type_werewolf_players
    where player_id = type_werewolf_guesses.guesser_player_id
      and room_id = type_werewolf_guesses.room_id
      and user_id = auth.uid()
      and is_alive = true
  )
);
