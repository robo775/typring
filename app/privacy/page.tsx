import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "Typringで取り扱う情報とアカウント削除についての説明です。"
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <article className="space-y-8 rounded-2xl border border-white bg-white/88 p-6 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ringViolet">
            Privacy
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">
            プライバシーポリシー
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Typringは、類型プロフィールを作成・共有するために必要な範囲で情報を取り扱います。
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-ink">取得する情報</h2>
          <p className="text-sm leading-7 text-slate-600">
            Xアカウントでログインした際に、ユーザーID、ハンドル名、表示名、アイコンURLなど、
            認証とプロフィール表示に必要な情報を保存します。また、ユーザーが入力した自己紹介、
            登録類型、投票、紹介文などを保存します。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-ink">情報の利用目的</h2>
          <p className="text-sm leading-7 text-slate-600">
            保存した情報は、プロフィールカード表示、ユーザー検索、類型ハンドブック上のユーザー表示、
            類型予想投票、紹介文表示など、Typringの機能提供のために利用します。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-ink">アカウント削除</h2>
          <p className="text-sm leading-7 text-slate-600">
            ユーザーはマイページからアカウントを削除できます。アカウント削除時には、
            プロフィール、登録類型、投票、紹介文など、Typring内で対象ユーザーに関連するデータを削除します。
            削除後はログイン状態も破棄されます。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-ink">外部サービス</h2>
          <p className="text-sm leading-7 text-slate-600">
            認証にはSupabase AuthとX OAuthを利用します。将来的に広告やAI機能を有効にする場合は、
            実際に利用する外部サービスに合わせて、このページの説明を更新します。
          </p>
        </section>
      </article>
    </div>
  );
}
