create table public.compatibility_results (
  id uuid primary key default gen_random_uuid(),
  requester_user_id uuid not null references public.profiles(id) on delete cascade,
  target_user_id uuid not null references public.profiles(id) on delete cascade,
  input_hash text not null,
  result_text text not null,
  model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint compatibility_results_no_self check (requester_user_id <> target_user_id),
  constraint compatibility_results_cached_unique
    unique (requester_user_id, target_user_id, input_hash)
);

create table public.ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  feature text not null,
  used_on date not null default current_date,
  created_at timestamptz not null default now()
);

create table public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_table text not null,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index compatibility_results_requester_target_idx
  on public.compatibility_results (requester_user_id, target_user_id, created_at desc);
create index ai_usage_logs_user_feature_day_idx
  on public.ai_usage_logs (user_id, feature, used_on);
create index admin_logs_admin_created_idx
  on public.admin_logs (admin_user_id, created_at desc);

create trigger compatibility_results_set_updated_at
before update on public.compatibility_results
for each row execute function public.set_updated_at();

alter table public.compatibility_results enable row level security;
alter table public.ai_usage_logs enable row level security;
alter table public.admin_logs enable row level security;

create policy "users can read their own compatibility results"
on public.compatibility_results for select
using (auth.uid() = requester_user_id);

create policy "users can insert their own compatibility results"
on public.compatibility_results for insert
with check (auth.uid() = requester_user_id);

create policy "users can read their own ai usage"
on public.ai_usage_logs for select
using (auth.uid() = user_id);

create policy "users can insert their own ai usage"
on public.ai_usage_logs for insert
with check (auth.uid() = user_id);

create policy "admins can read admin logs"
on public.admin_logs for select
using (public.is_admin());

create policy "admins can insert admin logs"
on public.admin_logs for insert
with check (public.is_admin());

