import { PyramidPartShape } from "@/components/pyramid/pyramid-part-shape";
import { pyramidParts } from "@/data/pyramidParts";
import { shadeColor } from "@/lib/pyramid/color";
import type { PlacedPyramidPart, PyramidBackground } from "@/types/pyramid";

export function PyramidScene({
  background,
  handlePointerDown,
  idPrefix,
  placedParts,
  selectedId,
  title
}: {
  background: PyramidBackground;
  handlePointerDown?: (
    event: React.PointerEvent<SVGGElement>,
    part: PlacedPyramidPart
  ) => void;
  idPrefix: string;
  placedParts: PlacedPyramidPart[];
  selectedId?: string | null;
  title?: string;
}) {
  const skyId = `${idPrefix}Sky`;
  const glowId = `${idPrefix}Glow`;
  const leftFaceId = `${idPrefix}LeftFace`;
  const rightFaceId = `${idPrefix}RightFace`;

  return (
    <>
      <defs>
        <linearGradient id={skyId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={background.skyTop} />
          <stop offset="58%" stopColor={background.skyBottom} />
          <stop offset="78%" stopColor={background.horizon} />
        </linearGradient>
        <radialGradient id={glowId}>
          <stop offset="0%" stopColor={background.sunColor} stopOpacity="0.9" />
          <stop offset="55%" stopColor={background.sunColor} stopOpacity="0.28" />
          <stop offset="100%" stopColor={background.sunColor} stopOpacity="0" />
        </radialGradient>
        <clipPath id={leftFaceId}>
          <polygon points="500,155 170,790 560,790" />
        </clipPath>
        <clipPath id={rightFaceId}>
          <polygon points="500,155 560,790 830,790" />
        </clipPath>
      </defs>

      {/* 空 */}
      <rect fill={`url(#${skyId})`} height="1000" width="1000" />

      {/* 太陽 / 月と星 */}
      {background.isNight ? (
        <>
          {[
            [120, 120, 3],
            [260, 80, 2],
            [420, 150, 2.5],
            [610, 70, 2],
            [700, 180, 3],
            [880, 120, 2],
            [930, 240, 2.5],
            [180, 260, 2],
            [540, 250, 2]
          ].map(([cx, cy, r]) => (
            <circle
              cx={cx}
              cy={cy}
              fill="#e2e8f0"
              key={`${cx}-${cy}`}
              opacity="0.85"
              r={r}
            />
          ))}
          <circle cx="790" cy="160" fill={`url(#${glowId})`} r="130" />
          <circle cx="790" cy="160" fill={background.sunColor} r="52" />
          <circle cx="772" cy="148" fill={background.skyTop} opacity="0.35" r="12" />
          <circle cx="805" cy="178" fill={background.skyTop} opacity="0.3" r="8" />
        </>
      ) : (
        <>
          <circle cx="790" cy="160" fill={`url(#${glowId})`} r="160" />
          <circle cx="790" cy="160" fill={background.sunColor} r="56" />
        </>
      )}

      {/* 雲 */}
      <g className="pyr-drift" opacity={background.isNight ? 0.25 : 0.8}>
        <path
          d="M150 215 C135 180 175 160 200 175 C212 145 262 150 268 180 C300 172 312 205 285 218 C260 228 175 228 150 215 Z"
          fill="#ffffff"
        />
      </g>
      <g className="pyr-drift-slow" opacity={background.isNight ? 0.18 : 0.62}>
        <path
          d="M560 120 C545 90 585 72 608 86 C620 58 666 64 672 92 C700 84 712 114 686 126 C662 136 585 134 560 120 Z"
          fill="#ffffff"
        />
      </g>

      {/* 遠景シルエット */}
      {background.id === "city" ? (
        <g fill={shadeColor(background.groundSide, -10)} opacity="0.5">
          <rect height="160" width="60" x="40" y="540" />
          <rect height="220" width="46" x="112" y="480" />
          <rect height="120" width="70" x="170" y="580" />
          <rect height="190" width="52" x="760" y="510" />
          <rect height="140" width="64" x="824" y="560" />
          <rect height="240" width="44" x="900" y="460" />
        </g>
      ) : (
        <g fill={shadeColor(background.groundSide, 16)} opacity="0.55">
          <path d="M0 660 Q140 600 300 655 L300 700 L0 700 Z" />
          <path d="M660 655 Q820 595 1000 650 L1000 700 L660 700 Z" />
        </g>
      )}

      {/* 地面: 2.5Dプレーン */}
      <path
        d="M0 700 C190 668 300 716 475 692 C680 662 810 702 1000 668 L1000 832 L0 832 Z"
        fill={background.groundTop}
      />
      <path
        d="M0 832 L1000 832 L1000 1000 L0 1000 Z"
        fill={background.groundSide}
      />
      <path
        d="M0 832 C250 818 760 818 1000 832 L1000 850 C760 836 250 836 0 850 Z"
        fill={shadeColor(background.groundSide, -16)}
        opacity="0.6"
      />
      {/* 薄いパース格子 */}
      <g opacity="0.12" stroke="#0f172a" strokeWidth="2">
        <path d="M120 705 L20 826 M320 698 L260 828 M500 694 L500 828 M690 692 L740 828 M880 678 L976 824" fill="none" />
      </g>

      {/* ベースピラミッドの落ち影（光源は左上） */}
      <path
        d="M500 790 L830 790 L980 838 L640 842 Z"
        fill="#0f172a"
        opacity="0.2"
      />

      {/* ベースピラミッド: 明暗2面 */}
      <polygon
        fill={shadeColor("#cbd5e1", 22)}
        points="500,155 170,790 560,790"
      />
      <polygon
        fill={shadeColor("#94a3b8", -18)}
        points="500,155 560,790 830,790"
      />
      <g clipPath={`url(#${leftFaceId})`} opacity="0.3" stroke="#64748b" strokeWidth="5">
        <path d="M150 680 H860 M210 575 H800 M270 470 H740 M330 365 H680 M390 260 H620" fill="none" />
      </g>
      <g clipPath={`url(#${rightFaceId})`} opacity="0.4" stroke="#334155" strokeWidth="5">
        <path d="M150 680 H860 M210 575 H800 M270 470 H740 M330 365 H680 M390 260 H620" fill="none" />
      </g>
      <path
        d="M500 155 L560 790"
        fill="none"
        opacity="0.5"
        stroke={shadeColor("#94a3b8", -30)}
        strokeWidth="4"
      />

      {/* 配置パーツ */}
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
              cursor={handlePointerDown ? "grab" : undefined}
              key={placedPart.instanceId}
              onPointerDown={
                handlePointerDown
                  ? (event) => handlePointerDown(event, placedPart)
                  : undefined
              }
              transform={`translate(${placedPart.x} ${placedPart.y}) rotate(${placedPart.rotation}) scale(${
                placedPart.flipX ? -placedPart.scale : placedPart.scale
              } ${placedPart.scale})`}
            >
              <PyramidPartShape color={part.color} visual={part.visual} />
              {selectedId === placedPart.instanceId ? (
                <rect
                  fill="none"
                  height="128"
                  pointerEvents="none"
                  rx="18"
                  stroke="#22d3ee"
                  strokeDasharray="12 8"
                  strokeWidth="7"
                  width="128"
                  x="-64"
                  y="-64"
                />
              ) : null}
            </g>
          );
        })}

      {/* タイトル */}
      {title !== undefined ? (
        <>
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
      ) : null}
    </>
  );
}
