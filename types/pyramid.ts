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
  | "circle"
  | "cloud"
  | "door"
  | "eye"
  | "plant"
  | "platform"
  | "rect"
  | "sign"
  | "stairs"
  | "triangle";

export type PyramidPart = {
  category: PyramidPartCategory;
  color: string;
  defaultScale: number;
  description?: string;
  id: string;
  name: string;
  score: number;
  visual: PyramidPartVisual;
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
  accent: string;
  ground: string;
  horizon: string;
  id: string;
  name: string;
  sky: string;
};

export type PyramidSaveData = {
  backgroundId: string;
  placedParts: PlacedPyramidPart[];
  updatedAt: string;
  version: 1;
};

export type PyramidScore = {
  categoryCount: number;
  partCount: number;
  totalScore: number;
};
