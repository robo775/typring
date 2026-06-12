"use client";

import {
  ArrowDownToLine,
  ArrowUpToLine,
  Copy,
  FlipHorizontal,
  Minus,
  Plus,
  RotateCcw,
  RotateCw,
  Trash2
} from "lucide-react";

export function FloatingPartToolbar({
  onBack,
  onDelete,
  onDuplicate,
  onFlip,
  onForward,
  onRotateLeft,
  onRotateRight,
  onScaleDown,
  onScaleUp,
  partName
}: {
  onBack: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onFlip: () => void;
  onForward: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onScaleDown: () => void;
  onScaleUp: () => void;
  partName: string;
}) {
  return (
    <div className="pointer-events-auto flex flex-col items-center gap-1 rounded-3xl border border-white bg-white/92 px-2 py-2 shadow-soft backdrop-blur">
      <p className="max-w-[280px] truncate px-2 text-[11px] font-black text-slate-500">
        {partName}
      </p>
      <div className="flex items-center gap-1">
        <ToolbarButton label="縮小" onClick={onScaleDown}>
          <Minus className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="拡大" onClick={onScaleUp}>
          <Plus className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="左回転" onClick={onRotateLeft}>
          <RotateCcw className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="右回転" onClick={onRotateRight}>
          <RotateCw className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="反転" onClick={onFlip}>
          <FlipHorizontal className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="前面へ" onClick={onForward}>
          <ArrowUpToLine className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="背面へ" onClick={onBack}>
          <ArrowDownToLine className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="複製" onClick={onDuplicate}>
          <Copy className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton danger label="削除" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </ToolbarButton>
      </div>
    </div>
  );
}

function ToolbarButton({
  children,
  danger = false,
  label,
  onClick
}: {
  children: React.ReactNode;
  danger?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className={`flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-black transition active:scale-95 ${
        danger
          ? "bg-red-50 text-red-600"
          : "bg-slate-50 text-ink hover:bg-slate-100"
      }`}
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}
