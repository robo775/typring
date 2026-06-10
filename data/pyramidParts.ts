import type { PyramidPart, PyramidPartCategory } from "@/types/pyramid";

export const pyramidCategoryLabels: Record<PyramidPartCategory, string> = {
  decoration: "装飾",
  entrance: "入口",
  environment: "周辺",
  facility: "設備",
  joke: "ネタ",
  material: "建材"
};

export const pyramidParts: PyramidPart[] = [
  {
    category: "material",
    color: "#d6d3d1",
    defaultScale: 1.2,
    description: "王道の石材。何にでも合います。",
    id: "stone-block",
    name: "石材",
    score: 24,
    visual: "rect"
  },
  {
    category: "material",
    color: "#111827",
    defaultScale: 1.1,
    description: "圧のある黒い石材。",
    id: "black-stone",
    name: "黒い石材",
    score: 30,
    visual: "rect"
  },
  {
    category: "material",
    color: "#bfdbfe",
    defaultScale: 1.15,
    description: "夜になるとたぶん映えます。",
    id: "glass-panel",
    name: "ガラス",
    score: 28,
    visual: "rect"
  },
  {
    category: "entrance",
    color: "#92400e",
    defaultScale: 1,
    description: "ひとまず入れます。",
    id: "normal-door",
    name: "普通の入口",
    score: 18,
    visual: "door"
  },
  {
    category: "entrance",
    color: "#f59e0b",
    defaultScale: 1.15,
    description: "威厳だけは十分。",
    id: "giant-gate",
    name: "巨大な門",
    score: 35,
    visual: "arch"
  },
  {
    category: "entrance",
    color: "#fef3c7",
    defaultScale: 0.95,
    description: "帰りたくなる入口。",
    id: "glowing-door",
    name: "光る入口",
    score: 30,
    visual: "door"
  },
  {
    category: "decoration",
    color: "#facc15",
    defaultScale: 0.9,
    description: "正面に置くと急にそれっぽい。",
    id: "ancient-mark",
    name: "古代文字",
    score: 22,
    visual: "sign"
  },
  {
    category: "decoration",
    color: "#38bdf8",
    defaultScale: 0.8,
    description: "見られている感じを足します。",
    id: "giant-eye",
    name: "巨大な目",
    score: 32,
    visual: "eye"
  },
  {
    category: "decoration",
    color: "#fb7185",
    defaultScale: 0.75,
    description: "急に祝祭感が出ます。",
    id: "flowers",
    name: "花",
    score: 18,
    visual: "plant"
  },
  {
    category: "facility",
    color: "#a3e635",
    defaultScale: 0.95,
    description: "ピラミッド内の快適性を上げます。",
    id: "sofa",
    name: "ソファ",
    score: 26,
    visual: "rect"
  },
  {
    category: "facility",
    color: "#f97316",
    defaultScale: 0.85,
    description: "長期滞在にも対応。",
    id: "bed",
    name: "ベッド",
    score: 24,
    visual: "rect"
  },
  {
    category: "facility",
    color: "#64748b",
    defaultScale: 0.8,
    description: "統治の香りがします。",
    id: "camera",
    name: "監視カメラ",
    score: 27,
    visual: "antenna"
  },
  {
    category: "environment",
    color: "#16a34a",
    defaultScale: 1,
    description: "自然と調和したい時に。",
    id: "tree",
    name: "木",
    score: 20,
    visual: "plant"
  },
  {
    category: "environment",
    color: "#94a3b8",
    defaultScale: 1.2,
    description: "何も見えなくなるのも味です。",
    id: "fog",
    name: "霧",
    score: 18,
    visual: "cloud"
  },
  {
    category: "environment",
    color: "#475569",
    defaultScale: 0.9,
    description: "守りが固く見えます。",
    id: "soldier",
    name: "兵士",
    score: 25,
    visual: "triangle"
  },
  {
    category: "joke",
    color: "#ec4899",
    defaultScale: 1.2,
    description: "もはや公民館。",
    id: "festival",
    name: "祝祭会場",
    score: 40,
    visual: "banner"
  },
  {
    category: "joke",
    color: "#06b6d4",
    defaultScale: 1,
    description: "目的最適化の気配。",
    id: "roi-monitor",
    name: "ROI最大化モニター",
    score: 38,
    visual: "sign"
  },
  {
    category: "joke",
    color: "#7c3aed",
    defaultScale: 1.25,
    description: "これがあると勝った気になります。",
    id: "giant-airship",
    name: "巨大な風船",
    score: 34,
    visual: "circle"
  }
];
