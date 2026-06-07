"use client";

import { useState } from "react";
import { deleteMyAccount } from "@/lib/account/actions";

export function DeleteAccountSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const canDelete = confirmation === "削除";

  return (
    <section className="rounded-2xl border border-red-200 bg-red-50/70 p-5 shadow-sm">
      <h2 className="text-lg font-bold text-red-800">危険な操作</h2>
      <p className="mt-2 text-sm leading-6 text-red-700">
        アカウントを削除すると、プロフィール、登録した類型、投票、紹介文などのデータが削除されます。
        この操作は取り消せません。
      </p>
      <button
        className="mt-4 rounded-full bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        アカウントを削除する
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-red-100 bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-ink">
              本当にアカウントを削除しますか？
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              プロフィール、登録した類型、投票、紹介文などのデータが削除されます。
              この操作は取り消せません。
            </p>
            <form action={deleteMyAccount} className="mt-5 space-y-4">
              <label className="grid gap-2 text-sm font-semibold text-ink">
                確認のため「削除」と入力してください
                <input
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  name="confirmation"
                  onChange={(event) => setConfirmation(event.target.value)}
                  value={confirmation}
                />
              </label>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-ink"
                  onClick={() => {
                    setConfirmation("");
                    setIsOpen(false);
                  }}
                  type="button"
                >
                  キャンセル
                </button>
                <button
                  className="rounded-full bg-red-700 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-red-200"
                  disabled={!canDelete}
                  type="submit"
                >
                  完全に削除する
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
