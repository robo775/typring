import { notFound } from "next/navigation";
import Link from "next/link";
import { PyramidModeBadge } from "@/components/pyramid/pyramid-creation-list";
import { PyramidPreview } from "@/components/pyramid/pyramid-preview";
import { sanitizePlacedParts } from "@/lib/pyramid/sanitize-pyramid";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PyramidMode } from "@/types/pyramid";

type PyramidCreationRow = {
  background_id: string;
  category_count: number;
  cost_used: number;
  creator:
    | { display_name: string; twitter_handle: string | null }
    | { display_name: string; twitter_handle: string | null }[]
    | null;
  id: string;
  mode: PyramidMode;
  part_count: number;
  placed_parts: unknown;
  synergy_bonus: number;
  title: string;
  total_score: number;
};

export default async function PyramidCreationPage({
  params
}: {
  params: { id: string };
}) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("pyramid_creations")
    .select("id,title,background_id,placed_parts,total_score,part_count,category_count,mode,synergy_bonus,cost_used,creator:profiles!pyramid_creations_user_id_fkey(display_name,twitter_handle)")
    .eq("id", params.id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const creation = data as unknown as PyramidCreationRow;
  const creator = Array.isArray(creation.creator)
    ? creation.creator[0] ?? null
    : creation.creator;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const creationUrl = `${appUrl.replace(/\/$/, "")}/games/pyramid/${creation.id}`;
  const shareText = `「${creation.title}」を作りました。\n建築スコア: ${creation.total_score}\n\n#Typring\n#PYRAMIDMAKER`;
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(creationUrl)}`;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_360px]">
      <section className="overflow-hidden rounded-3xl border border-white bg-white shadow-soft">
        <PyramidPreview
          backgroundId={creation.background_id}
          className="aspect-square w-full bg-slate-100"
          placedParts={sanitizePlacedParts(creation.placed_parts)}
          title={creation.title}
        />
      </section>
      <aside className="space-y-4">
        <section className="rounded-3xl border border-white bg-white/88 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-ringViolet">
            PYRAMID MAKER
          </p>
          <div className="mt-2 flex items-center gap-2">
            <h1 className="text-2xl font-black text-ink">{creation.title}</h1>
            <PyramidModeBadge mode={creation.mode} />
          </div>
          <p className="mt-2 text-sm text-slate-500">
            by {creator?.display_name ?? "Typring user"}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <ScoreBox label="Score" value={creation.total_score} />
            <ScoreBox label="Parts" value={creation.part_count} />
            <ScoreBox label="Types" value={creation.category_count} />
            {creation.mode === "challenge" ? (
              <>
                <ScoreBox label="シナジー" value={creation.synergy_bonus} />
                <ScoreBox label="コスト" value={creation.cost_used} />
              </>
            ) : null}
          </div>
          <div className="mt-5 flex flex-col gap-2">
            <a
              className="inline-flex justify-center rounded-full bg-ink px-5 py-3 text-sm font-bold text-white"
              href={shareUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Xで共有
            </a>
            <Link
              className="inline-flex justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-ink"
              href="/games/pyramid"
            >
              自分も作る
            </Link>
            <Link
              className="inline-flex justify-center rounded-full bg-slate-100 px-5 py-3 text-sm font-bold text-slate-600"
              href="/games/pyramid/ranking"
            >
              ランキングを見る
            </Link>
          </div>
        </section>
      </aside>
    </div>
  );
}

function ScoreBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 text-center">
      <p className="text-[11px] font-bold text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-black text-ink">{value}</p>
    </div>
  );
}
