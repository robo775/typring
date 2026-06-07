"use client";

import { Copy, ExternalLink } from "lucide-react";
import { useState } from "react";

type PollShareActionsProps = {
  pollTitle: string;
  pollUrl: string;
  question: string;
};

export function PollShareActions({
  pollTitle,
  pollUrl,
  question
}: PollShareActionsProps) {
  const [copied, setCopied] = useState(false);
  const shareText = [
    "Typringでアンケートを作成しました！",
    `「${pollTitle}」`,
    question,
    pollUrl,
    "#Typring #類型アンケート"
  ].join("\n");
  const intentUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  async function copyShareText() {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
  }

  return (
    <section className="rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-ringViolet">
        Share
      </p>
      <h2 className="mt-1 text-lg font-bold text-ink">アンケートを共有</h2>
      <div className="mt-4 grid gap-2">
        <a
          className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
          href={intentUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <ExternalLink className="h-4 w-4" />
          Xで投稿する
        </a>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink"
          onClick={copyShareText}
          type="button"
        >
          <Copy className="h-4 w-4" />
          投稿文をコピー
        </button>
      </div>
      {copied ? (
        <p className="mt-3 text-xs font-semibold text-teal-700">
          投稿文をコピーしました。
        </p>
      ) : null}
    </section>
  );
}
