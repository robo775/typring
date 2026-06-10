import { pyramidParts } from "@/data/pyramidParts";
import type { PlacedPyramidPart, PyramidScore } from "@/types/pyramid";

export function calculatePyramidScore(
  placedParts: PlacedPyramidPart[]
): PyramidScore {
  const categories = new Set<string>();
  let totalScore = 0;

  for (const placedPart of placedParts) {
    const part = pyramidParts.find((item) => item.id === placedPart.partId);

    if (!part) {
      continue;
    }

    categories.add(part.category);
    totalScore += Math.round(part.score * placedPart.scale);
  }

  const varietyBonus = Math.max(0, categories.size - 1) * 12;
  const volumeBonus = placedParts.length >= 8 ? 30 : 0;

  return {
    categoryCount: categories.size,
    partCount: placedParts.length,
    totalScore: totalScore + varietyBonus + volumeBonus
  };
}
