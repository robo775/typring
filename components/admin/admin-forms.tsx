import {
  saveFollowEdge,
  saveTypeSystem,
  saveTypeValue
} from "@/lib/admin/actions";

type TypeSystem = {
  code: string;
  description: string | null;
  id: string;
  is_active: boolean;
  name: string;
  position: number;
};

type TypeValue = {
  code: string;
  description: string | null;
  id: string;
  is_active: boolean;
  name: string;
  position: number;
  type_system_id: string;
};

export function AdminForms({
  typeSystems,
  typeValues
}: {
  typeSystems: TypeSystem[];
  typeValues: TypeValue[];
}) {
  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
        <h2 className="text-lg font-bold text-ink">Xフォローキャッシュ</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Typring登録済みユーザー同士のフォロー関係だけを手動登録します。相互にするには両方向を追加してください。
        </p>
        <form action={saveFollowEdge} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input
            className={inputClass}
            name="follower_handle"
            placeholder="フォロー元のハンドル"
            required
          />
          <input
            className={inputClass}
            name="following_handle"
            placeholder="フォロー先のハンドル"
            required
          />
          <button className={buttonClass} type="submit">
            キャッシュ登録
          </button>
        </form>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
        <h2 className="text-lg font-bold text-ink">類型システム</h2>
        <form action={saveTypeSystem} className="mt-4 grid gap-3">
          <input className={inputClass} name="code" placeholder="コード" required />
          <input className={inputClass} name="name" placeholder="表示名" required />
          <input className={inputClass} name="position" placeholder="表示順" type="number" />
          <textarea className={textareaClass} name="description" placeholder="説明文" />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input defaultChecked name="is_active" type="checkbox" />
            有効
          </label>
          <button className={buttonClass} type="submit">
            類型システムを追加
          </button>
        </form>
        <div className="mt-5 grid gap-3">
          {typeSystems.map((system) => (
            <form action={saveTypeSystem} className="grid gap-2 rounded-xl border border-slate-200 p-3" key={system.id}>
              <input name="id" type="hidden" value={system.id} />
              <input className={inputClass} name="code" defaultValue={system.code} required />
              <input className={inputClass} name="name" defaultValue={system.name} required />
              <input className={inputClass} name="position" defaultValue={system.position} type="number" />
              <textarea className={textareaClass} name="description" defaultValue={system.description ?? ""} />
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input defaultChecked={system.is_active} name="is_active" type="checkbox" />
                有効
              </label>
              <button className={buttonClass} type="submit">
                保存
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
        <h2 className="text-lg font-bold text-ink">類型値</h2>
        <form action={saveTypeValue} className="mt-4 grid gap-3">
          <TypeSystemSelect typeSystems={typeSystems} />
          <input className={inputClass} name="code" placeholder="コード" required />
          <input className={inputClass} name="name" placeholder="表示名" required />
          <input className={inputClass} name="position" placeholder="表示順" type="number" />
          <textarea className={textareaClass} name="description" placeholder="説明文" />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input defaultChecked name="is_active" type="checkbox" />
            有効
          </label>
          <button className={buttonClass} type="submit">
            類型値を追加
          </button>
        </form>
        <div className="mt-5 grid gap-3">
          {typeValues.map((value) => (
            <form action={saveTypeValue} className="grid gap-2 rounded-xl border border-slate-200 p-3" key={value.id}>
              <input name="id" type="hidden" value={value.id} />
              <TypeSystemSelect selectedId={value.type_system_id} typeSystems={typeSystems} />
              <input className={inputClass} name="code" defaultValue={value.code} required />
              <input className={inputClass} name="name" defaultValue={value.name} required />
              <input className={inputClass} name="position" defaultValue={value.position} type="number" />
              <textarea className={textareaClass} name="description" defaultValue={value.description ?? ""} />
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input defaultChecked={value.is_active} name="is_active" type="checkbox" />
                有効
              </label>
              <button className={buttonClass} type="submit">
                保存
              </button>
            </form>
          ))}
        </div>
      </section>
      </div>
    </div>
  );
}

function TypeSystemSelect({
  selectedId,
  typeSystems
}: {
  selectedId?: string;
  typeSystems: TypeSystem[];
}) {
  return (
    <select className={inputClass} defaultValue={selectedId ?? ""} name="type_system_id" required>
      <option value="">類型システムを選択</option>
      {typeSystems.map((system) => (
        <option key={system.id} value={system.id}>
          {system.name}
        </option>
      ))}
    </select>
  );
}

const inputClass =
  "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-ringTeal focus:ring-2 focus:ring-teal-100";
const textareaClass =
  "min-h-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-ringTeal focus:ring-2 focus:ring-teal-100";
const buttonClass =
  "rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white";
