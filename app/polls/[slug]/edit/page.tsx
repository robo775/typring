import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Save } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { updatePoll } from "@/lib/polls/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PollOption = {
  body: string;
  id: string;
  position: number;
};

export default async function EditPollPage({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams?: { error?: string };
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/polls/${params.slug}/edit`);
  }

  const { data: poll } = await supabase
    .from("polls")
    .select("id,creator_user_id,slug,title,question,description,status")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!poll) {
    notFound();
  }

  if (poll.creator_user_id !== user.id) {
    redirect(`/polls/${poll.slug}?error=owner_required`);
  }

  const { data: optionRows } = await supabase
    .from("poll_options")
    .select("id,body,position")
    .eq("poll_id", poll.id)
    .order("position", { ascending: true });
  const options = (optionRows ?? []) as PollOption[];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          eyebrow="Edit"
          title="アンケートを編集"
          description="タイトル、質問、説明、回答選択肢を編集できます。選択肢を削除すると、その選択肢に入っていた回答も削除されます。"
        />
        <Link
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink"
          href={`/polls/${poll.slug}`}
        >
          アンケートへ戻る
        </Link>
      </div>

      {searchParams?.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error}
        </p>
      ) : null}

      <form action={updatePoll} className="space-y-6">
        <input name="poll_id" type="hidden" value={poll.id} />
        <input name="slug" type="hidden" value={poll.slug} />
        <section className={panelClass}>
          <h2 className="text-lg font-bold text-ink">基本情報</h2>
          <div className="mt-4 grid gap-4">
            <label className={labelClass}>
              タイトル
              <input
                className={fieldClass}
                defaultValue={poll.title}
                maxLength={100}
                name="title"
                required
              />
            </label>
            <label className={labelClass}>
              質問
              <input
                className={fieldClass}
                defaultValue={poll.question}
                maxLength={240}
                name="question"
                required
              />
            </label>
            <label className={labelClass}>
              説明
              <textarea
                className={`${fieldClass} min-h-28 leading-6`}
                defaultValue={poll.description ?? ""}
                maxLength={1000}
                name="description"
              />
            </label>
            <label className={labelClass}>
              公開状態
              <select className={fieldClass} defaultValue={poll.status} name="status">
                <option value="published">公開する</option>
                <option value="draft">下書き</option>
              </select>
            </label>
          </div>
        </section>

        <section className={panelClass}>
          <h2 className="text-lg font-bold text-ink">回答選択肢</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            2個以上入力してください。空欄にした既存選択肢は削除されます。
          </p>
          <div className="mt-4 grid gap-3">
            {Array.from({ length: 10 }, (_, index) => {
              const option = options[index];

              return (
                <label className={labelClass} key={index}>
                  回答 {index + 1}
                  <input
                    name={`option_${index + 1}_id`}
                    type="hidden"
                    value={option?.id ?? ""}
                  />
                  <input
                    className={fieldClass}
                    defaultValue={option?.body ?? ""}
                    maxLength={120}
                    name={`option_${index + 1}`}
                    required={index < 2}
                  />
                </label>
              );
            })}
          </div>
        </section>

        <section className={panelClass}>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-soft"
            type="submit"
          >
            <Save className="h-4 w-4" />
            更新する
          </button>
        </section>
      </form>
    </div>
  );
}

const panelClass = "rounded-2xl border border-white bg-white/88 p-5 shadow-sm";
const labelClass = "grid gap-2 text-sm font-semibold text-ink";
const fieldClass =
  "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal outline-none transition focus:border-ringTeal focus:ring-2 focus:ring-teal-100";
