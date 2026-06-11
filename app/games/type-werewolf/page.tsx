import Link from "next/link";
import { ArrowLeft, ShieldQuestion } from "lucide-react";
import { CharacterSelectionPreview } from "@/components/type-werewolf/character-selection-preview";

const sampleMessages = [
  {
    body: "休日は普通に家でゲームしてることが多いかな",
    character: "ジェームズ"
  },
  {
    body: "予定を詰め込みすぎると疲れません？",
    character: "ヴィクトリア"
  },
  {
    body: "それは遊ぶ相手による",
    character: "イジュン"
  }
];

export default function TypeWerewolfPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <div>
        <Link
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-ink"
          href="/games"
        >
          <ArrowLeft className="h-4 w-4" />
          ミニゲームへ戻る
        </Link>
      </div>

      <section className="overflow-hidden rounded-3xl border border-white bg-white/90 shadow-sm">
        <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-ringViolet p-6 text-white sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-white/60">
                Type Werewolf
              </p>
              <h1 className="mt-2 text-3xl font-black">類型人狼</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72">
                ゲーム中は匿名キャラクターとして会話し、終了後に正体を公開する類型推理ゲームです。
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-bold">
              <ShieldQuestion className="h-4 w-4" />
              準備中
            </div>
          </div>
        </div>
      </section>

      <CharacterSelectionPreview />

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-white bg-white/90 p-5 shadow-sm">
          <h2 className="text-xl font-black text-ink">ゲーム中の見え方</h2>
          <div className="mt-4 rounded-2xl bg-slate-950 p-4 text-white">
            <div className="flex flex-wrap gap-3 text-xs font-bold text-white/60">
              <span>残り時間 07:42</span>
              <span>生存者 5 / 8</span>
              <span>対象類型 MBTI</span>
            </div>
            <div className="mt-4 space-y-3">
              {sampleMessages.map((message) => (
                <div
                  className="rounded-2xl border border-white/10 bg-white/8 p-3"
                  key={`${message.character}-${message.body}`}
                >
                  <p className="text-sm font-black text-cyan-100">
                    {message.character}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-white/86">
                    「{message.body}」
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white bg-white/90 p-5 shadow-sm">
          <h2 className="text-xl font-black text-ink">匿名ルール</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li>ゲーム中はキャラクター名と画像だけを表示します。</li>
            <li>Typringの表示名、Xハンドル、プロフィール画像は公開しません。</li>
            <li>終了後の結果画面で、キャラクター名と実際の表示名を対応付けます。</li>
            <li>同じ部屋で同じキャラクターは選択できない設計にします。</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
