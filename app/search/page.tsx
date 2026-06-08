import Link from "next/link";
import { AdSlot } from "@/components/ads/ad-slot";
import { ProfileCard } from "@/components/profiles/profile-card";
import { SearchForm } from "@/components/search/search-form";
import { SectionHeader } from "@/components/ui/section-header";
import { getAdVisibility } from "@/lib/ads/viewer";
import { getUserLevelSummaries } from "@/lib/levels/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTopVotedTypesForUsers } from "@/lib/votes/queries";

type SearchParams = Record<string, string | string[] | undefined>;

type ProfileResult = {
  allow_external_typing?: boolean;
  avatar_url: string | null;
  bio: string | null;
  display_name: string;
  id: string;
  twitter_handle: string | null;
};

type ProfileTypeWithPosition = {
  position: number;
  system: string;
  value: string;
  valuePosition: number;
};

const PAGE_SIZE = 20;

export default async function SearchPage({
  searchParams
}: {
  searchParams?: SearchParams;
}) {
  const supabase = createSupabaseServerClient();
  const handleQuery = getParam(searchParams, "q")
    .replace(/^@/, "")
    .trim()
    .slice(0, 80);
  const page = Math.max(1, Number(getParam(searchParams, "page") || "1") || 1);
  const { data: typeSystemRows } = await supabase
    .from("type_systems")
    .select("id,code,name")
    .eq("is_active", true)
    .order("position", { ascending: true })
    .order("name", { ascending: true });
  const { data: typeValueRows } = await supabase
    .from("type_values")
    .select("id,type_system_id,code,name")
    .eq("is_active", true)
    .order("position", { ascending: true })
    .order("name", { ascending: true });

  const typeSystems = typeSystemRows ?? [];
  const typeValues = typeValueRows ?? [];
  const selectedTypeValueIds = getSelectedTypeValueIds(searchParams, typeSystems);
  const selectedTypeValues = Array.from(selectedTypeValueIds.entries()).map(
    ([typeSystemId, typeValueId]) => ({ typeSystemId, typeValueId })
  );
  const profileResults = await searchProfiles({
    handleQuery,
    page,
    selectedTypeValues,
    supabase
  });
  const userIds = profileResults.map((profile) => profile.id);
  const profileTypesByUserId = await getProfileTypesByUserId(supabase, userIds);
  const votedTypesByUserId = await getTopVotedTypesForUsers(supabase, userIds);
  const levelSummariesByUserId = await getUserLevelSummaries(supabase, userIds);
  const showAds = await getAdVisibility(supabase);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <SectionHeader
        eyebrow="Search"
        title="類型でユーザー検索"
        description="Xハンドル名や自認タイプの組み合わせからユーザーを探せます。複数条件を選ぶと、すべてに当てはまるユーザーだけを表示します。"
      />
      <section className="rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
        <SearchForm
          handleQuery={handleQuery}
          selectedTypeValueIds={selectedTypeValueIds}
          typeSystems={typeSystems}
          typeValues={typeValues}
        />
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {profileResults.map((profile) => {
          const card = (
            <ProfileCard
              avatarUrl={profile.avatar_url}
              bio={profile.bio ?? "このユーザーはまだ自己紹介を書いていません。"}
              displayName={profile.display_name}
              handle={profile.twitter_handle ?? "unknown"}
              levelSummary={levelSummariesByUserId.get(profile.id)}
              showVotedTypes={profile.allow_external_typing ?? true}
              types={profileTypesByUserId.get(profile.id) ?? []}
              votedTypes={
                profile.allow_external_typing === false
                  ? []
                  : votedTypesByUserId.get(profile.id) ?? []
              }
            />
          );

          return profile.twitter_handle ? (
            <Link
              href={`/users/${encodeURIComponent(profile.twitter_handle)}`}
              key={profile.id}
            >
              {card}
            </Link>
          ) : (
            <div key={profile.id}>{card}</div>
          );
        })}
      </div>

      {profileResults.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-500">
          条件に合うユーザーが見つかりませんでした。
        </div>
      ) : null}

      <SearchPagination
        hasNext={profileResults.length === PAGE_SIZE}
        page={page}
        searchParams={searchParams}
      />

      <AdSlot
        label="検索結果 広告枠"
        show={showAds}
        slot={process.env.NEXT_PUBLIC_ADSENSE_SEARCH_SLOT}
      />
    </div>
  );
}

