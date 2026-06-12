import type { PyramidBackground } from "@/types/pyramid";

export const pyramidBackgrounds: PyramidBackground[] = [
  {
    groundSide: "#b8965f",
    groundTop: "#e3c98f",
    horizon: "#fdf3dd",
    id: "desert",
    isNight: false,
    name: "砂漠",
    skyBottom: "#cdeaf7",
    skyTop: "#5db5e8",
    sunColor: "#fbbf24"
  },
  {
    groundSide: "#1e293b",
    groundTop: "#3b4a63",
    horizon: "#2c3a55",
    id: "night",
    isNight: true,
    name: "夜",
    skyBottom: "#1e2c4a",
    skyTop: "#0b1226",
    sunColor: "#fef3c7"
  },
  {
    groundSide: "#4d7c0f",
    groundTop: "#84cc16",
    horizon: "#ecfccb",
    id: "forest",
    isNight: false,
    name: "森",
    skyBottom: "#d9f99d",
    skyTop: "#7dd3fc",
    sunColor: "#fde047"
  },
  {
    groundSide: "#475569",
    groundTop: "#94a3b8",
    horizon: "#e9d5ff",
    id: "city",
    isNight: false,
    name: "都市",
    skyBottom: "#fbcfe8",
    skyTop: "#818cf8",
    sunColor: "#fb923c"
  }
];
