import Link from "next/link";
import { PyramidPreview } from "@/components/pyramid/pyramid-preview";
import { sanitizePlacedParts } from "@/lib/pyramid/sanitize-pyramid";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PyramidCreationRow = {
  background_id: string;
  created_at: string;
  creator:
    | { display_name: string; twitter_handle: string | null }
    | { display_name: string; twitter_handle: string | null }[]
    | null;
  id: string;
  placed_parts: unknown;
  title: string;
  total_score: number;
};

export default async function PyramidGalleryPage() {
  const creations = await getPublicCreations("created_at");

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <Header title="公開ピラミッド" description="みんなが公開したピラミッドです。" />
      <CreationGrid creations={creations} />
    </div>
  );
}

export async function getPublicCreations(order: "created_at" | "total_score") {
  const supabase = createSupabaseServerClient();
  const query = supabase
    .from("pyramid_creations")
    .select("id,title,background_id,placed_parts,total_score,created_at,creator:profiles!pyramid_creations_user_id_fkey(display_name,twitter_handle)")
    .eq("is_public", true)
    .limit(order === "total_score" ? 10 : 24);

  const { data } =
    order === "total_score"
      ? await query.order("total_score", { ascending: false }).order("created_at", {
          ascending: true
        })
      : await query.order("created_at", { ascending: false });

  return (data ?? []) as unknown as PyramidCreationRow[];
}

export function Header({
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

export function CreationGrid({ creations }: { creations: PyramidCreationRow[] }) {
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
