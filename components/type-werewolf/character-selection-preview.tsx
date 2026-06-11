"use client";

import { Check, Lock, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { TYPE_WEREWOLF_CHARACTERS } from "@/data/typeWerewolfCharacters";
import type { TypeWerewolfCharacterCode } from "@/data/typeWerewolfCharacters";

const mockUsedCharacters: TypeWerewolfCharacterCode[] = ["victoria", "ijun"];

export function CharacterSelectionPreview() {
  const [selectedCode, setSelectedCode] =
    useState<TypeWerewolfCharacterCode | null>("james");
  const selectedCharacter = useMemo(
    () =>
      TYPE_WEREWOLF_CHARACTERS.find(
        (character) => character.code === selectedCode
      ) ?? null,
    [selectedCode]
  );

  return (
    <section className="rounded-3xl border border-white bg-white/90 p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ringViolet">
            Character Select
          </p>
          <h2 className="mt-1 text-2xl font-black text-ink">
            参加キャラクターを選択
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            同じ部屋では同じキャラクターを選べません。ゲーム中はキャラクター名と画像だけが公開されます。
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600">
          最大 8人
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TYPE_WEREWOLF_CHARACTERS.map((character) => {
          const isUsed = mockUsedCharacters.includes(character.code);
          const isSelected = selectedCode === character.code;

          return (
            <button
              className={`group overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition ${
                isSelected
                  ? "border-ringViolet ring-2 ring-violet-100"
                  : isUsed
                    ? "border-slate-200 opacity-58"
                    : "border-white hover:-translate-y-0.5 hover:border-ringTeal hover:shadow-soft"
              }`}
              disabled={isUsed}
              key={character.code}
              onClick={() => setSelectedCode(character.code)}
              type="button"
            >
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={character.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  src={character.imagePath}
                />
                <div className="absolute inset-x-2 bottom-2 flex justify-end">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold shadow-sm ${
                      isSelected
                        ? "bg-ringViolet text-white"
                        : isUsed
                          ? "bg-slate-900/78 text-white"
                          : "bg-white/92 text-ink"
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="h-3 w-3" />
                        選択中
                      </>
                    ) : isUsed ? (
                      <>
                        <Lock className="h-3 w-3" />
                        使用中
                      </>
                    ) : (
                      "選択可"
                    )}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-black text-ink">
                  {character.name}
                </p>
                <p className="mt-1 truncate text-[11px] font-semibold text-slate-400">
                  {character.code}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">現在の選択</p>
            <p className="mt-1 text-lg font-black text-ink">
              {selectedCharacter ? selectedCharacter.name : "未選択"}
            </p>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={!selectedCharacter}
            type="button"
          >
            <Users className="h-4 w-4" />
            このキャラで待機する
          </button>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          実際の部屋では、サーバー側で同一キャラクターの競合を防止します。
        </p>
      </div>
    </section>
  );
}
