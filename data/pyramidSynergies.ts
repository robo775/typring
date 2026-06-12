import type { PyramidSynergy } from "@/types/pyramid";

export const pyramidSynergies: PyramidSynergy[] = [
  {
    backgroundId: "night",
    bonus: 40,
    description: "篝火を夜の背景で灯す。",
    id: "night-fire-ritual",
    name: "夜火の儀式",
    requires: [{ partId: "torch" }]
  },
  {
    bonus: 45,
    description: "スフィンクスと古代石碑を並べる。",
    id: "ancient-guardians",
    name: "古代の守護",
    requires: [{ partId: "sphinx" }, { partId: "ancient-obelisk" }]
  },
  {
    bonus: 35,
    description: "豪華な門に赤い旗を添える。",
    id: "royal-style",
    name: "王家の風格",
    requires: [{ partId: "royal-gate" }, { partId: "red-banner" }]
  },
  {
    bonus: 60,
    description: "猫とスフィンクスを共に祀る。",
    id: "cat-is-god",
    name: "猫は神",
    requires: [{ partId: "cat" }, { partId: "sphinx" }]
  },
  {
    bonus: 50,
    description: "木と噴水と花壇で憩いの場に。",
    id: "oasis-park",
    name: "オアシス公園",
    requires: [
      { partId: "tree" },
      { partId: "fountain" },
      { partId: "flower-box" }
    ]
  },
  {
    bonus: 40,
    description: "監視カメラと分析モニターで完全管理。",
    id: "surveillance-society",
    name: "監視社会",
    requires: [{ partId: "security-camera" }, { partId: "roi-monitor" }]
  },
  {
    bonus: 30,
    description: "足場と工事看板で建設現場に。",
    id: "under-construction",
    name: "工事中につき",
    requires: [{ partId: "scaffold" }, { partId: "warning-sign" }]
  },
  {
    bonus: 35,
    description: "巨大な目が霧の中から覗く。",
    id: "mystery",
    name: "ミステリー",
    requires: [{ partId: "giant-eye" }, { partId: "fog" }]
  },
  {
    bonus: 45,
    description: "祝祭アーチと風船でお祭り会場に。",
    id: "festival-time",
    name: "お祭り騒ぎ",
    requires: [{ partId: "festival-arch" }, { partId: "balloons" }]
  },
  {
    bonus: 30,
    description: "ソファと自販機で快適空間。",
    id: "cozy-corner",
    name: "快適休憩所",
    requires: [{ partId: "sofa" }, { partId: "vending-machine" }]
  },
  {
    bonus: 50,
    description: "石積みピラミッドを3基並べる。",
    id: "three-great-pyramids",
    name: "三大ピラミッド",
    requires: [{ count: 3, partId: "stone-pyramid" }]
  },
  {
    bonus: 55,
    description: "建材4種をすべて使う。",
    id: "material-master",
    name: "建材マスター",
    requires: [
      { partId: "stone-pyramid" },
      { partId: "black-pyramid" },
      { partId: "glass-pyramid" },
      { partId: "moss-pyramid" }
    ]
  }
];
