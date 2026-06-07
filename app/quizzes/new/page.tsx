import { redirect } from "next/navigation";
import { Save } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { createSimpleQuiz } from "@/lib/quizzes/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function NewQuizPage({
  searchParams
}: {
  searchParams?: { error?: string };
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/quizzes/new");
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <SectionHeader
        eyebrow="Create"
        title="診断を作る"
        description="まずは最大値型のシンプルな診断を作れます。結果を2〜4個、質問を1〜5個入れるだけで公開できます。"
      />
      {searchParams?.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error}
        </p>
      ) : null}

      <form action={createSimpleQuiz} className="space-y-6">
        <section className={panelClass}>
          <StepHeader number="1" title="基本情報" />
          <div className="grid gap-4">
            <label className={labelClass}>
              タイトル
              <input
                className={fieldClass}
                maxLength={100}
                name="title"
                placeholder="あなたをRPG職業に例えると？"
                required
              />
            </label>
            <label className={labelClass}>
              短い説明
              <input
                className={fieldClass}
                maxLength={160}
                name="short_description"
                placeholder="数問であなたのタイプを判定します。"
              />
            </label>
            <label className={labelClass}>
              詳細説明
              <textarea
                className={`${fieldClass} min-h-28 leading-6`}
                maxLength={2000}
                name="description"
                placeholder="診断の雰囲気や注意書きを書けます。"
              />
            </label>
            <label className={labelClass}>
              公開状態
              <select className={fieldClass} name="status" defaultValue="draft">
                <option value="draft">下書き</option>
                <option value="published">公開する</option>
              </select>
            </label>
          </div>
        </section>

        <section className={panelClass}>
          <StepHeader number="2" title="結果タイプ" />
          <p className="text-sm leading-6 text-slate-500">
            ここで入れたコードが、そのまま結果コードになります。同点の場合は上にあるタイプが優先されます。
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <VariableFields index={index + 1} key={index} />
            ))}
          </div>
        </section>

        <section className={panelClass}>
          <StepHeader number="3" title="質問" />
          <p className="text-sm leading-6 text-slate-500">
            各回答に、どの結果タイプへ何点入るかを設定します。まずは `+1` だけで十分です。
          </p>
          <div className="space-y-5">
            {Array.from({ length: 5 }, (_, index) => (
              <QuestionFields index={index + 1} key={index} />
            ))}
          </div>
        </section>

        <section className={panelClass}>
          <StepHeader number="4" title="公開前チェック" />
          <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
            <li>結果タイプは2個以上必要です。</li>
            <li>質問は1問以上、各質問は2択以上必要です。</li>
            <li>回答がついた後のロジック変更は、今後は複製で対応する予定です。</li>
            <li>この診断は娯楽目的のコンテンツとして表示されます。</li>
          </ul>
          <button
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-soft"
            type="submit"
          >
            <Save className="h-4 w-4" />
            診断を保存
          </button>
        </section>
      </form>
    </div>
  );
}

function VariableFields({ index }: { index: number }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <h3 className="font-bold text-ink">結果タイプ {index}</h3>
      <div className="mt-3 grid gap-3">
        <label className={labelClass}>
          コード
          <input
            className={fieldClass}
            name={`variable_${index}_code`}
            placeholder={index === 1 ? "hero" : index === 2 ? "mage" : ""}
          />
        </label>
        <label className={labelClass}>
          表示名
          <input
            className={fieldClass}
            name={`variable_${index}_name`}
            placeholder={index === 1 ? "勇者" : index === 2 ? "魔法使い" : ""}
          />
        </label>
        <label className={labelClass}>
          説明
          <textarea
            className={`${fieldClass} min-h-20 leading-6`}
            name={`variable_${index}_description`}
            placeholder="結果ページに表示される短い説明です。"
          />
        </label>
      </div>
    </div>
  );
}

function QuestionFields({ index }: { index: number }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <h3 className="font-bold text-ink">質問 {index}</h3>
      <div className="mt-3 grid gap-3">
        <label className={labelClass}>
          質問文
          <input
            className={fieldClass}
            name={`question_${index}_body`}
            placeholder={index === 1 ? "休日はどう過ごしたい？" : ""}
          />
        </label>
        <label className={labelClass}>
          補足文
          <input
            className={fieldClass}
            name={`question_${index}_help`}
            placeholder="必要なら補足を入れます。"
          />
        </label>
        <div className="grid gap-3">
          {Array.from({ length: 3 }, (_, optionIndex) => (
            <div className="grid gap-2 rounded-xl bg-white p-3" key={optionIndex}>
              <p className="text-xs font-bold text-slate-400">
                回答 {optionIndex + 1}
              </p>
              <input
                className={fieldClass}
                name={`question_${index}_option_${optionIndex + 1}_body`}
                placeholder={
                  optionIndex === 0
                    ? "友人と外出する"
                    : optionIndex === 1
                      ? "家でじっくり過ごす"
                      : "気分で決める"
                }
              />
              <div className="grid gap-2 sm:grid-cols-[1fr_8rem]">
                <input
                  className={fieldClass}
                  name={`question_${index}_option_${optionIndex + 1}_variable`}
                  placeholder="加点するコード"
                />
                <input
                  className={fieldClass}
                  defaultValue="1"
                  name={`question_${index}_option_${optionIndex + 1}_score`}
                  type="number"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">
        {number}
      </span>
      <h2 className="text-lg font-bold text-ink">{title}</h2>
    </div>
  );
}

const panelClass = "rounded-2xl border border-white bg-white/88 p-5 shadow-sm";
const labelClass = "grid gap-2 text-sm font-semibold text-ink";
const fieldClass =
  "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal outline-none transition focus:border-ringTeal focus:ring-2 focus:ring-teal-100";
