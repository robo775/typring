"use client";

import { Sparkles } from "lucide-react";
import { pyramidSynergies } from "@/data/pyramidSynergies";
import {
  CHALLENGE_COST_BUDGET,
  CHALLENGE_MAX_PARTS
} from "@/lib/pyramid/challenge-rules";
import type { PyramidScore } from "@/types/pyramid";

export function ChallengeHud({ score }: { score: PyramidScore }) {
  const costRatio = Math.min(1, score.costUsed / CHALLENGE_COST_BUDGET);
  const isNearLimit = costRatio >= 0.8;
  const achieved = new Set(score.achievedSynergyIds);

  return (
    <section className="rounded-2xl border border-white bg-white/86 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-black text-ink">チャレンジ状況</h2>
        <span className="text-xs font-bold text-slate-500">
          残り {CHALLENGE_MAX_PARTS - score.partCount} パーツ
        </span>
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-500">コスト</span>
          <span className={isNearLimit ? "text-amber-600" : "text-ink"}>
            {score.costUsed} / {CHALLENGE_COST_BUDGET}
          </span>
        </div>
        <div className="mt-1 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all ${
              isNearLimit ? "bg-amber-400" : "bg-ringTeal"
            }`}
            style={{ width: `${costRatio * 100}%` }}
          />
        </div>
      </div>
      <div className="mt-4">
        <p className="flex items-center gap-1 text-xs font-black text-ink">
          <Sparkles className="h-3.5 w-3.5 text-ringViolet" />
          シナジーボーナス +{score.synergyBonus}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {pyramidSynergies.map((synergy) => {
            const isAchieved = achieved.has(synergy.id);

            return (
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                  isAchieved
                    ? "bg-violet-100 text-ringViolet"
                    : "bg-slate-100 text-slate-400"
                }`}
                key={synergy.id}
                title={`${synergy.description}（+${synergy.bonus}）`}
              >
                {synergy.name} +{synergy.bonus}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
