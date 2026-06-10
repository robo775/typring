"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowDownToLine,
  ArrowUpToLine,
  Download,
  FlipHorizontal,
  HelpCircle,
  RotateCcw,
  RotateCw,
  Share2,
  Trash2,
  Undo2,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { pyramidBackgrounds } from "@/data/pyramidBackgrounds";
import { pyramidCategoryLabels, pyramidParts } from "@/data/pyramidParts";
import { calculatePyramidScore } from "@/lib/pyramid/calculate-pyramid-score";
import { downloadSvgAsPng } from "@/lib/pyramid/export-pyramid-image";
import {
  clearPyramidSave,
  loadPyramidSave,
  savePyramidState
} from "@/lib/pyramid/pyramid-storage";
import type {
  PlacedPyramidPart,
  PyramidBackground,
  PyramidPart,
  PyramidPartCategory,
  PyramidPartVisual
} from "@/types/pyramid";

const categories = Object.keys(pyramidCategoryLabels) as PyramidPartCategory[];
const viewBoxSize = 1000;

type DragState = {
  instanceId: string;
  offsetX: number;
  offsetY: number;
};

export function PyramidGame() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [backgroundId, setBackgroundId] = useState("desert");
  const [placedParts, setPlacedParts] = useState<PlacedPyramidPart[]>([]);
  const [history, setHistory] = useState<PlacedPyramidPart[][]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] =
    useState<PyramidPartCategory>("material");
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [isHowToOpen, setIsHowToOpen] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [publishTitle, setPublishTitle] = useState("わたしのピラミッド");
  const [publishMessage, setPublishMessage] = useState<string | null>(null);
  const [publishedPath, setPublishedPath] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const background =
    pyramidBackgrounds.find((item) => item.id === backgroundId) ??
    pyramidBackgrounds[0];
  const score = useMemo(
    () => calculatePyramidScore(placedParts),
    [placedParts]
  );
  const selectedPart = placedParts.find((part) => part.instanceId === selectedId);
  const visibleParts = pyramidParts.filter(
    (part) => part.category === activeCategory
  );

  useEffect(() => {
    const saveData = loadPyramidSave();

    if (!saveData) {
      return;
    }

    setBackgroundId(saveData.backgroundId);
    setPlacedParts(saveData.placedParts);
  }, []);

  useEffect(() => {
    savePyramidState(backgroundId, placedParts);
  }, [backgroundId, placedParts]);

  function commit(nextParts: PlacedPyramidPart[]) {
    setHistory((current) => [...current.slice(-20), placedParts]);
    setPlacedParts(nextParts);
  }

  function addPart(part: PyramidPart) {
    const nextPart: PlacedPyramidPart = {
      flipX: false,
      instanceId: `${part.id}-${crypto.randomUUID()}`,
      partId: part.id,
      rotation: 0,
      scale: part.defaultScale,
      x: 500 + Math.round((Math.random() - 0.5) * 80),
      y: 520 + Math.round((Math.random() - 0.5) * 80),
      zIndex: getNextZIndex(placedParts)
    };

    commit([...placedParts, nextPart]);
    setSelectedId(nextPart.instanceId);
    setIsComplete(false);
  }

  function updateSelected(updater: (part: PlacedPyramidPart) => PlacedPyramidPart) {
    if (!selectedId) {
      return;
    }

    commit(
      placedParts.map((part) =>
        part.instanceId === selectedId ? updater(part) : part
      )
    );
    setIsComplete(false);
  }

  function removeSelected() {
    if (!selectedId) {
      return;
    }

    commit(placedParts.filter((part) => part.instanceId !== selectedId));
    setSelectedId(null);
    setIsComplete(false);
  }

  function undo() {
    const previous = history[history.length - 1];

    if (!previous) {
      return;
    }

    setPlacedParts(previous);
    setHistory((current) => current.slice(0, -1));
    setSelectedId(null);
    setIsComplete(false);
  }

  function reset() {
    if (!window.confirm("作成中のピラミッドをリセットしますか？")) {
      return;
    }

    clearPyramidSave();
    setHistory((current) => [...current.slice(-20), placedParts]);
    setPlacedParts([]);
    setSelectedId(null);
    setIsComplete(false);
  }

  function handlePointerDown(
    event: React.PointerEvent<SVGGElement>,
    placedPart: PlacedPyramidPart
  ) {
    const point = getSvgPoint(event);

    if (!point) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedId(placedPart.instanceId);
    setDragState({
      instanceId: placedPart.instanceId,
      offsetX: point.x - placedPart.x,
      offsetY: point.y - placedPart.y
    });
  }

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    if (!dragState) {
      return;
    }

    const point = getSvgPoint(event);

    if (!point) {
      return;
    }

    setPlacedParts((current) =>
      current.map((part) =>
        part.instanceId === dragState.instanceId
          ? {
              ...part,
              x: clamp(point.x - dragState.offsetX, 40, 960),
              y: clamp(point.y - dragState.offsetY, 40, 940)
            }
          : part
      )
    );
  }

  function handlePointerUp() {
    if (dragState) {
      setHistory((current) => [...current.slice(-20), placedParts]);
    }

    setDragState(null);
  }

  function getSvgPoint(event: React.PointerEvent<SVGElement>) {
    const svg = svgRef.current;

    if (!svg) {
      return null;
    }

    const rect = svg.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * viewBoxSize,
      y: ((event.clientY - rect.top) / rect.height) * viewBoxSize
    };
  }

  async function downloadImage() {
    if (!svgRef.current) {
      return;
    }

    await downloadSvgAsPng(svgRef.current, "typring-pyramid.png");
  }

  function shareToX() {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    const text = [
      "オリジナルのピラミッドを作りました。",
      `建築スコア: ${score.totalScore}`,
      "",
      "#Typring",
      "#PYRAMIDMAKER"
    ].join("\n");
    const url = new URL("https://twitter.com/intent/tweet");
    url.searchParams.set("text", text);
    url.searchParams.set("url", `${appUrl.replace(/\/$/, "")}/games/pyramid`);
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  }

  async function publishCreation() {
    setPublishMessage(null);
    setPublishedPath(null);

    if (placedParts.length === 0) {
      setPublishMessage("パーツを1つ以上置いてから公開してください。");
      return;
    }

    setIsPublishing(true);

    try {
      const response = await fetch("/api/games/pyramid/creations", {
        body: JSON.stringify({
          backgroundId,
          isPublic: true,
          placedParts,
          title: publishTitle
        }),
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      });
      const data = (await response.json().catch(() => null)) as {
        error?: string;
        id?: string;
      } | null;

      if (response.status === 401) {
        setPublishMessage("公開するにはログインしてください。");
        return;
      }

      if (!response.ok || !data?.id) {
        setPublishMessage(data?.error ?? "公開に失敗しました。");
        return;
      }

      setPublishedPath(`/games/pyramid/${data.id}`);
      setPublishMessage("公開しました。");
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-3 py-4 sm:px-4 sm:py-8">
      <div className="flex items-center justify-between gap-3">
        <Link
          className="inline-flex items-center gap-2 rounded-full border border-white bg-white/80 px-3 py-2 text-sm font-bold text-ink shadow-sm"
          href="/games"
        >
          <ArrowLeft className="h-4 w-4" />
          戻る
        </Link>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white bg-white/82 text-ink shadow-sm"
            onClick={() => setIsHowToOpen(true)}
            type="button"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
          <button
            className="inline-flex h-10 items-center justify-center rounded-full bg-ink px-4 text-sm font-bold text-white shadow-sm"
            onClick={() => setIsComplete(true)}
            type="button"
          >
            完成
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px] lg:items-start">
        <section className="space-y-3">
          <div className="flex items-center justify-between rounded-2xl border border-white bg-white/82 px-4 py-3 shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-ringViolet">
                PYRAMID MAKER
              </p>
              <h1 className="text-lg font-black text-ink sm:text-2xl">
                ピラミッドメーカー
              </h1>
            </div>
            <ScorePill
              categoryCount={score.categoryCount}
              partCount={score.partCount}
              totalScore={score.totalScore}
            />
          </div>

          <div className="overflow-hidden rounded-3xl border border-white bg-white shadow-soft">
            <svg
              className="block aspect-square w-full touch-none bg-slate-100"
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              ref={svgRef}
              role="img"
              viewBox="0 0 1000 1000"
              xmlns="http://www.w3.org/2000/svg"
            >
              <PyramidScene
                background={background}
                handlePointerDown={handlePointerDown}
                placedParts={placedParts}
                selectedId={selectedId}
              />
            </svg>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <button
              className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white bg-white/82 px-2 py-3 text-xs font-bold text-ink shadow-sm disabled:opacity-40"
              disabled={history.length === 0}
              onClick={undo}
              type="button"
            >
              <Undo2 className="h-4 w-4" />
              Undo
            </button>
            <button
              className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white bg-white/82 px-2 py-3 text-xs font-bold text-ink shadow-sm"
              onClick={downloadImage}
              type="button"
            >
              <Download className="h-4 w-4" />
              保存
            </button>
            <button
              className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white bg-white/82 px-2 py-3 text-xs font-bold text-ink shadow-sm"
              onClick={shareToX}
              type="button"
            >
              <Share2 className="h-4 w-4" />
              X共有
            </button>
            <button
              className="inline-flex items-center justify-center rounded-2xl border border-red-100 bg-red-50 px-2 py-3 text-xs font-bold text-red-700 shadow-sm"
              onClick={reset}
              type="button"
            >
              全消し
            </button>
          </div>
        </section>

        <aside className="space-y-3">
          <BackgroundSelector
            backgroundId={backgroundId}
            setBackgroundId={(id) => {
              setBackgroundId(id);
              setIsComplete(false);
            }}
          />
          <SelectedPartControls
            hasSelection={Boolean(selectedPart)}
            onBack={() =>
              updateSelected((part) => ({
                ...part,
                zIndex: Math.max(0, part.zIndex - 1)
              }))
            }
            onDelete={removeSelected}
            onFlip={() =>
              updateSelected((part) => ({
                ...part,
                flipX: !part.flipX
              }))
            }
            onForward={() =>
              updateSelected((part) => ({
                ...part,
                zIndex: getNextZIndex(placedParts)
              }))
            }
            onRotateLeft={() =>
              updateSelected((part) => ({
                ...part,
                rotation: part.rotation - 15
              }))
            }
            onRotateRight={() =>
              updateSelected((part) => ({
                ...part,
                rotation: part.rotation + 15
              }))
            }
            onScaleDown={() =>
              updateSelected((part) => ({
                ...part,
                scale: Math.max(0.45, Number((part.scale - 0.1).toFixed(2)))
              }))
            }
            onScaleUp={() =>
              updateSelected((part) => ({
                ...part,
                scale: Math.min(2.4, Number((part.scale + 0.1).toFixed(2)))
              }))
            }
          />
          <PartsPalette
            activeCategory={activeCategory}
            addPart={addPart}
            parts={visibleParts}
            setActiveCategory={setActiveCategory}
          />
        </aside>
      </div>

      {isHowToOpen ? <HowToPlayModal onClose={() => setIsHowToOpen(false)} /> : null}
      {isComplete ? (
        <>
          <ResultPanel
            downloadImage={downloadImage}
            reset={() => setIsComplete(false)}
            score={score}
            shareToX={shareToX}
          />
          <PublishPanel
            isPublishing={isPublishing}
            publishCreation={publishCreation}
            publishedPath={publishedPath}
            publishMessage={publishMessage}
            publishTitle={publishTitle}
            setPublishTitle={setPublishTitle}
          />
        </>
      ) : null}
    </div>
  );
}

