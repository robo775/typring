"use client";

import { Copy, Download, ExternalLink, ImageDown } from "lucide-react";
import { useState } from "react";

type CharacterTopType = {
  system: string;
  value: string;
};

type ShareNavigator = Navigator & {
  canShare?: (data: ShareData & { files?: File[] }) => boolean;
  share?: (data: ShareData & { files?: File[] }) => Promise<void>;
};

type CharacterDiagnosisShareActionsProps = {
  characterName: string;
  characterUrl: string;
  imageUrl: string | null;
  topTypes: CharacterTopType[];
  workTitle: string | null;
};

export function CharacterDiagnosisShareActions({
  characterName,
  characterUrl,
  imageUrl,
  topTypes,
  workTitle
}: CharacterDiagnosisShareActionsProps) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const titleText = `${workTitle ?? "作品名未設定"}の${characterName}`;
  const topTypeLine = topTypes
    .map((type) => `${type.system}: ${type.value}`)
    .join(" / ");
  const shareText = [
    `${titleText}の他者診断ページが公開されました。みんなで投票しよう。`,
    topTypeLine ? `現在の1位: ${topTypeLine}` : "",
    characterUrl,
    "#Typring #キャラ診断"
  ]
    .filter(Boolean)
    .join("\n");
  const intentUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}`;

  async function copy(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
  }

  async function downloadCardImage() {
    setBusy(true);
    try {
      const blob = await createCharacterCardImage({
        characterName,
        imageUrl,
        topTypes,
        workTitle
      });
      downloadBlob(blob, workTitle, characterName);
    } finally {
      setBusy(false);
    }
  }

  async function shareCardImage() {
    setBusy(true);
    try {
      const blob = await createCharacterCardImage({
        characterName,
        imageUrl,
        topTypes,
        workTitle
      });
      const file = new File([blob], "typring-character.png", {
        type: "image/png"
      });
      const nav = navigator as ShareNavigator;

      if (nav.share && (!nav.canShare || nav.canShare({ files: [file] }))) {
        await nav.share({
          files: [file],
          text: shareText,
          title: `${titleText} | Typring`
        });
        return;
      }

      downloadBlob(blob, workTitle, characterName);
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
        <h2 className="mt-1 text-lg font-bold text-ink">
          キャラ診断を共有
        </h2>
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
          Xで投稿
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
          onClick={() => copy(characterUrl, "url")}
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
          投稿文をコピー
        </button>
      </div>
      {copied ? (
        <p className="text-xs font-semibold text-teal-700">
          {copied === "url" ? "URL" : "投稿文"}をコピーしました。
        </p>
      ) : null}
    </section>
  );
}

function downloadBlob(blob: Blob, workTitle: string | null, characterName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `typring-character-${slugify(workTitle ?? "work")}-${slugify(
    characterName
  )}.png`;
  link.click();
  URL.revokeObjectURL(url);
}

async function createCharacterCardImage({
  characterName,
  imageUrl,
  topTypes,
  workTitle
}: {
  characterName: string;
  imageUrl: string | null;
  topTypes: CharacterTopType[];
  workTitle: string | null;
}) {
  const characterImage = imageUrl ? await loadImage(imageUrl) : null;

  try {
    return await renderCharacterCardImage({
      characterImage,
      characterName,
      topTypes,
      workTitle
    });
  } catch (error) {
    if (characterImage) {
      return renderCharacterCardImage({
        characterImage: null,
        characterName,
        topTypes,
        workTitle
      });
    }

    throw error;
  }
}

async function renderCharacterCardImage({
  characterImage,
  characterName,
  topTypes,
  workTitle
}: {
  characterImage: HTMLImageElement | null;
  characterName: string;
  topTypes: CharacterTopType[];
  workTitle: string | null;
}) {
  const canvas = document.createElement("canvas");
  const width = 1080;
  const height = 1180;
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
    characterImage,
    characterName,
    height,
    topTypes,
    width,
    workTitle
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

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    const timeout = window.setTimeout(() => resolve(null), 5000);

    image.crossOrigin = "anonymous";
    image.referrerPolicy = "no-referrer";
    image.onload = () => {
      window.clearTimeout(timeout);
      resolve(image);
    };
    image.onerror = () => {
      window.clearTimeout(timeout);
      resolve(null);
    };
    image.src = src;
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
    characterImage,
    characterName,
    height,
    topTypes,
    width,
    workTitle
  }: {
    characterImage: HTMLImageElement | null;
    characterName: string;
    height: number;
    topTypes: CharacterTopType[];
    width: number;
    workTitle: string | null;
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
  roundRect(ctx, cardX, cardY, cardW, 300, 44);
  ctx.clip();
  const header = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + 300);
  header.addColorStop(0, "#10b8a6");
  header.addColorStop(0.55, "#3b82f6");
  header.addColorStop(1, "#7c3aed");
  ctx.fillStyle = header;
  ctx.fillRect(cardX, cardY, cardW, 300);
  ctx.restore();

  const imageX = cardX + 56;
  const imageY = cardY + 62;
  drawAvatar(ctx, characterImage, characterName, imageX, imageY, 160);

  ctx.fillStyle = "rgba(255,255,255,0.84)";
  ctx.font = "600 28px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(
    truncateText(ctx, workTitle ?? "作品名未設定", 560),
    imageX + 190,
    imageY + 56
  );
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 48px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(truncateText(ctx, characterName, 560), imageX + 190, imageY + 112);

  let y = cardY + 390;
  y = drawTypeBlock(ctx, "他者診断 1位", topTypes, cardX + 56, y, cardW - 112);

  ctx.fillStyle = "#475569";
  ctx.font = "400 28px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  if (topTypes.length === 0) {
    ctx.fillText("みんなの投票を待っています。", cardX + 56, y + 18);
  } else {
    ctx.fillText("このキャラをどう見る？Typringで投票できます。", cardX + 56, y + 18);
  }

  ctx.font = "700 26px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "#0f172a";
  ctx.fillText("Typring", cardX + 56, cardY + cardH - 56);
  ctx.font = "400 22px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText("Character Types", cardX + 174, cardY + cardH - 56);
}

function drawAvatar(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
  characterName: string,
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

  if (image) {
    const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
    const sourceX = (image.naturalWidth - sourceSize) / 2;
    const sourceY = (image.naturalHeight - sourceSize) / 2;
    ctx.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, x, y, size, size);
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 58px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(characterName.slice(0, 1).toUpperCase(), x + size / 2, y + size / 2);
    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
  }

  ctx.restore();
}

function drawTypeBlock(
  ctx: CanvasRenderingContext2D,
  label: string,
  types: CharacterTopType[],
  x: number,
  y: number,
  maxWidth: number
) {
  ctx.font = "800 24px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText(label, x, y);
  y += 34;

  if (types.length === 0) {
    ctx.font = "400 28px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("まだ投票が集まっていません。", x, y + 42);
    return y + 98;
  }

  let currentX = x;
  let currentY = y;

  for (const type of types) {
    const text = `${type.system}  ${type.value}`;
    ctx.font = "700 25px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    const textWidth = ctx.measureText(text).width;
    const tagW = textWidth + 44;
    const tagH = 52;

    if (currentX + tagW > x + maxWidth) {
      currentX = x;
      currentY += tagH + 14;
    }

    roundRect(ctx, currentX, currentY, tagW, tagH, 26);
    ctx.fillStyle = "#f5f3ff";
    ctx.fill();
    ctx.strokeStyle = "#ddd6fe";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#5b21b6";
    ctx.fillText(text, currentX + 22, currentY + 35);
    currentX += tagW + 12;
  }

  return currentY + 88;
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

function slugify(value: string) {
  return value
    .trim()
    .replace(/[^\p{Letter}\p{Number}_-]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}
