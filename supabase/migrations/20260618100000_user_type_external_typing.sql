alter table public.user_types
add column if not exists allow_external_typing boolean not null default true;

create index if not exists user_types_external_typing_idx
  on public.user_types (user_id, type_system_id)
  where allow_external_typing = true;

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
  with allowed_target as (
    select profiles.id
    from public.profiles
    where profiles.id = p_target_user_id
      and profiles.allow_external_typing = true
  ),
  allowed_systems as (
    select user_types.type_system_id
    from public.user_types
    join allowed_target on allowed_target.id = user_types.user_id
    where user_types.allow_external_typing = true
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
    join public.user_types
      on user_types.user_id = type_votes.target_user_id
     and user_types.type_system_id = type_votes.type_system_id
    where profiles.allow_external_typing = true
      and user_types.allow_external_typing = true
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
  limit greatest(coalesce(p_limit, 50), 1);
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
    join public.user_types
      on user_types.user_id = profiles.id
     and user_types.type_system_id = type_votes.type_system_id
    where profiles.id = type_votes.target_user_id
      and profiles.allow_external_typing = true
      and user_types.allow_external_typing = true
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
    join public.user_types
      on user_types.user_id = profiles.id
     and user_types.type_system_id = type_votes.type_system_id
    where profiles.id = type_votes.target_user_id
      and profiles.allow_external_typing = true
      and user_types.allow_external_typing = true
  )
);
