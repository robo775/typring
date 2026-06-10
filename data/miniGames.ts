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
  }
];
