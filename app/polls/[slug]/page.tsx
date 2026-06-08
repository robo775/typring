import Link from "next/link";
import { notFound } from "next/navigation";
import { BarChart3 } from "lucide-react";
import { PollOwnerActions } from "@/components/polls/poll-owner-actions";
import { PollShareActions } from "@/components/polls/poll-share-actions";
import { submitPollResponse } from "@/lib/polls/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PollOption = {
  body: string;
  id: string;
  position: number;
};

type CountRow = {
  option_id: string;
  response_count: number;
};

export default async function PollDetailPage({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams?: { answered?: string; error?: string; updated?: string };
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data: poll } = await supabase
    .from("polls")
    .select("id,creator_user_id,slug,title,question,description,status,creator:profiles!polls_creator_user_id_fkey(display_name,twitter_handle)")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!poll) {
    notFound();
  }

  const { data: optionRows } = await supabase
    .from("poll_options")
    .select("id,body,position")
    .eq("poll_id", poll.id)
    .order("position", { ascending: true });
  const options = (optionRows ?? []) as PollOption[];
  const { data: countRows } = await supabase.rpc("get_poll_option_counts", {
    p_poll_id: poll.id
  });
  const counts = new Map(
    ((countRows ?? []) as CountRow[]).map((row) => [
      row.option_id,
      Number(row.response_count ?? 0)
    ])
  );
  const total = Array.from(counts.values()).reduce((sum, count) => sum + count, 0);
  const { data: myResponse } = user
    ? await supabase
        .from("poll_responses")
        .select("option_id")
        .eq("poll_id", poll.id)
        .eq("respondent_user_id", user.id)
        .maybeSingle()
    : { data: null };
  const creator = Array.isArray(poll.creator) ? poll.creator[0] : poll.creator;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const pollUrl = `${appUrl.replace(/\/$/, "")}/polls/${poll.slug}`;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_360px]">
      <section className="rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ringViolet">
              Poll
            </p>
            <h1 className="mt-2 text-2xl font-bold text-ink">{poll.title}</h1>
            <p className="mt-2 text-sm text-slate-500">
              by {creator?.display_name ?? "Typring user"}
            </p>
          </div>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink"
            href={`/polls/${poll.slug}/stats`}
          >
            <BarChart3 className="h-4 w-4" />
            類型別集計を見る
          </Link>
        </div>
        <div className="mt-6 rounded-2xl bg-slate-50 p-5">
          <h2 className="text-lg font-bold text-ink">{poll.question}</h2>
          {poll.description ? (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {poll.description}
            </p>
          ) : null}
        </div>

        {searchParams?.answered ? (
          <p className="mt-4 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-700">
            回答を保存しました。
          </p>
        ) : null}
        {searchParams?.updated ? (
          <p className="mt-4 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-700">
            アンケートを更新しました。
          </p>
        ) : null}
        {searchParams?.error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {searchParams.error}
          </p>
        ) : null}

        {user ? (
          <form action={submitPollResponse} className="mt-6 space-y-3">
            <input name="poll_id" type="hidden" value={poll.id} />
            <input name="slug" type="hidden" value={poll.slug} />
            {options.map((option) => (
              <label
                className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-ringTeal"
                key={option.id}
              >
                <input
                  className="mt-1"
                  defaultChecked={myResponse?.option_id === option.id}
                  name="option_id"
                  required
                  type="radio"
                  value={option.id}
                />
                <span className="text-sm font-semibold leading-6 text-ink">
                  {option.body}
                </span>
              </label>
            ))}
            <button
              className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-soft"
              type="submit"
            >
              {myResponse ? "回答を更新する" : "回答する"}
            </button>
          </form>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-500">
            回答するにはログインしてください。
          </div>
        )}
      </section>

      <aside className="space-y-4">
        {user?.id === poll.creator_user_id ? (
          <PollOwnerActions pollId={poll.id} slug={poll.slug} />
        ) : null}
        <PollShareActions
          pollTitle={poll.title}
          pollUrl={pollUrl}
          question={poll.question}
        />
        <section className="rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
          <h2 className="text-lg font-bold text-ink">現在の回答</h2>
          <p className="mt-1 text-sm text-slate-500">{total}人が回答</p>
          <div className="mt-4 space-y-4">
            {options.map((option) => {
              const count = counts.get(option.id) ?? 0;
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

              return (
                <div key={option.id}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-ink">{option.body}</span>
                    <span className="shrink-0 tabular-nums text-slate-500">
                      {count}人 / {percentage}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-ringTeal to-ringViolet"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </aside>
    </div>
  );
}
