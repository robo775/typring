import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Plus, Search, Sparkles } from "lucide-react";
import { CharacterDiagnosisCard } from "@/components/character-diagnoses/character-diagnosis-card";
import { SectionHeader } from "@/components/ui/section-header";
import { getCharacterImageUrl } from "@/lib/character-diagnoses/images";
import {
  buildCharacterVoteSummary,
  getTopTypesBySystem,
  type CharacterTopType,
  type CharacterTypeVoteRow,
  type TypeSystemForSummary,
  type TypeValueForSummary
} from "@/lib/character-diagnoses/vote-summary";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "キャラ診断",
  description:
    "作品キャラクターに対してMBTIやエニアグラムなどの類型を投票できるページです。"
};

type SearchParams = Record<string, string | string[] | undefined>;

type CharacterDiagnosisRow = {
  character_name: string;
  created_at: string;
  description: string | null;
  id: string;
  image_path: string | null;
  work_title: string | null;
};

const PAGE_SIZE = 20;
const MAX_SEARCH_ROWS = 500;

export default async function CharacterDiagnosesPage({
  searchParams
}: {
  searchParams?: SearchParams;
}) {
  const supabase = createSupabaseServerClient();
  const keywordQuery = getParam(searchParams, "q").trim().slice(0, 80);
  const sort = getParam(searchParams, "sort") === "votes" ? "votes" : "latest";
  const page = Math.max(1, Number(getParam(searchParams, "page") || "1") || 1);
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
  const typeSystems = (typeSystemRows ?? []) as TypeSystemForSummary[];
  const typeValues = (typeValueRows ?? []) as TypeValueForSummary[];
  const selectedTopTypeValueIds = getSelectedTopTypeValueIds(
    searchParams,
    typeSystems
  );
  const characters = await searchCharacters({
    keywordQuery,
    supabase
  });
  const characterIds = characters.map((character) => character.id);
  const votesByCharacterId = await getVotesByCharacterId(supabase, characterIds);
  const topTypesByCharacterId = new Map<string, CharacterTopType[]>();
  const voteCountsByCharacterId = new Map<string, number>();

  for (const character of characters) {
    const votes = votesByCharacterId.get(character.id) ?? [];
    const summary = buildCharacterVoteSummary({
      typeSystems,
      typeValues,
      votes
    });
    topTypesByCharacterId.set(character.id, getTopTypesBySystem(summary));
    voteCountsByCharacterId.set(character.id, votes.length);
  }

  const filteredCharacters = characters.filter((character) =>
    matchesSelectedTopTypes({
      selectedTopTypeValueIds,
      topTypes: topTypesByCharacterId.get(character.id) ?? []
    })
  );
  const sortedCharacters =
    sort === "votes"
      ? [...filteredCharacters].sort(
          (a, b) =>
            (voteCountsByCharacterId.get(b.id) ?? 0) -
              (voteCountsByCharacterId.get(a.id) ?? 0) ||
            getTime(b.created_at) - getTime(a.created_at)
        )
      : filteredCharacters;
  const visibleCharacters = sortedCharacters.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );
  const hasNext = sortedCharacters.length > page * PAGE_SIZE;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          eyebrow="Character Types"
          title="キャラクター他者診断"
          description="作品名・キャラ名・みんなの診断1位から、投票したいキャラを探せます。"
        />
        <Link
          className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-soft"
          href="/character-diagnoses/new"
        >
          <Plus className="h-4 w-4" />
          キャラ診断を作る
        </Link>
      </div>

      {getParam(searchParams, "deleted") ? (
        <p className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-700">
          キャラクター診断を削除しました。
        </p>
      ) : null}
      {getParam(searchParams, "error") ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {getParam(searchParams, "error")}
        </p>
      ) : null}

      <section className="rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
        <form className="grid gap-4" method="get">
          <input name="sort" type="hidden" value={sort} />
          <label className="grid gap-2 text-sm font-semibold text-ink">
            作品名・キャラクター名
            <input
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal outline-none transition focus:border-ringTeal focus:ring-2 focus:ring-teal-100"
              defaultValue={keywordQuery}
              name="q"
              placeholder="例: フリーレン、ノート、セイバー"
            />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            {typeSystems.map((system) => {
              const values = typeValues.filter(
                (value) => value.type_system_id === system.id
              );

              return (
                <label
                  className="grid gap-2 text-sm font-semibold text-ink"
                  key={system.id}
                >
                  {system.name} の1位
                  <select
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal outline-none transition focus:border-ringTeal focus:ring-2 focus:ring-teal-100"
                    defaultValue={selectedTopTypeValueIds.get(system.id) ?? ""}
                    name={`top:${system.id}`}
                  >
                    <option value="">指定しない</option>
                    {values.map((value) => (
                      <option key={value.id} value={value.id}>
                        {value.name || value.code}
                      </option>
                    ))}
                  </select>
                </label>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white"
              type="submit"
            >
              <Search className="h-4 w-4" />
              検索
            </button>
            <Link
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-ink"
              href="/character-diagnoses"
            >
              クリア
            </Link>
          </div>
        </form>
      </section>

      <div className="flex gap-2">
        <SortLink active={sort === "latest"} href={createSortHref(searchParams, "latest")}>
          新着順
        </SortLink>
        <SortLink active={sort === "votes"} href={createSortHref(searchParams, "votes")}>
          投票数順
        </SortLink>
      </div>

      {visibleCharacters.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {visibleCharacters.map((character) => (
            <Link href={`/character-diagnoses/${character.id}`} key={character.id}>
              <CharacterDiagnosisCard
                characterName={character.character_name}
                description={character.description}
                imageUrl={getCharacterImageUrl(supabase, character.image_path)}
                topTypes={topTypesByCharacterId.get(character.id) ?? []}
                voteCount={voteCountsByCharacterId.get(character.id) ?? 0}
                workTitle={character.work_title}
              />
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-500">
          条件に合うキャラクター診断は見つかりませんでした。
        </div>
      )}

      <CharacterPagination
        hasNext={hasNext}
        page={page}
        searchParams={searchParams}
      />
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

async function searchCharacters({
  keywordQuery,
  supabase
}: {
  keywordQuery: string;
  supabase: ReturnType<typeof createSupabaseServerClient>;
}) {
  let query = supabase
    .from("character_diagnoses")
    .select("id,work_title,character_name,image_path,description,created_at")
    .is("deleted_at", null)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(MAX_SEARCH_ROWS);

  if (keywordQuery) {
    const likePattern = `%${escapePostgrestLikePattern(keywordQuery)}%`;
    query = query.or(
      [
        `work_title.ilike.${likePattern}`,
        `character_name.ilike.${likePattern}`
      ].join(",")
    );
  }

  const { data } = await query;
  return (data ?? []) as CharacterDiagnosisRow[];
}

async function getVotesByCharacterId(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  characterIds: string[]
) {
  const votesByCharacterId = new Map<string, CharacterTypeVoteRow[]>();

  if (characterIds.length === 0) {
    return votesByCharacterId;
  }

  const { data } = await supabase
    .from("character_type_votes")
    .select("character_diagnosis_id,type_system_id,type_value_id,created_at")
    .in("character_diagnosis_id", characterIds);

  for (const vote of (data ?? []) as CharacterTypeVoteRow[]) {
    const votes = votesByCharacterId.get(vote.character_diagnosis_id) ?? [];
    votes.push(vote);
    votesByCharacterId.set(vote.character_diagnosis_id, votes);
  }

  return votesByCharacterId;
}

function getParam(searchParams: SearchParams | undefined, key: string) {
  const value = searchParams?.[key];

  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function getSelectedTopTypeValueIds(
  searchParams: SearchParams | undefined,
  typeSystems: { id: string }[]
) {
  const selected = new Map<string, string>();

  for (const system of typeSystems) {
    const value = getParam(searchParams, `top:${system.id}`);

    if (value) {
      selected.set(system.id, value);
    }
  }

  return selected;
}

function matchesSelectedTopTypes({
  selectedTopTypeValueIds,
  topTypes
}: {
  selectedTopTypeValueIds: Map<string, string>;
  topTypes: CharacterTopType[];
}) {
  if (selectedTopTypeValueIds.size === 0) {
    return true;
  }

  return Array.from(selectedTopTypeValueIds.entries()).every(
    ([typeSystemId, typeValueId]) =>
      topTypes.some(
        (type) =>
          type.typeSystemId === typeSystemId && type.typeValueId === typeValueId
      )
  );
}

function escapePostgrestLikePattern(value: string) {
  return value
    .replace(/[(),]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
}

function CharacterPagination({
  hasNext,
  page,
  searchParams
}: {
  hasNext: boolean;
  page: number;
  searchParams: SearchParams | undefined;
}) {
  if (page <= 1 && !hasNext) {
    return null;
  }

  return (
    <nav className="flex items-center justify-center gap-3">
      {page > 1 ? (
        <Link
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink"
          href={createPageHref(searchParams, page - 1)}
        >
          前へ
        </Link>
      ) : null}
      <span className="text-sm font-semibold text-slate-500">{page}ページ目</span>
      {hasNext ? (
        <Link
          className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
          href={createPageHref(searchParams, page + 1)}
        >
          次へ
        </Link>
      ) : null}
    </nav>
  );
}

function createPageHref(
  searchParams: SearchParams | undefined,
  nextPage: number
) {
  const params = createParamsWithout(searchParams, ["page"]);
  params.set("page", String(nextPage));
  return `/character-diagnoses?${params.toString()}`;
}

function createSortHref(searchParams: SearchParams | undefined, sort: string) {
  const params = createParamsWithout(searchParams, ["page", "sort"]);

  if (sort !== "latest") {
    params.set("sort", sort);
  }

  const query = params.toString();
  return query ? `/character-diagnoses?${query}` : "/character-diagnoses";
}

function createParamsWithout(
  searchParams: SearchParams | undefined,
  omittedKeys: string[]
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (omittedKeys.includes(key)) {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
    } else if (value) {
      params.set(key, value);
    }
  }

  return params;
}

function getTime(value: string) {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}
