import { pyramidParts } from "@/data/pyramidParts";
import type { PlacedPyramidPart, PyramidPart } from "@/types/pyramid";

export const CHALLENGE_COST_BUDGET = 100;
export const CHALLENGE_MAX_PARTS = 12;

const partCostById = new Map(pyramidParts.map((part) => [part.id, part.cost]));

export function calculateCostUsed(placedParts: PlacedPyramidPart[]) {
  let total = 0;

  for (const placedPart of placedParts) {
    total += partCostById.get(placedPart.partId) ?? 0;
  }

  return total;
}

export type ChallengeAddCheck =
  | { ok: true }
  | { ok: false; reason: "cost_exceeded" | "too_many_parts" };

export function canAddPart(
  placedParts: PlacedPyramidPart[],
  part: PyramidPart
): ChallengeAddCheck {
  if (placedParts.length >= CHALLENGE_MAX_PARTS) {
    return { ok: false, reason: "too_many_parts" };
  }

  if (calculateCostUsed(placedParts) + part.cost > CHALLENGE_COST_BUDGET) {
    return { ok: false, reason: "cost_exceeded" };
  }

  return { ok: true };
}

export function validateChallengeParts(placedParts: PlacedPyramidPart[]) {
  if (placedParts.length > CHALLENGE_MAX_PARTS) {
    return { ok: false as const, reason: "too_many_parts" as const };
  }

  if (calculateCostUsed(placedParts) > CHALLENGE_COST_BUDGET) {
    return { ok: false as const, reason: "cost_exceeded" as const };
  }

  return { ok: true as const };
}
