import { Vote } from "lucide-react";
import { submitTypeVotes } from "@/lib/votes/actions";

type TypeSystemOption = {
  id: string;
  name: string;
};

type TypeValueOption = {
  code: string;
  id: string;
  name: string;
  type_system_id: string;
};

type TypeVoteFormProps = {
  currentVoteValueIds: Map<string, string>;
  handle: string;
  isLoggedIn: boolean;
  isOwnProfile: boolean;
  targetUserId: string;
  typeSystems: TypeSystemOption[];
  typeValues: TypeValueOption[];
};

export function TypeVoteForm({
  currentVoteValueIds,
  handle,
  isLoggedIn,
  isOwnProfile,
  targetUserId,
  typeSystems,
  typeValues
}: TypeVoteFormProps) {
  if (isOwnProfile) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-500">
        自分自身には投票できません。
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-500">
        投票するにはログインしてください。
      </div>
    );
  }

  if (typeSystems.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-500">
        このユーザーは、現在投票できる類型を公開していません。
      </div>
    );
  }

  return (
    <form
      action={submitTypeVotes}
      className="rounded-2xl border border-white bg-white/88 p-5 shadow-sm"
    >
      <input name="target_user_id" type="hidden" value={targetUserId} />
      <input name="handle" type="hidden" value={handle} />

      <div className="grid gap-4">
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
                defaultValue={currentVoteValueIds.get(system.id) ?? ""}
                name={`vote:${system.id}`}
              >
                <option value="">投票しない</option>
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

      <button
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
        type="submit"
      >
        <Vote className="h-4 w-4" />
        投票を保存
      </button>
    </form>
  );
}
