import Link from "next/link";
import { PyramidPreview } from "@/components/pyramid/pyramid-preview";
import { sanitizePlacedParts } from "@/lib/pyramid/sanitize-pyramid";
import type { PyramidCreationRow } from "@/lib/pyramid/queries";

export function PyramidListHeader({
  description,
  title
}: {
  description: string;
  title: string;
}) {
  return (
    <section className="rounded-3xl border border-white bg-white/88 p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-ringViolet">
        PYRAMID MAKER
      </p>
      <h1 className="mt-2 text-3xl font-black text-ink">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white"
          href="/games/pyramid"
        >
          作る
        </Link>
        <Link
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-ink"
          href="/games/pyramid/ranking"
        >
          ランキング
        </Link>
      </div>
    </section>
  );
}

export function PyramidCreationGrid({
  creations
}: {
  creations: PyramidCreationRow[];
}) {
  if (creations.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-500">
        まだ公開作品がありません。最初のピラミッドを作ってみましょう。
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {creations.map((creation) => {
        const creator = Array.isArray(creation.creator)
          ? creation.creator[0] ?? null
          : creation.creator;

        return (
          <Link
            className="overflow-hidden rounded-3xl border border-white bg-white/88 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
            href={`/games/pyramid/${creation.id}`}
            key={creation.id}
          >
            <PyramidPreview
              backgroundId={creation.background_id}
              className="aspect-square w-full bg-slate-100"
              placedParts={sanitizePlacedParts(creation.placed_parts)}
              title={creation.title}
            />
            <div className="p-4">
              <h2 className="truncate text-base font-black text-ink">
                {creation.title}
              </h2>
              <p className="mt-1 truncate text-xs text-slate-500">
                by {creator?.display_name ?? "Typring user"}
              </p>
              <p className="mt-3 text-sm font-black text-ringViolet">
                Score {creation.total_score}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
