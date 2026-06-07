alter table public.profiles
add column if not exists show_quiz_history boolean not null default true;

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  creator_user_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null unique,
  title text not null,
  short_description text,
  description text,
  thumbnail_url text,
  mode text not null default 'max_score'
    check (mode in ('max_score', 'comparison_group')),
  status text not null default 'draft'
    check (status in ('draft', 'published', 'unpublished')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint quizzes_slug_format check (slug ~ '^[a-z0-9][a-z0-9_-]{2,80}$'),
  constraint quizzes_title_length check (char_length(trim(title)) between 1 and 100),
  constraint quizzes_short_description_length check (
    short_description is null or char_length(short_description) <= 160
  ),
  constraint quizzes_description_length check (
    description is null or char_length(description) <= 2000
  )
);

create table public.quiz_variables (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  code text not null,
  name text not null,
  description text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quiz_variables_code_format check (code ~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,40}$'),
  constraint quiz_variables_quiz_code_unique unique (quiz_id, code),
  constraint quiz_variables_quiz_id_unique unique (quiz_id, id),
  constraint quiz_variables_name_length check (char_length(trim(name)) between 1 and 80)
);

create table public.quiz_variable_groups (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  name text not null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quiz_variable_groups_name_length check (char_length(trim(name)) between 1 and 80),
  constraint quiz_variable_groups_quiz_id_unique unique (quiz_id, id)
);

create table public.quiz_variable_group_members (
  group_id uuid not null references public.quiz_variable_groups(id) on delete cascade,
  quiz_id uuid not null,
  variable_id uuid not null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (group_id, variable_id),
  constraint quiz_variable_group_members_group_fk
    foreign key (quiz_id, group_id)
    references public.quiz_variable_groups(quiz_id, id)
    on delete cascade,
  constraint quiz_variable_group_members_variable_fk
    foreign key (quiz_id, variable_id)
    references public.quiz_variables(quiz_id, id)
    on delete cascade
);

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  body text not null,
  help_text text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quiz_questions_body_length check (char_length(trim(body)) between 1 and 300),
  constraint quiz_questions_help_text_length check (
    help_text is null or char_length(help_text) <= 500
  )
);

create table public.quiz_answer_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  body text not null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quiz_answer_options_body_length check (char_length(trim(body)) between 1 and 200),
  constraint quiz_answer_options_question_id_unique unique (question_id, id)
);

create table public.quiz_answer_effects (
  id uuid primary key default gen_random_uuid(),
  answer_option_id uuid not null references public.quiz_answer_options(id) on delete cascade,
  quiz_id uuid not null,
  variable_id uuid not null,
  score integer not null check (score between -20 and 20),
  created_at timestamptz not null default now(),
  constraint quiz_answer_effects_option_variable_unique unique (answer_option_id, variable_id),
  constraint quiz_answer_effects_variable_fk
    foreign key (quiz_id, variable_id)
    references public.quiz_variables(quiz_id, id)
    on delete cascade
);

create table public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  code text not null,
  name text not null,
  short_description text,
  description text,
  image_url text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quiz_results_code_format check (code ~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,80}$'),
  constraint quiz_results_quiz_code_unique unique (quiz_id, code),
  constraint quiz_results_quiz_id_unique unique (quiz_id, id),
  constraint quiz_results_name_length check (char_length(trim(name)) between 1 and 100),
  constraint quiz_results_short_description_length check (
    short_description is null or char_length(short_description) <= 200
  ),
  constraint quiz_results_description_length check (
    description is null or char_length(description) <= 3000
  )
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  result_id uuid references public.quiz_results(id) on delete set null,
  result_code text not null,
  created_at timestamptz not null default now()
);

create table public.quiz_attempt_answers (
  attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  answer_option_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (attempt_id, question_id),
  constraint quiz_attempt_answers_option_fk
    foreign key (question_id, answer_option_id)
    references public.quiz_answer_options(question_id, id)
    on delete restrict
);

create table public.quiz_attempt_scores (
  attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  quiz_id uuid not null,
  variable_id uuid not null,
  score integer not null,
  primary key (attempt_id, variable_id),
  constraint quiz_attempt_scores_variable_fk
    foreign key (quiz_id, variable_id)
    references public.quiz_variables(quiz_id, id)
    on delete restrict
);

