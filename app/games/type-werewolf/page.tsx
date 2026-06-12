import Link from "next/link";
import { ArrowLeft, DoorOpen, Plus, ShieldQuestion, Users } from "lucide-react";
import {
  createTypeWerewolfRoom,
  joinTypeWerewolfRoom
} from "@/lib/type-werewolf/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RoomRow = {
  created_at: string;
  host_user_id: string;
  id: string;
  room_code: string;
  type_system_id: string;
};

export default async function TypeWerewolfPage({
  searchParams
}: {
  searchParams?: { deleted?: string; error?: string };
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
  const { data: roomRows } = await supabase
    .from("type_werewolf_rooms")
    .select("id,room_code,host_user_id,type_system_id,created_at")
    .eq("status", "waiting")
    .order("created_at", { ascending: false })
    .limit(20);
  const openRooms = (roomRows ?? []) as RoomRow[];
  const roomIds = openRooms.map((room) => room.id);
  const hostUserIds = Array.from(new Set(openRooms.map((room) => room.host_user_id)));
  const { data: playerRows } =
    roomIds.length > 0
      ? await supabase
          .from("type_werewolf_players")
          .select("room_id")
          .in("room_id", roomIds)
      : { data: [] };
  const { data: hostProfiles } =
    hostUserIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id,display_name")
          .in("id", hostUserIds)
      : { data: [] };
  const playerCounts = new Map<string, number>();

  for (const player of playerRows ?? []) {
    playerCounts.set(player.room_id, (playerCounts.get(player.room_id) ?? 0) + 1);
  }

  const typeSystemMap = new Map((typeSystems ?? []).map((system) => [system.id, system]));
  const hostNameMap = new Map(
    (hostProfiles ?? []).map((profile) => [profile.id, profile.display_name])
  );
  const currentRoom = user ? await getCurrentTypeWerewolfRoom(supabase, user.id) : null;
  const isLocked = Boolean(currentRoom);

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

      {searchParams?.deleted ? (
        <p className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-bold text-teal-700">
          ルームを削除しました。
        </p>
      ) : null}

      {currentRoom ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800 sm:flex-row sm:items-center sm:justify-between">
          <p>
            現在参加中、または作成済みのルームがあります。別の部屋を作成・参加するには、先にそのルームから退出するか、作成者の場合はルームを削除してください。
          </p>
          <Link
            className="inline-flex shrink-0 justify-center rounded-full bg-amber-600 px-4 py-2 text-sm font-bold text-white"
            href={`/games/type-werewolf/rooms/${currentRoom.room_id}`}
          >
            ルームへ戻る
          </Link>
        </div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
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
            disabled={!user || isLocked}
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

        <section className="rounded-3xl border border-white bg-white/90 p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-ringViolet text-white">
                <DoorOpen className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-ink">公開中の部屋</h2>
                <p className="mt-1 text-sm text-slate-500">
                  待機中の部屋に自由に参加できます。
                </p>
              </div>
            </div>
            <form action={joinTypeWerewolfRoom} className="flex gap-2">
              <input
                className="w-28 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold uppercase outline-none transition focus:border-ringTeal"
                maxLength={12}
                name="room_code"
                placeholder="コード"
              />
              <button
                className="rounded-full bg-slate-900 px-3 py-2 text-xs font-bold text-white disabled:bg-slate-300"
                disabled={!user || isLocked}
                type="submit"
              >
                入室
              </button>
            </form>
          </div>

          <div className="mt-5 grid gap-3">
            {openRooms.length > 0 ? (
              openRooms.map((room) => {
                const playerCount = playerCounts.get(room.id) ?? 0;
                const isFull = playerCount >= 8;
                const typeSystem = typeSystemMap.get(room.type_system_id);

                return (
                  <Link
                    className={`flex flex-col gap-3 rounded-2xl border p-4 transition sm:flex-row sm:items-center sm:justify-between ${
                      isFull
                        ? "border-slate-200 bg-slate-50 opacity-60"
                        : "border-slate-100 bg-white hover:-translate-y-0.5 hover:border-ringTeal hover:shadow-soft"
                    }`}
                    href={`/games/type-werewolf/rooms/${room.id}`}
                    key={room.id}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-black text-ink">
                          部屋 {room.room_code}
                        </p>
                        <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-700">
                          募集中
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        対象類型: {typeSystem?.name ?? "不明"} / ホスト:{" "}
                        {hostNameMap.get(room.host_user_id) ?? "Typring user"}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600">
                      <Users className="h-4 w-4" />
                      {playerCount}/8
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-500">
                現在募集中の部屋はありません。自分で部屋を作ると、ここに表示されます。
              </div>
            )}
          </div>
        </section>
      </section>
    </div>
  );
}

function getErrorMessage(error: string) {
  const messages: Record<string, string> = {
    already_in_room:
      "すでに参加中、または作成済みのルームがあります。先に退出または削除してください。",
    room_code_required: "部屋コードを入力してください。",
    room_create_failed: "部屋を作成できませんでした。",
    room_not_found: "部屋が見つかりませんでした。",
    room_not_waiting: "待機中の部屋ではありません。",
    self_type_required: "この類型の自認登録が必要です。先にマイページで登録してください。",
    type_system_required: "対象類型を選択してください。"
  };

  return messages[error] ?? error;
}

async function getCurrentTypeWerewolfRoom(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  userId: string
) {
  const { data: hostedRooms } = await supabase
    .from("type_werewolf_rooms")
    .select("id")
    .eq("host_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  const hostedRoom = hostedRooms?.[0];
  if (hostedRoom) {
    return { room_id: hostedRoom.id };
  }

  const { data: playerRooms } = await supabase
    .from("type_werewolf_players")
    .select("room_id")
    .eq("user_id", userId)
    .order("joined_at", { ascending: false })
    .limit(1);

  return playerRooms?.[0] ?? null;
}
