"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  TYPE_WEREWOLF_CHARACTERS,
  type TypeWerewolfCharacterCode
} from "@/data/typeWerewolfCharacters";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const characterCodes = new Set<string>(
  TYPE_WEREWOLF_CHARACTERS.map((character) => character.code)
);

export async function createTypeWerewolfRoom(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const typeSystemId = getString(formData, "type_system_id");

  if (!user) {
    redirect("/login?next=/games/type-werewolf");
  }

  if (!typeSystemId) {
    redirect("/games/type-werewolf?error=type_system_required");
  }

  const { data: ownType } = await supabase
    .from("user_types")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("type_system_id", typeSystemId)
    .maybeSingle();

  if (!ownType) {
    redirect("/games/type-werewolf?error=self_type_required");
  }

  const { data: room, error } = await supabase
    .from("type_werewolf_rooms")
    .insert({
      host_user_id: user.id,
      room_code: await createUniqueRoomCode(supabase),
      type_system_id: typeSystemId
    })
    .select("id")
    .single();

  if (error || !room) {
    redirect("/games/type-werewolf?error=room_create_failed");
  }

  redirect(`/games/type-werewolf/rooms/${room.id}`);
}

export async function joinTypeWerewolfRoom(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const roomCode = getString(formData, "room_code").toUpperCase();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/games/type-werewolf");
  }

  if (!roomCode) {
    redirect("/games/type-werewolf?error=room_code_required");
  }

  const { data: room } = await supabase
    .from("type_werewolf_rooms")
    .select("id,status")
    .eq("room_code", roomCode)
    .maybeSingle();

  if (!room) {
    redirect("/games/type-werewolf?error=room_not_found");
  }

  redirect(`/games/type-werewolf/rooms/${room.id}`);
}

