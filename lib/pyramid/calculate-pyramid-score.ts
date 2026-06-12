import { pyramidParts } from "@/data/pyramidParts";
import { pyramidSynergies } from "@/data/pyramidSynergies";
import { calculateCostUsed } from "@/lib/pyramid/challenge-rules";
import type {
  PlacedPyramidPart,
  PyramidScore,
  PyramidSynergy
} from "@/types/pyramid";

const partById = new Map(pyramidParts.map((part) => [part.id, part]));

export function calculatePyramidScore(
  placedParts: PlacedPyramidPart[]
): PyramidScore {
  const categories = new Set<string>();
  let baseScore = 0;

  for (const placedPart of placedParts) {
    const part = partById.get(placedPart.partId);

    if (!part) {
      continue;
    }

    categories.add(part.category);
    baseScore += Math.round(part.score * placedPart.scale);
  }

  const varietyBonus = Math.max(0, categories.size - 1) * 12;
  const volumeBonus = placedParts.length >= 8 ? 30 : 0;

  return {
    achievedSynergyIds: [],
    baseScore,
    categoryCount: categories.size,
    costUsed: calculateCostUsed(placedParts),
    partCount: placedParts.length,
    synergyBonus: 0,
    totalScore: baseScore + varietyBonus + volumeBonus,
    varietyBonus,
    volumeBonus
  };
}

export function detectSynergies(
  placedParts: PlacedPyramidPart[],
  backgroundId: string
): PyramidSynergy[] {
  const partCounts = new Map<string, number>();

  for (const placedPart of placedParts) {
    partCounts.set(
      placedPart.partId,
      (partCounts.get(placedPart.partId) ?? 0) + 1
    );
  }

  return pyramidSynergies.filter((synergy) => {
    if (synergy.backgroundId && synergy.backgroundId !== backgroundId) {
      return false;
    }

    return synergy.requires.every(
      (requirement) =>
        (partCounts.get(requirement.partId) ?? 0) >= (requirement.count ?? 1)
    );
  });
}

export function calculateChallengeScore(
  placedParts: PlacedPyramidPart[],
  backgroundId: string
): PyramidScore {
  const categories = new Set<string>();
  let baseScore = 0;

  for (const placedPart of placedParts) {
    const part = partById.get(placedPart.partId);

    if (!part) {
      continue;
    }

    categories.add(part.category);
    baseScore += part.score;
  }

  const varietyBonus = Math.max(0, categories.size - 1) * 12;
  const volumeBonus = placedParts.length >= 8 ? 30 : 0;
  const achievedSynergies = detectSynergies(placedParts, backgroundId);
  const synergyBonus = achievedSynergies.reduce(
    (sum, synergy) => sum + synergy.bonus,
    0
  );

  return {
    achievedSynergyIds: achievedSynergies.map((synergy) => synergy.id),
    baseScore,
    categoryCount: categories.size,
    costUsed: calculateCostUsed(placedParts),
    partCount: placedParts.length,
    synergyBonus,
    totalScore: baseScore + varietyBonus + volumeBonus + synergyBonus,
    varietyBonus,
    volumeBonus
  };
}
