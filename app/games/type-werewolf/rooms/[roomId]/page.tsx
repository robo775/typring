import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Crown,
  RefreshCw,
  Send,
  Share2,
  Skull,
  Ticket,
  XCircle
} from "lucide-react";
import {
  TYPE_WEREWOLF_CHARACTERS,
  type TypeWerewolfCharacterCode
} from "@/data/typeWerewolfCharacters";
import {
  finishTypeWerewolfRoom,
  guessTypeWerewolfPlayer,
  leaveTypeWerewolfRoom,
  selectTypeWerewolfCharacter,
  sendTypeWerewolfMessage,
  startTypeWerewolfRoom
} from "@/lib/type-werewolf/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RoomRow = {
  finished_at: string | null;
  host_user_id: string;
  id: string;
  room_code: string;
  started_at: string | null;
  status: "waiting" | "playing" | "finished";
  type_system_id: string;
};

type PlayerRow = {
  character_code: TypeWerewolfCharacterCode;
  eliminated_at: string | null;
  is_alive: boolean;
  joined_at: string;
  player_id: string;
  remaining_guess_tickets: number;
  user_id: string;
};

type MessageRow = {
  body: string;
  created_at: string;
  id: string;
  player_id: string;
};

type GuessRow = {
  created_at: string;
  guessed_type_value_id: string;
  guesser_player_id: string;
  id: string;
  is_correct: boolean;
  target_player_id: string;
};

type ProfileRow = {
  display_name: string;
  id: string;
  twitter_handle: string | null;
};

type UserTypeRow = {
  type_value_id: string;
  user_id: string;
};

export default async function TypeWerewolfRoomPage({
  params,
  searchParams
}: {
  params: { roomId: string };
  searchParams?: {
    error?: string;
    finished?: string;
    guess?: string;
    selected?: string;
    started?: string;
  };
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/games/type-werewolf/rooms/${params.roomId}`)}`
    );
  }

  const { data: roomData } = await supabase
    .from("type_werewolf_rooms")
    .select("id,room_code,host_user_id,type_system_id,status,started_at,finished_at")
    .eq("id", params.roomId)
    .maybeSingle();

  if (!roomData) {
    notFound();
  }

  const room = roomData as RoomRow;
  const { data: typeSystem } = await supabase
    .from("type_systems")
    .select("id,name,code")
    .eq("id", room.type_system_id)
    .maybeSingle();
  const { data: typeValues } = await supabase
    .from("type_values")
    .select("id,name,code,position")
    .eq("type_system_id", room.type_system_id)
    .eq("is_active", true)
    .order("position", { ascending: true })
    .order("name", { ascending: true });
  const { data: playerRows } = await supabase
    .from("type_werewolf_players")
    .select("player_id,user_id,character_code,is_alive,remaining_guess_tickets,joined_at,eliminated_at")
    .eq("room_id", room.id)
    .order("joined_at", { ascending: true });
  const players = (playerRows ?? []) as PlayerRow[];
  const currentPlayer =
    players.find((player) => player.user_id === user.id) ?? null;
  const isHost = room.host_user_id === user.id;
  const usedCharacterCodes = new Set(players.map((player) => player.character_code));
  const { data: ownType } = await supabase
    .from("user_types")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("type_system_id", room.type_system_id)
    .maybeSingle();
  const { data: messages } =
    currentPlayer || isHost
      ? await supabase
          .from("type_werewolf_messages")
          .select("id,player_id,body,created_at")
          .eq("room_id", room.id)
          .order("created_at", { ascending: true })
          .limit(100)
      : { data: [] };
  const { data: guesses } =
    currentPlayer || isHost
      ? await supabase
          .from("type_werewolf_guesses")
          .select("id,guesser_player_id,target_player_id,guessed_type_value_id,is_correct,created_at")
          .eq("room_id", room.id)
          .order("created_at", { ascending: false })
          .limit(30)
      : { data: [] };
  const profileMap = await getProfileMap(
    supabase,
    room.status === "finished" ? players.map((player) => player.user_id) : []
  );
  const userTypeMap = await getUserTypeMap(
    supabase,
    room.status === "finished" ? players.map((player) => player.user_id) : [],
    room.type_system_id
  );
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const roomUrl = `${appUrl.replace(/\/$/, "")}/games/type-werewolf/rooms/${room.id}`;
  const shareUrl = new URL("https://x.com/intent/tweet");
  shareUrl.searchParams.set(
    "text",
    `Typringの類型人狼で遊びませんか？\n部屋コード: ${room.room_code}\n対象類型: ${typeSystem?.name ?? "類型"}\n\n#Typring #類型人狼`
  );
  shareUrl.searchParams.set("url", roomUrl);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-ink"
          href="/games/type-werewolf"
        >
          <ArrowLeft className="h-4 w-4" />
          類型人狼へ戻る
        </Link>
        <Link
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-ink"
          href={`/games/type-werewolf/rooms/${room.id}`}
        >
          <RefreshCw className="h-4 w-4" />
          更新
        </Link>
      </div>

      <section className="rounded-3xl border border-white bg-white/90 p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ringViolet">
              Room {room.room_code}
            </p>
            <h1 className="mt-1 text-2xl font-black text-ink">類型人狼の部屋</h1>
            <p className="mt-2 text-sm text-slate-500">
              対象類型: {typeSystem?.name ?? "不明"} / 状態:{" "}
              {getStatusLabel(room.status)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">
              <Copy className="h-4 w-4" />
              {room.room_code}
            </span>
            {room.status === "waiting" ? (
              <a
                className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5"
                href={shareUrl.toString()}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Share2 className="h-4 w-4" />
                Xで募集
              </a>
            ) : null}
            {isHost ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-700">
                <Crown className="h-4 w-4" />
                ホスト
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <StatusMessages searchParams={searchParams} />

      {!ownType ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          この部屋に参加するには、対象類型「{typeSystem?.name ?? "不明"}」の自認登録が必要です。
          マイページで登録してから戻ってきてください。
        </div>
      ) : null}

      {room.status === "waiting" ? (
        <WaitingRoom
          currentPlayer={currentPlayer}
          isHost={isHost}
          players={players}
          room={room}
          usedCharacterCodes={usedCharacterCodes}
        />
      ) : null}

      {room.status === "playing" ? (
        <PlayingRoom
          currentPlayer={currentPlayer}
          guesses={(guesses ?? []) as GuessRow[]}
          isHost={isHost}
          messages={(messages ?? []) as MessageRow[]}
          players={players}
          room={room}
          typeValues={typeValues ?? []}
        />
      ) : null}

      {room.status === "finished" ? (
        <FinishedRoom
          guesses={(guesses ?? []) as GuessRow[]}
          players={players}
          profileMap={profileMap}
          room={room}
          typeValueMap={new Map((typeValues ?? []).map((value) => [value.id, value.name || value.code]))}
          userTypeMap={userTypeMap}
        />
      ) : null}
    </div>
  );
}

