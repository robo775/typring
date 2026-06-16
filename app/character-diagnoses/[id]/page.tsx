import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, ImageUp, Sparkles } from "lucide-react";
import { CharacterTypeVoteForm } from "@/components/character-diagnoses/character-type-vote-form";
import { DeleteCharacterDiagnosisButton } from "@/components/character-diagnoses/delete-character-diagnosis-button";
import {
  removeCharacterDiagnosisImage,
  updateCharacterDiagnosisImage
} from "@/lib/character-diagnoses/actions";
import { getCharacterImageUrl } from "@/lib/character-diagnoses/images";
import { SectionHeader } from "@/components/ui/section-header";
import { TypeVoteSummary } from "@/components/votes/type-vote-summary";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type CharacterDiagnosisRow = {
  character_name: string;
  created_at: string;
  creator:
    | { display_name: string; twitter_handle: string | null }
    | { display_name: string; twitter_handle: string | null }[]
    | null;
  creator_user_id: string;
  description: string | null;
  id: string;
  image_path: string | null;
  related_url: string | null;
  work_title: string | null;
};

type TypeSystemRow = {
  id: string;
  name: string;
  position: number | null;
};

type TypeValueRow = {
  code: string;
  id: string;
  name: string;
  position: number | null;
  type_system_id: string;
};

type CharacterVoteRow = {
  created_at: string;
  type_system_id: string;
  type_value_id: string;
};

type OwnVoteRow = {
  type_system_id: string;
  type_value_id: string;
};

export async function generateMetadata({
  params
}: {
  params: { id: string };
}): Promise<Metadata> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("character_diagnoses")
    .select("character_name,work_title")
    .eq("id", params.id)
    .eq("is_public", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (!data) {
    return {
      title: "キャラクター他者診断"
    };
  }

  return {
    title: `${data.character_name} キャラ診断`,
    description: `${data.work_title ?? "作品名未設定"}の${data.character_name}をみんなで類型投票できます。`
  };
}

export default async function CharacterDiagnosisDetailPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: {
    created?: string;
    error?: string;
    image_removed?: string;
    image_updated?: string;
    voted?: string;
  };
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data: characterData } = await supabase
    .from("character_diagnoses")
    .select(
      "id,creator_user_id,work_title,character_name,image_path,description,related_url,created_at,creator:profiles!character_diagnoses_creator_user_id_fkey(display_name,twitter_handle)"
    )
    .eq("id", params.id)
    .is("deleted_at", null)
    .eq("is_public", true)
    .maybeSingle();

  if (!characterData) {
    notFound();
  }

  const character = normalizeCharacter(characterData);
  const imageUrl = getCharacterImageUrl(supabase, character.image_path);
  const { data: typeSystemRows } = await supabase
    .from("type_systems")
    .select("id,name,position")
    .eq("is_active", true)
    .order("position", { ascending: true })
    .order("name", { ascending: true });
  const { data: typeValueRows } = await supabase
    .from("type_values")
    .select("id,type_system_id,code,name,position")
    .eq("is_active", true)
    .order("position", { ascending: true })
    .order("name", { ascending: true });
  const typeSystems = (typeSystemRows ?? []) as TypeSystemRow[];
  const typeValues = (typeValueRows ?? []) as TypeValueRow[];
  const { data: voteRows } = await supabase
    .from("character_type_votes")
    .select("type_system_id,type_value_id,created_at")
    .eq("character_diagnosis_id", character.id);
  const { data: ownVoteRows } = user
    ? await supabase
        .from("character_type_votes")
        .select("type_system_id,type_value_id")
        .eq("character_diagnosis_id", character.id)
        .eq("voter_user_id", user.id)
    : { data: [] };
  const currentVoteValueIds = new Map(
    ((ownVoteRows ?? []) as OwnVoteRow[]).map((vote) => [
      vote.type_system_id,
      vote.type_value_id
    ])
  );
  const summaryItems = buildSummaryItems({
    typeSystems,
    typeValues,
    votes: (voteRows ?? []) as CharacterVoteRow[]
  });
  const creator = Array.isArray(character.creator)
    ? character.creator[0]
    : character.creator;
  const isCreator = user?.id === character.creator_user_id;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[360px_1fr]">
      <aside className="space-y-4">
        <Link
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-ink"
          href="/character-diagnoses"
        >
          <ArrowLeft className="h-4 w-4" />
          キャラ診断へ戻る
        </Link>

        <section className="overflow-hidden rounded-2xl border border-white bg-white/88 shadow-sm">
          <div className="aspect-square bg-gradient-to-br from-teal-50 via-white to-violet-100">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" className="h-full w-full object-cover" src={imageUrl} />
            ) : (
              <div className="grid h-full place-items-center text-ringViolet">
                <Sparkles className="h-16 w-16" />
              </div>
            )}
          </div>
          <div className="p-5">
            <p className="text-xs font-bold text-ringViolet">
              {character.work_title ?? "作品名未設定"}
            </p>
            <h1 className="mt-1 text-2xl font-black text-ink">
              {character.character_name}
            </h1>
            <p className="mt-2 text-xs font-semibold text-slate-500">
              作成者: {creator?.display_name ?? "Typring user"}
            </p>
            {character.description ? (
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {character.description}
              </p>
            ) : null}
            {character.related_url ? (
              <a
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-ringViolet"
                href={character.related_url}
                rel="noopener noreferrer"
                target="_blank"
              >
                関連URL
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </section>

        {isCreator ? (
          <section className="rounded-2xl border border-white bg-white/88 p-4 shadow-sm">
            <h2 className="text-sm font-black text-ink">画像を変更</h2>
            <form action={updateCharacterDiagnosisImage} className="mt-3 grid gap-3">
              <input
                name="character_diagnosis_id"
                type="hidden"
                value={character.id}
              />
              <input
                accept="image/jpeg,image/png,image/webp"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-3 file:py-2 file:text-xs file:font-bold file:text-white"
                name="image_file"
                type="file"
              />
              <p className="text-xs leading-5 text-slate-500">
                jpg / png / webp、5MB以下。登録すると現在の画像と差し替わります。
              </p>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-bold text-white"
                type="submit"
              >
                <ImageUp className="h-4 w-4" />
                画像を保存
              </button>
            </form>
            {character.image_path ? (
              <form action={removeCharacterDiagnosisImage} className="mt-3">
                <input
                  name="character_diagnosis_id"
                  type="hidden"
                  value={character.id}
                />
                <button
                  className="text-sm font-bold text-red-600"
                  type="submit"
                >
                  画像を外す
                </button>
              </form>
            ) : null}
          </section>
        ) : null}

        {isCreator ? (
          <DeleteCharacterDiagnosisButton characterId={character.id} />
        ) : null}
      </aside>

      <section className="space-y-4">
        {searchParams?.created ? (
          <StatusMessage>キャラクター診断を作成しました。</StatusMessage>
        ) : null}
        {searchParams?.image_updated ? (
          <StatusMessage>画像を更新しました。</StatusMessage>
        ) : null}
        {searchParams?.image_removed ? (
          <StatusMessage>画像を外しました。</StatusMessage>
        ) : null}
        {searchParams?.voted ? (
          <StatusMessage>投票を保存しました。</StatusMessage>
        ) : null}
        {searchParams?.error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {getErrorMessage(searchParams.error)}
          </p>
        ) : null}

        <SectionHeader
          eyebrow="Votes"
          title="みんなの診断結果"
          description="キャラクター本人の自認タイプではなく、みんなの解釈を投票で集めます。"
        />
        <TypeVoteSummary items={summaryItems} />

        <SectionHeader
          eyebrow="Your Vote"
          title="あなたの投票"
          description="このキャラはどの類型に見える？作成者も投票できます。"
        />
        <CharacterTypeVoteForm
          characterId={character.id}
          currentVoteValueIds={currentVoteValueIds}
          isLoggedIn={Boolean(user)}
          typeSystems={typeSystems}
          typeValues={typeValues}
        />
      </section>
    </div>
  );
}

