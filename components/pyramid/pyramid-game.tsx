"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Download,
  HelpCircle,
  Redo2,
  Share2,
  Undo2,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChallengeHud } from "@/components/pyramid/challenge-hud";
import { FloatingPartToolbar } from "@/components/pyramid/floating-part-toolbar";
import { PartPaletteSheet } from "@/components/pyramid/part-palette-sheet";
import { PyramidPartShape } from "@/components/pyramid/pyramid-part-shape";
import { PyramidScene } from "@/components/pyramid/pyramid-scene";
import { pyramidBackgrounds } from "@/data/pyramidBackgrounds";
import { pyramidCategoryLabels, pyramidParts } from "@/data/pyramidParts";
import {
  calculateChallengeScore,
  calculatePyramidScore
} from "@/lib/pyramid/calculate-pyramid-score";
import {
  CHALLENGE_COST_BUDGET,
  CHALLENGE_MAX_PARTS,
  canAddPart
} from "@/lib/pyramid/challenge-rules";
import { downloadSvgAsPng } from "@/lib/pyramid/export-pyramid-image";
import {
  clearPyramidSave,
  loadPyramidSave,
  savePyramidState
} from "@/lib/pyramid/pyramid-storage";
import { usePyramidGestures } from "@/lib/pyramid/use-pyramid-gestures";
import type {
  PlacedPyramidPart,
  PyramidMode,
  PyramidPart,
  PyramidPartCategory,
  PyramidScore
} from "@/types/pyramid";

const categories = Object.keys(pyramidCategoryLabels) as PyramidPartCategory[];