function WaitingRoom({
  currentPlayer,
  isHost,
  players,
  room,
  usedCharacterCodes
}: {
  currentPlayer: PlayerRow | null;
  isHost: boolean;
  players: PlayerRow[];
  room: RoomRow;
  usedCharacterCodes: Set<TypeWerewolfCharacterCode>;
}) {
  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="rounded-3xl border border-white bg-white/90 p-5 shadow-sm">
        <h2 className="text-xl font-black text-ink">キャラクター選択</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          待機中は変更できます。同じ部屋で同じキャラクターは選べません。
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TYPE_WEREWOLF_CHARACTERS.map((character) => {
            const selectedByMe = currentPlayer?.character_code === character.code;
            const usedByOther =
              usedCharacterCodes.has(character.code) && !selectedByMe;

            return (
              <form action={selectTypeWerewolfCharacter} key={character.code}>
                <input name="room_id" type="hidden" value={room.id} />
                <input name="character_code" type="hidden" value={character.code} />
                <button
                  className={`group w-full overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition ${
                    selectedByMe
                      ? "border-ringViolet ring-2 ring-violet-100"
                      : usedByOther
                        ? "border-slate-200 opacity-55"
                        : "border-white hover:-translate-y-0.5 hover:border-ringTeal hover:shadow-soft"
                  }`}
                  disabled={usedByOther}
                  type="submit"
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={character.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      src={character.imagePath}
                    />
                    <span
                      className={`absolute bottom-2 right-2 rounded-full px-2 py-1 text-[11px] font-bold shadow-sm ${
                        selectedByMe
                          ? "bg-ringViolet text-white"
                          : usedByOther
                            ? "bg-slate-900/80 text-white"
                            : "bg-white/92 text-ink"
                      }`}
                    >
                      {selectedByMe ? "選択中" : usedByOther ? "使用中" : "選択可"}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-black text-ink">
                      {character.name}
                    </p>
                  </div>
                </button>
              </form>
            );
          })}
        </div>
      </div>

      <aside className="space-y-4">
        <PlayerList players={players} showResult={false} />
        {currentPlayer ? (
          <form action={leaveTypeWerewolfRoom}>
            <input name="room_id" type="hidden" value={room.id} />
            <button
              className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600"
              type="submit"
            >
              退出する
            </button>
          </form>
        ) : null}
        {isHost ? (
          <form action={startTypeWerewolfRoom}>
            <input name="room_id" type="hidden" value={room.id} />
            <button
              className="w-full rounded-full bg-ink px-5 py-3 text-sm font-bold text-white disabled:bg-slate-300"
              disabled={players.length < 2}
              type="submit"
            >
              ゲーム開始
            </button>
            {players.length < 2 ? (
              <p className="mt-2 text-xs text-slate-500">
                2人以上で開始できます。
              </p>
            ) : null}
          </form>
        ) : null}
      </aside>
    </section>
  );
}

