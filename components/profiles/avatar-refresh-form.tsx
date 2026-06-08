import { RefreshCw } from "lucide-react";
import { refreshMyAvatarFromX } from "@/lib/profiles/actions";

export function AvatarRefreshForm() {
  return (
    <form
      action={refreshMyAvatarFromX}
      className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-bold text-ink">プロフィール画像</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Xで再認証して、現在のXアイコンをTypringへ反映します。
          </p>
        </div>
        <button
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-ringTeal bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-teal-50"
          type="submit"
        >
          <RefreshCw className="h-4 w-4" />
          Xアイコンを再取得
        </button>
      </div>
    </form>
  );
}
