import type { PlacedPyramidPart, PyramidSaveData } from "@/types/pyramid";

const STORAGE_KEY = "typring:pyramid-maker:v1";

export function loadPyramidSave(): PyramidSaveData | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<PyramidSaveData>;

    if (parsed.version !== 1 || !Array.isArray(parsed.placedParts)) {
      return null;
    }

    return {
      backgroundId: parsed.backgroundId ?? "desert",
      placedParts: parsed.placedParts as PlacedPyramidPart[],
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
      version: 1
    };
  } catch {
    return null;
  }
}

export function savePyramidState(
  backgroundId: string,
  placedParts: PlacedPyramidPart[]
) {
  if (typeof window === "undefined") {
    return;
  }

  const saveData: PyramidSaveData = {
    backgroundId,
    placedParts,
    updatedAt: new Date().toISOString(),
    version: 1
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
}

export function clearPyramidSave() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
