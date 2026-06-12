import { PyramidScene } from "@/components/pyramid/pyramid-scene";
import { pyramidBackgrounds } from "@/data/pyramidBackgrounds";
import type { PlacedPyramidPart } from "@/types/pyramid";

export function PyramidPreview({
  backgroundId,
  className,
  placedParts,
  title = "PYRAMID MAKER"
}: {
  backgroundId: string;
  className?: string;
  placedParts: PlacedPyramidPart[];
  title?: string;
}) {
  const background =
    pyramidBackgrounds.find((item) => item.id === backgroundId) ??
    pyramidBackgrounds[0];

  return (
    <svg
      className={className}
      role="img"
      viewBox="0 0 1000 1000"
      xmlns="http://www.w3.org/2000/svg"
    >
      <PyramidScene
        background={background}
        idPrefix={`preview-${background.id}-`}
        placedParts={placedParts}
        title={title}
      />
    </svg>
  );
}
