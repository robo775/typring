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
  with counts as (
    select
      type_votes.type_system_id,
      type_votes.type_value_id,
      count(*) as vote_count,
      min(type_votes.updated_at) as first_voted_at
    from public.type_votes
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
