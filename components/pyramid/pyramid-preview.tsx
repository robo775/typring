import { pyramidBackgrounds } from "@/data/pyramidBackgrounds";
import { pyramidParts } from "@/data/pyramidParts";
import type {
  PlacedPyramidPart,
  PyramidBackground,
  PyramidPartVisual
} from "@/types/pyramid";

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
              <PartShape color={part.color} visual={part.visual} />
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

function PartShape({
  color,
  visual
}: {
  color: string;
  visual: PyramidPartVisual;
}) {
  switch (visual) {
    case "antenna":
      return (
        <>
          <rect fill={color} height="80" rx="8" width="22" x="-11" y="-55" />
          <circle cx="0" cy="-70" fill="#f8fafc" r="22" stroke={color} strokeWidth="8" />
          <path d="M-45 -92 Q0 -125 45 -92" fill="none" stroke={color} strokeWidth="8" />
        </>
      );
    case "arch":
      return (
        <path
          d="M-58 58 V-8 C-58 -88 58 -88 58 -8 V58 H22 V-8 C22 -42 -22 -42 -22 -8 V58 Z"
          fill={color}
          stroke="#f8fafc"
          strokeWidth="6"
        />
      );
    case "banner":
      return (
        <>
          <path d="M-74 -36 H74 V18 H-74 Z" fill={color} />
          <path d="M-74 18 L-42 48 L-10 18 L22 48 L54 18 L74 38 V18 Z" fill="#fbbf24" />
        </>
      );
    case "circle":
      return <circle cx="0" cy="0" fill={color} opacity="0.88" r="58" />;
    case "cloud":
      return (
        <path
          d="M-78 24 C-92 -22 -40 -48 -18 -22 C2 -70 70 -52 62 0 C102 -2 108 54 56 58 H-54 C-100 58 -112 28 -78 24 Z"
          fill={color}
          opacity="0.7"
        />
      );
    case "door":
      return (
        <path
          d="M-42 58 V-2 C-42 -58 42 -58 42 -2 V58 Z"
          fill={color}
          stroke="#fde68a"
          strokeWidth="7"
        />
      );
    case "eye":
      return (
        <>
          <path
            d="M-70 0 C-34 -45 34 -45 70 0 C34 45 -34 45 -70 0 Z"
            fill="#f8fafc"
            stroke={color}
            strokeWidth="8"
          />
          <circle cx="0" cy="0" fill={color} r="23" />
        </>
      );
    case "plant":
      return (
        <>
          <rect fill="#854d0e" height="58" width="16" x="-8" y="0" />
          <circle cx="-28" cy="-8" fill={color} r="32" />
          <circle cx="22" cy="-24" fill={color} r="38" />
          <circle cx="34" cy="10" fill={color} r="28" />
        </>
      );
    case "sign":
      return (
        <>
          <rect fill={color} height="64" rx="10" width="126" x="-63" y="-46" />
          <rect fill="#475569" height="55" width="12" x="-6" y="18" />
          <path d="M-40 -13 H40" stroke="#fff" strokeLinecap="round" strokeWidth="8" />
        </>
      );
    case "stairs":
      return (
        <path
          d="M-70 58 H70 V34 H42 V12 H16 V-10 H-12 V-32 H-70 Z"
          fill={color}
        />
      );
    case "triangle":
      return <polygon fill={color} points="0,-70 68,58 -68,58" />;
    case "platform":
      return <ellipse cx="0" cy="18" fill={color} rx="76" ry="32" />;
    case "rect":
    default:
      return <rect fill={color} height="92" rx="14" width="120" x="-60" y="-46" />;
  }
}
