create index if not exists profile_introductions_author_updated_idx
  on public.profile_introductions (
    author_user_id,
    updated_at desc,
    created_at desc
  );
