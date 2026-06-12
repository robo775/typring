import { shadeColor } from "@/lib/pyramid/color";

// 2:1ディメトリック投影。床面座標(a, b)を画面座標(x, y)へ変換する。
// 光源は左上固定: 上面が最も明るく、左面が中間、右面が最も暗い。
function project(a: number, b: number, z: number) {
  return { x: a - b, y: (a + b) / 2 - z };
}

function toPoints(points: { x: number; y: number }[]) {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

export const ISO_TOP_SHADE = 18;
export const ISO_LEFT_SHADE = -4;
export const ISO_RIGHT_SHADE = -24;

// 床中心(0,0)に置かれた直方体。上方向(-y)へ伸びる。
export function IsoBox({
  color,
  d,
  h,
  stroke,
  w
}: {
  color: string;
  d: number;
  h: number;
  stroke?: string;
  w: number;
}) {
  const hw = w / 2;
  const hd = d / 2;
  const front = project(hw, hd, 0);
  const right = project(hw, -hd, 0);
  const left = project(-hw, hd, 0);
  const back = project(-hw, -hd, 0);
  const frontTop = project(hw, hd, h);
  const rightTop = project(hw, -hd, h);
  const leftTop = project(-hw, hd, h);
  const backTop = project(-hw, -hd, h);
  const strokeProps = stroke
    ? { stroke, strokeLinejoin: "round" as const, strokeWidth: 2.5 }
    : {};

  return (
    <>
      <polygon
        fill={shadeColor(color, ISO_LEFT_SHADE)}
        points={toPoints([left, front, frontTop, leftTop])}
        {...strokeProps}
      />
      <polygon
        fill={shadeColor(color, ISO_RIGHT_SHADE)}
        points={toPoints([front, right, rightTop, frontTop])}
        {...strokeProps}
      />
      <polygon
        fill={shadeColor(color, ISO_TOP_SHADE)}
        points={toPoints([frontTop, rightTop, backTop, leftTop])}
        {...strokeProps}
      />
    </>
  );
}

// 床中心(0,0)に置かれた四角錐。明暗2面で立体感を出す。
export function IsoPyramid({
  base,
  color,
  h,
  stroke
}: {
  base: number;
  color: string;
  h: number;
  stroke?: string;
}) {
  const half = base / 2;
  const front = project(half, half, 0);
  const right = project(half, -half, 0);
  const left = project(-half, half, 0);
  const apex = { x: 0, y: -h };
  const strokeProps = stroke
    ? { stroke, strokeLinejoin: "round" as const, strokeWidth: 2.5 }
    : {};

  return (
    <>
      <polygon
        fill={shadeColor(color, 10)}
        points={toPoints([left, front, apex])}
        {...strokeProps}
      />
      <polygon
        fill={shadeColor(color, -26)}
        points={toPoints([front, right, apex])}
        {...strokeProps}
      />
    </>
  );
}

// 床中心(0,0)に置かれた円柱。
export function IsoCylinder({
  color,
  h,
  r
}: {
  color: string;
  h: number;
  r: number;
}) {
  const ry = r * 0.5;

  return (
    <>
      <path
        d={`M ${-r} 0 A ${r} ${ry} 0 0 0 ${r} 0 L ${r} ${-h} A ${r} ${ry} 0 0 1 ${-r} ${-h} Z`}
        fill={shadeColor(color, -14)}
      />
      <path
        d={`M ${-r} 0 A ${r} ${ry} 0 0 0 0 ${ry} L 0 ${ry - h} A ${r} ${ry} 0 0 1 ${-r} ${-h} Z`}
        fill={shadeColor(color, 2)}
        opacity="0.6"
      />
      <ellipse
        cx="0"
        cy={-h}
        fill={shadeColor(color, ISO_TOP_SHADE)}
        rx={r}
        ry={ry}
      />
    </>
  );
}

// パーツ足元の共通楕円影。
export function GroundShadow({
  cy = 58,
  rx = 56
}: {
  cy?: number;
  rx?: number;
}) {
  return (
    <ellipse
      cx="6"
      cy={cy}
      fill="#0f172a"
      opacity="0.16"
      rx={rx}
      ry={rx * 0.26}
    />
  );
}
