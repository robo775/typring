import {
  PyramidCreationGrid,
  PyramidListHeader
} from "@/components/pyramid/pyramid-creation-list";
import { getPublicPyramidCreations } from "@/lib/pyramid/queries";

export default async function PyramidRankingPage() {
  const creations = await getPublicPyramidCreations("total_score");

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <PyramidListHeader
        title="スコアランキング"
        description="公開ピラミッドのスコア上位10件です。"
      />
      <PyramidCreationGrid creations={creations} />
    </div>
  );
}
