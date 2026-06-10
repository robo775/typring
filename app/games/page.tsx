import { Gamepad2, Trophy } from "lucide-react";
import Link from "next/link";
import { miniGames } from "@/data/miniGames";

export default function GamesPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <section className="rounded-3xl border border-white bg-white/88 p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-ringViolet">
          Mini Games
        </p>
        <h1 className="mt-2 text-3xl font-black text-ink">ミニゲーム</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Typring内で遊べる軽めのゲーム置き場です。今後ここにゲームを増やしていきます。
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {miniGames
          .filter((game) => game.isActive)
          .map((game) => (
            <Link
              className="group overflow-hidden rounded-3xl border border-white bg-white/88 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
              href={game.href}
              key={game.id}
            >
              <div className="grid aspect-[16/9] place-items-center bg-gradient-to-br from-ringTeal via-ringBlue to-ringViolet text-white">
                <Gamepad2 className="h-16 w-16 opacity-90" />
              </div>
              <div className="p-5">
                <h2 className="text-xl font-black text-ink">{game.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {game.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold text-white">
                    遊ぶ
                  </span>
                  {game.id === "pyramid-maker" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      <Trophy className="h-3.5 w-3.5" />
                      ランキング対応
                    </span>
                  ) : null}
                </div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}
