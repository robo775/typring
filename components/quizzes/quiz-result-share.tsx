"use client";

import { Copy, ExternalLink } from "lucide-react";
import { useState } from "react";

type QuizResultShareProps = {
  resultName: string;
  resultUrl: string;
  quizTitle: string;
};

export function QuizResultShare({
  resultName,
  resultUrl,
  quizTitle
}: QuizResultShareProps) {
  const [copied, setCopied] = useState(false);
  const shareText = [
    `「${quizTitle}」を診断しました。`,
    "",
    "結果は……",
    `《${resultName}》`,
    "",
    resultUrl,
    "#Typring診断"
  ].join("\n");
  const intentUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  async function copyText() {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <a
        className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white"
        href={intentUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        <ExternalLink className="h-4 w-4" />
        Xで共有
      </a>
      <button
        className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-ink"
        onClick={copyText}
        type="button"
      >
        <Copy className="h-4 w-4" />
        共有文をコピー
      </button>
      {copied ? (
        <p className="self-center text-xs font-semibold text-teal-700">
          コピーしました。
        </p>
      ) : null}
    </div>
  );
}
