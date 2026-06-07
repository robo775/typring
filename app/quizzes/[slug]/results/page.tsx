import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionHeader } from "@/components/ui/section-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function QuizResultsPage({
  params
}: {
  params: { slug: string };
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id,creator_user_id,slug,title,status")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!quiz || (quiz.status !== "published" && quiz.creator_user_id !== user?.id)) {
    notFound();
  }

  const { data: results } = await supabase
    .from("quiz_results")
    .select("id,code,name,short_description,description,image_url,position")
    .eq("quiz_id", quiz.id)
    .order("position", { ascending: true });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <SectionHeader
        eyebrow="Results"
        title={`${quiz.title} の結果一覧`}
        description="この診断で表示される可能性がある結果です。"
      />
      <div className="grid gap-4 md:grid-cols-2">
        {(results ?? []).map((result) => (
          <article
            className="rounded-2xl border border-white bg-white/88 p-5 shadow-sm"
            key={result.id}
          >
            <p className="text-xs font-bold text-ringViolet">{result.code}</p>
            <h2 className="mt-1 text-lg font-bold text-ink">{result.name}</h2>
            {result.short_description ? (
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {result.short_description}
              </p>
            ) : null}
          </article>
        ))}
      </div>
      <Link
        className="inline-flex w-fit items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-ink"
        href={`/quizzes/${quiz.slug}`}
      >
        診断へ戻る
      </Link>
    </div>
  );
}