create table public.quiz_reports (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  reporter_user_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null
    check (reason in ('inappropriate', 'misleading', 'copyright', 'spam', 'other')),
  body text,
  status text not null default 'open'
    check (status in ('open', 'reviewed', 'dismissed', 'actioned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quiz_reports_reporter_quiz_unique unique (quiz_id, reporter_user_id),
  constraint quiz_reports_body_length check (body is null or char_length(body) <= 500)
);

create index quizzes_status_created_idx on public.quizzes (status, created_at desc);
create index quizzes_creator_idx on public.quizzes (creator_user_id, created_at desc);
create index quiz_variables_quiz_position_idx on public.quiz_variables (quiz_id, position);
create index quiz_questions_quiz_position_idx on public.quiz_questions (quiz_id, position);
create index quiz_answer_options_question_position_idx on public.quiz_answer_options (question_id, position);
create index quiz_results_quiz_position_idx on public.quiz_results (quiz_id, position);
create index quiz_attempts_quiz_created_idx on public.quiz_attempts (quiz_id, created_at desc);
create index quiz_attempts_user_created_idx on public.quiz_attempts (user_id, created_at desc);
create index quiz_attempt_scores_variable_idx on public.quiz_attempt_scores (variable_id, score);

create trigger quizzes_set_updated_at
before update on public.quizzes
for each row execute function public.set_updated_at();

create trigger quiz_variables_set_updated_at
before update on public.quiz_variables
for each row execute function public.set_updated_at();

create trigger quiz_variable_groups_set_updated_at
before update on public.quiz_variable_groups
for each row execute function public.set_updated_at();

create trigger quiz_questions_set_updated_at
before update on public.quiz_questions
for each row execute function public.set_updated_at();

create trigger quiz_answer_options_set_updated_at
before update on public.quiz_answer_options
for each row execute function public.set_updated_at();

create trigger quiz_results_set_updated_at
before update on public.quiz_results
for each row execute function public.set_updated_at();

create trigger quiz_reports_set_updated_at
before update on public.quiz_reports
for each row execute function public.set_updated_at();

create or replace function public.can_read_quiz(p_quiz_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.quizzes
    where quizzes.id = p_quiz_id
      and (
        quizzes.status = 'published'
        or quizzes.creator_user_id = auth.uid()
        or public.is_admin()
      )
  );
$$;

create or replace function public.can_edit_quiz(p_quiz_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.quizzes
    where quizzes.id = p_quiz_id
      and (quizzes.creator_user_id = auth.uid() or public.is_admin())
  );
$$;

create or replace function public.has_answered_quiz(p_quiz_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.quiz_attempts
    where quiz_attempts.quiz_id = p_quiz_id
      and quiz_attempts.user_id = auth.uid()
  );
$$;

create or replace function public.get_public_quiz_history(
  p_user_id uuid,
  p_limit integer default 10
)
returns table (
  attempt_id uuid,
  quiz_slug text,
  quiz_title text,
  result_name text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    quiz_attempts.id as attempt_id,
    quizzes.slug as quiz_slug,
    quizzes.title as quiz_title,
    quiz_results.name as result_name,
    quiz_attempts.created_at
  from public.quiz_attempts
  join public.profiles
    on profiles.id = quiz_attempts.user_id
  join public.quizzes
    on quizzes.id = quiz_attempts.quiz_id
  left join public.quiz_results
    on quiz_results.id = quiz_attempts.result_id
  where quiz_attempts.user_id = p_user_id
    and profiles.show_quiz_history = true
    and quizzes.status = 'published'
  order by quiz_attempts.created_at desc
  limit greatest(1, least(coalesce(p_limit, 10), 20));
$$;

create or replace function public.get_recent_quiz_attempts(
  p_quiz_id uuid,
  p_limit integer default 20
)
returns table (
  attempt_id uuid,
  user_id uuid,
  display_name text,
  twitter_handle text,
  avatar_url text,
  result_name text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    quiz_attempts.id as attempt_id,
    profiles.id as user_id,
    profiles.display_name,
    profiles.twitter_handle,
    profiles.avatar_url,
    quiz_results.name as result_name,
    quiz_attempts.created_at
  from public.quiz_attempts
  join public.profiles
    on profiles.id = quiz_attempts.user_id
  left join public.quiz_results
    on quiz_results.id = quiz_attempts.result_id
  where quiz_attempts.quiz_id = p_quiz_id
    and profiles.show_quiz_history = true
  order by quiz_attempts.created_at desc
  limit greatest(1, least(coalesce(p_limit, 20), 20));
$$;

create or replace function public.get_quiz_attempt_count(p_quiz_id uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::bigint
  from public.quiz_attempts
  join public.quizzes
    on quizzes.id = quiz_attempts.quiz_id
  where quiz_attempts.quiz_id = p_quiz_id
    and public.can_read_quiz(quizzes.id);
$$;

alter table public.quizzes enable row level security;
alter table public.quiz_variables enable row level security;
alter table public.quiz_variable_groups enable row level security;
alter table public.quiz_variable_group_members enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_answer_options enable row level security;
alter table public.quiz_answer_effects enable row level security;
alter table public.quiz_results enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_attempt_answers enable row level security;
alter table public.quiz_attempt_scores enable row level security;
alter table public.quiz_reports enable row level security;

create policy "read visible quizzes"
on public.quizzes for select
using (status = 'published' or creator_user_id = auth.uid() or public.is_admin());

create policy "authenticated users can create quizzes"
on public.quizzes for insert
to authenticated
with check (creator_user_id = auth.uid());

create policy "creators can update own quizzes"
on public.quizzes for update
to authenticated
using (creator_user_id = auth.uid() or public.is_admin())
with check (creator_user_id = auth.uid() or public.is_admin());

create policy "creators can delete unanswered quizzes"
on public.quizzes for delete
to authenticated
using (
  (creator_user_id = auth.uid() or public.is_admin())
  and not exists (
    select 1 from public.quiz_attempts where quiz_attempts.quiz_id = quizzes.id
  )
);

create policy "read variables for visible quizzes"
on public.quiz_variables for select
using (public.can_read_quiz(quiz_id));

create policy "edit variables for own quizzes"
on public.quiz_variables for all
to authenticated
using (public.can_edit_quiz(quiz_id))
with check (public.can_edit_quiz(quiz_id));

create policy "read groups for visible quizzes"
on public.quiz_variable_groups for select
using (public.can_read_quiz(quiz_id));

create policy "edit groups for own quizzes"
on public.quiz_variable_groups for all
to authenticated
using (public.can_edit_quiz(quiz_id))
with check (public.can_edit_quiz(quiz_id));

create policy "read group members for visible quizzes"
on public.quiz_variable_group_members for select
using (public.can_read_quiz(quiz_id));

create policy "edit group members for own quizzes"
on public.quiz_variable_group_members for all
to authenticated
using (public.can_edit_quiz(quiz_id))
with check (public.can_edit_quiz(quiz_id));

create policy "read questions for visible quizzes"
on public.quiz_questions for select
using (public.can_read_quiz(quiz_id));

create policy "edit questions for own quizzes"
on public.quiz_questions for all
to authenticated
using (public.can_edit_quiz(quiz_id))
with check (public.can_edit_quiz(quiz_id));

create policy "read answer options for visible quizzes"
on public.quiz_answer_options for select
using (
  exists (
    select 1
    from public.quiz_questions
    where quiz_questions.id = quiz_answer_options.question_id
      and public.can_read_quiz(quiz_questions.quiz_id)
  )
);

create policy "edit answer options for own quizzes"
on public.quiz_answer_options for all
to authenticated
using (
  exists (
    select 1
    from public.quiz_questions
    where quiz_questions.id = quiz_answer_options.question_id
      and public.can_edit_quiz(quiz_questions.quiz_id)
  )
)
with check (
  exists (
    select 1
    from public.quiz_questions
    where quiz_questions.id = quiz_answer_options.question_id
      and public.can_edit_quiz(quiz_questions.quiz_id)
  )
);

create policy "read answer effects for visible quizzes"
on public.quiz_answer_effects for select
using (public.can_read_quiz(quiz_id));

create policy "edit answer effects for own quizzes"
on public.quiz_answer_effects for all
to authenticated
using (public.can_edit_quiz(quiz_id))
with check (public.can_edit_quiz(quiz_id));

create policy "read results for visible quizzes"
on public.quiz_results for select
using (public.can_read_quiz(quiz_id));

create policy "edit results for own quizzes"
on public.quiz_results for all
to authenticated
using (public.can_edit_quiz(quiz_id))
with check (public.can_edit_quiz(quiz_id));

create policy "users can read own attempts"
on public.quiz_attempts for select
to authenticated
using (
  user_id = auth.uid()
  or public.can_edit_quiz(quiz_id)
);

create policy "users can create own attempts"
on public.quiz_attempts for insert
to authenticated
with check (user_id = auth.uid() and public.can_read_quiz(quiz_id));

create policy "users can read allowed attempt answers"
on public.quiz_attempt_answers for select
to authenticated
using (
  exists (
    select 1
    from public.quiz_attempts
    where quiz_attempts.id = quiz_attempt_answers.attempt_id
      and (
        quiz_attempts.user_id = auth.uid()
        or public.can_edit_quiz(quiz_attempts.quiz_id)
      )
  )
);

create policy "users can create own attempt answers"
on public.quiz_attempt_answers for insert
to authenticated
with check (
  exists (
    select 1
    from public.quiz_attempts
    where quiz_attempts.id = quiz_attempt_answers.attempt_id
      and quiz_attempts.user_id = auth.uid()
  )
);

create policy "users can read allowed attempt scores"
on public.quiz_attempt_scores for select
to authenticated
using (
  exists (
    select 1
    from public.quiz_attempts
    where quiz_attempts.id = quiz_attempt_scores.attempt_id
      and (
        quiz_attempts.user_id = auth.uid()
        or public.can_edit_quiz(quiz_attempts.quiz_id)
      )
  )
);

create policy "users can create own attempt scores"
on public.quiz_attempt_scores for insert
to authenticated
with check (
  exists (
    select 1
    from public.quiz_attempts
    where quiz_attempts.id = quiz_attempt_scores.attempt_id
      and quiz_attempts.user_id = auth.uid()
  )
);

create policy "authenticated users can report quizzes"
on public.quiz_reports for insert
to authenticated
with check (reporter_user_id = auth.uid() and public.can_read_quiz(quiz_id));

create policy "admins can read quiz reports"
on public.quiz_reports for select
to authenticated
using (public.is_admin());

create policy "admins can update quiz reports"
on public.quiz_reports for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant execute on function public.get_public_quiz_history(uuid, integer) to anon, authenticated;
grant execute on function public.get_recent_quiz_attempts(uuid, integer) to anon, authenticated;
grant execute on function public.get_quiz_attempt_count(uuid) to anon, authenticated;
