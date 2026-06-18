import { Save } from "lucide-react";
import { updateMyProfile } from "@/lib/profiles/actions";

type TypeValueOption = {
  code: string;
  id: string;
  name: string;
  type_system_id: string;
};

type TypeSystemOption = {
  code: string;
  id: string;
  name: string;
};

type ProfileEditFormProps = {
  allowExternalTyping: boolean;
  bio: string;
  currentExternalTypingTypeSystemIds: Set<string>;
  currentTypeValueIds: Map<string, string>;
  displayName: string;
  typeSystems: TypeSystemOption[];
  typeValues: TypeValueOption[];
};

export function ProfileEditForm({
  allowExternalTyping,
  bio,
  currentExternalTypingTypeSystemIds,
  currentTypeValueIds,
  displayName,
  typeSystems,
  typeValues
}: ProfileEditFormProps) {
  return (
    <form action={updateMyProfile} className="mt-6 grid gap-5">
      <label className="grid gap-2 text-sm font-semibold text-ink">
        表示名
        <input
          className={fieldClass}
          defaultValue={displayName}
          maxLength={80}
          name="display_name"
          required
        />
      </label>

      <label className="grid gap-2 text-sm font-semibold text-ink">
        自己紹介
        <textarea
          className="min-h-32 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal leading-6 outline-none transition focus:border-ringTeal focus:ring-2 focus:ring-teal-100"
          defaultValue={bio}
          maxLength={500}
          name="bio"
          placeholder="好きなこと、話したいこと、プロフィールに添えたい一言を書けます。"
        />
      </label>

      <ProfileCheckbox
        defaultChecked={allowExternalTyping}
        description="OFFにすると、プロフィール上の他者診断結果と投票フォームを非表示にします。"
        name="allow_external_typing"
        title="他ユーザーからの他者診断を受け付ける"
      />

      <div className="grid gap-4">
        {typeSystems.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
            選べる類型がまだありません。少し時間を置いてからもう一度お試しください。
          </p>
        ) : null}
        {typeSystems.map((system) => {
          const values = typeValues.filter(
            (value) => value.type_system_id === system.id
          );

          return (
            <div
              className="grid gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm"
              key={system.id}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <label className="grid flex-1 gap-2 font-semibold text-ink">
                  {system.name}
                  <select
                    className={fieldClass}
                    defaultValue={currentTypeValueIds.get(system.id) ?? ""}
                    name={`type:${system.id}`}
                  >
                    <option value="">未選択</option>
                    {values.map((value) => (
                      <option key={value.id} value={value.id}>
                        {value.name || value.code}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
                  <input
                    defaultChecked={currentExternalTypingTypeSystemIds.has(
                      system.id
                    )}
                    name={`allow_type_vote:${system.id}`}
                    type="checkbox"
                  />
                  他者診断を受け付ける
                </label>
              </div>
            </div>
          );
        })}
      </div>

      <button
        className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
        type="submit"
      >
        <Save className="h-4 w-4" />
        保存する
      </button>
    </form>
  );
}

function ProfileCheckbox({
  defaultChecked,
  description,
  name,
  title
}: {
  defaultChecked: boolean;
  description: string;
  name: string;
  title: string;
}) {
  return (
    <label className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
      <span className="flex items-start gap-3">
        <input
          className="mt-1"
          defaultChecked={defaultChecked}
          name={name}
          type="checkbox"
        />
        <span>
          <span className="block font-semibold text-ink">{title}</span>
          <span className="mt-1 block leading-6">{description}</span>
        </span>
      </span>
    </label>
  );
}

const fieldClass =
  "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal outline-none transition focus:border-ringTeal focus:ring-2 focus:ring-teal-100";
