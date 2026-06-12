alter table public.pyramid_creations
  add column mode text not null default 'free'
    constraint pyramid_creations_mode_check check (mode in ('free', 'challenge')),
  add column synergy_bonus integer not null default 0,
  add column cost_used integer not null default 0;

create index pyramid_creations_mode_score_idx
  on public.pyramid_creations (mode, is_public, total_score desc, created_at asc);

drop index if exists public.pyramid_creations_public_score_idx;
