import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { createCharacterDiagnosis } from "@/lib/character-diagnoses/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "キャラ診断を作る",
  description: "作品キャラクターの類型投票ページを作成します。"
};

export default async function NewCharacterDiagnosisPage({
  searchParams
}: {
  searchParams?: { error?: string };
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-8">
        <section className="rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
          <SectionHeader
            eyebrow="Character Types"
            title="ログインが必要です"
            description="キャラ診断を作るには、Xアカウントでログインしてください。"
          />
          <Link
            className="mt-5 inline-flex w-full justify-center rounded-full bg-ink px-5 py-3 text-sm font-bold text-white"
            href="/login?next=/character-diagnoses/new"
          >
            Xでログイン
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-ink"
        href="/character-diagnoses"
      >
        <ArrowLeft className="h-4 w-4" />
        キャラ診断へ戻る
      </Link>

      <section className="mt-5 rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
        <SectionHeader
          eyebrow="New Character"
          title="キャラ診断を作る"
          description="作品名は自由入力です。キャラクターの自認タイプは作らず、みんなの投票だけを集めます。"
        />
        {searchParams?.error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {getErrorMessage(searchParams.error)}
          </p>
        ) : null}

        <form action={createCharacterDiagnosis} className="mt-6 grid gap-5">
          <label className="grid gap-2 text-sm font-semibold text-ink">
            作品名
            <input
              className={fieldClass}
              maxLength={120}
              name="work_title"
              placeholder="例: 葬送のフリーレン"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-ink">
            キャラクター名
            <input
              className={fieldClass}
              maxLength={120}
              name="character_name"
              placeholder="例: フリーレン"
              required
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-ink">
            キャラクター画像URL
            <input
              className={fieldClass}
              maxLength={500}
              name="image_url"
              placeholder="https://..."
              type="url"
            />
            <span className="text-xs font-normal leading-5 text-slate-500">
              画像を登録する場合は、利用権限のある画像を使用してください。
            </span>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-ink">
            説明文
            <textarea
              className="min-h-32 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal leading-6 outline-none transition focus:border-ringTeal focus:ring-2 focus:ring-teal-100"
              maxLength={800}
              name="description"
              placeholder="キャラクターの概要や、投票してほしい観点を書けます。"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-ink">
            関連URL
            <input
              className={fieldClass}
              maxLength={500}
              name="related_url"
              placeholder="https://..."
              type="url"
            />
          </label>

          <button
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5"
            type="submit"
          >
            <Sparkles className="h-4 w-4" />
            作成する
          </button>
        </form>
      </section>
    </div>
  );
}

function getErrorMessage(error: string) {
  const messages: Record<string, string> = {
    character_name_required: "キャラクター名を入力してください。"
  };

  return messages[error] ?? error;
}

const fieldClass =
  "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal outline-none transition focus:border-ringTeal focus:ring-2 focus:ring-teal-100";
