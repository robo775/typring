create or replace function public.get_user_level_summaries(p_user_ids uuid[])
returns table (
  user_id uuid,
  total_points integer,
  level integer,
  next_level_points integer,
  self_type_points integer,
  votes_given_points integer,
  votes_received_points integer,
  poll_answer_points integer,
  poll_received_points integer,
  introductions_written_points integer,
  introductions_received_points integer
)
language sql
stable
security definer
set search_path = public
as $$
  with target_users as (
    select distinct unnest(p_user_ids) as user_id
  ),
  self_types as (
    select user_types.user_id, count(*)::integer * 5 as points
    from public.user_types
    join target_users on target_users.user_id = user_types.user_id
    group by user_types.user_id
  ),
  votes_given as (
    select type_votes.voter_user_id as user_id, count(*)::integer * 3 as points
    from public.type_votes
    join target_users on target_users.user_id = type_votes.voter_user_id
    group by type_votes.voter_user_id
  ),
  votes_received as (
    select type_votes.target_user_id as user_id, count(*)::integer * 3 as points
    from public.type_votes
    join target_users on target_users.user_id = type_votes.target_user_id
    group by type_votes.target_user_id
  ),
  poll_answers as (
    select poll_responses.respondent_user_id as user_id, count(*)::integer * 3 as points
    from public.poll_responses
    join target_users on target_users.user_id = poll_responses.respondent_user_id
    group by poll_responses.respondent_user_id
  ),
  poll_received as (
    select polls.creator_user_id as user_id, count(poll_responses.id)::integer as points
    from public.polls
    join target_users on target_users.user_id = polls.creator_user_id
    join public.poll_responses on poll_responses.poll_id = polls.id
    where poll_responses.respondent_user_id <> polls.creator_user_id
    group by polls.creator_user_id
  ),
  introductions_written as (
    select profile_introductions.author_user_id as user_id, count(*)::integer * 10 as points
    from public.profile_introductions
    join target_users on target_users.user_id = profile_introductions.author_user_id
    group by profile_introductions.author_user_id
  ),
  introductions_received as (
    select profile_introductions.target_user_id as user_id, count(*)::integer * 10 as points
    from public.profile_introductions
    join target_users on target_users.user_id = profile_introductions.target_user_id
    group by profile_introductions.target_user_id
  ),
  point_rows as (
    select
      target_users.user_id,
      coalesce(self_types.points, 0) as self_type_points,
      coalesce(votes_given.points, 0) as votes_given_points,
      coalesce(votes_received.points, 0) as votes_received_points,
      coalesce(poll_answers.points, 0) as poll_answer_points,
      coalesce(poll_received.points, 0) as poll_received_points,
      coalesce(introductions_written.points, 0) as introductions_written_points,
      coalesce(introductions_received.points, 0) as introductions_received_points
    from target_users
    left join self_types on self_types.user_id = target_users.user_id
    left join votes_given on votes_given.user_id = target_users.user_id
    left join votes_received on votes_received.user_id = target_users.user_id
    left join poll_answers on poll_answers.user_id = target_users.user_id
    left join poll_received on poll_received.user_id = target_users.user_id
    left join introductions_written on introductions_written.user_id = target_users.user_id
    left join introductions_received on introductions_received.user_id = target_users.user_id
  ),
  totals as (
    select
      point_rows.*,
      (
        point_rows.self_type_points
        + point_rows.votes_given_points
        + point_rows.votes_received_points
        + point_rows.poll_answer_points
        + point_rows.poll_received_points
        + point_rows.introductions_written_points
        + point_rows.introductions_received_points
      )::integer as total_points
    from point_rows
  )
  select
    totals.user_id,
    totals.total_points,
    (floor(totals.total_points / 50.0)::integer + 1) as level,
    ((floor(totals.total_points / 50.0)::integer + 1) * 50) as next_level_points,
    totals.self_type_points,
    totals.votes_given_points,
    totals.votes_received_points,
    totals.poll_answer_points,
    totals.poll_received_points,
    totals.introductions_written_points,
    totals.introductions_received_points
  from totals;
$$;

create or replace function public.get_user_level_summary(p_user_id uuid)
returns table (
  user_id uuid,
  total_points integer,
  level integer,
  next_level_points integer,
  self_type_points integer,
  votes_given_points integer,
  votes_received_points integer,
  poll_answer_points integer,
  poll_received_points integer,
  introductions_written_points integer,
  introductions_received_points integer
)
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.get_user_level_summaries(array[p_user_id]);
$$;
