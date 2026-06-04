import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-xl flex-col justify-center px-4 py-12">
      <section className="rounded-2xl border border-white bg-white/88 p-6 text-center shadow-soft">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-ringViolet">
          404
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">
          ページが見つかりません
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          ページが移動したか、指定されたプロフィール・類型が存在しない可能性があります。
        </p>
        <Link
          className="mt-6 inline-flex items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white"
          href="/"
        >
          ホームへ戻る
        </Link>
      </section>
    </div>
  );
}
