import { Sparkles } from "lucide-react";
import { generateCompatibility } from "@/lib/compatibility/actions";

type CompatibilityPanelProps = {
  handle: string;
  isLoggedIn: boolean;
  isOwnProfile: boolean;
  latestResult: string | null;
  targetUserId: string;
};

export function CompatibilityPanel({
  handle,
  isLoggedIn,
  isOwnProfile,
  latestResult,
  targetUserId
}: CompatibilityPanelProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-ringViolet">
          Compatibility
        </p>
        <h2 className="mt-2 text-xl font-bold tracking-tight text-ink">
          AI相性コメント
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          エンタメ用途の短いコメントです。X投稿本文は使わず、Typring上の公開類型情報だけを使います。
        </p>
      </div>

      {latestResult ? (
        <p className="rounded-xl border border-teal-100 bg-teal-50 px-3 py-3 text-sm leading-6 text-teal-800">
          {latestResult}
        </p>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-500">
          まだ相性コメントは生成されていません。
        </p>
      )}

      {isOwnProfile ? (
        <p className="text-sm text-slate-500">自分自身は診断できません。</p>
      ) : isLoggedIn ? (
        <form action={generateCompatibility}>
          <input name="target_user_id" type="hidden" value={targetUserId} />
          <input name="handle" type="hidden" value={handle} />
          <button
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
            type="submit"
          >
            <Sparkles className="h-4 w-4" />
            生成する
          </button>
        </form>
      ) : (
        <p className="text-sm text-slate-500">生成するにはログインしてください。</p>
      )}
    </section>
  );
}
