import { ArrowRight, Gamepad2, Trophy } from "lucide-react";
import Link from "next/link";
import { miniGames } from "@/data/miniGames";

export default function GamesPage() {
  const activeGames = miniGames.filter((game) => game.isActive);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-6 sm:py-8">
      <section className="rounded-2xl border border-white bg-white/88 p-4 shadow-sm sm:p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-ringTeal to-ringViolet text-white">
            <Gamepad2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-ringViolet">
              Mini Games
            </p>
            <h1 className="mt-1 text-2xl font-black text-ink">ミニゲーム</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Typringで遊べるミニゲーム置き場です。これから少しずつ追加していきます。
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-3">
        {activeGames.length > 0 ? (
          activeGames.map((game) => (
            <Link
              className="group flex items-center gap-3 rounded-2xl border border-white bg-white/88 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft sm:p-4"
              href={game.href}
              key={game.id}
            >
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-ringTeal via-ringBlue to-ringViolet text-white sm:h-16 sm:w-16">
                <Gamepad2 className="h-7 w-7 opacity-95" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-base font-black text-ink sm:text-lg">
                    {game.title}
                  </h2>
                  {game.id === "pyramid-maker" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                      <Trophy className="h-3 w-3" />
                      ランキング対応
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600 sm:text-sm">
                  {game.description}
                </p>
                {game.id === "pyramid-maker" ? (
                  <p className="mt-1 text-[11px] font-semibold text-slate-500">
                    アイディア: 具沢山様（@1004morgenstern）
                  </p>
                ) : null}
              </div>

              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-white transition group-hover:bg-ringViolet">
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-sm text-slate-500">
            現在公開中のミニゲームはありません。
          </div>
        )}
      </section>
    </div>
  );
}
