import { pyramidBackgrounds } from "@/data/pyramidBackgrounds";
import { pyramidParts } from "@/data/pyramidParts";
import type { PlacedPyramidPart } from "@/types/pyramid";

const knownPartIds = new Set(pyramidParts.map((part) => part.id));
const knownBackgroundIds = new Set(pyramidBackgrounds.map((background) => background.id));

export function sanitizeBackgroundId(value: unknown) {
  return typeof value === "string" && knownBackgroundIds.has(value)
    ? value
    : "desert";
}

export function sanitizePlacedParts(value: unknown): PlacedPyramidPart[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .slice(0, 80)
    .map((item, index) => sanitizePlacedPart(item, index))
    .filter((item): item is PlacedPyramidPart => item !== null);
}

function sanitizePlacedPart(value: unknown, index: number) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Partial<PlacedPyramidPart>;

  if (!item.partId || !knownPartIds.has(item.partId)) {
    return null;
  }

  return {
    flipX: Boolean(item.flipX),
    instanceId:
      typeof item.instanceId === "string" && item.instanceId.length <= 120
        ? item.instanceId
        : `${item.partId}-${index}`,
    partId: item.partId,
    rotation: clampNumber(item.rotation, -360, 360, 0),
    scale: clampNumber(item.scale, 0.35, 2.5, 1),
    x: clampNumber(item.x, 0, 1000, 500),
    y: clampNumber(item.y, 0, 1000, 500),
    zIndex: Math.round(clampNumber(item.zIndex, 0, 1000, index))
  };
}

function clampNumber(
  value: unknown,
  min: number,
  max: number,
  fallback: number
) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, value));
}
