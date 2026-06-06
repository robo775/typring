"use client";

import Link from "next/link";
import {
  deleteTypeSystem,
  deleteTypeValue,
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
  registrationCount: number;
};

type TypeValue = {
  code: string;
  description: string | null;
  id: string;
  is_active: boolean;
  name: string;
  position: number;
  registrationCount: number;
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
      <section className={sectionClass}>
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

      <section className={sectionClass}>
        <h2 className="text-lg font-bold text-ink">類型システム</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          MBTI、エニアグラムなどの大分類を管理します。順の数字を変えて保存すると、次回表示時に昇順で並び直されます。
        </p>
        <form action={saveTypeSystem} className="mt-4 grid gap-3 md:grid-cols-[120px_1fr_100px_1.5fr_auto_auto]">
          <input name="return_to" type="hidden" value={returnTo} />
          <input className={inputClass} name="code" placeholder="コード" required />
          <input className={inputClass} name="name" placeholder="表示名" required />
          <input className={inputClass} name="position" placeholder="順" type="number" />
          <input className={inputClass} name="description" placeholder="説明文" />
          <ActiveCheckbox />
          <button className={buttonClass} type="submit">
            追加
          </button>
        </form>

        <div className="mt-5 grid gap-3">
          {typeSystems.map((system) => (
            <div
              className={`rounded-2xl border bg-white p-3 ${
                system.id === selectedSystemId
                  ? "border-teal-200 ring-2 ring-teal-50"
                  : "border-slate-200"
              }`}
              key={system.id}
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    登録 {system.registrationCount}人
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {system.is_active ? "有効" : "無効"}
                  </span>
                </div>
                <Link
                  className={secondaryButtonClass}
                  href={`/admin?system=${encodeURIComponent(system.id)}`}
                >
                  類型値を表示
                </Link>
              </div>
              <form
                action={saveTypeSystem}
                className="grid gap-2 md:grid-cols-[120px_1fr_90px_1.6fr_92px_92px]"
                onSubmit={(event) =>
                  confirmSubmit(event, getSystemUpdateMessage(system))
                }
              >
                <input name="return_to" type="hidden" value={`/admin?system=${system.id}`} />
                <input name="id" type="hidden" value={system.id} />
                <input className={compactInputClass} name="code" defaultValue={system.code} required />
                <input className={compactInputClass} name="name" defaultValue={system.name} required />
                <input className={compactInputClass} name="position" defaultValue={system.position} type="number" />
                <textarea
                  className={textareaClass}
                  name="description"
                  defaultValue={system.description ?? ""}
                  placeholder="説明文"
                  rows={2}
                />
                <ActiveCheckbox checked={system.is_active} compact />
                <button className={buttonClass} type="submit">
                  更新
                </button>
              </form>
              <form
                action={deleteTypeSystem}
                className="mt-2 flex justify-end"
                onSubmit={(event) =>
                  confirmSubmit(event, getSystemDeleteMessage(system))
                }
              >
                <input name="id" type="hidden" value={system.id} />
                <button className={dangerButtonClass} type="submit">
                  削除
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>

      <section className={sectionClass}>
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

            <div className="mt-5 grid gap-3">
              {typeValues.length > 0 ? (
                typeValues.map((value) => (
                  <div className="rounded-2xl border border-slate-200 bg-white p-3" key={value.id}>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          登録 {value.registrationCount}人
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {value.is_active ? "有効" : "無効"}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-slate-500">
                        {selectedSystem.code} / {value.code}
                      </span>
                    </div>
                    <form
                      action={saveTypeValue}
                      className="grid gap-2 md:grid-cols-[120px_1fr_90px_1.6fr_92px_92px]"
                      onSubmit={(event) =>
                        confirmSubmit(event, getTypeValueUpdateMessage(value))
                      }
                    >
                      <input name="return_to" type="hidden" value={returnTo} />
                      <input name="id" type="hidden" value={value.id} />
                      <input name="type_system_id" type="hidden" value={selectedSystem.id} />
                      <input className={compactInputClass} name="code" defaultValue={value.code} required />
                      <input className={compactInputClass} name="name" defaultValue={value.name} required />
                      <input className={compactInputClass} name="position" defaultValue={value.position} type="number" />
                      <textarea
                        className={textareaClass}
                        name="description"
                        defaultValue={value.description ?? ""}
                        placeholder="説明文"
                        rows={2}
                      />
                      <ActiveCheckbox checked={value.is_active} compact />
                      <button className={buttonClass} type="submit">
                        更新
                      </button>
                    </form>
                    <form
                      action={deleteTypeValue}
                      className="mt-2 flex justify-end"
                      onSubmit={(event) =>
                        confirmSubmit(event, getTypeValueDeleteMessage(value))
                      }
                    >
                      <input name="return_to" type="hidden" value={returnTo} />
                      <input name="id" type="hidden" value={value.id} />
                      <button className={dangerButtonClass} type="submit">
                        削除
                      </button>
                    </form>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-3 py-6 text-sm text-slate-500">
                  この類型システムには、まだ類型値がありません。
                </div>
              )}
            </div>
          </>
        ) : null}
      </section>

      <section className={sectionClass}>
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

function confirmSubmit(event: React.FormEvent<HTMLFormElement>, message: string) {
  if (!window.confirm(message)) {
    event.preventDefault();
  }
}

function getSystemUpdateMessage(system: TypeSystem) {
  return system.registrationCount > 0
    ? `${system.name} を更新します。この類型システムを登録しているユーザーが ${system.registrationCount} 人います。表示内容が変わる可能性があります。更新してもいいですか？`
    : `${system.name} を更新します。更新してもいいですか？`;
}

function getSystemDeleteMessage(system: TypeSystem) {
  return system.registrationCount > 0
    ? `${system.name} を削除します。この類型システムを登録しているユーザーが ${system.registrationCount} 人います。削除すると、そのユーザーの該当類型登録と関連する投票がリセットされます。削除してもいいですか？`
    : `${system.name} を削除します。配下の類型値と関連する投票も削除されます。削除してもいいですか？`;
}

function getTypeValueUpdateMessage(value: TypeValue) {
  return value.registrationCount > 0
    ? `${value.name} を更新します。この類型値を登録しているユーザーが ${value.registrationCount} 人います。表示内容が変わる可能性があります。更新してもいいですか？`
    : `${value.name} を更新します。更新してもいいですか？`;
}

function getTypeValueDeleteMessage(value: TypeValue) {
  return value.registrationCount > 0
    ? `${value.name} を削除します。この類型値を登録しているユーザーが ${value.registrationCount} 人います。削除すると、そのユーザーの該当類型登録と関連する投票がリセットされます。削除してもいいですか？`
    : `${value.name} を削除します。関連する投票も削除されます。削除してもいいですか？`;
}

const sectionClass = "rounded-2xl border border-white bg-white/88 p-5 shadow-sm";
const inputClass =
  "min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-ringTeal focus:ring-2 focus:ring-teal-100";
const compactInputClass =
  "min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-ringTeal focus:ring-2 focus:ring-teal-100";
const textareaClass =
  "min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm leading-5 outline-none focus:border-ringTeal focus:ring-2 focus:ring-teal-100";
const buttonClass =
  "rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white";
const secondaryButtonClass =
  "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink";
const dangerButtonClass =
  "rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700";
