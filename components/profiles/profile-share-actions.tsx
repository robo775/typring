"use client";

import { Copy, ExternalLink } from "lucide-react";
import { useState } from "react";

type ProfileType = {
  system: string;
  value: string;
};

type ProfileShareActionsProps = {
  displayName: string;
  profileUrl: string;
  types: ProfileType[];
  votedTypes?: ProfileType[];
};

export function ProfileShareActions({
  displayName,
  profileUrl,
  types,
  votedTypes = []
}: ProfileShareActionsProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const selfTypeLine = formatTypeLine(types);
  const votedTypeLine = formatTypeLine(votedTypes);
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

  return (
    <section className="space-y-3 rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ringViolet">
          Share
        </p>
        <h2 className="mt-1 text-lg font-bold text-ink">プロフィールを共有</h2>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <a
          className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
          href={intentUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <ExternalLink className="h-4 w-4" />
          Xで共有
        </a>
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
      {copied ? (
        <p className="text-xs font-semibold text-teal-700">
          {copied === "url" ? "URL" : "共有文"}をコピーしました。
        </p>
      ) : null}
    </section>
  );
}

function formatTypeLine(types: ProfileType[]) {
  return types
    .map((type) => `${type.system}: ${type.value}`)
    .join(" / ");
}
