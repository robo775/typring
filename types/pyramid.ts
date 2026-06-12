export type PyramidPartCategory =
  | "material"
  | "entrance"
  | "decoration"
  | "facility"
  | "environment"
  | "joke";

export type PyramidPartVisual =
  | "antenna"
  | "arch"
  | "banner"
  | "bench"
  | "circle"
  | "cloud"
  | "door"
  | "eye"
  | "flame"
  | "fountain"
  | "gate"
  | "glassPyramid"
  | "lantern"
  | "monitor"
  | "obelisk"
  | "plant"
  | "platform"
  | "pyramidBlock"
  | "rect"
  | "scaffold"
  | "sign"
  | "sphinx"
  | "stairs"
  | "statue"
  | "triangle";

export type PyramidMode = "free" | "challenge";

export type PyramidPart = {
  category: PyramidPartCategory;
  color: string;
  cost: number;
  defaultScale: number;
  description?: string;
  id: string;
  name: string;
  score: number;
  visual: PyramidPartVisual;
};

export type PyramidSynergy = {
  backgroundId?: string;
  bonus: number;
  description: string;
  id: string;
  name: string;
  requires: { count?: number; partId: string }[];
};

export type PlacedPyramidPart = {
  flipX: boolean;
  instanceId: string;
  partId: string;
  rotation: number;
  scale: number;
  x: number;
  y: number;
  zIndex: number;
};

export type PyramidBackground = {
  groundSide: string;
  groundTop: string;
  horizon: string;
  id: string;
  isNight: boolean;
  name: string;
  skyBottom: string;
  skyTop: string;
  sunColor: string;
};

export type PyramidSaveData = {
  backgroundId: string;
  mode: PyramidMode;
  placedParts: PlacedPyramidPart[];
  updatedAt: string;
  version: 2;
};

export type PyramidScore = {
  achievedSynergyIds: string[];
  baseScore: number;
  categoryCount: number;
  costUsed: number;
  partCount: number;
  synergyBonus: number;
  totalScore: number;
  varietyBonus: number;
  volumeBonus: number;
};
