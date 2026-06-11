export type MiniGame = {
  description: string;
  href: string;
  id: string;
  isActive: boolean;
  title: string;
};

export const miniGames: MiniGame[] = [
  {
    description: "好きなパーツを組み合わせて、自分だけのピラミッドを作るミニゲームです。",
    href: "/games/pyramid",
    id: "pyramid-maker",
    isActive: true,
    title: "PYRAMID MAKER"
  },
  {
    description: "匿名キャラクターになって、相手の類型を推理する準備中のゲームです。",
    href: "/games/type-werewolf",
    id: "type-werewolf",
    isActive: true,
    title: "類型人狼"
  }
];
