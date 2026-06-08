drop policy if exists "creators can delete unanswered polls" on public.polls;

create policy "creators can delete own polls"
on public.polls for delete
using (creator_user_id = auth.uid() or public.is_admin());
