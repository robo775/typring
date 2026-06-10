import Link from "next/link";
import { PyramidGame } from "@/components/pyramid/pyramid-game";

export default function PyramidGamePage() {
  return (
    <>
      <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-3 pt-4 sm:px-4">
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
      <PyramidGame />
    </>
  );
}
