import Link from "next/link";
import { Infinity as InfinityIcon, Swords } from "lucide-react";
import {
  CHALLENGE_COST_BUDGET,
  CHALLENGE_MAX_PARTS
} from "@/lib/pyramid/challenge-rules";

export function PyramidModeSelect() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-3 py-4 sm:px-4">
      <section className="rounded-3xl border border-white bg-white/88 p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-ringViolet">
          PYRAMID MAKER
        </p>
        <h1 className="mt-2 text-2xl font-black text-ink sm:text-3xl">
          モードを選んでください
        </h1>
      </section>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          className="group rounded-3xl border border-white bg-white/88 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
          href="/games/pyramid?mode=challenge"
        >
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-ringViolet">
            <Swords className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-xl font-black text-ink">チャレンジモード</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            コスト{CHALLENGE_COST_BUDGET}以内・{CHALLENGE_MAX_PARTS}
            パーツまでの制限の中でハイスコアを狙うモード。パーツの組み合わせで
            シナジーボーナスが発生します。
          </p>
          <ul className="mt-3 space-y-1 text-xs font-bold text-slate-500">
            <li>・コスト上限 {CHALLENGE_COST_BUDGET}</li>
            <li>・配置上限 {CHALLENGE_MAX_PARTS}パーツ</li>
            <li>・シナジーボーナスあり</li>
            <li>・ランキング対象</li>
          </ul>
          <span className="mt-4 inline-flex rounded-full bg-ringViolet px-4 py-2 text-sm font-bold text-white">
            挑戦する
          </span>
        </Link>
        <Link
          className="group rounded-3xl border border-white bg-white/88 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
          href="/games/pyramid?mode=free"
        >
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-ringTeal">
            <InfinityIcon className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-xl font-black text-ink">自由編集モード</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            コスト制限なしで好きなだけパーツを置ける創作モード。
            完成した作品はギャラリーに公開できます。
          </p>
          <ul className="mt-3 space-y-1 text-xs font-bold text-slate-500">
            <li>・コスト制限なし</li>
            <li>・パーツ数無制限</li>
            <li>・ギャラリー公開のみ（ランキング対象外）</li>
          </ul>
          <span className="mt-4 inline-flex rounded-full bg-ink px-4 py-2 text-sm font-bold text-white">
            自由に作る
          </span>
        </Link>
      </div>
    </div>
  );
}