function PlayingRoom({
  currentPlayer,
  guesses,
  isHost,
  messages,
  players,
  room,
  typeValues
}: {
  currentPlayer: PlayerRow | null;
  guesses: GuessRow[];
  isHost: boolean;
  messages: MessageRow[];
  players: PlayerRow[];
  room: RoomRow;
  typeValues: { code: string; id: string; name: string }[];
}) {
  const alivePlayers = players.filter((player) => player.is_alive);

  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <div className="rounded-3xl border border-white bg-slate-950 p-4 text-white shadow-sm">
          <div className="flex flex-wrap gap-3 text-xs font-bold text-white/60">
            <span>生存者 {alivePlayers.length} / {players.length}</span>
            <span>
              残りチケット {currentPlayer?.remaining_guess_tickets ?? 0}
            </span>
          </div>
          <div className="mt-4 max-h-[520px] space-y-3 overflow-y-auto pr-1">
            {messages.length > 0 ? (
              messages.map((message) => {
                const player = players.find(
                  (item) => item.player_id === message.player_id
                );
                const character = getCharacter(player?.character_code);

                return (
                  <div
                    className="rounded-2xl border border-white/10 bg-white/8 p-3"
                    key={message.id}
                  >
                    <p className="text-sm font-black text-cyan-100">
                      {character?.name ?? "匿名"}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-white/86">
                      {message.body}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="rounded-2xl border border-white/10 bg-white/8 p-4 text-sm text-white/60">
                まだ発言がありません。
              </p>
            )}
          </div>
        </div>

        {currentPlayer?.is_alive ? (
          <form
            action={sendTypeWerewolfMessage}
            className="rounded-3xl border border-white bg-white/90 p-4 shadow-sm"
          >
            <input name="room_id" type="hidden" value={room.id} />
            <label className="grid gap-2 text-sm font-bold text-ink">
              発言
              <textarea
                className="min-h-24 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal outline-none transition focus:border-ringTeal focus:ring-2 focus:ring-teal-100"
                maxLength={240}
                name="body"
                placeholder="匿名キャラクターとして発言します"
                required
              />
            </label>
            <button
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white"
              type="submit"
            >
              <Send className="h-4 w-4" />
              送信
            </button>
          </form>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-500">
            脱落中のため発言できません。
          </div>
        )}
      </div>

      <aside className="space-y-4">
        <PlayerList players={players} showResult={false} />
        {currentPlayer?.is_alive ? (
          <GuessForm
            currentPlayer={currentPlayer}
            players={players}
            room={room}
            typeValues={typeValues}
          />
        ) : null}
        <GuessLog guesses={guesses} players={players} typeValues={typeValues} />
        {isHost ? (
          <form action={finishTypeWerewolfRoom}>
            <input name="room_id" type="hidden" value={room.id} />
            <button
              className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600"
              type="submit"
            >
              ゲーム終了
            </button>
          </form>
        ) : null}
      </aside>
    </section>
  );
}

function GuessForm({
  currentPlayer,
  players,
  room,
  typeValues
}: {
  currentPlayer: PlayerRow;
  players: PlayerRow[];
  room: RoomRow;
  typeValues: { code: string; id: string; name: string }[];
}) {
  const targets = players.filter(
    (player) => player.is_alive && player.player_id !== currentPlayer.player_id
  );

  return (
    <form
      action={guessTypeWerewolfPlayer}
      className="rounded-3xl border border-white bg-white/90 p-4 shadow-sm"
    >
      <input name="room_id" type="hidden" value={room.id} />
      <div className="flex items-center gap-2 text-sm font-black text-ink">
        <Ticket className="h-4 w-4" />
        推理チケット {currentPlayer.remaining_guess_tickets}
      </div>
      <label className="mt-3 grid gap-2 text-sm font-bold text-ink">
        対象
        <select
          className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal"
          name="target_player_id"
          required
        >
          <option value="">選択してください</option>
          {targets.map((player) => {
            const character = getCharacter(player.character_code);
            return (
              <option key={player.player_id} value={player.player_id}>
                {character?.name ?? player.character_code}
              </option>
            );
          })}
        </select>
      </label>
      <label className="mt-3 grid gap-2 text-sm font-bold text-ink">
        予想類型
        <select
          className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal"
          name="guessed_type_value_id"
          required
        >
          <option value="">選択してください</option>
          {typeValues.map((value) => (
            <option key={value.id} value={value.id}>
              {value.name || value.code}
            </option>
          ))}
        </select>
      </label>
      <button
        className="mt-4 w-full rounded-full bg-ringViolet px-5 py-3 text-sm font-bold text-white disabled:bg-slate-300"
        disabled={currentPlayer.remaining_guess_tickets <= 0 || targets.length === 0}
        type="submit"
      >
        推理する
      </button>
    </form>
  );
}

function FinishedRoom({
  guesses,
  players,
  profileMap,
  typeValueMap,
  userTypeMap
}: {
  guesses: GuessRow[];
  players: PlayerRow[];
  profileMap: Map<string, ProfileRow>;
  room: RoomRow;
  typeValueMap: Map<string, string>;
  userTypeMap: Map<string, string>;
}) {
  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <div className="rounded-3xl border border-white bg-white/90 p-5 shadow-sm">
        <h2 className="text-2xl font-black text-ink">類型人狼 結果</h2>
        <div className="mt-5 grid gap-3">
          {players.map((player, index) => {
            const character = getCharacter(player.character_code);
            const profile = profileMap.get(player.user_id);
            const typeName = userTypeMap.get(player.user_id) ?? "未登録";

            return (
              <div
                className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3"
                key={player.player_id}
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-200">
                  {character ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={character.name}
                      className="h-full w-full object-cover"
                      src={character.imagePath}
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-ringViolet">
                    {index + 1}位 {character?.name ?? player.character_code}
                  </p>
                  <p className="mt-1 truncate text-base font-black text-ink">
                    正体: {profile?.display_name ?? "不明"}
                  </p>
                  <p className="text-sm text-slate-600">自認: {typeName}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {player.is_alive ? "最後まで生存" : "脱落"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <GuessLog guesses={guesses} players={players} typeValueMap={typeValueMap} />
    </section>
  );
}

function PlayerList({
  players,
  showResult
}: {
  players: PlayerRow[];
  showResult: boolean;
}) {
  return (
    <div className="rounded-3xl border border-white bg-white/90 p-4 shadow-sm">
      <h2 className="text-lg font-black text-ink">参加者 {players.length}/8</h2>
      <div className="mt-3 grid gap-2">
        {players.map((player) => {
          const character = getCharacter(player.character_code);

          return (
            <div
              className="flex items-center gap-3 rounded-2xl bg-slate-50 p-2"
              key={player.player_id}
            >
              <div className="h-12 w-12 overflow-hidden rounded-xl bg-slate-200">
                {character ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={character.name}
                    className="h-full w-full object-cover"
                    src={character.imagePath}
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-ink">
                  {character?.name ?? player.character_code}
                </p>
                <p className="text-xs font-semibold text-slate-500">
                  {player.is_alive ? "生存中" : "脱落済み"}
                  {showResult ? "" : ` / チケット ${player.remaining_guess_tickets}`}
                </p>
              </div>
              {player.is_alive ? (
                <CheckCircle2 className="h-4 w-4 text-teal-500" />
              ) : (
                <Skull className="h-4 w-4 text-slate-400" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GuessLog({
  guesses,
  players,
  typeValueMap,
  typeValues
}: {
  guesses: GuessRow[];
  players: PlayerRow[];
  typeValueMap?: Map<string, string>;
  typeValues?: { code: string; id: string; name: string }[];
}) {
  const valueMap =
    typeValueMap ??
    new Map((typeValues ?? []).map((value) => [value.id, value.name || value.code]));

  return (
    <div className="rounded-3xl border border-white bg-white/90 p-4 shadow-sm">
      <h2 className="text-lg font-black text-ink">推理ログ</h2>
      <div className="mt-3 space-y-2">
        {guesses.length > 0 ? (
          guesses.map((guess) => {
            const guesser = getCharacter(
              players.find((player) => player.player_id === guess.guesser_player_id)
                ?.character_code
            );
            const target = getCharacter(
              players.find((player) => player.player_id === guess.target_player_id)
                ?.character_code
            );

            return (
              <div
                className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm"
                key={guess.id}
              >
                <div className="flex items-center gap-2 font-bold text-ink">
                  {guess.is_correct ? (
                    <CheckCircle2 className="h-4 w-4 text-teal-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-500" />
                  )}
                  {guesser?.name ?? "匿名"} → {target?.name ?? "匿名"}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  予想: {valueMap.get(guess.guessed_type_value_id) ?? "不明"}
                </p>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-slate-500">まだ推理はありません。</p>
        )}
      </div>
    </div>
  );
}

function StatusMessages({
  searchParams
}: {
  searchParams?: {
    error?: string;
    finished?: string;
    guess?: string;
    selected?: string;
    started?: string;
  };
}) {
  const messages = [
    searchParams?.selected ? "キャラクターを選択しました。" : null,
    searchParams?.started ? "ゲームを開始しました。" : null,
    searchParams?.finished ? "ゲームを終了しました。" : null,
    searchParams?.guess === "correct" ? "推理成功です。相手は脱落しました。" : null,
    searchParams?.guess === "miss" ? "推理は外れました。" : null,
    searchParams?.error ? getErrorMessage(searchParams.error) : null
  ].filter(Boolean);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-2">
      {messages.map((message) => (
        <p
          className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-bold text-teal-700"
          key={message}
        >
          {message}
        </p>
      ))}
    </div>
  );
}

async function getProfileMap(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  userIds: string[]
) {
  if (userIds.length === 0) {
    return new Map<string, ProfileRow>();
  }

  const { data } = await supabase
    .from("profiles")
    .select("id,display_name,twitter_handle")
    .in("id", userIds);

  return new Map(((data ?? []) as ProfileRow[]).map((profile) => [profile.id, profile]));
}

async function getUserTypeMap(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  userIds: string[],
  typeSystemId: string
) {
  if (userIds.length === 0) {
    return new Map<string, string>();
  }

  const { data: userTypes } = await supabase
    .from("user_types")
    .select("user_id,type_value_id")
    .eq("type_system_id", typeSystemId)
    .in("user_id", userIds);
  const rows = (userTypes ?? []) as UserTypeRow[];
  const valueIds = Array.from(new Set(rows.map((row) => row.type_value_id)));
  const { data: values } =
    valueIds.length > 0
      ? await supabase
          .from("type_values")
          .select("id,name,code")
          .in("id", valueIds)
      : { data: [] };
  const valueMap = new Map(
    (values ?? []).map((value) => [value.id, value.name || value.code])
  );

  return new Map(
    rows.map((row) => [row.user_id, valueMap.get(row.type_value_id) ?? "不明"])
  );
}

function getCharacter(code: TypeWerewolfCharacterCode | string | undefined) {
  return TYPE_WEREWOLF_CHARACTERS.find((character) => character.code === code);
}

function getStatusLabel(status: RoomRow["status"]) {
  if (status === "waiting") {
    return "待機中";
  }

  if (status === "playing") {
    return "プレイ中";
  }

  return "終了";
}

function getErrorMessage(error: string) {
  const messages: Record<string, string> = {
    character_required: "キャラクターを選択してください。",
    character_taken:
      "このキャラクターは、ほかの参加者が選択しました。別のキャラクターを選んでください。",
    guess_not_allowed: "推理できません。",
    guess_required: "推理対象と類型を選んでください。",
    message_not_allowed: "発言できません。",
    not_enough_players: "2人以上で開始できます。",
    room_not_playing: "プレイ中の部屋ではありません。",
    room_not_waiting: "待機中の部屋ではありません。",
    self_type_required: "この部屋の対象類型をマイページで登録してください。",
    start_not_allowed: "ゲームを開始できません。",
    target_not_allowed: "その相手には推理できません。"
  };

  return messages[error] ?? error;
}
