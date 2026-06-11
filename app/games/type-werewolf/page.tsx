import Link from "next/link";
import { ArrowLeft, DoorOpen, Plus, ShieldQuestion } from "lucide-react";
import { CharacterSelectionPreview } from "@/components/type-werewolf/character-selection-preview";
import {
  createTypeWerewolfRoom,
  joinTypeWerewolfRoom
} from "@/lib/type-werewolf/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function TypeWerewolfPage({
  searchParams
}: {
  searchParams?: { error?: string };
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data: typeSystems } = await supabase
    .from("type_systems")
    .select("id,name,code")
    .eq("is_active", true)
    .order("position", { ascending: true })
    .order("name", { ascending: true });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <div>
        <Link
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-ink"
          href="/games"
        >
          <ArrowLeft className="h-4 w-4" />
          ミニゲームへ戻る
        </Link>
      </div>

      <section className="overflow-hidden rounded-3xl border border-white bg-white/90 shadow-sm">
        <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-ringViolet p-6 text-white sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-white/60">
                Type Werewolf
              </p>
              <h1 className="mt-2 text-3xl font-black">類型人狼</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72">
                匿名キャラクターになって会話し、相手の自認類型を推理するゲームです。ゲーム終了まで、Typring上の正体は伏せられます。
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-bold">
              <ShieldQuestion className="h-4 w-4" />
              β版
            </div>
          </div>
        </div>
      </section>

      {searchParams?.error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {getErrorMessage(searchParams.error)}
        </p>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <form
          action={createTypeWerewolfRoom}
          className="rounded-3xl border border-white bg-white/90 p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-ink text-white">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-ink">部屋を作る</h2>
              <p className="mt-1 text-sm text-slate-500">
                対象にする類型システムを選びます。
              </p>
            </div>
          </div>
          <label className="mt-5 grid gap-2 text-sm font-bold text-ink">
            対象類型
            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal outline-none transition focus:border-ringTeal focus:ring-2 focus:ring-teal-100"
              name="type_system_id"
              required
            >
              <option value="">選択してください</option>
              {(typeSystems ?? []).map((system) => (
                <option key={system.id} value={system.id}>
                  {system.name}
                </option>
              ))}
            </select>
          </label>
          <button
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 disabled:bg-slate-300"
            disabled={!user}
            type="submit"
          >
            部屋を作成
          </button>
          {!user ? (
            <p className="mt-3 text-xs text-slate-500">
              部屋を作るにはログインが必要です。
            </p>
          ) : null}
        </form>

        <form
          action={joinTypeWerewolfRoom}
          className="rounded-3xl border border-white bg-white/90 p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-ringViolet text-white">
              <DoorOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-ink">部屋に入る</h2>
              <p className="mt-1 text-sm text-slate-500">
                共有された6文字の部屋コードを入力します。
              </p>
            </div>
          </div>
          <label className="mt-5 grid gap-2 text-sm font-bold text-ink">
            部屋コード
            <input
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal uppercase outline-none transition focus:border-ringTeal focus:ring-2 focus:ring-teal-100"
              maxLength={12}
              name="room_code"
              placeholder="ABC123"
              required
            />
          </label>
          <button
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ringViolet px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 disabled:bg-slate-300"
            disabled={!user}
            type="submit"
          >
            入室する
          </button>
          {!user ? (
            <p className="mt-3 text-xs text-slate-500">
              参加するにはログインが必要です。
            </p>
          ) : null}
        </form>
      </section>

      <CharacterSelectionPreview />
    </div>
  );
}

function getErrorMessage(error: string) {
  const messages: Record<string, string> = {
    room_code_required: "部屋コードを入力してください。",
    room_create_failed: "部屋を作成できませんでした。",
    room_not_found: "部屋が見つかりませんでした。",
    self_type_required: "この類型の自認登録が必要です。先にマイページで登録してください。",
    type_system_required: "対象類型を選択してください。"
  };

  return messages[error] ?? error;
}
