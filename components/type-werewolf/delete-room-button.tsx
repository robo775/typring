"use client";

import { Trash2 } from "lucide-react";
import { deleteTypeWerewolfRoom } from "@/lib/type-werewolf/actions";

export function DeleteTypeWerewolfRoomButton({ roomId }: { roomId: string }) {
  return (
    <form
      action={deleteTypeWerewolfRoom}
      onSubmit={(event) => {
        if (
          !window.confirm(
            "この部屋を削除しますか？参加者、発言、推理ログも削除されます。"
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input name="room_id" type="hidden" value={roomId} />
      <button
        className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:-translate-y-0.5"
        type="submit"
      >
        <Trash2 className="h-4 w-4" />
        ルーム削除
      </button>
    </form>
  );
}
