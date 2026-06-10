import Link from "next/link";
import { PyramidGame } from "@/components/pyramid/pyramid-game";

export default function PyramidGamePage() {
  return (
    <>
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-3 pt-4 sm:px-4">
        <div className="flex flex-wrap gap-2">
          <Link
            className="rounded-full border border-white bg-white/82 px-4 py-2 text-sm font-bold text-ink shadow-sm"
            href="/games/pyramid/gallery"
          >
            公開作品を見る
          </Link>
          <Link
            className="rounded-full border border-white bg-white/82 px-4 py-2 text-sm font-bold text-ink shadow-sm"
            href="/games/pyramid/ranking"
          >
            ランキング
          </Link>
        </div>
        <p className="rounded-2xl border border-white bg-white/72 px-4 py-3 text-xs font-semibold leading-5 text-slate-600 shadow-sm">
          原案:{" "}
          <a
            className="font-bold text-ringViolet underline underline-offset-2"
            href="https://x.com/1004morgenstern"
            rel="noopener noreferrer"
            target="_blank"
          >
            具沢山様（@1004morgenstern）
          </a>
        </p>
      </div>
      <PyramidGame />
    </>
  );
}
