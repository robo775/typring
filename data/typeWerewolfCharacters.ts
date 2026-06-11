export const TYPE_WEREWOLF_CHARACTERS = [
  {
    code: "james",
    imagePath: "/assets/games/type-werewolf/characters/james.png",
    name: "ジェームズ"
  },
  {
    code: "victoria",
    imagePath: "/assets/games/type-werewolf/characters/victoria.png",
    name: "ヴィクトリア"
  },
  {
    code: "ijun",
    imagePath: "/assets/games/type-werewolf/characters/ijun.png",
    name: "イジュン"
  },
  {
    code: "catherine",
    imagePath: "/assets/games/type-werewolf/characters/catherine.png",
    name: "カトリーヌ"
  },
  {
    code: "masayoshi",
    imagePath: "/assets/games/type-werewolf/characters/masayoshi.png",
    name: "マサヨシ"
  },
  {
    code: "clara",
    imagePath: "/assets/games/type-werewolf/characters/clara.png",
    name: "クララ"
  },
  {
    code: "xiyue",
    imagePath: "/assets/games/type-werewolf/characters/xiyue.png",
    name: "シーユエ"
  },
  {
    code: "mohamed",
    imagePath: "/assets/games/type-werewolf/characters/mohamed.png",
    name: "モハメド"
  }
] as const;

export type TypeWerewolfCharacterCode =
  (typeof TYPE_WEREWOLF_CHARACTERS)[number]["code"];
