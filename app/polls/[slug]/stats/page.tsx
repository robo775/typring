import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionHeader } from "@/components/ui/section-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SearchParams = Record<string, string | string[] | undefined>;

type PollOption = {
  body: string;
  id: string;
  position: number;
};

type TypeSystem = {
  id: string;
  name: string;
};

type TypeValue = {
  code: string;
  id: string;
  name: string;
  position: number;
};

type BreakdownRow = {
  option_id: string;
  response_count: number;
  type_value_id: string;
};

export default async function PollStatsPage({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams?: SearchParams;
}) {
  const supabase = createSupabaseServerClient();
  const { data: poll } = await supabase
    .from("polls")
    .select("id,slug,title,question")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!poll) {
    notFound();
  }

  const { data: optionRows } = await supabase
    .from("poll_options")
    .select("id,body,position")
    .eq("poll_id", poll.id)
    .order("position", { ascending: true });
  const { data: typeSystemRows } = await supabase
    .from("type_systems")
    .select("id,name")
    .eq("is_active", true)
    .order("position", { ascending: true })
    .order("name", { ascending: true });
  const options = (optionRows ?? []) as PollOption[];
  const typeSystems = (typeSystemRows ?? []) as TypeSystem[];
  const selectedTypeSystemId =
    getParam(searchParams, "type_system") || typeSystems[0]?.id || "";
  const selectedTypeSystem = typeSystems.find(
    (system) => system.id === selectedTypeSystemId
  );
  const layout =
    getParam(searchParams, "layout") === "type_rows" ? "type_rows" : "answer_rows";
  const { data: typeValueRows } = selectedTypeSystem
    ? await supabase
        .from("type_values")
        .select("id,code,name,position")
        .eq("type_system_id", selectedTypeSystem.id)
        .eq("is_active", true)
        .order("position", { ascending: true })
        .order("name", { ascending: true })
    : { data: [] };
  const typeValues = (typeValueRows ?? []) as TypeValue[];
  const { data: breakdownRows } = selectedTypeSystem
    ? await supabase.rpc("get_poll_type_breakdown", {
        p_poll_id: poll.id,
        p_type_system_id: selectedTypeSystem.id
      })
    : { data: [] };
  const breakdown = (breakdownRows ?? []) as BreakdownRow[];
  const matrix = buildMatrix({ breakdown, options, typeValues });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          eyebrow="Poll Stats"
          title="アンケート類型別集計"
          description="回答結果を選択した類型システム別に集計します。行の中で一番多い組み合わせを赤色で表示します。"
        />
        <Link
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink"
          href={`/polls/${poll.slug}`}
        >
          アンケートへ戻る
        </Link>
      </div>

      <section className="rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
        <h1 className="text-xl font-bold text-ink">{poll.title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{poll.question}</p>
        <form className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr_auto]" method="get">
          <label className="grid gap-2 text-sm font-semibold text-ink">
            類型システム
            <select
              className={selectClass}
              defaultValue={selectedTypeSystemId}
              name="type_system"
            >
              {typeSystems.map((system) => (
                <option key={system.id} value={system.id}>
                  {system.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-ink">
            表示方向
            <select className={selectClass} defaultValue={layout} name="layout">
              <option value="answer_rows">アンケート回答 × 類型</option>
              <option value="type_rows">類型 × アンケート回答</option>
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

      {!selectedTypeSystem ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-500">
          集計できる類型システムがまだありません。
        </div>
      ) : layout === "answer_rows" ? (
        <AnswerRowsTable
          matrix={matrix}
          options={options}
          typeSystem={selectedTypeSystem}
          typeValues={typeValues}
        />
      ) : (
        <TypeRowsTable
          matrix={matrix}
          options={options}
          typeSystem={selectedTypeSystem}
          typeValues={typeValues}
        />
      )}

      <section className="grid gap-4 lg:grid-cols-2">
        <RankingByAnswer
          matrix={matrix}
          options={options}
          typeSystem={selectedTypeSystem}
          typeValues={typeValues}
        />
        <RankingByType
          matrix={matrix}
          options={options}
          typeSystem={selectedTypeSystem}
          typeValues={typeValues}
        />
      </section>
    </div>
  );
}

function AnswerRowsTable({
  matrix,
  options,
  typeSystem,
  typeValues
}: {
  matrix: Matrix;
  options: PollOption[];
  typeSystem: TypeSystem;
  typeValues: TypeValue[];
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white bg-white/88 shadow-sm">
      <TableTitle title={`アンケート回答 × ${typeSystem.name}`} />
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-bold text-slate-500">
              <th className="sticky left-0 z-10 min-w-44 border-b border-r border-slate-200 bg-slate-50 px-3 py-3">
                回答
              </th>
              {typeValues.map((value) => (
                <th className="min-w-20 border-b border-slate-200 px-3 py-3 text-center" key={value.id}>
                  {value.name || value.code}
                </th>
              ))}
              <th className="min-w-20 border-b border-slate-200 px-3 py-3 text-center">
                合計
              </th>
            </tr>
          </thead>
          <tbody>
            {options.map((option) => {
              const max = Math.max(...typeValues.map((value) => matrix.get(option.id, value.id)));

              return (
                <tr key={option.id}>
                  <th className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white px-3 py-3 text-left font-bold text-ink">
                    {option.body}
                  </th>
                  {typeValues.map((value) => {
                    const count = matrix.get(option.id, value.id);
                    return (
                      <CountCell count={count} isMax={count > 0 && count === max} key={value.id} />
                    );
                  })}
                  <td className="border-b border-slate-100 bg-slate-50 px-3 py-3 text-center font-bold tabular-nums text-slate-700">
                    {matrix.optionTotal(option.id)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TypeRowsTable({
  matrix,
  options,
  typeSystem,
  typeValues
}: {
  matrix: Matrix;
  options: PollOption[];
  typeSystem: TypeSystem;
  typeValues: TypeValue[];
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white bg-white/88 shadow-sm">
      <TableTitle title={`${typeSystem.name} × アンケート回答`} />
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-bold text-slate-500">
              <th className="sticky left-0 z-10 min-w-28 border-b border-r border-slate-200 bg-slate-50 px-3 py-3">
                {typeSystem.name}
              </th>
              {options.map((option) => (
                <th className="min-w-36 border-b border-slate-200 px-3 py-3 text-center" key={option.id}>
                  {option.body}
                </th>
              ))}
              <th className="min-w-20 border-b border-slate-200 px-3 py-3 text-center">
                合計
              </th>
            </tr>
          </thead>
          <tbody>
            {typeValues.map((value) => {
              const max = Math.max(...options.map((option) => matrix.get(option.id, value.id)));

              return (
                <tr key={value.id}>
                  <th className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white px-3 py-3 text-left font-bold text-ink">
                    {value.name || value.code}
                  </th>
                  {options.map((option) => {
                    const count = matrix.get(option.id, value.id);
                    return (
                      <CountCell count={count} isMax={count > 0 && count === max} key={option.id} />
                    );
                  })}
                  <td className="border-b border-slate-100 bg-slate-50 px-3 py-3 text-center font-bold tabular-nums text-slate-700">
                    {matrix.typeTotal(value.id)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RankingByAnswer({
  matrix,
  options,
  typeSystem,
  typeValues
}: {
  matrix: Matrix;
  options: PollOption[];
  typeSystem?: TypeSystem;
  typeValues: TypeValue[];
}) {
  return (
    <section className="rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
      <h2 className="text-lg font-bold text-ink">回答別 類型ランキング</h2>
      <p className="mt-1 text-sm text-slate-500">
        各回答を選んだ人に多い{typeSystem?.name ?? "類型"}です。
      </p>
      <div className="mt-4 space-y-4">
        {options.map((option) => {
          const ranking = typeValues
            .map((value) => ({
              count: matrix.get(option.id, value.id),
              label: value.name || value.code
            }))
            .filter((item) => item.count > 0)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

          return <RankingBlock emptyText="まだ集計できる回答がありません。" items={ranking} key={option.id} title={option.body} />;
        })}
      </div>
    </section>
  );
}

function RankingByType({
  matrix,
  options,
  typeSystem,
  typeValues
}: {
  matrix: Matrix;
  options: PollOption[];
  typeSystem?: TypeSystem;
  typeValues: TypeValue[];
}) {
  return (
    <section className="rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
      <h2 className="text-lg font-bold text-ink">類型別 回答ランキング</h2>
      <p className="mt-1 text-sm text-slate-500">
        {typeSystem?.name ?? "類型"}ごとに多い回答です。
      </p>
      <div className="mt-4 space-y-4">
        {typeValues.map((value) => {
          const ranking = options
            .map((option) => ({
              count: matrix.get(option.id, value.id),
              label: option.body
            }))
            .filter((item) => item.count > 0)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

          return <RankingBlock emptyText="まだ集計できる回答がありません。" items={ranking} key={value.id} title={value.name || value.code} />;
        })}
      </div>
    </section>
  );
}

function RankingBlock({
  emptyText,
  items,
  title
}: {
  emptyText: string;
  items: { count: number; label: string }[];
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <h3 className="font-bold text-ink">{title}</h3>
      {items.length > 0 ? (
        <ol className="mt-3 space-y-2">
          {items.map((item, index) => (
            <li className="flex items-center justify-between gap-3 text-sm" key={`${item.label}-${index}`}>
              <span className="font-semibold text-slate-700">
                {index + 1}位 {item.label}
              </span>
              <span className="tabular-nums text-slate-500">{item.count}人</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-sm text-slate-500">{emptyText}</p>
      )}
    </div>
  );
}

function CountCell({ count, isMax }: { count: number; isMax: boolean }) {
  return (
    <td
      className={`border-b border-slate-100 px-3 py-3 text-center tabular-nums ${
        isMax
          ? "bg-red-100 font-bold text-red-800"
          : count > 0
            ? "bg-teal-50 text-ink"
            : "text-slate-300"
      }`}
    >
      {count}
    </td>
  );
}

function TableTitle({ title }: { title: string }) {
  return (
    <div className="border-b border-slate-100 p-5">
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">
        行の中で一番多い組み合わせを赤色で表示します。
      </p>
    </div>
  );
}

type Matrix = ReturnType<typeof buildMatrix>;

function buildMatrix({
  breakdown,
  options,
  typeValues
}: {
  breakdown: BreakdownRow[];
  options: PollOption[];
  typeValues: TypeValue[];
}) {
  const values = new Map<string, number>();
  const optionTotals = new Map(options.map((option) => [option.id, 0]));
  const typeTotals = new Map(typeValues.map((value) => [value.id, 0]));

  for (const row of breakdown) {
    const count = Number(row.response_count ?? 0);
    const key = `${row.option_id}:${row.type_value_id}`;
    values.set(key, count);
    optionTotals.set(row.option_id, (optionTotals.get(row.option_id) ?? 0) + count);
    typeTotals.set(row.type_value_id, (typeTotals.get(row.type_value_id) ?? 0) + count);
  }

  return {
    get(optionId: string, typeValueId: string) {
      return values.get(`${optionId}:${typeValueId}`) ?? 0;
    },
    optionTotal(optionId: string) {
      return optionTotals.get(optionId) ?? 0;
    },
    typeTotal(typeValueId: string) {
      return typeTotals.get(typeValueId) ?? 0;
    }
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
