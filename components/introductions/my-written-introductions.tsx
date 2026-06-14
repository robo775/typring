import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";

export type WrittenIntroductionItem = {
  body: string;
  created_at: string;
  id: string;
  target_profile: {
    avatar_url: string | null;
    display_name: string;
    twitter_handle: string | null;
  } | null;
  updated_at: string;
};

type MyWrittenIntroductionsProps = {
  currentPage: number;
  hasError?: boolean;
  hasNextPage: boolean;
  introductions: WrittenIntroductionItem[];
  pageHref: string;
  profileName: string;
};

export function MyWrittenIntroductions({
  currentPage,
  hasError = false,
  hasNextPage,
  introductions,
  pageHref,
  profileName
}: MyWrittenIntroductionsProps) {
  return (
    <section className="rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
      <SectionHeader
        eyebrow="Introductions"
        title="書いた紹介文"
        description={`${profileName}さんがほかのユーザーに書いた紹介文です。最近書いたものから表示します。`}
      />

      <div className="mt-5 grid gap-3">
        {hasError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            紹介文の取得に失敗しました。
          </div>
        ) : introductions.length > 0 ? (
          introductions.map((introduction) => (
            <WrittenIntroductionCard
              introduction={introduction}
              key={introduction.id}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-500">
            まだ紹介文を書いていません。
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-center gap-3 text-sm font-bold">
        {currentPage > 1 ? (
          <Link
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 transition hover:-translate-y-0.5"
            href={buildPageHref(pageHref, currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            前へ
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-100 bg-slate-50 px-4 py-2 text-slate-300">
            <ChevronLeft className="h-4 w-4" />
            前へ
          </span>
        )}
        <span className="rounded-full bg-slate-100 px-4 py-2 text-slate-600">
          {currentPage}
        </span>
        {hasNextPage ? (
          <Link
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 transition hover:-translate-y-0.5"
            href={buildPageHref(pageHref, currentPage + 1)}
          >
            次へ
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-100 bg-slate-50 px-4 py-2 text-slate-300">
            次へ
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </section>
  );
}

function WrittenIntroductionCard({
  introduction
}: {
  introduction: WrittenIntroductionItem;
}) {
  const target = introduction.target_profile;
  const handle = target?.twitter_handle;
  const profileHref = handle ? `/users/${encodeURIComponent(handle)}` : null;
  const updatedAt = formatDate(introduction.updated_at);
  const createdAt = formatDate(introduction.created_at);
  const avatarText = target?.display_name?.slice(0, 1) || "?";

  const header = (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-ringTeal to-ringViolet text-sm font-black text-white">
        {target?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            className="h-full w-full object-cover"
            src={target.avatar_url}
          />
        ) : (
          avatarText
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-black text-ink">
          {target?.display_name ?? "退会済みユーザー"}さんへの紹介文
        </p>
        {handle ? (
          <p className="truncate text-xs font-semibold text-slate-500">@{handle}</p>
        ) : null}
      </div>
    </div>
  );

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      {profileHref ? (
        <Link className="block transition hover:opacity-80" href={profileHref}>
          {header}
        </Link>
      ) : (
        header
      )}
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {introduction.body}
      </p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-400">
        <span>作成日 {createdAt}</span>
        {updatedAt !== createdAt ? <span>更新日 {updatedAt}</span> : null}
      </div>
    </article>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

function buildPageHref(baseHref: string, page: number) {
  return `${baseHref}?writtenIntroPage=${page}`;
}
