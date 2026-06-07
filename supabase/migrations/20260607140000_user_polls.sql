create table public.polls (
  id uuid primary key default gen_random_uuid(),
  creator_user_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null unique,
  title text not null,
  question text not null,
  description text,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint polls_slug_format check (slug ~ '^[a-z0-9][a-z0-9_-]{2,80}$'),
  constraint polls_title_length check (char_length(trim(title)) between 1 and 100),
  constraint polls_question_length check (char_length(trim(question)) between 1 and 240),
  constraint polls_description_length check (description is null or char_length(description) <= 1000)
);

create table public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  body text not null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  constraint poll_options_body_length check (char_length(trim(body)) between 1 and 120),
  constraint poll_options_position_positive check (position between 1 and 10),
  constraint poll_options_poll_id_id_unique unique (poll_id, id),
  constraint poll_options_position_unique unique (poll_id, position)
);

create table public.poll_responses (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  respondent_user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint poll_responses_user_unique unique (poll_id, respondent_user_id),
  constraint poll_responses_option_belongs_to_poll
    foreign key (poll_id, option_id)
    references public.poll_options(poll_id, id)
    on delete cascade
);

create index polls_status_created_idx on public.polls (status, created_at desc);
create index polls_creator_created_idx on public.polls (creator_user_id, created_at desc);
create index poll_options_poll_position_idx on public.poll_options (poll_id, position);
create index poll_responses_poll_option_idx on public.poll_responses (poll_id, option_id);
create index poll_responses_user_idx on public.poll_responses (respondent_user_id, created_at desc);

create trigger polls_set_updated_at
before update on public.polls
for each row execute function public.set_updated_at();

create trigger poll_responses_set_updated_at
before update on public.poll_responses
for each row execute function public.set_updated_at();

create or replace function public.can_read_poll(p_poll_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.polls
    where polls.id = p_poll_id
      and (
        polls.status = 'published'
        or polls.creator_user_id = auth.uid()
        or public.is_admin()
      )
  );
$$;

create or replace function public.get_poll_option_counts(p_poll_id uuid)
returns table (
  option_id uuid,
  response_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    poll_options.id as option_id,
    count(poll_responses.id)::bigint as response_count
  from public.poll_options
  left join public.poll_responses
    on poll_responses.option_id = poll_options.id
  where poll_options.poll_id = p_poll_id
    and public.can_read_poll(p_poll_id)
  group by poll_options.id, poll_options.position
  order by poll_options.position asc;
$$;

create or replace function public.get_poll_type_breakdown(
  p_poll_id uuid,
  p_type_system_id uuid
)
returns table (
  option_id uuid,
  type_value_id uuid,
  response_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    poll_responses.option_id,
    user_types.type_value_id,
    count(*)::bigint as response_count
  from public.poll_responses
  join public.user_types
    on user_types.user_id = poll_responses.respondent_user_id
    and user_types.type_system_id = p_type_system_id
  where poll_responses.poll_id = p_poll_id
    and public.can_read_poll(p_poll_id)
  group by poll_responses.option_id, user_types.type_value_id;
$$;

alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_responses enable row level security;

create policy "read visible polls"
on public.polls for select
using (status = 'published' or creator_user_id = auth.uid() or public.is_admin());

create policy "authenticated users can create polls"
on public.polls for insert
with check (auth.uid() = creator_user_id);

create policy "creators can update own polls"
on public.polls for update
using (creator_user_id = auth.uid() or public.is_admin())
with check (creator_user_id = auth.uid() or public.is_admin());

create policy "creators can delete unanswered polls"
on public.polls for delete
using (
  creator_user_id = auth.uid()
  and not exists (
    select 1 from public.poll_responses where poll_responses.poll_id = polls.id
  )
);

create policy "read options for visible polls"
on public.poll_options for select
using (public.can_read_poll(poll_id));

create policy "edit options for own polls"
on public.poll_options for all
using (
  exists (
    select 1 from public.polls
    where polls.id = poll_options.poll_id
      and (polls.creator_user_id = auth.uid() or public.is_admin())
  )
)
with check (
  exists (
    select 1 from public.polls
    where polls.id = poll_options.poll_id
      and (polls.creator_user_id = auth.uid() or public.is_admin())
  )
);

create policy "users can read their own poll responses"
on public.poll_responses for select
using (respondent_user_id = auth.uid() or public.is_admin());

create policy "authenticated users can answer visible polls"
on public.poll_responses for insert
with check (
  respondent_user_id = auth.uid()
  and public.can_read_poll(poll_id)
);

create policy "users can update own poll responses"
on public.poll_responses for update
using (respondent_user_id = auth.uid())
with check (
  respondent_user_id = auth.uid()
  and public.can_read_poll(poll_id)
);

create policy "users can delete own poll responses"
on public.poll_responses for delete
using (respondent_user_id = auth.uid());
