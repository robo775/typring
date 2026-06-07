import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { QuizResultShare } from "@/components/quizzes/quiz-result-share";
import { SectionHeader } from "@/components/ui/section-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AttemptPageProps = {
  params: { attemptId: string; slug: string };
};

export default async function QuizAttemptResultPage({ params }: AttemptPageProps) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/quizzes/${params.slug}`);
  }

  const { data: attempt } = await supabase
    .from("quiz_attempts")
    .select("id,quiz_id,result_code,created_at,quiz:quizzes(id,slug,title,creator_user_id),result:quiz_results(id,code,name,short_description,description,image_url)")
    .eq("id", params.attemptId)
    .maybeSingle();

  if (!attempt) {
    notFound();
  }

  const quiz = Array.isArray(attempt.quiz) ? attempt.quiz[0] : attempt.quiz;
  const result = Array.isArray(attempt.result) ? attempt.result[0] : attempt.result;

  if (!quiz || !result || quiz.slug !== params.slug) {
    notFound();
  }

  const { data: scoreRows } = await supabase
    .from("quiz_attempt_scores")
    .select("score,variable:quiz_variables(code,name,position)")
    .eq("attempt_id", attempt.id)
    .order("score", { ascending: false });
  const scores = ((scoreRows ?? []) as any[]).map((row) => ({
    score: row.score as number,
    variable: Array.isArray(row.variable) ? row.variable[0] : row.variable
  }));
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const resultUrl = `${appUrl.replace(/\/$/, "")}/quizzes/${quiz.slug}`;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <section className="overflow-hidden rounded-2xl border border-white bg-white/88 shadow-sm">
        <div className="bg-gradient-to-br from-ringTeal via-ringBlue to-ringViolet p-6 text-white">
          <p className="text-sm font-semibold text-white/80">診断結果</p>
          <h1 className="mt-2 text-3xl font-bold">{result.name}</h1>
          <p className="mt-2 text-sm text-white/82">{quiz.title}</p>
        </div>
        <div className="space-y-5 p-5">
          {result.short_description ? (
            <p className="text-base font-semibold leading-7 text-ink">
              {result.short_description}
            </p>
          ) : null}
          {result.description ? (
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {result.description}
            </p>
          ) : null}
          <QuizResultShare
            quizTitle={quiz.title}
            resultName={result.name}
            resultUrl={resultUrl}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
        <SectionHeader
          eyebrow="Scores"
          title="変数別スコア"
          description="どの結果タイプにどれだけ点が入ったかを表示します。"
        />
        <div className="mt-4 space-y-3">
          {scores.map((row) => (
            <div
              className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
              key={row.variable?.code}
            >
              <span className="font-semibold text-ink">
                {row.variable?.name ?? row.variable?.code}
              </span>
              <span className="font-bold tabular-nums text-ringViolet">
                {row.score}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-ink"
          href={`/quizzes/${quiz.slug}`}
        >
          診断詳細へ戻る
        </Link>
        <Link
          className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white"
          href={`/quizzes/${quiz.slug}`}
        >
          もう一度回答する
        </Link>
      </div>
    </div>
  );
}
