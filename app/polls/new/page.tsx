import { redirect } from "next/navigation";
import { Save } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { createPoll } from "@/lib/polls/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function NewPollPage({
  searchParams
}: {
  searchParams?: { error?: string };
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/polls/new");
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <SectionHeader
        eyebrow="Create"
        title="アンケートを作る"
        description="質問と回答選択肢を入れるだけで公開できます。回答はあとから類型別に集計できます。"
      />
      {searchParams?.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error}
        </p>
      ) : null}

      <form action={createPoll} className="space-y-6">
        <section className={panelClass}>
          <h2 className="text-lg font-bold text-ink">基本情報</h2>
          <div className="mt-4 grid gap-4">
            <label className={labelClass}>
              タイトル
              <input
                className={fieldClass}
                maxLength={100}
                name="title"
                placeholder="例: 初対面で話しかけやすいタイプは？"
                required
              />
            </label>
            <label className={labelClass}>
              質問
              <input
                className={fieldClass}
                maxLength={240}
                name="question"
                placeholder="例: オフ会で最初に話しかけるなら、どんな人？"
                required
              />
            </label>
            <label className={labelClass}>
              説明
              <textarea
                className={`${fieldClass} min-h-28 leading-6`}
                maxLength={1000}
                name="description"
                placeholder="補足や注意書きがあれば書けます。"
              />
            </label>
            <label className={labelClass}>
              公開状態
              <select className={fieldClass} defaultValue="published" name="status">
                <option value="published">公開する</option>
                <option value="draft">下書き</option>
              </select>
            </label>
          </div>
        </section>

        <section className={panelClass}>
          <h2 className="text-lg font-bold text-ink">回答選択肢</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            2個以上入力してください。最大10個まで保存されます。
          </p>
          <div className="mt-4 grid gap-3">
            {Array.from({ length: 10 }, (_, index) => (
              <label className={labelClass} key={index}>
                回答 {index + 1}
                <input
                  className={fieldClass}
                  maxLength={120}
                  name={`option_${index + 1}`}
                  placeholder={
                    index === 0
                      ? "話しかけてくれる人"
                      : index === 1
                        ? "静かに聞いてくれる人"
                        : ""
                  }
                  required={index < 2}
                />
              </label>
            ))}
          </div>
        </section>

        <section className={panelClass}>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-soft"
            type="submit"
          >
            <Save className="h-4 w-4" />
            アンケートを保存
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
