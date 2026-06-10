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
    color: "#d8c7a6",
    defaultScale: 1.08,
    description: "王道の石積みピラミッド。",
    id: "stone-pyramid",
    name: "石積みピラミッド",
    score: 34,
    visual: "pyramidBlock"
  },
  {
    category: "material",
    color: "#1f2937",
    defaultScale: 1.04,
    description: "重厚で威圧感のある黒石。",
    id: "black-pyramid",
    name: "黒石ピラミッド",
    score: 39,
    visual: "pyramidBlock"
  },
  {
    category: "material",
    color: "#93c5fd",
    defaultScale: 1.04,
    description: "光を通す透明な素材。",
    id: "glass-pyramid",
    name: "ガラスピラミッド",
    score: 42,
    visual: "glassPyramid"
  },
  {
    category: "material",
    color: "#8f9f6a",
    defaultScale: 1.04,
    description: "遺跡感が出る苔むした石材。",
    id: "moss-pyramid",
    name: "苔むした石材",
    score: 36,
    visual: "pyramidBlock"
  },
  {
    category: "entrance",
    color: "#8b5e34",
    defaultScale: 1,
    description: "普通だけど安心する入口。",
    id: "normal-door",
    name: "普通の入口",
    score: 22,
    visual: "door"
  },
  {
    category: "entrance",
    color: "#b45309",
    defaultScale: 1.05,
    description: "正面に置くと急に本格派。",
    id: "royal-gate",
    name: "豪華な門",
    score: 44,
    visual: "gate"
  },
  {
    category: "entrance",
    color: "#d6b98c",
    defaultScale: 1,
    description: "中でくつろげそうな丸い入口。",
    id: "round-arch",
    name: "丸い入口",
    score: 31,
    visual: "arch"
  },
  {
    category: "decoration",
    color: "#c084fc",
    defaultScale: 0.9,
    description: "神秘性がだいぶ増えます。",
    id: "ancient-obelisk",
    name: "古代石碑",
    score: 32,
    visual: "obelisk"
  },
  {
    category: "decoration",
    color: "#38bdf8",
    defaultScale: 0.78,
    description: "見守っているのか見張っているのか。",
    id: "giant-eye",
    name: "巨大な目",
    score: 37,
    visual: "eye"
  },
  {
    category: "decoration",
    color: "#c2a36b",
    defaultScale: 0.95,
    description: "置くだけで古代感。",
    id: "sphinx",
    name: "スフィンクス",
    score: 39,
    visual: "sphinx"
  },
  {
    category: "decoration",
    color: "#fb7185",
    defaultScale: 0.78,
    description: "やさしい雰囲気になります。",
    id: "flower-box",
    name: "花壇",
    score: 24,
    visual: "plant"
  },
  {
    category: "decoration",
    color: "#dc2626",
    defaultScale: 0.86,
    description: "祝祭感を足す旗。",
    id: "red-banner",
    name: "赤い旗",
    score: 30,
    visual: "banner"
  },
  {
    category: "decoration",
    color: "#f59e0b",
    defaultScale: 0.84,
    description: "夜のピラミッドに似合います。",
    id: "torch",
    name: "篝火",
    score: 33,
    visual: "flame"
  },
  {
    category: "facility",
    color: "#a16207",
    defaultScale: 0.92,
    description: "休めるピラミッドは強い。",
    id: "sofa",
    name: "ソファ",
    score: 28,
    visual: "bench"
  },
  {
    category: "facility",
    color: "#0891b2",
    defaultScale: 0.86,
    description: "目的最適化の気配。",
    id: "roi-monitor",
    name: "分析モニター",
    score: 42,
    visual: "monitor"
  },
  {
    category: "facility",
    color: "#64748b",
    defaultScale: 0.78,
    description: "セキュリティ意識が高い。",
    id: "security-camera",
    name: "監視カメラ",
    score: 34,
    visual: "antenna"
  },
  {
    category: "facility",
    color: "#475569",
    defaultScale: 0.9,
    description: "なぜか急に施設っぽい。",
    id: "vending-machine",
    name: "自販機",
    score: 31,
    visual: "rect"
  },
  {
    category: "environment",
    color: "#16a34a",
    defaultScale: 0.96,
    description: "自然と調和したい時に。",
    id: "tree",
    name: "大きな木",
    score: 28,
    visual: "plant"
  },
  {
    category: "environment",
    color: "#60a5fa",
    defaultScale: 0.88,
    description: "公園ピラミッドにできます。",
    id: "fountain",
    name: "噴水",
    score: 35,
    visual: "fountain"
  },
  {
    category: "environment",
    color: "#94a3b8",
    defaultScale: 1.08,
    description: "何も見えなくなるのも味です。",
    id: "fog",
    name: "霧",
    score: 20,
    visual: "cloud"
  },
  {
    category: "environment",
    color: "#a16207",
    defaultScale: 1,
    description: "建設途中感が出ます。",
    id: "scaffold",
    name: "足場",
    score: 25,
    visual: "scaffold"
  },
  {
    category: "environment",
    color: "#475569",
    defaultScale: 0.78,
    description: "守りが固く見えます。",
    id: "soldier",
    name: "兵士",
    score: 30,
    visual: "statue"
  },
  {
    category: "joke",
    color: "#ec4899",
    defaultScale: 1.08,
    description: "もはや公民館。",
    id: "festival-arch",
    name: "祝祭アーチ",
    score: 45,
    visual: "arch"
  },
  {
    category: "joke",
    color: "#7c3aed",
    defaultScale: 1,
    description: "勝った気になります。",
    id: "balloons",
    name: "風船",
    score: 34,
    visual: "circle"
  },
  {
    category: "joke",
    color: "#f97316",
    defaultScale: 0.9,
    description: "そこにいるだけで満足度が上がる。",
    id: "cat",
    name: "猫",
    score: 50,
    visual: "statue"
  },
  {
    category: "joke",
    color: "#facc15",
    defaultScale: 0.9,
    description: "工事現場にもできます。",
    id: "warning-sign",
    name: "工事看板",
    score: 22,
    visual: "sign"
  }
];
