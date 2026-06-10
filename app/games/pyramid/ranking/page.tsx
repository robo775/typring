import { CreationGrid, getPublicCreations, Header } from "../gallery/page";

export default async function PyramidRankingPage() {
  const creations = await getPublicCreations("total_score");

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <Header
        title="スコアランキング"
        description="公開ピラミッドのスコア上位10件です。"
      />
      <CreationGrid creations={creations} />
    </div>
  );
}
