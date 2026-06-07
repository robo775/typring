import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type QuizRow = {
  attempt_count?: number;
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
  id: string;
  short_description: string | null;
  slug: string;
  status: string;
  title: string;
};

export default async function QuizzesPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data: publishedRows } = await supabase
    .from("quizzes")
    .select("id,creator_user_id,slug,title,short_description,status,creator:profiles!quizzes_creator_user_id_fkey(display_name,twitter_handle)")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(24);
  const { data: myRows } = user
    ? await supabase
        .from("quizzes")
        .select("id,creator_user_id,slug,title,short_description,status,creator:profiles!quizzes_creator_user_id_fkey(display_name,twitter_handle)")
        .eq("creator_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(12)
    : { data: [] };
  const publishedQuizzes = await withAttemptCounts(
    supabase,
    normalizeQuizzes(publishedRows)
  );
  const myQuizzes = await withAttemptCounts(supabase, normalizeQuizzes(myRows));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          eyebrow="Quizzes"
          title="診断を探す"
          description="Typringユーザーが作った、気軽に遊べる診断一覧です。"
        />
        <Link
          className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-soft"
          href="/quizzes/new"
        >
          <Plus className="h-4 w-4" />
          診断を作る
        </Link>
      </div>

      {myQuizzes.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-ink">自分が作った診断</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {myQuizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} showStatus />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-ink">新着診断</h2>
        {publishedQuizzes.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {publishedQuizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-500">
            公開中の診断はまだありません。
          </div>
        )}
      </section>
    </div>
  );
}

function QuizCard({
  quiz,
  showStatus = false
}: {
  quiz: QuizRow;
  showStatus?: boolean;
}) {
  const creator = Array.isArray(quiz.creator) ? quiz.creator[0] : quiz.creator;

  return (
    <Link
      className="block rounded-2xl border border-white bg-white/88 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
      href={`/quizzes/${quiz.slug}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-ringTeal">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-ink">{quiz.title}</h3>
            <p className="mt-1 truncate text-xs text-slate-500">
              by {creator?.display_name ?? "Typring user"}
            </p>
          </div>
        </div>
        {showStatus ? (
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
            {quiz.status === "published" ? "公開中" : "下書き"}
          </span>
        ) : null}
      </div>
      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
        {quiz.short_description ?? "説明文はまだありません。"}
      </p>
      <p className="mt-4 text-xs font-semibold text-slate-400">
        {quiz.attempt_count ?? 0}人が回答
      </p>
    </Link>
  );
}

async function withAttemptCounts(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  quizzes: QuizRow[]
) {
  if (quizzes.length === 0) {
    return quizzes;
  }

  const counts = new Map<string, number>();

  await Promise.all(
    quizzes.map(async (quiz) => {
      const { data } = await supabase.rpc("get_quiz_attempt_count", {
        p_quiz_id: quiz.id
      });
      counts.set(quiz.id, Number(data ?? 0));
    })
  );

  return quizzes.map((quiz) => ({
    ...quiz,
    attempt_count: counts.get(quiz.id) ?? 0
  }));
}

function normalizeQuizzes(rows: unknown) {
  return ((rows ?? []) as QuizRow[]).map((quiz) => ({
    ...quiz,
    creator: Array.isArray(quiz.creator) ? quiz.creator[0] ?? null : quiz.creator
  }));
}