function getParam(searchParams: SearchParams | undefined, key: string) {
  const value = searchParams?.[key];

  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function getSelectedTypeValueIds(
  searchParams: SearchParams | undefined,
  typeSystems: { id: string }[]
) {
  const selected = new Map<string, string>();

  for (const system of typeSystems) {
    const value = getParam(searchParams, `type:${system.id}`);

    if (value) {
      selected.set(system.id, value);
    }
  }

  return selected;
}

async function searchProfiles({
  handleQuery,
  page,
  selectedTypeValues,
  supabase
}: {
  handleQuery: string;
  page: number;
  selectedTypeValues: { typeSystemId: string; typeValueId: string }[];
  supabase: ReturnType<typeof createSupabaseServerClient>;
}) {
  const matchedUserIds =
    selectedTypeValues.length > 0
      ? await getUserIdsMatchingAllTypes(supabase, selectedTypeValues)
      : null;

  if (matchedUserIds && matchedUserIds.length === 0) {
    return [];
  }

  let query = supabase
    .from("profiles")
    .select("id,allow_external_typing,avatar_url,bio,display_name,twitter_handle")
    .not("twitter_handle", "is", null)
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (handleQuery) {
    query = query.ilike("twitter_handle", `%${handleQuery}%`);
  }

  if (matchedUserIds) {
    query = query.in("id", matchedUserIds);
  }

  const { data } = await query;
  return (data ?? []) as ProfileResult[];
}

async function getUserIdsMatchingAllTypes(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  selectedTypeValues: { typeSystemId: string; typeValueId: string }[]
) {
  const selectedTypeValueIds = selectedTypeValues.map(
    (selection) => selection.typeValueId
  );
  const { data } = await supabase
    .from("user_types")
    .select("user_id,type_system_id,type_value_id")
    .in("type_value_id", selectedTypeValueIds);
  const rows = data ?? [];
  const requiredPairs = new Set(
    selectedTypeValues.map(
      (selection) => `${selection.typeSystemId}:${selection.typeValueId}`
    )
  );
  const matchedPairsByUserId = new Map<string, Set<string>>();

  for (const row of rows) {
    const pair = `${row.type_system_id}:${row.type_value_id}`;

    if (!requiredPairs.has(pair)) {
      continue;
    }

    const matchedPairs = matchedPairsByUserId.get(row.user_id) ?? new Set<string>();
    matchedPairs.add(pair);
    matchedPairsByUserId.set(row.user_id, matchedPairs);
  }

  return Array.from(matchedPairsByUserId.entries())
    .filter(([, pairs]) => pairs.size === requiredPairs.size)
    .map(([userId]) => userId);
}

async function getProfileTypesByUserId(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  userIds: string[]
) {
  if (userIds.length === 0) {
    return new Map<string, { system: string; value: string }[]>();
  }

  const { data: userTypes } = await supabase
    .from("user_types")
    .select("user_id,type_system_id,type_value_id")
    .in("user_id", userIds);
  const rows = userTypes ?? [];
  const typeSystemIds = Array.from(new Set(rows.map((row) => row.type_system_id)));
  const typeValueIds = Array.from(new Set(rows.map((row) => row.type_value_id)));
  const typeSystemResult =
    typeSystemIds.length > 0
      ? await supabase
          .from("type_systems")
          .select("id,name,position")
          .in("id", typeSystemIds)
      : { data: [] };
  const typeValueResult =
    typeValueIds.length > 0
      ? await supabase
          .from("type_values")
          .select("id,code,name,position")
          .in("id", typeValueIds)
      : { data: [] };
  const typeSystems = typeSystemResult.data ?? [];
  const typeValues = typeValueResult.data ?? [];
  const profileTypesByUserId = new Map<string, ProfileTypeWithPosition[]>();

  for (const row of rows) {
    const system = typeSystems.find((typeSystem) => typeSystem.id === row.type_system_id);
    const value = typeValues.find((typeValue) => typeValue.id === row.type_value_id);

    if (!system || !value) {
      continue;
    }

    const profileTypes = profileTypesByUserId.get(row.user_id) ?? [];
    profileTypes.push({
      position: system.position ?? 0,
      system: system.name,
      value: value.name || value.code,
      valuePosition: value.position ?? 0
    });
    profileTypesByUserId.set(
      row.user_id,
      profileTypes.sort((a, b) => {
        if (a.position !== b.position) {
          return a.position - b.position;
        }

        return a.valuePosition - b.valuePosition;
      })
    );
  }

  return new Map(
    Array.from(profileTypesByUserId.entries()).map(([userId, profileTypes]) => [
      userId,
      profileTypes.map(({ system, value }) => ({ system, value }))
    ])
  );
}

function SearchPagination({
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
        <a
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink"
          href={createPageHref(searchParams, page - 1)}
        >
          前へ
        </a>
      ) : null}
      <span className="text-sm font-semibold text-slate-500">{page}ページ目</span>
      {hasNext ? (
        <a
          className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
          href={createPageHref(searchParams, page + 1)}
        >
          次へ
        </a>
      ) : null}
    </nav>
  );
}

function createPageHref(
  searchParams: SearchParams | undefined,
  nextPage: number
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (key === "page") {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
    } else if (value) {
      params.set(key, value);
    }
  }

  params.set("page", String(nextPage));
  return `/search?${params.toString()}`;
}