function StatusMessage({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-700">
      {children}
    </p>
  );
}

function getErrorMessage(error: string) {
  const messages: Record<string, string> = {
    image_required: "画像ファイルを選択してください。",
    image_too_large: "画像は5MB以下にしてください。",
    invalid_image_type: "画像はjpg / png / webpのみ登録できます。"
  };

  return messages[error] ?? error;
}

function buildSummaryItems({
  typeSystems,
  typeValues,
  votes
}: {
  typeSystems: TypeSystemRow[];
  typeValues: TypeValueRow[];
  votes: CharacterVoteRow[];
}) {
  const counts = new Map<
    string,
    {
      firstVotedAt: string | null;
      typeSystemId: string;
      typeValueId: string;
      voteCount: number;
    }
  >();
  const totals = new Map<string, number>();

  for (const vote of votes) {
    const key = `${vote.type_system_id}:${vote.type_value_id}`;
    const current = counts.get(key);
    counts.set(key, {
      firstVotedAt: getEarlierDate(current?.firstVotedAt ?? null, vote.created_at),
      typeSystemId: vote.type_system_id,
      typeValueId: vote.type_value_id,
      voteCount: (current?.voteCount ?? 0) + 1
    });
    totals.set(vote.type_system_id, (totals.get(vote.type_system_id) ?? 0) + 1);
  }

  return Array.from(counts.values())
    .map((count) => {
      const system = typeSystems.find((item) => item.id === count.typeSystemId);
      const value = typeValues.find((item) => item.id === count.typeValueId);
      const totalCount = totals.get(count.typeSystemId) ?? 0;

      if (!system || !value || totalCount === 0) {
        return null;
      }

      return {
        firstVotedAt: count.firstVotedAt,
        percentage: Math.round((count.voteCount / totalCount) * 100),
        system: system.name,
        systemPosition: system.position ?? 0,
        totalCount,
        value: value.name || value.code,
        valuePosition: value.position ?? 0,
        voteCount: count.voteCount
      };
    })
    .filter(
      (
        item
      ): item is {
        firstVotedAt: string | null;
        percentage: number;
        system: string;
        systemPosition: number;
        totalCount: number;
        value: string;
        valuePosition: number;
        voteCount: number;
      } => item !== null
    )
    .sort((a, b) => {
      if (a.systemPosition !== b.systemPosition) {
        return a.systemPosition - b.systemPosition;
      }

      if (a.voteCount !== b.voteCount) {
        return b.voteCount - a.voteCount;
      }

      const firstVoteDiff = getTime(a.firstVotedAt) - getTime(b.firstVotedAt);
      if (firstVoteDiff !== 0) {
        return firstVoteDiff;
      }

      return a.valuePosition - b.valuePosition;
    });
}

function getEarlierDate(current: string | null, next: string) {
  if (!current) {
    return next;
  }

  return getTime(current) <= getTime(next) ? current : next;
}

function getTime(value: string | null) {
  if (!value) {
    return Number.MAX_SAFE_INTEGER;
  }

  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : Number.MAX_SAFE_INTEGER;
}

function normalizeCharacter(data: unknown): CharacterDiagnosisRow {
  const character = data as CharacterDiagnosisRow;

  return {
    ...character,
    creator: Array.isArray(character.creator)
      ? character.creator[0] ?? null
      : character.creator
  };
}
