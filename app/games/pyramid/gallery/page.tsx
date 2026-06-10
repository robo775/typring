import {
  PyramidCreationGrid,
  PyramidListHeader
} from "@/components/pyramid/pyramid-creation-list";
import { getPublicPyramidCreations } from "@/lib/pyramid/queries";

export default async function PyramidGalleryPage() {
  const creations = await getPublicPyramidCreations("created_at");

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <PyramidListHeader
        title="公開ピラミッド"
        description="みんなが公開したピラミッドです。"
      />
      <PyramidCreationGrid creations={creations} />
    </div>
  );
}
