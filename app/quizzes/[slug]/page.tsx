import Link from "next/link";
import { notFound } from "next/navigation";
import { Play, UserRound } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { submitQuizAttempt } from "@/lib/quizzes/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type QuizPageProps = {
  params: { slug: string };
  searchParams?: { error?: string };
};

type QuestionRow = {
  body: string;
  help_text: string | null;
  id: string;
  options: {
    body: string;
    id: string;
    position: number;
  }[];
  position: number;
};

export default async function QuizDetailPage({
  params,
  searchParams
}: QuizPageProps) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id,creator_user_id,slug,title,short_description,description,status,creator:profiles!quizzes_creator_user_id_fkey(display_name,twitter_handle)")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!quiz || (quiz.status !== "published" && quiz.creator_user_id !== user?.id)) {
    notFound();
  }

  const { data: questionRows } = await supabase
    .from("quiz_questions")
    .select("id,body,help_text,position,options:quiz_answer_options(id,body,position)")
    .eq("quiz_id", quiz.id)
    .order("position", { ascending: true });
  const questions = ((questionRows ?? []) as unknown as QuestionRow[]).map(
    (question) => ({
      ...question,
      options: [...(question.options ?? [])].sort(
        (a, b) => a.position - b.position
      )
    })
  );
  const { data: attemptCount } = await supabase.rpc("get_quiz_attempt_count", {
    p_quiz_id: quiz.id
  });
  const { data: recentAttempts } = await supabase.rpc("get_recent_quiz_attempts", {
    p_limit: 20,
    p_quiz_id: quiz.id
  });
  const creator = Array.isArray(quiz.creator) ? quiz.creator[0] : quiz.creator;
  const visibleRecentAttempts = (recentAttempts ?? []) as {
    attempt_id: string;
    avatar_url: string | null;
    created_at: string;
    display_name: string;
    result_name: string | null;
    twitter_handle: string | null;
  }[];

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
          <SectionHeader
            eyebrow="Quiz"
            title={quiz.title}
            description={quiz.short_description ?? "ユーザー作成診断です。"}
          />
          {quiz.description ? (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {quiz.description}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1">
              {Number(attemptCount ?? 0)}人が回答
            </span>
            {creator?.twitter_handle ? (
              <Link
                className="rounded-full bg-teal-50 px-3 py-1 text-ringTeal"
                href={`/users/${encodeURIComponent(creator.twitter_handle)}`}
              >
                作成者: {creator.display_name}
              </Link>
            ) : (
              <span className="rounded-full bg-teal-50 px-3 py-1 text-ringTeal">
                作成者: {creator?.display_name ?? "Typring user"}
              </span>
            )}
          </div>
          <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-800">
            この診断はユーザーが作成した娯楽目的のコンテンツです。医学的・心理学的な診断を行うものではありません。
          </p>
        </section>

        <section className="rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-ink">回答する</h2>
            <span className="text-sm font-semibold text-slate-400">
              {questions.length}問
            </span>
          </div>
          {searchParams?.error ? (
            <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {searchParams.error}
            </p>
          ) : null}
          {questions.length > 0 ? (
            <form action={submitQuizAttempt} className="space-y-5">
              <input name="quiz_id" type="hidden" value={quiz.id} />
              <input name="slug" type="hidden" value={quiz.slug} />
              {questions.map((question, index) => (
                <fieldset
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  key={question.id}
                >
                  <legend className="text-sm font-bold text-ink">
                    {index + 1} / {questions.length}
                  </legend>
                  <p className="mt-2 text-base font-bold text-ink">{question.body}</p>
                  {question.help_text ? (
                    <p className="mt-1 text-sm text-slate-500">{question.help_text}</p>
                  ) : null}
                  <div className="mt-4 grid gap-2">
                    {question.options.map((option) => (
                      <label
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-ink transition hover:border-ringTeal"
                        key={option.id}
                      >
                        <input
                          name={`answer:${question.id}`}
                          required
                          type="radio"
                          value={option.id}
                        />
                        {option.body}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
              <button
                className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-soft"
                type="submit"
              >
                <Play className="h-4 w-4" />
                結果を見る
              </button>
            </form>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-500">
              まだ回答できる質問がありません。
            </p>
          )}
        </section>
      </div>

      <aside className="space-y-4">
        <Link
          className="block rounded-2xl border border-white bg-white/88 p-5 text-sm font-bold text-ink shadow-sm"
          href={`/quizzes/${quiz.slug}/results`}
        >
          結果一覧を見る
        </Link>
        <section className="rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
          <h2 className="text-lg font-bold text-ink">最近遊んだユーザー</h2>
          {visibleRecentAttempts.length > 0 ? (
            <div className="mt-4 space-y-3">
              {visibleRecentAttempts.map((attempt) => (
                  <div className="flex items-center gap-3" key={attempt.attempt_id}>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-teal-50 text-ringTeal">
                      {attempt.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          alt=""
                          className="h-full w-full object-cover"
                          src={attempt.avatar_url}
                        />
                      ) : (
                        <UserRound className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink">
                        {attempt.display_name ?? "Typring user"}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {attempt.result_name ?? "結果"} / {formatDate(attempt.created_at)}
                      </p>
                    </div>
                  </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              まだ公開できる回答履歴はありません。
            </p>
          )}
        </section>
      </aside>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}
