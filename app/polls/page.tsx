import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PollRow = {
  creator:
    | {
        display_name: string;
        twitter_handle: string | null;
      }
    | {
        display_name: string;
        twitter_handle: string | null;
      }[]
    | null;
  creator_user_id: string;
  description: string | null;
  id: string;
  question: string;
  slug: string;
  status: string;
  title: string;
};

type CountRow = {
  option_id: string;
  response_count: number;
};

export default async function PollsPage({
  searchParams
}: {
  searchParams?: { deleted?: string; error?: string };
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data: publishedRows } = await supabase
    .from("polls")
    .select("id,creator_user_id,slug,title,question,description,status,creator:profiles!polls_creator_user_id_fkey(display_name,twitter_handle)")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(24);
  const { data: myRows } = user
    ? await supabase
        .from("polls")
        .select("id,creator_user_id,slug,title,question,description,status,creator:profiles!polls_creator_user_id_fkey(display_name,twitter_handle)")
        .eq("creator_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(12)
    : { data: [] };
  const publishedPolls = await withResponseCounts(
    supabase,
    normalizePolls(publishedRows)
  );
  const myPolls = await withResponseCounts(supabase, normalizePolls(myRows));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          eyebrow="Polls"
          title="アンケート"
          description="質問を作って、回答結果をMBTIやエニアグラムなどの類型別に集計できます。"
        />
        <Link
          className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-soft"
          href="/polls/new"
        >
          <Plus className="h-4 w-4" />
          アンケートを作る
        </Link>
      </div>

      {searchParams?.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error}
        </p>
      ) : null}
      {searchParams?.deleted ? (
        <p className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-700">
          アンケートを削除しました。
        </p>
      ) : null}

      {myPolls.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-ink">自分が作ったアンケート</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {myPolls.map((poll) => (
              <PollCard key={poll.id} poll={poll} showStatus />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-ink">新着アンケート</h2>
        {publishedPolls.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {publishedPolls.map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-500">
            公開中のアンケートはまだありません。
          </div>
        )}
      </section>
    </div>
  );
}

function PollCard({
  poll,
  showStatus = false
}: {
  poll: PollRow & { response_count?: number };
  showStatus?: boolean;
}) {
  const creator = Array.isArray(poll.creator) ? poll.creator[0] : poll.creator;

  return (
    <Link
      className="block rounded-2xl border border-white bg-white/88 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
      href={`/polls/${poll.slug}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-ringTeal">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-ink">{poll.title}</h3>
            <p className="mt-1 truncate text-xs text-slate-500">
              by {creator?.display_name ?? "Typring user"}
            </p>
          </div>
        </div>
        {showStatus ? (
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
            {poll.status === "published" ? "公開中" : "下書き"}
          </span>
        ) : null}
      </div>
      <p className="mt-4 line-clamp-2 text-sm font-semibold leading-6 text-ink">
        {poll.question}
      </p>
      {poll.description ? (
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
          {poll.description}
        </p>
      ) : null}
      <p className="mt-4 text-xs font-semibold text-slate-400">
        {poll.response_count ?? 0}人が回答
      </p>
    </Link>
  );
}

async function withResponseCounts(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  polls: PollRow[]
) {
  if (polls.length === 0) {
    return polls;
  }

  const counts = new Map<string, number>();

  await Promise.all(
    polls.map(async (poll) => {
      const { data } = await supabase.rpc("get_poll_option_counts", {
        p_poll_id: poll.id
      });
      const total = ((data ?? []) as CountRow[]).reduce(
        (sum, row) => sum + Number(row.response_count ?? 0),
        0
      );
      counts.set(poll.id, total);
    })
  );

  return polls.map((poll) => ({
    ...poll,
    response_count: counts.get(poll.id) ?? 0
  }));
}

function normalizePolls(rows: unknown) {
  return ((rows ?? []) as PollRow[]).map((poll) => ({
    ...poll,
    creator: Array.isArray(poll.creator) ? poll.creator[0] ?? null : poll.creator
  }));
}
