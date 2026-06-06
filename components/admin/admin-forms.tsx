import Link from "next/link";
import {
  grantAdminByHandle,
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
  selectedSystemId,
  typeSystems,
  typeValues
}: {
  selectedSystemId: string;
  typeSystems: TypeSystem[];
  typeValues: TypeValue[];
}) {
  const selectedSystem = typeSystems.find((system) => system.id === selectedSystemId);
  const returnTo = selectedSystemId
    ? `/admin?system=${encodeURIComponent(selectedSystemId)}`
    : "/admin";

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
        <h2 className="text-lg font-bold text-ink">管理者権限</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          既にTypringへログイン済みのユーザーに、管理者権限を付与できます。Xハンドルは @ なしで入力してください。
        </p>
        <form action={grantAdminByHandle} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            className={inputClass}
            name="twitter_handle"
            placeholder="例: robo775"
            required
          />
          <button className={buttonClass} type="submit">
            管理者にする
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
        <h2 className="text-lg font-bold text-ink">類型システム</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          MBTI、エニアグラムなどの大分類を管理します。左の一覧から選ぶと、下にその類型値だけが表示されます。
        </p>
        <form action={saveTypeSystem} className="mt-4 grid gap-3 md:grid-cols-[120px_1fr_100px_1.5fr_auto_auto]">
          <input className={inputClass} name="code" placeholder="コード" required />
          <input className={inputClass} name="name" placeholder="表示名" required />
          <input className={inputClass} name="position" placeholder="順" type="number" />
          <input className={inputClass} name="description" placeholder="説明文" />
          <ActiveCheckbox />
          <button className={buttonClass} type="submit">
            追加
          </button>
        </form>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="grid grid-cols-[88px_1fr_52px] border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500 sm:grid-cols-[100px_1fr_80px_80px]">
            <span>コード</span>
            <span>表示名</span>
            <span>順</span>
            <span className="hidden sm:block">状態</span>
          </div>
          <div className="divide-y divide-slate-100">
            {typeSystems.map((system) => (
              <Link
                className={`grid grid-cols-[88px_1fr_52px] items-center gap-2 px-3 py-3 text-sm transition hover:bg-slate-50 sm:grid-cols-[100px_1fr_80px_80px] ${
                  system.id === selectedSystemId ? "bg-teal-50/70 text-ink" : "text-slate-700"
                }`}
                href={`/admin?system=${encodeURIComponent(system.id)}`}
                key={system.id}
              >
                <span className="truncate font-mono text-xs">{system.code}</span>
                <span className="truncate font-semibold">{system.name}</span>
                <span className="text-xs text-slate-500">{system.position}</span>
                <span className="hidden text-xs sm:block">
                  {system.is_active ? "有効" : "無効"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink">類型値</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {selectedSystem
                ? `${selectedSystem.name} に属する類型値だけを表示しています。`
                : "先に類型システムを追加してください。"}
            </p>
          </div>
          {selectedSystem ? (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {typeValues.length}件
            </span>
          ) : null}
        </div>

        {selectedSystem ? (
          <>
            <form action={saveTypeValue} className="mt-4 grid gap-3 md:grid-cols-[120px_1fr_100px_1.5fr_auto_auto]">
              <input name="return_to" type="hidden" value={returnTo} />
              <input name="type_system_id" type="hidden" value={selectedSystem.id} />
              <input className={inputClass} name="code" placeholder="コード" required />
              <input className={inputClass} name="name" placeholder="表示名" required />
              <input className={inputClass} name="position" placeholder="順" type="number" />
              <input className={inputClass} name="description" placeholder="説明文" />
              <ActiveCheckbox />
              <button className={buttonClass} type="submit">
                追加
              </button>
            </form>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="hidden grid-cols-[120px_1fr_80px_100px_1.5fr_88px] gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500 md:grid">
                <span>コード</span>
                <span>表示名</span>
                <span>順</span>
                <span>状態</span>
                <span>説明</span>
                <span />
              </div>
              <div className="divide-y divide-slate-100">
                {typeValues.length > 0 ? (
                  typeValues.map((value) => (
                    <form
                      action={saveTypeValue}
                      className="grid gap-2 px-3 py-3 md:grid-cols-[120px_1fr_80px_100px_1.5fr_88px] md:items-center"
                      key={value.id}
                    >
                      <input name="return_to" type="hidden" value={returnTo} />
                      <input name="id" type="hidden" value={value.id} />
                      <input name="type_system_id" type="hidden" value={selectedSystem.id} />
                      <input className={compactInputClass} name="code" defaultValue={value.code} required />
                      <input className={compactInputClass} name="name" defaultValue={value.name} required />
                      <input className={compactInputClass} name="position" defaultValue={value.position} type="number" />
                      <ActiveCheckbox checked={value.is_active} compact />
                      <input className={compactInputClass} name="description" defaultValue={value.description ?? ""} />
                      <button className={secondaryButtonClass} type="submit">
                        保存
                      </button>
                    </form>
                  ))
                ) : (
                  <div className="px-3 py-6 text-sm text-slate-500">
                    この類型システムには、まだ類型値がありません。
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </section>

      <section className="rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
        <h2 className="text-lg font-bold text-ink">Xフォローキャッシュ</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Typring登録済みユーザー同士のフォロー関係だけを手動登録します。相互表示にするには両方向を追加してください。
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
    </div>
  );
}

function ActiveCheckbox({
  checked = true,
  compact = false
}: {
  checked?: boolean;
  compact?: boolean;
}) {
  return (
    <label className={`flex items-center gap-2 text-sm text-slate-600 ${compact ? "min-h-10" : ""}`}>
      <input defaultChecked={checked} name="is_active" type="checkbox" />
      有効
    </label>
  );
}

const inputClass =
  "min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-ringTeal focus:ring-2 focus:ring-teal-100";
const compactInputClass =
  "min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-ringTeal focus:ring-2 focus:ring-teal-100";
const buttonClass =
  "rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white";
const secondaryButtonClass =
  "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink";
