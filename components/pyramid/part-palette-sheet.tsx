"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { PyramidPartShape } from "@/components/pyramid/pyramid-part-shape";
import { pyramidCategoryLabels, pyramidParts } from "@/data/pyramidParts";
import { canAddPart } from "@/lib/pyramid/challenge-rules";
import type {
  PlacedPyramidPart,
  PyramidMode,
  PyramidPart,
  PyramidPartCategory
} from "@/types/pyramid";

const categories = Object.keys(pyramidCategoryLabels) as PyramidPartCategory[];

export function PartPaletteSheet({
  activeCategory,
  addPart,
  mode,
  placedParts,
  setActiveCategory
}: {
  activeCategory: PyramidPartCategory;
  addPart: (part: PyramidPart) => void;
  mode: PyramidMode;
  placedParts: PlacedPyramidPart[];
  setActiveCategory: (category: PyramidPartCategory) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleParts = pyramidParts.filter(
    (part) => part.category === activeCategory
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
      <div className="mx-auto max-w-2xl rounded-t-3xl border border-b-0 border-white bg-white/96 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 shadow-soft backdrop-blur">
        <button
          aria-label={isExpanded ? "パレットを閉じる" : "パレットを開く"}
          className="mx-auto flex h-8 w-full max-w-[160px] items-center justify-center text-slate-400"
          onClick={() => setIsExpanded((current) => !current)}
          type="button"
        >
          {isExpanded ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronUp className="h-5 w-5" />
          )}
        </button>
        <div className="flex gap-1.5 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${
                activeCategory === category
                  ? "bg-ink text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
              key={category}
              onClick={() => setActiveCategory(category)}
              type="button"
            >
              {pyramidCategoryLabels[category]}
            </button>
          ))}
        </div>
        <div
          className={`transition-all ${
            isExpanded
              ? "grid max-h-[50vh] grid-cols-3 gap-2 overflow-y-auto pb-2 sm:grid-cols-4"
              : "flex gap-2 overflow-x-auto pb-1"
          }`}
        >
          {visibleParts.map((part) => {
            const check =
              mode === "challenge"
                ? canAddPart(placedParts, part)
                : ({ ok: true } as const);

            return (
              <button
                className={`flex shrink-0 flex-col items-center gap-1 rounded-2xl border border-slate-100 bg-white p-2 shadow-sm transition active:scale-95 disabled:opacity-40 ${
                  isExpanded ? "" : "w-[76px]"
                }`}
                disabled={!check.ok}
                key={part.id}
                onClick={() => addPart(part)}
                type="button"
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${part.color}30` }}
                >
                  <svg height="34" viewBox="-80 -80 160 160" width="34">
                    <PyramidPartShape color={part.color} visual={part.visual} />
                  </svg>
                </span>
                <span className="w-full truncate text-center text-[10px] font-bold text-ink">
                  {part.name}
                </span>
                {mode === "challenge" ? (
                  <span
                    className={`rounded-full px-1.5 text-[9px] font-black ${
                      check.ok ? "text-ringTeal" : "text-red-500"
                    }`}
                  >
                    {check.ok
                      ? `C${part.cost}`
                      : check.reason === "cost_exceeded"
                        ? "コスト不足"
                        : "上限"}
                  </span>
                ) : (
                  <span className="text-[9px] font-black text-slate-400">
                    +{part.score}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
