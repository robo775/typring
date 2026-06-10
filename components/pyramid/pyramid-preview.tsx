import { pyramidBackgrounds } from "@/data/pyramidBackgrounds";
import { PyramidPartShape } from "@/components/pyramid/pyramid-part-shape";
import { pyramidParts } from "@/data/pyramidParts";
import type { PlacedPyramidPart, PyramidBackground } from "@/types/pyramid";

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
        placedParts={placedParts}
        title={title}
      />
    </svg>
  );
}

function PyramidScene({
  background,
  placedParts,
  title
}: {
  background: PyramidBackground;
  placedParts: PlacedPyramidPart[];
  title: string;
}) {
  return (
    <>
      <defs>
        <linearGradient id="previewPyramidSky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={background.sky} />
          <stop offset="75%" stopColor={background.horizon} />
        </linearGradient>
        <linearGradient id="previewBasePyramid" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="52%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
      </defs>
      <rect fill="url(#previewPyramidSky)" height="1000" width="1000" />
      <circle cx="805" cy="145" fill={background.accent} opacity="0.8" r="58" />
      <path
        d="M0 700 C190 655 300 720 475 688 C680 650 810 700 1000 660 L1000 1000 L0 1000 Z"
        fill={background.ground}
      />
      <ellipse cx="500" cy="780" fill="#0f172a" opacity="0.18" rx="330" ry="52" />
      <polygon
        fill="url(#previewBasePyramid)"
        points="500,155 170,790 830,790"
        stroke="#f8fafc"
        strokeWidth="8"
      />
      <polygon fill="#334155" opacity="0.35" points="500,155 830,790 510,790" />
      <path
        d="M246 650 L754 650 M300 540 L700 540 M356 430 L644 430 M414 320 L586 320"
        fill="none"
        opacity="0.35"
        stroke="#475569"
        strokeWidth="8"
      />
      {placedParts
        .slice()
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((placedPart) => {
          const part = pyramidParts.find((item) => item.id === placedPart.partId);

          if (!part) {
            return null;
          }

          return (
            <g
              key={placedPart.instanceId}
              transform={`translate(${placedPart.x} ${placedPart.y}) rotate(${placedPart.rotation}) scale(${
                placedPart.flipX ? -placedPart.scale : placedPart.scale
              } ${placedPart.scale})`}
            >
              <PyramidPartShape color={part.color} visual={part.visual} />
            </g>
          );
        })}
      <rect fill="#ffffff" height="76" opacity="0.76" rx="24" width="430" x="44" y="44" />
      <text
        fill="#0f172a"
        fontFamily="Arial, sans-serif"
        fontSize="31"
        fontWeight="800"
        x="68"
        y="90"
      >
        {title.slice(0, 24)}
      </text>
      <text
        fill="#475569"
        fontFamily="Arial, sans-serif"
        fontSize="20"
        fontWeight="700"
        x="70"
        y="116"
      >
        Typring Mini Game
      </text>
    </>
  );
}
