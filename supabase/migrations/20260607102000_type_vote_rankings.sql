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
  with vote_counts as (
    select
      type_votes.target_user_id,
      type_votes.type_system_id,
      type_votes.type_value_id,
      count(*)::bigint as vote_count
    from public.type_votes
    where
      (p_type_system_id is null or type_votes.type_system_id = p_type_system_id)
      and (p_type_value_id is null or type_votes.type_value_id = p_type_value_id)
    group by
      type_votes.target_user_id,
      type_votes.type_system_id,
      type_votes.type_value_id
  ),
  totals as (
    select
      type_votes.target_user_id,
      type_votes.type_system_id,
      count(*)::bigint as total_count
    from public.type_votes
    where p_type_system_id is null or type_votes.type_system_id = p_type_system_id
    group by type_votes.target_user_id, type_votes.type_system_id
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