function PyramidScene({
  background,
  handlePointerDown,
  placedParts,
  selectedId
}: {
  background: PyramidBackground;
  handlePointerDown: (
    event: React.PointerEvent<SVGGElement>,
    part: PlacedPyramidPart
  ) => void;
  placedParts: PlacedPyramidPart[];
  selectedId: string | null;
}) {
  return (
    <>
      <defs>
        <linearGradient id="pyramidSky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={background.sky} />
          <stop offset="75%" stopColor={background.horizon} />
        </linearGradient>
        <linearGradient id="basePyramid" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="52%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
      </defs>
      <rect fill="url(#pyramidSky)" height="1000" width="1000" />
      <circle cx="805" cy="145" fill={background.accent} opacity="0.8" r="58" />
      <path
        d="M0 700 C190 655 300 720 475 688 C680 650 810 700 1000 660 L1000 1000 L0 1000 Z"
        fill={background.ground}
      />
      <ellipse cx="500" cy="780" fill="#0f172a" opacity="0.18" rx="330" ry="52" />
      <polygon
        fill="url(#basePyramid)"
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
              cursor="grab"
              key={placedPart.instanceId}
              onPointerDown={(event) => handlePointerDown(event, placedPart)}
              transform={`translate(${placedPart.x} ${placedPart.y}) rotate(${placedPart.rotation}) scale(${
                placedPart.flipX ? -placedPart.scale : placedPart.scale
              } ${placedPart.scale})`}
            >
              <PartShape color={part.color} visual={part.visual} />
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
      <text
        fill="#0f172a"
        fontFamily="Arial, sans-serif"
        fontSize="34"
        fontWeight="800"
        x="52"
        y="82"
      >
        PYRAMID MAKER
      </text>
      <text
        fill="#475569"
        fontFamily="Arial, sans-serif"
        fontSize="22"
        fontWeight="700"
        x="52"
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
    case "platform":
      return <ellipse cx="0" cy="18" fill={color} rx="76" ry="32" />;
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
    case "rect":
    default:
      return <rect fill={color} height="92" rx="14" width="120" x="-60" y="-46" />;
  }
}

