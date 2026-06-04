import { Twitter } from "lucide-react";
import { signInWithTwitter } from "@/lib/auth/actions";

export default function LoginPage({
  searchParams
}: {
  searchParams?: { error?: string; next?: string };
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md flex-col justify-center px-4 py-12">
      <section className="rounded-2xl border border-white bg-white/88 p-6 shadow-soft">
        <div className="mb-6 space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-ink">Typringにログイン</h1>
          <p className="text-sm leading-6 text-slate-600">
            X/Twitterアカウントでログインします。初回ログイン時にTypringプロフィールが作成されます。
          </p>
        </div>
        {searchParams?.error ? (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {searchParams.error}
          </p>
        ) : null}
        <form action={signInWithTwitter}>
          <input name="next" type="hidden" value={searchParams?.next ?? "/me"} />
          <button
            className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            type="submit"
          >
            <Twitter className="h-4 w-4" />
            Xでログイン
          </button>
        </form>
      </section>
    </div>
  );
}
