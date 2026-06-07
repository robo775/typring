"use client";

import { Copy, Download, ExternalLink, ImageDown } from "lucide-react";
import { useState } from "react";

type ProfileType = {
  system: string;
  value: string;
};

type ProfileShareActionsProps = {
  avatarUrl: string | null;
  bio: string;
  displayName: string;
  handle: string;
  profileUrl: string;
  showVotedTypes?: boolean;
  types: ProfileType[];
  votedTypes?: ProfileType[];
};

type ShareNavigator = Navigator & {
  canShare?: (data: ShareData & { files?: File[] }) => boolean;
  share?: (data: ShareData & { files?: File[] }) => Promise<void>;
};

export function ProfileShareActions({
  avatarUrl,
  bio,
  displayName,
  handle,
  profileUrl,
  showVotedTypes = true,
  types,
  votedTypes = []
}: ProfileShareActionsProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const visibleVotedTypes = showVotedTypes ? votedTypes : [];
  const selfTypeLine = formatTypeLine(types);
  const votedTypeLine = formatTypeLine(visibleVotedTypes);
  const shareText = [
    `Typringで${displayName}さんのプロフィールを見つけました。`,
    selfTypeLine ? `自認: ${selfTypeLine}` : "",
    votedTypeLine ? `他者診断: ${votedTypeLine}` : "",
    profileUrl,
    "#Typring #MBTI"
  ]
    .filter(Boolean)
    .join("\n");
  const intentUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  async function copy(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
  }

  async function downloadCardImage() {
    setBusy(true);
    try {
      const blob = await createProfileCardImage({
        avatarUrl,
        bio,
        displayName,
        handle,
        showVotedTypes,
        types,
        votedTypes: visibleVotedTypes
      });
      downloadBlob(blob, handle);
    } finally {
      setBusy(false);
    }
  }

  async function shareCardImage() {
    setBusy(true);
    try {
      const blob = await createProfileCardImage({
        avatarUrl,
        bio,
        displayName,
        handle,
        showVotedTypes,
        types,
        votedTypes: visibleVotedTypes
      });
      const file = new File([blob], "typring-profile.png", { type: "image/png" });
      const nav = navigator as ShareNavigator;

      if (nav.share && (!nav.canShare || nav.canShare({ files: [file] }))) {
        await nav.share({
          files: [file],
          text: shareText,
          title: `${displayName} | Typring`
        });
        return;
      }

      downloadBlob(blob, handle);
      window.open(intentUrl, "_blank", "noopener,noreferrer");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-3 rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ringViolet">
          Share
        </p>
        <h2 className="mt-1 text-lg font-bold text-ink">プロフィールを共有</h2>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <button
          className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          disabled={busy}
          onClick={shareCardImage}
          type="button"
        >
          <ImageDown className="h-4 w-4" />
          画像で共有
        </button>
        <a
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink"
          href={intentUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <ExternalLink className="h-4 w-4" />
          Xで共有
        </a>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink disabled:opacity-60"
          disabled={busy}
          onClick={downloadCardImage}
          type="button"
        >
          <Download className="h-4 w-4" />
          画像を保存
        </button>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink"
          onClick={() => copy(profileUrl, "url")}
          type="button"
        >
          <Copy className="h-4 w-4" />
          URLをコピー
        </button>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink"
          onClick={() => copy(shareText, "text")}
          type="button"
        >
          <Copy className="h-4 w-4" />
          共有文をコピー
        </button>
      </div>
      <p className="text-xs leading-5 text-slate-500">
        スマホでは「画像で共有」から画像付き投稿に進めます。PCブラウザではXの仕様上、画像が自動添付されない場合があるため、その場合は「画像を保存」して投稿画面で添付してください。
      </p>
      {copied ? (
        <p className="text-xs font-semibold text-teal-700">
          {copied === "url" ? "URL" : "共有文"}をコピーしました。
        </p>
      ) : null}
    </section>
  );
}

function formatTypeLine(types: ProfileType[]) {
  return types.map((type) => `${type.system}: ${type.value}`).join(" / ");
}

function downloadBlob(blob: Blob, handle: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `typring-${handle.replace(/^@/, "") || "profile"}.png`;
  link.click();
  URL.revokeObjectURL(url);
}

async function createProfileCardImage({
  avatarUrl,
  bio,
  displayName,
  handle,
  showVotedTypes,
  types,
  votedTypes
}: {
  avatarUrl: string | null;
  bio: string;
  displayName: string;
  handle: string;
  showVotedTypes: boolean;
  types: ProfileType[];
  votedTypes: ProfileType[];
}) {
  const canvas = document.createElement("canvas");
  const width = 1080;
  const height = showVotedTypes ? 1320 : 1120;
  const scale = window.devicePixelRatio || 1;
  canvas.width = width * scale;
  canvas.height = height * scale;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas is not available.");
  }

  ctx.scale(scale, scale);
  drawBackground(ctx, width, height);
  drawCard(ctx, {
    avatarUrl,
    bio,
    displayName,
    handle,
    height,
    showVotedTypes,
    types,
    votedTypes,
    width
  });

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to create image."));
        return;
      }

      resolve(blob);
    }, "image/png");
  });
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const background = ctx.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, "#d8fbf4");
  background.addColorStop(0.55, "#f8fbff");
  background.addColorStop(1, "#eee3ff");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);
}

