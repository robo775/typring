import {
  GroundShadow,
  IsoBox,
  IsoCylinder,
  IsoPyramid
} from "@/components/pyramid/iso-helpers";
import { shadeColor } from "@/lib/pyramid/color";
import type { PyramidPartVisual } from "@/types/pyramid";

// 全ビジュアルは±80の基準ボックス内・接地ラインy≒58で描画する。
// 光源は左上固定（iso-helpersの面シェーディングと統一）。
export function PyramidPartShape({
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
          <GroundShadow rx={40} />
          <g transform="translate(0 58)">
            <IsoBox color="#64748b" d={26} h={20} w={26} />
          </g>
          <g transform="translate(0 42)">
            <IsoBox color="#475569" d={12} h={64} w={12} />
          </g>
          <g transform="translate(0 -22)">
            <IsoBox color={color} d={26} h={26} w={52} />
          </g>
          <circle cx="-14" cy="-32" fill="#22d3ee" r="6" />
          <circle cx="10" cy="-38" fill="#38bdf8" r="6" />
          <path
            d="M-44 -62 Q0 -92 44 -62"
            fill="none"
            stroke={shadeColor(color, 16)}
            strokeLinecap="round"
            strokeWidth="7"
          />
          <path
            d="M-34 -72 L-56 -94 M34 -72 L56 -94"
            stroke={shadeColor(color, 16)}
            strokeLinecap="round"
            strokeWidth="6"
          />
        </>
      );
    case "arch":
      return (
        <>
          <GroundShadow rx={62} />
          {/* 奥行き面 */}
          <path
            d="M-50 50 V-10 C-50 -78 62 -78 62 -10 V42 H40 V-8 C40 -44 -28 -44 -28 -8 V50 Z"
            fill={shadeColor(color, -28)}
          />
          {/* 正面 */}
          <path
            d="M-62 58 V-2 C-62 -70 50 -70 50 -2 V58 H28 V0 C28 -36 -40 -36 -40 0 V58 Z"
            fill={shadeColor(color, 6)}
          />
          <path
            d="M-62 -2 C-62 -70 50 -70 50 -2"
            fill="none"
            stroke={shadeColor(color, 26)}
            strokeWidth="7"
          />
          <circle cx="-36" cy="-26" fill="#fb7185" r="9" />
          <circle cx="24" cy="-26" fill="#fb7185" r="9" />
        </>
      );
    case "banner":
      return (
        <>
          <GroundShadow rx={56} />
          <g transform="translate(-58 58)">
            <IsoBox color="#8b5e34" d={8} h={116} w={8} />
          </g>
          <g transform="translate(58 50)">
            <IsoBox color="#8b5e34" d={8} h={108} w={8} />
          </g>
          {/* 旗本体（風になびく台形） */}
          <path
            d="M-58 -54 L58 -46 L58 16 L-58 24 Z"
            fill={shadeColor(color, 0)}
          />
          <path
            d="M-58 -54 L58 -46 L58 -32 L-58 -40 Z"
            fill={shadeColor(color, 18)}
          />
          <path
            d="M-58 24 L-30 44 L-2 22 L26 42 L58 16 L58 4 L-58 12 Z"
            fill="#fbbf24"
          />
          <path
            d="M0 -30 L15 -8 L0 14 L-15 -8 Z"
            fill="#fde68a"
            stroke={shadeColor(color, -20)}
            strokeWidth="3"
          />
        </>
      );
    case "bench":
      return (
        <>
          <GroundShadow rx={62} />
          <g transform="translate(0 58)">
            <IsoBox color="#b45309" d={44} h={26} w={110} />
          </g>
          <g transform="translate(-26 30)">
            <IsoBox color="#f97316" d={36} h={26} w={46} />
          </g>
          <g transform="translate(26 33)">
            <IsoBox color="#fb923c" d={36} h={26} w={46} />
          </g>
          <g transform="translate(12 6)">
            <IsoBox color="#fdba74" d={10} h={40} w={100} />
          </g>
          <circle cx="-26" cy="-4" fill="#fde68a" r="8" />
          <circle cx="30" cy="0" fill="#fde68a" r="8" />
        </>
      );
    case "circle":
      return (
        <>
          <GroundShadow rx={30} />
          <path
            d="M-30 -20 L0 58 M0 -34 L0 58 M32 -16 L0 58"
            stroke="#94a3b8"
            strokeWidth="3"
          />
          <g className="pyr-float">
            {[
              [-34, -28, "#ef4444"],
              [2, -46, "#22c55e"],
              [34, -22, "#3b82f6"],
              [-12, -8, "#eab308"],
              [20, 2, color]
            ].map(([cx, cy, fill]) => (
              <g key={`${cx}-${cy}`}>
                <ellipse
                  cx={Number(cx)}
                  cy={Number(cy)}
                  fill={String(fill)}
                  rx="19"
                  ry="22"
                />
                <ellipse
                  cx={Number(cx) - 6}
                  cy={Number(cy) - 8}
                  fill="#ffffff"
                  opacity="0.45"
                  rx="6"
                  ry="8"
                />
              </g>
            ))}
          </g>
          <g transform="translate(0 58)">
            <IsoBox color="#92400e" d={18} h={14} w={26} />
          </g>
        </>
      );
    case "cloud":
      return (
        <g className="pyr-drift-slow">
          <path
            d="M-82 24 C-98 -24 -42 -52 -18 -22 C4 -74 74 -54 66 0 C106 -4 116 58 58 62 H-58 C-106 62 -118 28 -82 24 Z"
            fill="#f1f5f9"
            opacity="0.88"
          />
          <path
            d="M-82 24 C-98 -24 -42 -52 -18 -22 C4 -74 74 -54 66 0 C80 -1 90 6 94 18 C40 8 -40 10 -94 26 C-92 25 -88 24 -82 24 Z"
            fill="#ffffff"
            opacity="0.9"
          />
        </g>
      );
    case "door":
      return (
        <>
          <GroundShadow rx={52} />
          {/* 壁の厚み付きの入口 */}
          <g transform="translate(0 58)">
            <IsoBox color={color} d={30} h={104} w={92} />
          </g>
          <path
            d="M-30 52 V-6 C-30 -42 26 -42 26 -6 V52 Z"
            fill="#100c08"
            opacity="0.85"
          />
          <path
            d="M-30 -6 C-30 -42 26 -42 26 -6"
            fill="none"
            stroke={shadeColor(color, -34)}
            strokeWidth="6"
          />
          <circle cx="14" cy="22" fill="#facc15" r="5" />
          <g transform="translate(0 70)">
            <IsoBox color={shadeColor(color, -10)} d={40} h={12} w={112} />
          </g>
        </>
      );
    case "eye":
      return (
        <>
          {/* 石の縁取りに奥行きを持たせた目 */}
          <path
            d="M-74 4 C-36 -46 44 -46 80 4 C44 54 -36 54 -74 4 Z"
            fill={shadeColor("#92400e", -20)}
          />
          <path
            d="M-78 0 C-40 -50 40 -50 76 0 C40 50 -40 50 -78 0 Z"
            fill="#fef3c7"
            stroke="#92400e"
            strokeWidth="6"
          />
          <circle cx="-2" cy="0" fill={color} r="29" />
          <circle cx="-2" cy="0" fill="#0f172a" r="14" />
          <circle cx="-12" cy="-9" fill="#ffffff" opacity="0.8" r="6" />
          <path
            d="M-2 38 L12 66 L-16 66 Z"
            fill={shadeColor(color, -12)}
            stroke="#92400e"
            strokeWidth="4"
          />
        </>
      );
    case "flame":
      return (
        <>
          <GroundShadow rx={40} />
          <g transform="translate(0 58)">
            <IsoCylinder color="#7c5f3d" h={20} r={30} />
          </g>
          <g transform="translate(0 38)">
            <IsoCylinder color="#a16207" h={10} r={20} />
          </g>
          <g className="pyr-flicker">
            <path
              d="M-22 28 C-40 -20 -6 -22 -8 -64 C20 -36 38 -16 22 28 Z"
              fill={color}
            />
            <path
              d="M-8 26 C-18 -4 10 -16 6 -44 C28 -16 24 4 10 26 Z"
              fill="#fde047"
            />
            <path
              d="M-2 24 C-8 6 8 -2 6 -20 C16 -4 14 10 6 24 Z"
              fill="#fffbeb"
              opacity="0.9"
            />
          </g>
        </>
      );
    case "fountain":
      return (
        <>
          <GroundShadow cy={62} rx={66} />
          <g transform="translate(0 58)">
            <IsoCylinder color="#d6d3d1" h={18} r={64} />
          </g>
          <ellipse cx="0" cy="40" fill="#38bdf8" opacity="0.75" rx="54" ry="26" />
          <ellipse cx="-14" cy="34" fill="#bae6fd" opacity="0.6" rx="20" ry="9" />
          <g transform="translate(0 44)">
            <IsoCylinder color="#a8a29e" h={36} r={10} />
          </g>
          <g className="pyr-water">
            <path
              d="M-40 16 C-22 -6 -10 -22 0 -46 C10 -22 22 -6 40 16"
              fill="none"
              stroke="#7dd3fc"
              strokeLinecap="round"
              strokeWidth="6"
            />
            <path
              d="M-22 22 C-12 6 -6 -8 0 -28 C6 -8 12 6 22 22"
              fill="none"
              opacity="0.8"
              stroke="#e0f2fe"
              strokeLinecap="round"
              strokeWidth="4"
            />
          </g>
        </>
      );
    case "gate":
      return (
        <>
          <GroundShadow rx={66} />
          <g transform="translate(-52 58)">
            <IsoBox color="#8b7355" d={26} h={100} w={28} />
          </g>
          <g transform="translate(52 58)">
            <IsoBox color="#8b7355" d={26} h={100} w={28} />
          </g>
          <g transform="translate(0 -46)">
            <IsoBox color={color} d={30} h={26} w={132} />
          </g>
          <path
            d="M-28 54 V-16 C-28 -46 28 -46 28 -16 V54 Z"
            fill="#2a1205"
            opacity="0.9"
          />
          <circle cx="-10" cy="10" fill="#facc15" r="5" />
          <circle cx="10" cy="10" fill="#facc15" r="5" />
          <path
            d="M0 -88 L15 -64 L0 -42 L-15 -64 Z"
            fill="#38bdf8"
            stroke={shadeColor(color, -24)}
            strokeWidth="4"
          />
        </>
      );
    case "glassPyramid":
      return (
        <>
          <GroundShadow cy={62} rx={60} />
          <g opacity="0.78" transform="translate(0 58)">
            <IsoPyramid base={104} color={color} h={128} />
          </g>
          <path
            d="M0 -70 L-52 32 M0 -70 L52 32 M0 -70 L0 58 M-34 -4 L34 -4 M-46 22 L46 22"
            opacity="0.85"
            stroke="#e0f2fe"
            strokeWidth="3.5"
          />
          <path
            d="M0 -70 L-22 -22 L-8 -26 Z"
            fill="#ffffff"
            opacity="0.55"
          />
        </>
      );
    case "lantern":
      return (
        <>
          <GroundShadow rx={32} />
          <g transform="translate(0 58)">
            <IsoBox color="#334155" d={10} h={120} w={10} />
          </g>
          <path
            d="M-24 -46 Q0 -70 24 -46"
            fill="none"
            stroke="#334155"
            strokeWidth="6"
          />
          <g transform="translate(0 -8)">
            <IsoBox color={color} d={24} h={44} w={32} />
          </g>
          <circle className="pyr-flicker" cx="2" cy="-28" fill="#fef9c3" opacity="0.85" r="11" />
        </>
      );
    case "monitor":
      return (
        <>
          <GroundShadow rx={58} />
          <g transform="translate(0 58)">
            <IsoBox color="#475569" d={30} h={16} w={56} />
          </g>
          <g transform="translate(0 44)">
            <IsoBox color="#334155" d={12} h={28} w={14} />
          </g>
          {/* 本体（少し斜めに置かれた薄型筐体） */}
          <g transform="translate(0 18)">
            <IsoBox color="#0f172a" d={14} h={84} w={120} />
          </g>
          <polygon
            fill="#083344"
            points="-55,-62 53,-54 53,4 -55,12"
          />
          <path
            className="pyr-blink"
            d="M-40 -16 L-20 -30 L-2 -16 L22 -40 L40 -30"
            fill="none"
            stroke="#22d3ee"
            strokeLinecap="round"
            strokeWidth="5"
          />
          <circle className="pyr-blink" cx="34" cy="-4" fill="#22d3ee" opacity="0.8" r="9" />
        </>
      );
    case "obelisk":
      return (
        <>
          <GroundShadow rx={42} />
          <g transform="translate(0 58)">
            <IsoBox color={shadeColor(color, -8)} d={42} h={14} w={56} />
          </g>
          {/* テーパー付き角柱: 左右2面 */}
          <polygon
            fill={shadeColor(color, 8)}
            points="-22,46 0,56 0,-58 -12,-62"
            stroke="none"
          />
          <polygon
            fill={shadeColor(color, -24)}
            points="0,56 24,46 13,-62 0,-58"
          />
          <polygon
            fill={shadeColor(color, 24)}
            points="-12,-62 0,-58 13,-62 0,-66"
          />
          <polygon fill="#fde68a" points="0,-66 14,-62 0,-88 -13,-62" />
          <path
            d="M-10 -34 H4 M-9 -10 H5 M-8 14 H6"
            opacity="0.7"
            stroke="#fde68a"
            strokeWidth="4"
          />
        </>
      );
    case "plant":
      return (
        <>
          <GroundShadow rx={56} />
          <g transform="translate(0 58)">
            <IsoBox color="#8b5e34" d={36} h={20} w={96} />
          </g>
          <ellipse cx="-30" cy="6" fill={shadeColor("#16a34a", -16)} rx="26" ry="24" />
          <ellipse cx="28" cy="8" fill={shadeColor("#16a34a", -8)} rx="24" ry="22" />
          <ellipse cx="0" cy="-12" fill="#16a34a" rx="32" ry="30" />
          <ellipse cx="-12" cy="-24" fill={shadeColor("#16a34a", 22)} rx="18" ry="14" />
          {[
            [-38, -2, "#fb7185"],
            [-8, 6, "#facc15"],
            [20, -8, "#a78bfa"],
            [38, 2, "#f472b6"]
          ].map(([cx, cy, fill]) => (
            <circle
              cx={Number(cx)}
              cy={Number(cy)}
              fill={String(fill)}
              key={`${cx}-${cy}`}
              r="7"
            />
          ))}
        </>
      );
    case "pyramidBlock":
      return (
        <>
          <GroundShadow cy={62} rx={62} />
          <g transform="translate(0 58)">
            <IsoPyramid base={110} color={color} h={132} />
          </g>
          {/* 石積みライン（左右面で濃さを変える） */}
          <path
            d="M-40 30 L0 38 M-28 2 L0 8 M-16 -26 L0 -22"
            opacity="0.4"
            stroke="#ffffff"
            strokeWidth="4"
          />
          <path
            d="M0 38 L42 30 M0 8 L30 2 M0 -22 L17 -26"
            opacity="0.3"
            stroke="#0f172a"
            strokeWidth="4"
          />
        </>
      );
    case "scaffold":
      return (
        <>
          <GroundShadow rx={62} />
          {/* 奥の柱 */}
          <g opacity="0.75" transform="translate(-44 44)">
            <IsoBox color="#a16207" d={9} h={110} w={9} />
          </g>
          <g opacity="0.75" transform="translate(52 44)">
            <IsoBox color="#a16207" d={9} h={110} w={9} />
          </g>
          {/* 手前の柱 */}
          <g transform="translate(-60 60)">
            <IsoBox color="#92400e" d={10} h={116} w={10} />
          </g>
          <g transform="translate(36 60)">
            <IsoBox color="#92400e" d={10} h={116} w={10} />
          </g>
          {/* 足場板 */}
          <g transform="translate(-12 -2)">
            <IsoBox color="#d6a35c" d={26} h={8} w={108} />
          </g>
          <g transform="translate(-12 40)">
            <IsoBox color="#d6a35c" d={26} h={8} w={108} />
          </g>
          <path
            d="M-60 -10 L36 34 M36 -10 L-60 34"
            opacity="0.85"
            stroke="#92400e"
            strokeLinecap="round"
            strokeWidth="6"
          />
          <circle cx="-60" cy="-58" fill="#facc15" r="7" />
          <circle cx="36" cy="-58" fill="#facc15" r="7" />
        </>
      );
    case "sign":
      return (
        <>
          <GroundShadow rx={48} />
          <g transform="translate(4 58)">
            <IsoBox color="#475569" d={10} h={70} w={12} />
          </g>
          {/* 看板パネル（厚みつき） */}
          <polygon
            fill={shadeColor(color, -26)}
            points="58,-46 64,-42 64,18 58,22"
          />
          <polygon
            fill={shadeColor(color, 6)}
            points="-58,-50 58,-46 58,22 -58,26"
          />
          <path
            d="M-34 -22 L34 -19 M-26 0 L26 2"
            stroke="#ffffff"
            strokeLinecap="round"
            strokeWidth="7"
          />
          <path
            d="M-58 -50 L-44 -50 L-58 -36 Z M-20 -49 L0 -48 L-34 -32 L-50 -33 Z M18 -47 L38 -46 L4 -30 L-12 -31 Z M52 -46 L58 -45 L58 -32 L36 -30 Z"
            fill="#0f172a"
            opacity="0.6"
          />
        </>
      );
    case "sphinx":
      return (
        <>
          <GroundShadow rx={66} />
          {/* 台座 */}
          <g transform="translate(0 60)">
            <IsoBox color={shadeColor(color, -18)} d={44} h={12} w={124} />
          </g>
          {/* 胴体 */}
          <g transform="translate(8 48)">
            <IsoBox color={color} d={40} h={36} w={104} />
          </g>
          {/* 前脚 */}
          <g transform="translate(-34 56)">
            <IsoBox color={shadeColor(color, 6)} d={14} h={24} w={48} />
          </g>
          {/* 頭部 */}
          <circle
            cx="-26"
            cy="-22"
            fill={shadeColor(color, 10)}
            r="26"
          />
          <path
            d="M-26 -48 L-54 -34 L-50 -6 L-26 4 Z"
            fill={shadeColor(color, -12)}
          />
          <path
            d="M-26 -48 L2 -34 L-2 -6 L-26 4 Z"
            fill={shadeColor(color, -26)}
          />
          <circle cx="-26" cy="-22" fill={shadeColor(color, 14)} r="17" />
          <path d="M-34 -24 H-18 M-31 -16 H-21" stroke="#3f3424" strokeLinecap="round" strokeWidth="3.5" />
        </>
      );
    case "stairs":
      return (
        <>
          <GroundShadow rx={60} />
          <g transform="translate(40 58)">
            <IsoBox color={color} d={56} h={22} w={36} />
          </g>
          <g transform="translate(12 52)">
            <IsoBox color={shadeColor(color, 4)} d={56} h={42} w={32} />
          </g>
          <g transform="translate(-16 46)">
            <IsoBox color={shadeColor(color, 8)} d={56} h={62} w={32} />
          </g>
          <g transform="translate(-46 40)">
            <IsoBox color={shadeColor(color, 12)} d={56} h={82} w={30} />
          </g>
        </>
      );
    case "statue":
      return (
        <>
          <GroundShadow rx={46} />
          <g transform="translate(0 58)">
            <IsoBox color="#475569" d={36} h={16} w={72} />
          </g>
          {/* 胴体（テーパー付き） */}
          <polygon
            fill={shadeColor(color, 4)}
            points="-24,-12 0,-6 0,44 -32,38"
          />
          <polygon
            fill={shadeColor(color, -22)}
            points="0,-6 24,-12 32,38 0,44"
          />
          <polygon
            fill={shadeColor(color, 20)}
            points="-24,-12 0,-18 24,-12 0,-6"
          />
          {/* 頭部 */}
          <circle cx="0" cy="-36" fill={shadeColor(color, 8)} r="21" />
          <path
            d="M-21 -38 A21 21 0 0 1 0 -57 L0 -36 Z"
            fill={shadeColor(color, 26)}
            opacity="0.7"
          />
          <path d="M-12 -38 H12 M-7 -30 H7" stroke="#f8fafc" strokeLinecap="round" strokeWidth="3.5" />
          {/* 耳（猫にも兵士の兜にも見えるシルエット） */}
          <path d="M-16 -52 L-12 -64 L-5 -54 Z M16 -52 L12 -64 L5 -54 Z" fill={shadeColor(color, -10)} />
        </>
      );
    case "triangle":
      return (
        <>
          <GroundShadow cy={62} rx={56} />
          <g transform="translate(0 58)">
            <IsoPyramid base={96} color={color} h={118} />
          </g>
        </>
      );
    case "platform":
      return (
        <g transform="translate(0 34)">
          <IsoCylinder color={color} h={16} r={70} />
        </g>
      );
    case "rect":
    default:
      return (
        <>
          <GroundShadow rx={54} />
          <g transform="translate(0 58)">
            <IsoBox color={color} d={42} h={104} w={84} />
          </g>
          {/* 正面パネル */}
          <polygon
            fill="#0f172a"
            opacity="0.25"
            points="-60,-40 20,-32 20,40 -60,48"
          />
          <polygon
            className="pyr-blink"
            fill="#22d3ee"
            opacity="0.85"
            points="2,-26 18,-24 18,-8 2,-10"
          />
          <path
            d="M-50 -16 L-8 -12 M-50 4 L-8 8 M-50 24 L-26 26"
            opacity="0.65"
            stroke="#f8fafc"
            strokeLinecap="round"
            strokeWidth="5"
          />
        </>
      );
  }
}
