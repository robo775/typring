import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約",
  description: "Typringの利用に関する基本的なルールです。"
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <article className="space-y-8 rounded-2xl border border-white bg-white/88 p-6 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ringViolet">
            Terms
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">
            利用規約
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Typringを利用する際の基本的なルールです。β公開中のため、機能や表示は予告なく変更される場合があります。
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-ink">サービスの内容</h2>
          <p className="text-sm leading-7 text-slate-600">
            Typringは、性格類型などのプロフィール情報を登録し、プロフィールカード、検索、
            ハンドブック、投票、紹介文などを利用できるSNS兼ハンドブックサービスです。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-ink">投稿内容</h2>
          <p className="text-sm leading-7 text-slate-600">
            プロフィール、紹介文、投票などの投稿では、他者への誹謗中傷、不適切な表現、
            権利侵害につながる内容を投稿しないでください。必要に応じて、運営側で表示制限や削除を行う場合があります。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-ink">類型情報について</h2>
          <p className="text-sm leading-7 text-slate-600">
            Typring上の類型情報や相性コメントは、交流や娯楽を目的としたものです。
            医療、心理診断、能力判定などの断定的な用途を目的とするものではありません。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-ink">アカウント削除</h2>
          <p className="text-sm leading-7 text-slate-600">
            ユーザーはマイページからアカウントを削除できます。アカウント削除時には、
            プロフィール、登録類型、投票、紹介文などの関連データを削除します。
            削除したデータは元に戻せません。
          </p>
        </section>
      </article>
    </div>
  );
}
