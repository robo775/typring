import Link from "next/link";
import { Search, X } from "lucide-react";

type TypeSystemOption = {
  code: string;
  id: string;
  name: string;
};

type TypeValueOption = {
  code: string;
  id: string;
  name: string;
  type_system_id: string;
};

type SearchFormProps = {
  handleQuery: string;
  selectedTypeValueIds: Map<string, string>;
  typeSystems: TypeSystemOption[];
  typeValues: TypeValueOption[];
};

export function SearchForm({
  handleQuery,
  selectedTypeValueIds,
  typeSystems,
  typeValues
}: SearchFormProps) {
  return (
    <form className="grid gap-5" method="get">
      <label className="grid gap-2 text-sm font-semibold text-ink">
        Xハンドル
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-500 transition focus-within:border-ringTeal">
          <Search className="h-4 w-4" />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none"
            defaultValue={handleQuery}
            maxLength={80}
            name="q"
            placeholder="ハンドル名で検索"
          />
        </div>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        {typeSystems.map((system) => {
          const values = typeValues.filter(
            (value) => value.type_system_id === system.id
          );

          return (
            <label
              className="grid gap-2 text-sm font-semibold text-ink"
              key={system.id}
            >
              {system.name}
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal outline-none transition focus:border-ringTeal focus:ring-2 focus:ring-teal-100"
                defaultValue={selectedTypeValueIds.get(system.id) ?? ""}
                name={`type:${system.id}`}
              >
                <option value="">指定なし</option>
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

      {typeSystems.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
          有効な類型システムがありません。Supabaseのマイグレーションとseedを適用してください。
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
          type="submit"
        >
          <Search className="h-4 w-4" />
          検索
        </button>
        <Link
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:border-ringTeal"
          href="/search"
        >
          <X className="h-4 w-4" />
          クリア
        </Link>
      </div>
    </form>
  );
}
