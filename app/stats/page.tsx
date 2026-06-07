import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/section-header";
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

export const metadata: Metadata = {
  title: "自認タイプ統計",
  description: "Typringに登録された自認タイプの組み合わせをクロス集計で見られます。"
};

export default async function StatsPage({
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
  const rowSystemId =
    getParam(searchParams, "row") || typeSystems[0]?.id || "";
  const colSystemId =
    getParam(searchParams, "col") ||
    typeSystems.find((system) => system.id !== rowSystemId)?.id ||
    "";
  const rowSystem = typeSystems.find((system) => system.id === rowSystemId);
  const colSystem = typeSystems.find((system) => system.id === colSystemId);
  const selectedSystemIds = [rowSystem?.id, colSystem?.id].filter(
    (id): id is string => Boolean(id)
  );
  const { data: typeValueRows } =
    selectedSystemIds.length > 0
      ? await supabase
          .from("type_values")
          .select("id,code,name,type_system_id")
          .in("type_system_id", selectedSystemIds)
          .eq("is_active", true)
          .order("position", { ascending: true })
          .order("name", { ascending: true })
      : { data: [] };

  const typeValues = (typeValueRows ?? []) as TypeValue[];
  const rowValues = typeValues.filter(
    (value) => value.type_system_id === rowSystem?.id
  );
  const colValues = typeValues.filter(
    (value) => value.type_system_id === colSystem?.id
  );
  const matrix =
    rowSystem && colSystem && rowSystem.id !== colSystem.id
      ? await buildTypeMatrix({
          colSystemId: colSystem.id,
          colValues,
          rowSystemId: rowSystem.id,
          rowValues,
          supabase
        })
      : createEmptyMatrix(rowValues, colValues);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <SectionHeader
        eyebrow="Stats"
        title="自認タイプ統計"
        description="2つの類型システムを選ぶと、登録ユーザーの自認タイプの組み合わせを一覧できます。各行で一番多い組み合わせは赤色で表示します。"
      />

      <section className="rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
        <form className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]" method="get">
          <label className="grid gap-2 text-sm font-semibold text-ink">
            縦軸
            <select
              className={selectClass}
              defaultValue={rowSystemId}
              name="row"
            >
              {typeSystems.map((system) => (
                <option key={system.id} value={system.id}>
                  {system.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-ink">
            横軸
            <select
              className={selectClass}
              defaultValue={colSystemId}
              name="col"
            >
              {typeSystems.map((system) => (
                <option key={system.id} value={system.id}>
                  {system.name}
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

      {!rowSystem || !colSystem ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-500">
          集計できる類型システムがまだありません。
        </div>
      ) : rowSystem.id === colSystem.id ? (
        <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-5 text-sm text-amber-800">
          縦軸と横軸には別々の類型システムを選んでください。
        </div>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-white bg-white/88 shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-lg font-bold text-ink">
              {rowSystem.name} x {colSystem.name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              縦軸ごとに一番多い横軸の組み合わせを赤色で強調しています。
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-bold text-slate-500">
                  <th className="sticky left-0 z-10 min-w-28 border-b border-r border-slate-200 bg-slate-50 px-3 py-3">
                    {rowSystem.name}
                  </th>
                  {colValues.map((value) => (
                    <th
                      className="min-w-20 border-b border-slate-200 px-3 py-3 text-center"
                      key={value.id}
                    >
                      {value.name || value.code}
                    </th>
                  ))}
                  <th className="min-w-20 border-b border-slate-200 px-3 py-3 text-center">
                    合計
                  </th>
                </tr>
              </thead>
              <tbody>
                {rowValues.map((rowValue) => {
                  const row = matrix.rows.get(rowValue.id);
                  const max = Math.max(...Array.from(row?.counts.values() ?? [0]));

                  return (
                    <tr key={rowValue.id}>
                      <th className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white px-3 py-3 text-left font-bold text-ink">
                        {rowValue.name || rowValue.code}
                      </th>
                      {colValues.map((colValue) => {
                        const count = row?.counts.get(colValue.id) ?? 0;
                        const isRowMax = count > 0 && count === max;

                        return (
                          <td
                            className={`border-b border-slate-100 px-3 py-3 text-center tabular-nums ${
                              isRowMax
                                ? "bg-red-100 font-bold text-red-800"
                                : count > 0
                                  ? "bg-teal-50 text-ink"
                                  : "text-slate-300"
                            }`}
                            key={colValue.id}
                          >
                            {count}
                          </td>
                        );
                      })}
                      <td className="border-b border-slate-100 bg-slate-50 px-3 py-3 text-center font-bold tabular-nums text-slate-700">
                        {row?.total ?? 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 text-sm font-bold text-slate-700">
                  <th className="sticky left-0 z-10 border-r border-slate-200 bg-slate-50 px-3 py-3 text-left">
                    合計
                  </th>
                  {colValues.map((value) => (
                    <td className="px-3 py-3 text-center tabular-nums" key={value.id}>
                      {matrix.columnTotals.get(value.id) ?? 0}
                    </td>
                  ))}
                  <td className="px-3 py-3 text-center tabular-nums">
                    {matrix.total}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

async function buildTypeMatrix({
  colSystemId,
  colValues,
  rowSystemId,
  rowValues,
  supabase
}: {
  colSystemId: string;
  colValues: TypeValue[];
  rowSystemId: string;
  rowValues: TypeValue[];
  supabase: ReturnType<typeof createSupabaseServerClient>;
}) {
  const { data } = await supabase
    .from("user_types")
    .select("user_id,type_system_id,type_value_id")
    .in("type_system_id", [rowSystemId, colSystemId]);
  const typeByUser = new Map<
    string,
    { colValueId?: string; rowValueId?: string }
  >();

  for (const row of data ?? []) {
    const entry = typeByUser.get(row.user_id) ?? {};

    if (row.type_system_id === rowSystemId) {
      entry.rowValueId = row.type_value_id;
    }

    if (row.type_system_id === colSystemId) {
      entry.colValueId = row.type_value_id;
    }

    typeByUser.set(row.user_id, entry);
  }

  const matrix = createEmptyMatrix(rowValues, colValues);

  for (const entry of typeByUser.values()) {
    if (!entry.rowValueId || !entry.colValueId) {
      continue;
    }

    const row = matrix.rows.get(entry.rowValueId);

    if (!row || !matrix.columnTotals.has(entry.colValueId)) {
      continue;
    }

    row.counts.set(entry.colValueId, (row.counts.get(entry.colValueId) ?? 0) + 1);
    row.total += 1;
    matrix.columnTotals.set(
      entry.colValueId,
      (matrix.columnTotals.get(entry.colValueId) ?? 0) + 1
    );
    matrix.total += 1;
  }

  return matrix;
}

function createEmptyMatrix(rowValues: TypeValue[], colValues: TypeValue[]) {
  return {
    columnTotals: new Map(colValues.map((value) => [value.id, 0])),
    rows: new Map(
      rowValues.map((value) => [
        value.id,
        {
          counts: new Map(colValues.map((colValue) => [colValue.id, 0])),
          total: 0
        }
      ])
    ),
    total: 0
  };
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
