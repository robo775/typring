import type { PyramidPartVisual } from "@/types/pyramid";

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
          <ellipse cx="0" cy="54" fill="#0f172a" opacity="0.18" rx="48" ry="10" />
          <rect fill="#475569" height="64" rx="8" width="26" x="-13" y="-28" />
          <rect fill="#94a3b8" height="18" rx="6" width="70" x="-35" y="-56" />
          <circle cx="-18" cy="-47" fill="#22d3ee" r="8" />
          <circle cx="18" cy="-47" fill="#38bdf8" r="8" />
          <path d="M-58 -75 Q0 -112 58 -75" fill="none" stroke={color} strokeWidth="8" />
          <path d="M-45 -88 L-70 -112 M45 -88 L70 -112" stroke={color} strokeLinecap="round" strokeWidth="7" />
        </>
      );
    case "arch":
      return (
        <>
          <ellipse cx="0" cy="62" fill="#0f172a" opacity="0.16" rx="72" ry="12" />
          <path
            d="M-65 58 V-6 C-65 -94 65 -94 65 -6 V58 H24 V-8 C24 -42 -24 -42 -24 -8 V58 Z"
            fill="#d8c7a6"
            stroke="#7c5f3d"
            strokeWidth="6"
          />
          <path d="M-50 -22 C-32 -72 32 -72 50 -22" fill="none" stroke={color} strokeWidth="10" />
          <circle cx="-38" cy="-36" fill="#fb7185" r="12" />
          <circle cx="38" cy="-36" fill="#fb7185" r="12" />
        </>
      );
    case "banner":
      return (
        <>
          <path d="M-70 -60 V62 M70 -60 V62" stroke="#8b5e34" strokeLinecap="round" strokeWidth="9" />
          <path d="M-78 -52 H78 V24 H-78 Z" fill={color} stroke="#7f1d1d" strokeWidth="5" />
          <path d="M-78 24 L-46 54 L-14 24 L18 54 L50 24 L78 48 V24 Z" fill="#fbbf24" />
          <path d="M0 -36 L18 -8 L0 20 L-18 -8 Z" fill="#fde68a" />
        </>
      );
    case "bench":
      return (
        <>
          <ellipse cx="0" cy="58" fill="#0f172a" opacity="0.14" rx="78" ry="12" />
          <rect fill="#b45309" height="42" rx="12" width="130" x="-65" y="-10" />
          <rect fill="#f97316" height="35" rx="10" width="58" x="-52" y="-42" />
          <rect fill="#fb923c" height="35" rx="10" width="58" x="0" y="-42" />
          <circle cx="-34" cy="-18" fill="#fde68a" r="9" />
          <circle cx="34" cy="-18" fill="#fde68a" r="9" />
        </>
      );
    case "circle":
      return (
        <>
          <path d="M0 50 V78" stroke="#7c2d12" strokeWidth="7" />
          {[-44, -18, 12, 42, 0].map((cx, index) => (
            <circle
              cx={cx}
              cy={index % 2 === 0 ? -8 : -34}
              fill={["#ef4444", "#22c55e", "#3b82f6", "#eab308", color][index]}
              key={cx}
              r="24"
              stroke="#fff"
              strokeWidth="4"
            />
          ))}
          <rect fill="#92400e" height="20" rx="8" width="32" x="-16" y="72" />
        </>
      );
    case "cloud":
      return (
        <path
          d="M-82 24 C-98 -24 -42 -52 -18 -22 C4 -74 74 -54 66 0 C106 -4 116 58 58 62 H-58 C-106 62 -118 28 -82 24 Z"
          fill="#e2e8f0"
          opacity="0.82"
          stroke="#cbd5e1"
          strokeWidth="4"
        />
      );
    case "door":
      return (
        <>
          <ellipse cx="0" cy="60" fill="#0f172a" opacity="0.18" rx="60" ry="12" />
          <path d="M-46 60 V-4 C-46 -64 46 -64 46 -4 V60 Z" fill={color} stroke="#78350f" strokeWidth="7" />
          <path d="M-28 55 V-2 C-28 -34 28 -34 28 -2 V55 Z" fill="#1f2937" opacity="0.72" />
          <circle cx="18" cy="20" fill="#facc15" r="6" />
        </>
      );
    case "eye":
      return (
        <>
          <path d="M-76 0 C-38 -50 38 -50 76 0 C38 50 -38 50 -76 0 Z" fill="#fef3c7" stroke="#92400e" strokeWidth="8" />
          <circle cx="0" cy="0" fill="#67e8f9" r="30" />
          <circle cx="0" cy="0" fill="#0f172a" r="15" />
          <path d="M0 39 L14 68 L-14 68 Z" fill="#22d3ee" stroke="#92400e" strokeWidth="5" />
        </>
      );
    case "flame":
      return (
        <>
          <ellipse cx="0" cy="58" fill="#0f172a" opacity="0.16" rx="50" ry="10" />
          <rect fill="#7c5f3d" height="20" rx="8" width="80" x="-40" y="32" />
          <path d="M-28 30 C-50 -24 -8 -26 -10 -76 C25 -42 48 -20 28 30 Z" fill="#f97316" />
          <path d="M-10 28 C-22 -8 12 -22 8 -56 C36 -20 30 6 12 28 Z" fill="#fde047" />
        </>
      );
    case "fountain":
      return (
        <>
          <ellipse cx="0" cy="50" fill="#60a5fa" opacity="0.45" rx="74" ry="24" stroke="#64748b" strokeWidth="6" />
          <path d="M-48 46 H48 L34 72 H-34 Z" fill="#d6d3d1" stroke="#64748b" strokeWidth="5" />
          <path d="M0 30 C-26 0 -18 -34 0 -60 C18 -34 26 0 0 30 Z" fill="#7dd3fc" opacity="0.82" />
          <path d="M-42 12 C-20 0 -10 -20 0 -48 C10 -20 20 0 42 12" fill="none" stroke="#38bdf8" strokeLinecap="round" strokeWidth="6" />
        </>
      );
    case "gate":
      return (
        <>
          <ellipse cx="0" cy="62" fill="#0f172a" opacity="0.16" rx="78" ry="12" />
          <rect fill="#8b7355" height="108" rx="10" width="34" x="-70" y="-50" />
          <rect fill="#8b7355" height="108" rx="10" width="34" x="36" y="-50" />
          <rect fill="#d8c7a6" height="30" rx="8" width="146" x="-73" y="-70" />
          <path d="M-35 58 V-22 C-35 -55 35 -55 35 -22 V58 Z" fill="#7c2d12" stroke="#422006" strokeWidth="6" />
          <circle cx="-13" cy="8" fill="#facc15" r="6" />
          <circle cx="13" cy="8" fill="#facc15" r="6" />
          <path d="M0 -84 L18 -54 L0 -28 L-18 -54 Z" fill="#38bdf8" stroke="#92400e" strokeWidth="5" />
        </>
      );
    case "glassPyramid":
      return (
        <>
          <polygon fill="#bae6fd" opacity="0.72" points="0,-78 70,58 -70,58" stroke="#0e7490" strokeWidth="6" />
          <path d="M0 -78 V58 M-44 -20 H44 M-62 30 H62 M0 -78 L-22 58 M0 -78 L22 58" stroke="#e0f2fe" strokeWidth="5" />
        </>
      );
    case "lantern":
      return (
        <>
          <path d="M0 -72 V66" stroke="#334155" strokeWidth="9" />
          <rect fill="#f59e0b" height="56" rx="10" width="36" x="-18" y="-32" stroke="#334155" strokeWidth="5" />
          <path d="M-28 -52 Q0 -78 28 -52" fill="none" stroke="#334155" strokeWidth="6" />
        </>
      );
    case "monitor":
      return (
        <>
          <ellipse cx="0" cy="60" fill="#0f172a" opacity="0.14" rx="70" ry="10" />
          <rect fill="#0f172a" height="78" rx="10" width="130" x="-65" y="-50" />
          <rect fill="#083344" height="58" rx="6" width="108" x="-54" y="-40" />
          <path d="M-42 -12 L-18 -24 L2 -8 L28 -30 L45 -22" fill="none" stroke="#22d3ee" strokeWidth="6" />
          <circle cx="38" cy="4" fill="#22d3ee" r="13" opacity="0.8" />
          <path d="M0 28 V56 M-32 56 H32" stroke="#475569" strokeWidth="9" />
        </>
      );
    case "obelisk":
      return (
        <>
          <polygon fill={color} points="0,-82 34,-42 28,58 -28,58 -34,-42" stroke="#6b4f2a" strokeWidth="5" />
          <path d="M0 -62 V42 M-14 -24 H14 M-12 4 H12 M-16 30 H16" stroke="#fde68a" strokeWidth="5" />
          <rect fill="#6b4f2a" height="16" rx="4" width="78" x="-39" y="58" />
        </>
      );
    case "plant":
      return (
        <>
          <ellipse cx="0" cy="58" fill="#0f172a" opacity="0.14" rx="70" ry="11" />
          <rect fill="#8b5e34" height="26" rx="6" width="104" x="-52" y="28" />
          <circle cx="-36" cy="10" fill="#22c55e" r="28" />
          <circle cx="4" cy="-4" fill="#16a34a" r="34" />
          <circle cx="36" cy="12" fill="#4ade80" r="25" />
          {[-42, -10, 18, 42].map((cx, index) => (
            <circle cx={cx} cy={index % 2 ? -20 : 0} fill={["#fb7185", "#facc15", "#a78bfa", "#f472b6"][index]} key={cx} r="8" />
          ))}
        </>
      );
    case "pyramidBlock":
      return (
        <>
          <ellipse cx="0" cy="68" fill="#0f172a" opacity="0.14" rx="76" ry="12" />
          <polygon fill={color} points="0,-78 76,58 -76,58" stroke="#6b5b45" strokeWidth="6" />
          <path d="M-50 12 H50 M-34 -18 H34 M-18 -46 H18 M0 -78 V58 M-38 58 L-10 -78 M38 58 L10 -78" stroke="#f8fafc" strokeOpacity="0.55" strokeWidth="5" />
        </>
      );
    case "scaffold":
      return (
        <>
          <path d="M-68 62 V-62 M0 62 V-62 M68 62 V-62 M-82 38 H82 M-82 0 H82 M-82 -38 H82 M-68 62 L68 -62 M68 62 L-68 -62" fill="none" stroke="#92400e" strokeLinecap="round" strokeWidth="7" />
          <circle cx="-68" cy="-62" fill="#facc15" r="8" />
          <circle cx="68" cy="-62" fill="#facc15" r="8" />
        </>
      );
    case "sign":
      return (
        <>
          <rect fill={color} height="70" rx="10" width="128" x="-64" y="-48" stroke="#78350f" strokeWidth="6" />
          <rect fill="#475569" height="55" width="12" x="-6" y="22" />
          <path d="M-36 -12 H36 M-26 12 H26" stroke="#fff" strokeLinecap="round" strokeWidth="8" />
        </>
      );
    case "sphinx":
      return (
        <>
          <ellipse cx="0" cy="60" fill="#0f172a" opacity="0.14" rx="82" ry="12" />
          <rect fill={color} height="44" rx="20" width="120" x="-60" y="0" />
          <circle cx="-18" cy="-26" fill={color} r="30" stroke="#6b5b45" strokeWidth="5" />
          <path d="M-44 -28 H8 M-34 -44 L-52 -68 M-4 -44 L14 -68" stroke="#6b5b45" strokeLinecap="round" strokeWidth="6" />
          <rect fill="#6b5b45" height="12" rx="6" width="96" x="-44" y="40" />
        </>
      );
    case "stairs":
      return (
        <path
          d="M-70 58 H70 V34 H42 V12 H16 V-10 H-12 V-32 H-70 Z"
          fill={color}
          stroke="#6b5b45"
          strokeWidth="5"
        />
      );
    case "statue":
      return (
        <>
          <ellipse cx="0" cy="62" fill="#0f172a" opacity="0.14" rx="56" ry="10" />
          <circle cx="0" cy="-44" fill={color} r="24" stroke="#334155" strokeWidth="5" />
          <path d="M-26 -18 H26 L38 42 H-38 Z" fill={color} stroke="#334155" strokeWidth="5" />
          <path d="M-18 -44 H18 M-10 -34 H10" stroke="#f8fafc" strokeWidth="4" />
          <rect fill="#475569" height="18" rx="5" width="82" x="-41" y="42" />
        </>
      );
    case "triangle":
      return <polygon fill={color} points="0,-70 68,58 -68,58" stroke="#334155" strokeWidth="5" />;
    case "platform":
      return <ellipse cx="0" cy="18" fill={color} rx="76" ry="32" />;
    case "rect":
    default:
      return (
        <>
          <ellipse cx="0" cy="58" fill="#0f172a" opacity="0.12" rx="70" ry="10" />
          <rect fill={color} height="96" rx="14" width="118" x="-59" y="-48" stroke="#334155" strokeWidth="5" />
          <rect fill="#22d3ee" height="16" rx="4" width="20" x="24" y="-26" opacity="0.85" />
          <path d="M-38 -18 H6 M-38 8 H38 M-38 34 H20" stroke="#f8fafc" strokeLinecap="round" strokeOpacity="0.6" strokeWidth="5" />
        </>
      );
  }
}
