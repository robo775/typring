import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";
import { TypeTag } from "@/components/types/type-tag";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SearchParams = Record<string, string | string[] | undefined>;

type TypeSystem = {
  id: string;
  code: string;
  name: string;
};

type TypeValue = {
  id: string;
  code: string;
  name: string;
  type_system_id: string;
};

type RankingRow = {
  avatar_url: string | null;
  display_name: string;
  percentage: number;
  target_user_id: string;
  total_count: number;
  twitter_handle: string | null;
  type_system_id: string;
  type_value_id: string;
  vote_count: number;
};

export const metadata: Metadata = {
  title: "他者診断ランキング",
  description: "Typringで集まった他者診断の投票結果をランキングで見られます。"
};

export default async function VoteRankingsPage({
  searchParams
}: {
  searchParams?: SearchParams;
}) {
  const supabase = createSupabaseServerClient();
  const { data: typeSystemRows } = await supabase
    .from("type_systems")
    .select("id,code,name")
    .eq("is_active", true)
    .order("position", { ascending: true })
    .order("name", { ascending: true });

  const typeSystems = (typeSystemRows ?? []) as TypeSystem[];
  const selectedSystemId =
    getParam(searchParams, "system") || typeSystems[0]?.id || "";
  const { data: typeValueRows } = selectedSystemId
    ? await supabase
        .from("type_values")
        .select("id,code,name,type_system_id")
        .eq("type_system_id", selectedSystemId)
        .eq("is_active", true)
        .order("position", { ascending: true })
        .order("name", { ascending: true })
    : { data: [] };
  const typeValues = (typeValueRows ?? []) as TypeValue[];
  const selectedTypeValueId = getParam(searchParams, "type");
  const selectedSystem = typeSystems.find(
    (system) => system.id === selectedSystemId
  );
  const selectedTypeValue = typeValues.find(
    (value) => value.id === selectedTypeValueId
  );
  const { data: rankingRows } = selectedSystemId
    ? await supabase.rpc("get_type_vote_rankings", {
        p_limit: 50,
        p_type_system_id: selectedSystemId,
        p_type_value_id: selectedTypeValueId || null
      })
    : { data: [] };
  const rankings = ((rankingRows ?? []) as RankingRow[]).filter((row) => {
    if (!selectedTypeValueId) {
      return true;
    }

    return row.type_value_id === selectedTypeValueId;
  });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <SectionHeader
        eyebrow="Votes"
        title="他者診断ランキング"
        description="みんなからどう見られているかを、類型ごとの投票数でランキング表示します。"
      />

      <section className="rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
        <form className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]" method="get">
          <label className="grid gap-2 text-sm font-semibold text-ink">
            類型システム
            <select
              className={selectClass}
              defaultValue={selectedSystemId}
              name="system"
            >
              {typeSystems.map((system) => (
                <option key={system.id} value={system.id}>
                  {system.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-ink">
            類型
            <select
              className={selectClass}
              defaultValue={selectedTypeValueId}
              name="type"
            >
              <option value="">すべて</option>
              {typeValues.map((value) => (
                <option key={value.id} value={value.id}>
                  {value.name || value.code}
                </option>
              ))}
            </select>
          </label>
          <button
            className="self-end rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white"
            type="submit"
          >
            表示
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white bg-white/88 shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-ink">
            {selectedSystem?.name ?? "類型"}{" "}
            {selectedTypeValue ? `- ${selectedTypeValue.name || selectedTypeValue.code}` : ""}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            投票数が多い順に表示しています。同率の場合は割合も見ます。
          </p>
        </div>
        {rankings.length > 0 ? (
          <ol className="divide-y divide-slate-100">
            {rankings.map((row, index) => {
              const typeValue = typeValues.find(
                (value) => value.id === row.type_value_id
              );

              return (
                <li
                  className="grid gap-3 p-4 sm:grid-cols-[3rem_1fr_auto] sm:items-center"
                  key={`${row.target_user_id}-${row.type_system_id}-${row.type_value_id}`}
                >
                  <div className="text-2xl font-bold tabular-nums text-slate-300">
                    {index + 1}
                  </div>
                  <Link
                    className="flex min-w-0 items-center gap-3"
                    href={`/users/${encodeURIComponent(row.twitter_handle ?? "")}`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-ringTeal to-ringViolet text-sm font-bold text-white">
                      {row.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          alt=""
                          className="h-full w-full object-cover"
                          src={row.avatar_url}
                        />
                      ) : (
                        row.display_name.slice(0, 1).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-ink">
                        {row.display_name}
                      </p>
                      <p className="truncate text-sm text-slate-500">
                        @{row.twitter_handle}
                      </p>
                    </div>
                  </Link>
                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    <TypeTag
                      system={selectedSystem?.name ?? "他者診断"}
                      value={typeValue?.name || typeValue?.code || "不明"}
                      variant="voted"
                    />
                    <span className="text-sm font-semibold text-ink">
                      {row.vote_count}票 / {row.total_count}票中
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                      {Number(row.percentage).toFixed(1)}%
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="p-5 text-sm text-slate-500">
            まだランキングに表示できる他者診断がありません。
          </div>
        )}
      </section>
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

const selectClass =
  "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal outline-none transition focus:border-ringTeal focus:ring-2 focus:ring-teal-100";