export function PyramidGame({ mode = "free" }: { mode?: PyramidMode }) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [backgroundId, setBackgroundId] = useState("desert");
  const [placedParts, setPlacedParts] = useState<PlacedPyramidPart[]>([]);
  const [history, setHistory] = useState<PlacedPyramidPart[][]>([]);
  const [redoStack, setRedoStack] = useState<PlacedPyramidPart[][]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] =
    useState<PyramidPartCategory>("material");
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
    () =>
      mode === "challenge"
        ? calculateChallengeScore(placedParts, backgroundId)
        : calculatePyramidScore(placedParts),
    [mode, placedParts, backgroundId]
  );
  const selectedPart = placedParts.find((part) => part.instanceId === selectedId);
  const visibleParts = pyramidParts.filter(
    (part) => part.category === activeCategory
  );

  useEffect(() => {
    const saveData = loadPyramidSave(mode);

    if (!saveData) {
      return;
    }

    setBackgroundId(saveData.backgroundId);
    setPlacedParts(saveData.placedParts);
  }, [mode]);

  useEffect(() => {
    savePyramidState(mode, backgroundId, placedParts);
  }, [mode, backgroundId, placedParts]);

  function commit(nextParts: PlacedPyramidPart[]) {
    setHistory((current) => [...current.slice(-20), placedParts]);
    setRedoStack([]);
    setPlacedParts(nextParts);
  }

  function addPart(part: PyramidPart) {
    if (mode === "challenge" && !canAddPart(placedParts, part).ok) {
      return;
    }

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

  function duplicateSelected() {
    const source = placedParts.find((part) => part.instanceId === selectedId);

    if (!source) {
      return;
    }

    const partDefinition = pyramidParts.find(
      (item) => item.id === source.partId
    );

    if (
      mode === "challenge" &&
      (!partDefinition || !canAddPart(placedParts, partDefinition).ok)
    ) {
      return;
    }

    const copied: PlacedPyramidPart = {
      ...source,
      instanceId: `${source.partId}-${crypto.randomUUID()}`,
      x: clamp(source.x + 24, 40, 960),
      y: clamp(source.y + 24, 40, 940),
      zIndex: getNextZIndex(placedParts)
    };

    commit([...placedParts, copied]);
    setSelectedId(copied.instanceId);
    setIsComplete(false);
  }

  function undo() {
    const previous = history[history.length - 1];

    if (!previous) {
      return;
    }

    setRedoStack((current) => [...current.slice(-20), placedParts]);
    setPlacedParts(previous);
    setHistory((current) => current.slice(0, -1));
    setSelectedId(null);
    setIsComplete(false);
  }

  function redo() {
    const next = redoStack[redoStack.length - 1];

    if (!next) {
      return;
    }

    setHistory((current) => [...current.slice(-20), placedParts]);
    setPlacedParts(next);
    setRedoStack((current) => current.slice(0, -1));
    setSelectedId(null);
    setIsComplete(false);
  }

  function reset() {
    if (!window.confirm("作成中のピラミッドをリセットしますか？")) {
      return;
    }

    clearPyramidSave(mode);
    setHistory((current) => [...current.slice(-20), placedParts]);
    setRedoStack([]);
    setPlacedParts([]);
    setSelectedId(null);
    setIsComplete(false);
  }

  const gestures = usePyramidGestures({
    onGestureEnd: (snapshot) => {
      setHistory((current) => [...current.slice(-20), snapshot]);
      setRedoStack([]);
      setIsComplete(false);
    },
    onSelect: setSelectedId,
    setPlacedParts,
    svgRef
  });

  async function downloadImage() {
    if (!svgRef.current) {
      return;
    }

    await downloadSvgAsPng(svgRef.current, "typring-pyramid.png");
  }

  function shareToX() {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    const text = [
      mode === "challenge"
        ? "チャレンジモードでピラミッドを建築しました。"
        : "オリジナルのピラミッドを作りました。",
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
          mode,
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
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-3 py-4 pb-44 sm:px-4 sm:py-8 sm:pb-44 lg:pb-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            className="inline-flex items-center gap-2 rounded-full border border-white bg-white/80 px-3 py-2 text-sm font-bold text-ink shadow-sm"
            href="/games/pyramid"
          >
            <ArrowLeft className="h-4 w-4" />
            モード選択
          </Link>
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-black ${
              mode === "challenge"
                ? "bg-violet-100 text-ringViolet"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {mode === "challenge" ? "チャレンジ" : "自由編集"}
          </span>
        </div>
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

          <div className="relative overflow-hidden rounded-3xl border border-white bg-white shadow-soft">
            <svg
              className="block aspect-square w-full touch-none bg-slate-100"
              onPointerCancel={gestures.handlePointerUp}
              onPointerDown={(event) =>
                gestures.handleCanvasPointerDown(event, placedParts)
              }
              onPointerMove={gestures.handlePointerMove}
              onPointerUp={gestures.handlePointerUp}
              ref={svgRef}
              role="img"
              viewBox="0 0 1000 1000"
              xmlns="http://www.w3.org/2000/svg"
            >
              <PyramidScene
                background={background}
                handlePointerDown={(event, placedPart) =>
                  gestures.handlePartPointerDown(event, placedPart, placedParts)
                }
                idPrefix="editor"
                placedParts={placedParts}
                selectedId={selectedId}
              />
            </svg>
            {selectedPart ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center px-2">
                <FloatingPartToolbar
                  onBack={() =>
                    updateSelected((part) => ({
                      ...part,
                      zIndex: Math.max(0, part.zIndex - 1)
                    }))
                  }
                  onDelete={removeSelected}
                  onDuplicate={duplicateSelected}
                  onFlip={() =>
                    updateSelected((part) => ({ ...part, flipX: !part.flipX }))
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
                  partName={
                    pyramidParts.find((item) => item.id === selectedPart.partId)
                      ?.name ?? "パーツ"
                  }
                />
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-5 gap-2">
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
              className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white bg-white/82 px-2 py-3 text-xs font-bold text-ink shadow-sm disabled:opacity-40"
              disabled={redoStack.length === 0}
              onClick={redo}
              type="button"
            >
              <Redo2 className="h-4 w-4" />
              Redo
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
          {mode === "challenge" ? <ChallengeHud score={score} /> : null}
          <BackgroundSelector
            backgroundId={backgroundId}
            setBackgroundId={(id) => {
              setBackgroundId(id);
              setIsComplete(false);
            }}
          />
          <div className="hidden lg:block">
            <PartsPalette
              activeCategory={activeCategory}
              addPart={addPart}
              mode={mode}
              parts={visibleParts}
              placedParts={placedParts}
              setActiveCategory={setActiveCategory}
            />
          </div>
        </aside>
      </div>

      <PartPaletteSheet
        activeCategory={activeCategory}
        addPart={addPart}
        mode={mode}
        placedParts={placedParts}
        setActiveCategory={setActiveCategory}
      />

      {isHowToOpen ? (
        <HowToPlayModal mode={mode} onClose={() => setIsHowToOpen(false)} />
      ) : null}
      {isComplete ? (
        <>
          <ResultPanel
            downloadImage={downloadImage}
            mode={mode}
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
              style={{ backgroundColor: background.skyTop }}
            />
            {background.name}
          </button>
        ))}
      </div>
    </section>
  );
}

function PartsPalette({
  activeCategory,
  addPart,
  mode,
  parts,
  placedParts,
  setActiveCategory
}: {
  activeCategory: PyramidPartCategory;
  addPart: (part: PyramidPart) => void;
  mode: PyramidMode;
  parts: PyramidPart[];
  placedParts: PlacedPyramidPart[];
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
        {parts.map((part) => {
          const check =
            mode === "challenge"
              ? canAddPart(placedParts, part)
              : ({ ok: true } as const);
          const blockedReason = check.ok
            ? null
            : check.reason === "cost_exceeded"
              ? "コスト不足"
              : "配置上限";

          return (
            <button
              className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-left shadow-sm transition hover:border-ringTeal disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-slate-100"
              disabled={!check.ok}
              key={part.id}
              onClick={() => addPart(part)}
              title={blockedReason ?? part.description}
              type="button"
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${part.color}30`, color: part.color }}
              >
                <svg height="32" viewBox="-80 -80 160 160" width="32">
                  <PyramidPartShape color={part.color} visual={part.visual} />
                </svg>
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-black text-ink">
                    {part.name}
                  </span>
                  {mode === "challenge" ? (
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${
                        check.ok
                          ? "bg-teal-50 text-ringTeal"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      {blockedReason ?? `コスト${part.cost}`}
                    </span>
                  ) : null}
                </span>
                <span className="block truncate text-xs font-semibold text-slate-500">
                  +{part.score} / {part.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function HowToPlayModal({
  mode,
  onClose
}: {
  mode: PyramidMode;
  onClose: () => void;
}) {
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
          <p>パーツ一覧から好きなパーツを追加します。</p>
          <p>
            キャンバス上のパーツはドラッグで移動、スマホなら2本指でピンチ拡縮・回転ができます。
          </p>
          <p>
            選択中のパーツはツールバーから拡大、回転、反転、複製、削除、前後移動ができます。
          </p>
          {mode === "challenge" ? (
            <>
              <p className="font-bold text-ink">チャレンジモードのルール</p>
              <p>
                コスト{CHALLENGE_COST_BUDGET}・配置{CHALLENGE_MAX_PARTS}
                個の上限内でピラミッドを建築します。
              </p>
              <p>
                スコア = パーツ合計 + カテゴリボーナス + 数量ボーナス +
                シナジーボーナス。特定の組み合わせでシナジーが発動します。
              </p>
              <p>公開するとランキングに参加できます。</p>
            </>
          ) : (
            <>
              <p className="font-bold text-ink">自由編集モード</p>
              <p>
                コストや配置数の制限なしで自由に作れます。公開作品はギャラリーに表示されます（ランキング対象外）。
              </p>
            </>
          )}
          <p>完成したら画像保存やX共有ができます。</p>
        </div>
      </section>
    </div>
  );
}

function ResultPanel({
  downloadImage,
  mode,
  reset,
  score,
  shareToX
}: {
  downloadImage: () => void;
  mode: PyramidMode;
  reset: () => void;
  score: PyramidScore;
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
      {mode === "challenge" ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <ResultNumber label="基本スコア" value={score.baseScore} />
          <ResultNumber
            label="ボーナス"
            value={score.varietyBonus + score.volumeBonus}
          />
          <ResultNumber label="シナジー" value={score.synergyBonus} />
        </div>
      ) : null}
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
