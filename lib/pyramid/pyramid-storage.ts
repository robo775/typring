import type {
  PlacedPyramidPart,
  PyramidMode,
  PyramidSaveData
} from "@/types/pyramid";

const LEGACY_STORAGE_KEY = "typring:pyramid-maker:v1";

function storageKey(mode: PyramidMode) {
  return `typring:pyramid-maker:${mode}:v2`;
}

export function loadPyramidSave(mode: PyramidMode): PyramidSaveData | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    migrateLegacySave();

    const raw = window.localStorage.getItem(storageKey(mode));

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<PyramidSaveData>;

    if (parsed.version !== 2 || !Array.isArray(parsed.placedParts)) {
      return null;
    }

    return {
      backgroundId: parsed.backgroundId ?? "desert",
      mode,
      placedParts: parsed.placedParts as PlacedPyramidPart[],
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
      version: 2
    };
  } catch {
    return null;
  }
}

export function savePyramidState(
  mode: PyramidMode,
  backgroundId: string,
  placedParts: PlacedPyramidPart[]
) {
  if (typeof window === "undefined") {
    return;
  }

  const saveData: PyramidSaveData = {
    backgroundId,
    mode,
    placedParts,
    updatedAt: new Date().toISOString(),
    version: 2
  };

  window.localStorage.setItem(storageKey(mode), JSON.stringify(saveData));
}

export function clearPyramidSave(mode: PyramidMode) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(storageKey(mode));
}

function migrateLegacySave() {
  const raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);

  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw) as {
      backgroundId?: string;
      placedParts?: PlacedPyramidPart[];
      updatedAt?: string;
      version?: number;
    };

    if (
      parsed.version === 1 &&
      Array.isArray(parsed.placedParts) &&
      !window.localStorage.getItem(storageKey("free"))
    ) {
      const migrated: PyramidSaveData = {
        backgroundId: parsed.backgroundId ?? "desert",
        mode: "free",
        placedParts: parsed.placedParts,
        updatedAt: parsed.updatedAt ?? new Date().toISOString(),
        version: 2
      };
      window.localStorage.setItem(
        storageKey("free"),
        JSON.stringify(migrated)
      );
    }
  } finally {
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  }
}
