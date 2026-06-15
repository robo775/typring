"use client";

import { Trash2 } from "lucide-react";
import { deleteCharacterDiagnosis } from "@/lib/character-diagnoses/actions";

export function DeleteCharacterDiagnosisButton({
  characterId
}: {
  characterId: string;
}) {
  return (
    <form
      action={deleteCharacterDiagnosis}
      onSubmit={(event) => {
        if (
          !window.confirm(
            "このキャラクター診断を削除しますか？投票結果も表示されなくなります。この操作は元に戻せません。"
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input name="character_diagnosis_id" type="hidden" value={characterId} />
      <button
        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:-translate-y-0.5 sm:w-auto"
        type="submit"
      >
        <Trash2 className="h-4 w-4" />
        削除する
      </button>
    </form>
  );
}