export async function selectTypeWerewolfCharacter(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const roomId = getString(formData, "room_id");
  const characterCode = getString(formData, "character_code");
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const roomPath = `/games/type-werewolf/rooms/${roomId}`;

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(roomPath)}`);
  }

  if (!roomId || !characterCodes.has(characterCode)) {
    redirect(`${roomPath}?error=character_required`);
  }

  const { data: room } = await supabase
    .from("type_werewolf_rooms")
    .select("id,status,type_system_id")
    .eq("id", roomId)
    .maybeSingle();

  if (!room || room.status !== "waiting") {
    redirect(`${roomPath}?error=room_not_waiting`);
  }

  const { data: ownType } = await supabase
    .from("user_types")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("type_system_id", room.type_system_id)
    .maybeSingle();

  if (!ownType) {
    redirect(`${roomPath}?error=self_type_required`);
  }

  const { data: existingPlayer } = await supabase
    .from("type_werewolf_players")
    .select("player_id")
    .eq("room_id", roomId)
    .eq("user_id", user.id)
    .maybeSingle();

  const result = existingPlayer
    ? await supabase
        .from("type_werewolf_players")
        .update({ character_code: characterCode })
        .eq("player_id", existingPlayer.player_id)
    : await supabase.from("type_werewolf_players").insert({
        character_code: characterCode,
        room_id: roomId,
        user_id: user.id
      });

  if (result.error) {
    redirect(`${roomPath}?error=character_taken`);
  }

  revalidatePath(roomPath);
  redirect(`${roomPath}?selected=1`);
}

export async function leaveTypeWerewolfRoom(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const roomId = getString(formData, "room_id");
  const roomPath = `/games/type-werewolf/rooms/${roomId}`;
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || !roomId) {
    redirect("/games/type-werewolf");
  }

  await supabase
    .from("type_werewolf_players")
    .delete()
    .eq("room_id", roomId)
    .eq("user_id", user.id);

  revalidatePath(roomPath);
  redirect("/games/type-werewolf");
}

export async function startTypeWerewolfRoom(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const roomId = getString(formData, "room_id");
  const roomPath = `/games/type-werewolf/rooms/${roomId}`;
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || !roomId) {
    redirect("/games/type-werewolf");
  }

  const { data: room } = await supabase
    .from("type_werewolf_rooms")
    .select("id,host_user_id,status")
    .eq("id", roomId)
    .maybeSingle();

  if (!room || room.host_user_id !== user.id || room.status !== "waiting") {
    redirect(`${roomPath}?error=start_not_allowed`);
  }

  const { count } = await supabase
    .from("type_werewolf_players")
    .select("player_id", { count: "exact", head: true })
    .eq("room_id", roomId);

  if ((count ?? 0) < 2) {
    redirect(`${roomPath}?error=not_enough_players`);
  }

  await supabase
    .from("type_werewolf_rooms")
    .update({ started_at: new Date().toISOString(), status: "playing" })
    .eq("id", roomId);

  revalidatePath(roomPath);
  redirect(`${roomPath}?started=1`);
}

export async function sendTypeWerewolfMessage(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const roomId = getString(formData, "room_id");
  const body = getString(formData, "body").slice(0, 240);
  const roomPath = `/games/type-werewolf/rooms/${roomId}`;
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || !roomId || !body) {
    redirect(roomPath);
  }

  const { data: player } = await supabase
    .from("type_werewolf_players")
    .select("player_id,is_alive")
    .eq("room_id", roomId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!player?.is_alive) {
    redirect(`${roomPath}?error=message_not_allowed`);
  }

  await supabase.from("type_werewolf_messages").insert({
    body,
    player_id: player.player_id,
    room_id: roomId
  });

  revalidatePath(roomPath);
  redirect(roomPath);
}

export async function guessTypeWerewolfPlayer(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const roomId = getString(formData, "room_id");
  const targetPlayerId = getString(formData, "target_player_id");
  const guessedTypeValueId = getString(formData, "guessed_type_value_id");
  const roomPath = `/games/type-werewolf/rooms/${roomId}`;
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || !roomId || !targetPlayerId || !guessedTypeValueId) {
    redirect(`${roomPath}?error=guess_required`);
  }

  const { data: room } = await supabase
    .from("type_werewolf_rooms")
    .select("id,status,type_system_id")
    .eq("id", roomId)
    .maybeSingle();

  if (!room || room.status !== "playing") {
    redirect(`${roomPath}?error=room_not_playing`);
  }

  const { data: guesser } = await supabase
    .from("type_werewolf_players")
    .select("player_id,is_alive,remaining_guess_tickets")
    .eq("room_id", roomId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!guesser?.is_alive || guesser.remaining_guess_tickets <= 0) {
    redirect(`${roomPath}?error=guess_not_allowed`);
  }

  const { data: target } = await supabase
    .from("type_werewolf_players")
    .select("player_id,user_id,is_alive")
    .eq("room_id", roomId)
    .eq("player_id", targetPlayerId)
    .maybeSingle();

  if (!target?.is_alive || target.player_id === guesser.player_id) {
    redirect(`${roomPath}?error=target_not_allowed`);
  }

  const { data: targetType } = await supabase
    .from("user_types")
    .select("type_value_id")
    .eq("user_id", target.user_id)
    .eq("type_system_id", room.type_system_id)
    .maybeSingle();

  const isCorrect = targetType?.type_value_id === guessedTypeValueId;

  await supabase.from("type_werewolf_guesses").insert({
    guessed_type_value_id: guessedTypeValueId,
    guesser_player_id: guesser.player_id,
    is_correct: isCorrect,
    room_id: roomId,
    target_player_id: targetPlayerId
  });

  await supabase
    .from("type_werewolf_players")
    .update({
      remaining_guess_tickets: Math.max(0, guesser.remaining_guess_tickets - 1)
    })
    .eq("player_id", guesser.player_id);

  if (isCorrect) {
    await supabase
      .from("type_werewolf_players")
      .update({ eliminated_at: new Date().toISOString(), is_alive: false })
      .eq("player_id", targetPlayerId);
    await finishRoomIfNeeded(supabase, roomId);
  }

  revalidatePath(roomPath);
  redirect(`${roomPath}?guess=${isCorrect ? "correct" : "miss"}`);
}

export async function finishTypeWerewolfRoom(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const roomId = getString(formData, "room_id");
  const roomPath = `/games/type-werewolf/rooms/${roomId}`;
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || !roomId) {
    redirect("/games/type-werewolf");
  }

  const { data: room } = await supabase
    .from("type_werewolf_rooms")
    .select("host_user_id")
    .eq("id", roomId)
    .maybeSingle();

  if (room?.host_user_id !== user.id) {
    redirect(`${roomPath}?error=finish_not_allowed`);
  }

  await supabase
    .from("type_werewolf_rooms")
    .update({ finished_at: new Date().toISOString(), status: "finished" })
    .eq("id", roomId);

  revalidatePath(roomPath);
  redirect(`${roomPath}?finished=1`);
}

async function createUniqueRoomCode(
  supabase: ReturnType<typeof createSupabaseServerClient>
) {
  for (let i = 0; i < 8; i += 1) {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const { data } = await supabase
      .from("type_werewolf_rooms")
      .select("id")
      .eq("room_code", code)
      .maybeSingle();

    if (!data) {
      return code;
    }
  }

  return crypto.randomUUID().slice(0, 6).toUpperCase();
}

async function finishRoomIfNeeded(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  roomId: string
) {
  const { count } = await supabase
    .from("type_werewolf_players")
    .select("player_id", { count: "exact", head: true })
    .eq("room_id", roomId)
    .eq("is_alive", true);

  if ((count ?? 0) <= 1) {
    await supabase
      .from("type_werewolf_rooms")
      .update({ finished_at: new Date().toISOString(), status: "finished" })
      .eq("id", roomId);
  }
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