function ScorePill({
  categoryCount,
  partCount,
  totalScore
}: {
  categoryCount: number;
  partCount: number;
  totalScore: number;
}) {
  return (
    <div className="rounded-2xl bg-ink px-4 py-2 text-right text-white">
      <p className="text-xl font-black leading-none">{totalScore}</p>
      <p className="mt-1 text-[11px] font-bold text-white/70">
        {partCount}パーツ / {categoryCount}カテゴリ
      </p>
    </div>
  );
}

function BackgroundSelector({
  backgroundId,
  setBackgroundId
}: {
  backgroundId: string;
  setBackgroundId: (id: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-white bg-white/86 p-4 shadow-sm">
      <h2 className="text-sm font-black text-ink">背景</h2>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {pyramidBackgrounds.map((background) => (
          <button
            className={`rounded-2xl border px-3 py-3 text-sm font-bold transition ${
              backgroundId === background.id
                ? "border-ringTeal bg-teal-50 text-ink"
                : "border-slate-100 bg-white text-slate-600"
            }`}
            key={background.id}
            onClick={() => setBackgroundId(background.id)}
            type="button"
          >
            <span
              className="mr-2 inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: background.sky }}
            />
            {background.name}
          </button>
        ))}
      </div>
    </section>
  );
}

function SelectedPartControls({
  hasSelection,
  onBack,
  onDelete,
  onFlip,
  onForward,
  onRotateLeft,
  onRotateRight,
  onScaleDown,
  onScaleUp
}: {
  hasSelection: boolean;
  onBack: () => void;
  onDelete: () => void;
  onFlip: () => void;
  onForward: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onScaleDown: () => void;
  onScaleUp: () => void;
}) {
  return (
    <section className="rounded-2xl border border-white bg-white/86 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-black text-ink">選択中のパーツ</h2>
        {!hasSelection ? (
          <span className="text-xs font-bold text-slate-400">未選択</span>
        ) : null}
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        <IconButton disabled={!hasSelection} label="小" onClick={onScaleDown}>
          -
        </IconButton>
        <IconButton disabled={!hasSelection} label="大" onClick={onScaleUp}>
          +
        </IconButton>
        <IconButton disabled={!hasSelection} label="左回転" onClick={onRotateLeft}>
          <RotateCcw className="h-4 w-4" />
        </IconButton>
        <IconButton disabled={!hasSelection} label="右回転" onClick={onRotateRight}>
          <RotateCw className="h-4 w-4" />
        </IconButton>
        <IconButton disabled={!hasSelection} label="反転" onClick={onFlip}>
          <FlipHorizontal className="h-4 w-4" />
        </IconButton>
        <IconButton disabled={!hasSelection} label="前面" onClick={onForward}>
          <ArrowUpToLine className="h-4 w-4" />
        </IconButton>
        <IconButton disabled={!hasSelection} label="背面" onClick={onBack}>
          <ArrowDownToLine className="h-4 w-4" />
        </IconButton>
        <IconButton danger disabled={!hasSelection} label="削除" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </IconButton>
      </div>
    </section>
  );
}

function IconButton({
  children,
  danger = false,
  disabled,
  label,
  onClick
}: {
  children: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className={`flex h-11 items-center justify-center rounded-2xl border text-sm font-black shadow-sm disabled:opacity-35 ${
        danger
          ? "border-red-100 bg-red-50 text-red-700"
          : "border-slate-100 bg-white text-ink"
      }`}
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

function PartsPalette({
  activeCategory,
  addPart,
  parts,
  setActiveCategory
}: {
  activeCategory: PyramidPartCategory;
  addPart: (part: PyramidPart) => void;
  parts: PyramidPart[];
  setActiveCategory: (category: PyramidPartCategory) => void;
}) {
  return (
    <section className="rounded-2xl border border-white bg-white/86 p-4 shadow-sm">
      <h2 className="text-sm font-black text-ink">パーツ</h2>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {categories.map((category) => (
          <button
            className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${
              activeCategory === category
                ? "bg-ink text-white"
                : "bg-slate-100 text-slate-600"
            }`}
            key={category}
            onClick={() => setActiveCategory(category)}
            type="button"
          >
            {pyramidCategoryLabels[category]}
          </button>
        ))}
      </div>
      <div className="mt-3 grid max-h-[340px] gap-2 overflow-y-auto pr-1">
        {parts.map((part) => (
          <button
            className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-left shadow-sm transition hover:border-ringTeal"
            key={part.id}
            onClick={() => addPart(part)}
            type="button"
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `${part.color}30`, color: part.color }}
            >
              <svg height="32" viewBox="-80 -80 160 160" width="32">
                <PartShape color={part.color} visual={part.visual} />
              </svg>
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-black text-ink">
                {part.name}
              </span>
              <span className="block truncate text-xs font-semibold text-slate-500">
                +{part.score} / {part.description}
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function HowToPlayModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 p-4">
      <section className="max-w-md rounded-3xl bg-white p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ringViolet">
              How to Play
            </p>
            <h2 className="mt-1 text-xl font-black text-ink">遊び方</h2>
          </div>
          <button
            className="rounded-full bg-slate-100 p-2 text-ink"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
          <p>下のパーツ一覧から好きなパーツを追加します。</p>
          <p>キャンバス上のパーツはドラッグで移動できます。</p>
          <p>選択したパーツは拡大、回転、反転、削除、前後移動ができます。</p>
          <p>完成したら画像保存やX共有ができます。</p>
        </div>
      </section>
    </div>
  );
}

function ResultPanel({
  downloadImage,
  reset,
  score,
  shareToX
}: {
  downloadImage: () => void;
  reset: () => void;
  score: { categoryCount: number; partCount: number; totalScore: number };
  shareToX: () => void;
}) {
  return (
    <section className="rounded-3xl border border-white bg-white/90 p-5 shadow-soft">
      <p className="text-xs font-bold uppercase tracking-wide text-ringViolet">
        Complete
      </p>
      <h2 className="mt-1 text-2xl font-black text-ink">ピラミッド完成</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <ResultNumber label="建築スコア" value={score.totalScore} />
        <ResultNumber label="パーツ数" value={score.partCount} />
        <ResultNumber label="カテゴリ数" value={score.categoryCount} />
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white"
          onClick={downloadImage}
          type="button"
        >
          <Download className="h-4 w-4" />
          画像を保存
        </button>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-full border border-ringTeal bg-white px-5 py-3 text-sm font-bold text-ink"
          onClick={shareToX}
          type="button"
        >
          <Share2 className="h-4 w-4" />
          Xで共有
        </button>
        <button
          className="inline-flex items-center justify-center rounded-full bg-slate-100 px-5 py-3 text-sm font-bold text-slate-600"
          onClick={reset}
          type="button"
        >
          編集に戻る
        </button>
      </div>
    </section>
  );
}

function ResultNumber({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-bold text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black text-ink">{value}</p>
    </div>
  );
}

function PublishPanel({
  isPublishing,
  publishCreation,
  publishedPath,
  publishMessage,
  publishTitle,
  setPublishTitle
}: {
  isPublishing: boolean;
  publishCreation: () => void;
  publishedPath: string | null;
  publishMessage: string | null;
  publishTitle: string;
  setPublishTitle: (value: string) => void;
}) {
  return (
    <section className="rounded-3xl border border-white bg-white/90 p-5 shadow-soft">
      <p className="text-xs font-bold uppercase tracking-wide text-ringViolet">
        Publish
      </p>
      <h2 className="mt-1 text-xl font-black text-ink">ピラミッドを公開</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        公開すると、ミニゲーム内の公開作品一覧とランキングに表示されます。
      </p>
      <label className="mt-4 block text-xs font-bold text-slate-500" htmlFor="pyramid-title">
        タイトル
      </label>
      <input
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-ink outline-none focus:border-ringTeal"
        id="pyramid-title"
        maxLength={80}
        onChange={(event) => setPublishTitle(event.target.value)}
        value={publishTitle}
      />
      <button
        className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-ringViolet px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
        disabled={isPublishing}
        onClick={publishCreation}
        type="button"
      >
        {isPublishing ? "公開中..." : "公開する"}
      </button>
      {publishMessage ? (
        <p className="mt-3 text-sm font-semibold text-slate-600">
          {publishMessage}
        </p>
      ) : null}
      {publishedPath ? (
        <Link
          className="mt-2 inline-flex text-sm font-bold text-ringViolet underline"
          href={publishedPath}
        >
          公開ページを見る
        </Link>
      ) : null}
    </section>
  );
}

function getNextZIndex(parts: PlacedPyramidPart[]) {
  return Math.max(0, ...parts.map((part) => part.zIndex)) + 1;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
