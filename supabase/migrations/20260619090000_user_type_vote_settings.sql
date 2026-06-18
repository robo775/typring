create table if not exists public.user_type_vote_settings (
  user_id uuid not null references public.profiles(id) on delete cascade,
  type_system_id uuid not null references public.type_systems(id) on delete cascade,
  allow_external_typing boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, type_system_id)
);

insert into public.user_type_vote_settings (
  allow_external_typing,
  type_system_id,
  user_id
)
select
  user_types.allow_external_typing,
  user_types.type_system_id,
  user_types.user_id
from public.user_types
on conflict (user_id, type_system_id) do update
set
  allow_external_typing = excluded.allow_external_typing,
  updated_at = now();

drop trigger if exists user_type_vote_settings_set_updated_at
on public.user_type_vote_settings;

create trigger user_type_vote_settings_set_updated_at
before update on public.user_type_vote_settings
for each row execute function public.set_updated_at();

alter table public.user_type_vote_settings enable row level security;

drop policy if exists "user type vote settings are publicly readable"
on public.user_type_vote_settings;

create policy "user type vote settings are publicly readable"
on public.user_type_vote_settings for select
using (true);

drop policy if exists "users can insert own type vote settings"
on public.user_type_vote_settings;

create policy "users can insert own type vote settings"
on public.user_type_vote_settings for insert
with check (auth.uid() = user_id);

drop policy if exists "users can update own type vote settings"
on public.user_type_vote_settings;

create policy "users can update own type vote settings"
on public.user_type_vote_settings for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users can delete own type vote settings"
on public.user_type_vote_settings;

create policy "users can delete own type vote settings"
on public.user_type_vote_settings for delete
using (auth.uid() = user_id);

create or replace function public.get_type_vote_summary(p_target_user_id uuid)
returns table (
  type_system_id uuid,
  type_value_id uuid,
  vote_count bigint,
  total_count bigint,
  first_voted_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  with allowed_systems as (
    select type_systems.id as type_system_id
    from public.profiles
    cross join public.type_systems
    left join public.user_type_vote_settings
      on user_type_vote_settings.user_id = profiles.id
     and user_type_vote_settings.type_system_id = type_systems.id
    where profiles.id = p_target_user_id
      and profiles.allow_external_typing = true
      and type_systems.is_active = true
      and coalesce(user_type_vote_settings.allow_external_typing, true) = true
  ),
  counts as (
    select
      type_votes.type_system_id,
      type_votes.type_value_id,
      count(*) as vote_count,
      min(type_votes.updated_at) as first_voted_at
    from public.type_votes
    join allowed_systems
      on allowed_systems.type_system_id = type_votes.type_system_id
    where type_votes.target_user_id = p_target_user_id
    group by type_votes.type_system_id, type_votes.type_value_id
  )
  select
    counts.type_system_id,
    counts.type_value_id,
    counts.vote_count,
    sum(counts.vote_count) over (
      partition by counts.type_system_id
    ) as total_count,
    counts.first_voted_at
  from counts;
$$;

grant execute on function public.get_type_vote_summary(uuid) to anon, authenticated;

create or replace function public.get_type_vote_rankings(
  p_type_system_id uuid default null,
  p_type_value_id uuid default null,
  p_limit integer default 50
)
returns table (
  target_user_id uuid,
  display_name text,
  twitter_handle text,
  avatar_url text,
  type_system_id uuid,
  type_value_id uuid,
  vote_count bigint,
  total_count bigint,
  percentage numeric
)
language sql
stable
security definer
set search_path = public
as $$
  with allowed_votes as (
    select type_votes.*
    from public.type_votes
    join public.profiles
      on profiles.id = type_votes.target_user_id
    join public.type_systems
      on type_systems.id = type_votes.type_system_id
    left join public.user_type_vote_settings
      on user_type_vote_settings.user_id = type_votes.target_user_id
     and user_type_vote_settings.type_system_id = type_votes.type_system_id
    where profiles.allow_external_typing = true
      and type_systems.is_active = true
      and coalesce(user_type_vote_settings.allow_external_typing, true) = true
      and (p_type_system_id is null or type_votes.type_system_id = p_type_system_id)
      and (p_type_value_id is null or type_votes.type_value_id = p_type_value_id)
  ),
  vote_counts as (
    select
      allowed_votes.target_user_id,
      allowed_votes.type_system_id,
      allowed_votes.type_value_id,
      count(*)::bigint as vote_count
    from allowed_votes
    group by
      allowed_votes.target_user_id,
      allowed_votes.type_system_id,
      allowed_votes.type_value_id
  ),
  totals as (
    select
      allowed_votes.target_user_id,
      allowed_votes.type_system_id,
      count(*)::bigint as total_count
    from allowed_votes
    group by allowed_votes.target_user_id, allowed_votes.type_system_id
  )
  select
    profiles.id as target_user_id,
    profiles.display_name,
    profiles.twitter_handle,
    profiles.avatar_url,
    vote_counts.type_system_id,
    vote_counts.type_value_id,
    vote_counts.vote_count,
    totals.total_count,
    case
      when totals.total_count = 0 then 0
      else round((vote_counts.vote_count::numeric / totals.total_count::numeric) * 100, 1)
    end as percentage
  from vote_counts
  join totals
    on totals.target_user_id = vote_counts.target_user_id
   and totals.type_system_id = vote_counts.type_system_id
  join public.profiles
    on profiles.id = vote_counts.target_user_id
  where profiles.twitter_handle is not null
  order by
    vote_counts.vote_count desc,
    percentage desc,
    profiles.display_name asc
  limit greatest(1, least(coalesce(p_limit, 50), 100));
$$;

grant execute on function public.get_type_vote_rankings(uuid, uuid, integer) to anon, authenticated;

drop policy if exists "authenticated users can vote" on public.type_votes;
drop policy if exists "voters can update their own votes" on public.type_votes;

create policy "authenticated users can vote"
on public.type_votes for insert
with check (
  auth.uid() = voter_user_id
  and target_user_id <> voter_user_id
  and exists (
    select 1
    from public.profiles
    join public.type_systems
      on type_systems.id = type_votes.type_system_id
    left join public.user_type_vote_settings
      on user_type_vote_settings.user_id = profiles.id
     and user_type_vote_settings.type_system_id = type_votes.type_system_id
    where profiles.id = type_votes.target_user_id
      and profiles.allow_external_typing = true
      and type_systems.is_active = true
      and coalesce(user_type_vote_settings.allow_external_typing, true) = true
  )
);

create policy "voters can update their own votes"
on public.type_votes for update
using (auth.uid() = voter_user_id)
with check (
  auth.uid() = voter_user_id
  and target_user_id <> voter_user_id
  and exists (
    select 1
    from public.profiles
    join public.type_systems
      on type_systems.id = type_votes.type_system_id
    left join public.user_type_vote_settings
      on user_type_vote_settings.user_id = profiles.id
     and user_type_vote_settings.type_system_id = type_votes.type_system_id
    where profiles.id = type_votes.target_user_id
      and profiles.allow_external_typing = true
      and type_systems.is_active = true
      and coalesce(user_type_vote_settings.allow_external_typing, true) = true
  )
);