function drawCard(
  ctx: CanvasRenderingContext2D,
  {
    avatarUrl,
    bio,
    displayName,
    handle,
    height,
    showVotedTypes,
    types,
    votedTypes,
    width
  }: {
    avatarUrl: string | null;
    bio: string;
    displayName: string;
    handle: string;
    height: number;
    showVotedTypes: boolean;
    types: ProfileType[];
    votedTypes: ProfileType[];
    width: number;
  }
) {
  const cardX = 90;
  const cardY = 90;
  const cardW = width - 180;
  const cardH = height - 180;
  roundRect(ctx, cardX, cardY, cardW, cardH, 44);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  ctx.save();
  roundRect(ctx, cardX, cardY, cardW, 280, 44);
  ctx.clip();
  const header = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + 280);
  header.addColorStop(0, "#10b8a6");
  header.addColorStop(0.55, "#3b82f6");
  header.addColorStop(1, "#7c3aed");
  ctx.fillStyle = header;
  ctx.fillRect(cardX, cardY, cardW, 280);
  ctx.restore();

  const avatarX = cardX + 56;
  const avatarY = cardY + 70;
  drawAvatar(ctx, avatarUrl, displayName, avatarX, avatarY, 136);

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 48px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(truncateText(ctx, displayName, 560), avatarX + 168, avatarY + 56);
  ctx.font = "500 28px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.84)";
  ctx.fillText(`@${handle.replace(/^@/, "")}`, avatarX + 168, avatarY + 104);

  let y = cardY + 355;
  ctx.fillStyle = "#475569";
  ctx.font = "400 28px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  y =
    drawWrappedText(
      ctx,
      bio || "自己紹介はまだ設定されていません。",
      cardX + 56,
      y,
      cardW - 112,
      42,
      4
    ) + 42;
  y = drawTypeBlock(ctx, "自認", types, cardX + 56, y, cardW - 112, false);

  if (showVotedTypes) {
    y = drawTypeBlock(
      ctx,
      "他者診断 1位",
      votedTypes,
      cardX + 56,
      y + 18,
      cardW - 112,
      true
    );
  }

  ctx.font = "700 26px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "#0f172a";
  ctx.fillText("Typring", cardX + 56, cardY + cardH - 56);
  ctx.font = "400 22px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText("Type + Ring", cardX + 174, cardY + cardH - 56);
}

function drawAvatar(
  ctx: CanvasRenderingContext2D,
  avatarUrl: string | null,
  displayName: string,
  x: number,
  y: number,
  size: number
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = "rgba(255,255,255,0.82)";
  ctx.stroke();
  ctx.clip();

  // Xなど外部画像はCORSでcanvas保存に失敗しやすいため、画像化時は頭文字で安定表示する。
  void avatarUrl;
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(x, y, size, size);
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 58px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(displayName.slice(0, 1).toUpperCase(), x + size / 2, y + size / 2);
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
  ctx.restore();
}

function drawTypeBlock(
  ctx: CanvasRenderingContext2D,
  label: string,
  types: ProfileType[],
  x: number,
  y: number,
  maxWidth: number,
  voted: boolean
) {
  ctx.font = "800 22px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText(label, x, y);
  y += 28;

  if (types.length === 0) {
    ctx.font = "400 26px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText(
      voted ? "他者診断はまだ集まっていません。" : "自認タイプはまだ登録されていません。",
      x,
      y + 40
    );
    return y + 92;
  }

  let currentX = x;
  let currentY = y;

  for (const type of types) {
    const text = `${type.system}  ${type.value}`;
    ctx.font = "700 24px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    const textWidth = ctx.measureText(text).width;
    const tagW = textWidth + 44;
    const tagH = 50;

    if (currentX + tagW > x + maxWidth) {
      currentX = x;
      currentY += tagH + 14;
    }

    roundRect(ctx, currentX, currentY, tagW, tagH, 25);
    ctx.fillStyle = voted ? "#f5f3ff" : "#f8fafc";
    ctx.fill();
    ctx.strokeStyle = voted ? "#ddd6fe" : "#e2e8f0";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = voted ? "#5b21b6" : "#0f172a";
    ctx.fillText(text, currentX + 22, currentY + 33);
    currentX += tagW + 12;
  }

  return currentY + 82;
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
) {
  const chars = Array.from(text);
  const lines: string[] = [];
  let line = "";

  for (const char of chars) {
    const testLine = line + char;

    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = char;

      if (lines.length === maxLines) {
        break;
      }
    } else {
      line = testLine;
    }
  }

  if (line && lines.length < maxLines) {
    lines.push(line);
  }

  lines.forEach((lineText, index) => {
    ctx.fillText(lineText, x, y + index * lineHeight);
  });

  return y + lines.length * lineHeight;
}

function truncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
) {
  if (ctx.measureText(text).width <= maxWidth) {
    return text;
  }

  let result = text;

  while (result.length > 1 && ctx.measureText(`${result}...`).width > maxWidth) {
    result = result.slice(0, -1);
  }

  return `${result}...`;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}
