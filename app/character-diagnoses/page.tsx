import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { getCharacterImageUrl } from "@/lib/character-diagnoses/images";
import { SectionHeader } from "@/components/ui/section-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "キャラ診断",
  description:
    "作品キャラクターに対してMBTIやエニアグラムなどの類型を投票できるページです。"
};

type CharacterDiagnosisRow = {
  character_name: string;
  created_at: string;
  creator:
    | { display_name: string; twitter_handle: string | null }
    | { display_name: string; twitter_handle: string | null }[]
    | null;
  id: string;
  image_path: string | null;
  work_title: string | null;
};

type VoteRow = {
  character_diagnosis_id: string;
};

export default async function CharacterDiagnosesPage({
  searchParams
}: {
  searchParams?: { deleted?: string; error?: string; sort?: string };
}) {
  const supabase = createSupabaseServerClient();
  const sort = searchParams?.sort === "votes" ? "votes" : "latest";
  const { data: rows } = await supabase
    .from("character_diagnoses")
    .select(
      "id,work_title,character_name,image_path,created_at,creator:profiles!character_diagnoses_creator_user_id_fkey(display_name,twitter_handle)"
    )
    .is("deleted_at", null)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(48);
  const characters = normalizeCharacters(rows);
  const voteCounts = await getVoteCounts(
    supabase,
    characters.map((character) => character.id)
  );
  const sortedCharacters =
    sort === "votes"
      ? [...characters].sort(
          (a, b) =>
            (voteCounts.get(b.id) ?? 0) - (voteCounts.get(a.id) ?? 0) ||
            getTime(b.created_at) - getTime(a.created_at)
        )
      : characters;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          eyebrow="Character Types"
          title="キャラクター他者診断"
          description="みんなはこのキャラをどう見る？作品キャラクターの類型を投票できます。"
        />
        <Link
          className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-soft"
          href="/character-diagnoses/new"
        >
          <Plus className="h-4 w-4" />
          キャラ診断を作る
        </Link>
      </div>

      {searchParams?.deleted ? (
        <p className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-700">
          キャラクター診断を削除しました。
        </p>
      ) : null}
      {searchParams?.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error}
        </p>
      ) : null}

      <div className="flex gap-2">
        <SortLink active={sort === "latest"} href="/character-diagnoses">
          新着順
        </SortLink>
        <SortLink active={sort === "votes"} href="/character-diagnoses?sort=votes">
          投票数順
        </SortLink>
      </div>

      {sortedCharacters.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedCharacters.map((character) => (
            <CharacterCard
              character={character}
              imageUrl={getCharacterImageUrl(supabase, character.image_path)}
              key={character.id}
              voteCount={voteCounts.get(character.id) ?? 0}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-500">
          まだキャラクター診断はありません。
        </div>
      )}
    </div>
  );
}

function SortLink({
  active,
  children,
  href
}: {
  active: boolean;
  children: ReactNode;
  href: string;
}) {
  return (
    <Link
      className={`rounded-full px-4 py-2 text-sm font-bold transition ${
        active
          ? "bg-ink text-white"
          : "border border-slate-200 bg-white text-slate-600"
      }`}
      href={href}
    >
      {children}
    </Link>
  );
}

function CharacterCard({
  character,
  imageUrl,
  voteCount
}: {
  character: CharacterDiagnosisRow;
  imageUrl: string | null;
  voteCount: number;
}) {
  const creator = Array.isArray(character.creator)
    ? character.creator[0]
    : character.creator;

  return (
    <Link
      className="overflow-hidden rounded-2xl border border-white bg-white/88 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
      href={`/character-diagnoses/${character.id}`}
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-teal-50 via-white to-violet-100">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" className="h-full w-full object-cover" src={imageUrl} />
        ) : (
          <div className="grid h-full place-items-center text-ringViolet">
            <Sparkles className="h-10 w-10" />
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="truncate text-xs font-bold text-ringViolet">
          {character.work_title ?? "作品名未設定"}
        </p>
        <h2 className="mt-1 truncate text-lg font-black text-ink">
          {character.character_name}
        </h2>
        <p className="mt-1 truncate text-xs text-slate-500">
          by {creator?.display_name ?? "Typring user"}
        </p>
        <p className="mt-3 text-xs font-bold text-slate-400">{voteCount}票</p>
      </div>
    </Link>
  );
}

async function getVoteCounts(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  characterIds: string[]
) {
  const counts = new Map<string, number>();

  if (characterIds.length === 0) {
    return counts;
  }

  const { data } = await supabase
    .from("character_type_votes")
    .select("character_diagnosis_id")
    .in("character_diagnosis_id", characterIds);

  for (const vote of (data ?? []) as VoteRow[]) {
    counts.set(
      vote.character_diagnosis_id,
      (counts.get(vote.character_diagnosis_id) ?? 0) + 1
    );
  }

  return counts;
}

function normalizeCharacters(data: unknown): CharacterDiagnosisRow[] {
  return ((data ?? []) as CharacterDiagnosisRow[]).map((character) => ({
    ...character,
    creator: Array.isArray(character.creator)
      ? character.creator[0] ?? null
      : character.creator
  }));
}

function getTime(value: string) {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}
