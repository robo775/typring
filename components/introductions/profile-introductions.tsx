"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  deleteProfileIntroduction,
  saveProfileIntroduction
} from "@/lib/introductions/actions";

type Introduction = {
  author: {
    display_name: string;
    twitter_handle: string | null;
  } | null;
  author_user_id: string;
  body: string;
  created_at: string;
  id: string;
  updated_at: string;
};

type ProfileIntroductionsProps = {
  currentUserId: string | null;
  handle: string;
  introductions: Introduction[];
  isOwnProfile: boolean;
  targetUserId: string;
};

export function ProfileIntroductions({
  currentUserId,
  handle,
  introductions,
  isOwnProfile,
  targetUserId
}: ProfileIntroductionsProps) {
  const myIntroduction = useMemo(
    () =>
      currentUserId
        ? introductions.find(
            (introduction) => introduction.author_user_id === currentUserId
          ) ?? null
        : null,
    [currentUserId, introductions]
  );
  const [isEditing, setIsEditing] = useState(!myIntroduction);

  return (
    <section className="space-y-4 rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ringViolet">
          Introductions
        </p>
        <h2 className="mt-1 text-lg font-bold text-ink">
          このユーザーはどんな人？
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          このユーザーを紹介してください。紹介文は、1人につき1件まで投稿できます。
        </p>
      </div>

      <div className="space-y-3">
        {introductions.length > 0 ? (
          introductions.map((introduction) => {
            const isAuthor = currentUserId === introduction.author_user_id;

            return (
              <article
                className="rounded-2xl border border-slate-200 bg-white p-4"
                key={introduction.id}
              >
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {introduction.body}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <AuthorLink author={introduction.author} />
                  <span>
                    {new Date(introduction.updated_at).toLocaleDateString("ja-JP")}
                  </span>
                </div>
                {isAuthor ? (
                  <div className="mt-3 flex gap-2">
                    <button
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink"
                      onClick={() => setIsEditing(true)}
                      type="button"
                    >
                      編集
                    </button>
                    <form
                      action={deleteProfileIntroduction}
                      onSubmit={(event) => {
                        if (!window.confirm("この紹介文を削除しますか？")) {
                          event.preventDefault();
                        }
                      }}
                    >
                      <input name="handle" type="hidden" value={handle} />
                      <input
                        name="introduction_id"
                        type="hidden"
                        value={introduction.id}
                      />
                      <button
                        className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700"
                        type="submit"
                      >
                        削除
                      </button>
                    </form>
                  </div>
                ) : null}
              </article>
            );
          })
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
            まだ紹介文はありません。
          </p>
        )}
      </div>

      {!currentUserId ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
          紹介文を投稿するにはログインしてください。
        </p>
      ) : null}

      {currentUserId && isOwnProfile ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
          自分自身への紹介文は投稿できません。
        </p>
      ) : null}

      {currentUserId && !isOwnProfile && isEditing ? (
        <form action={saveProfileIntroduction} className="space-y-3">
          <input name="handle" type="hidden" value={handle} />
          <input name="target_user_id" type="hidden" value={targetUserId} />
          <textarea
            className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-6 outline-none transition focus:border-ringTeal focus:ring-2 focus:ring-teal-100"
            defaultValue={myIntroduction?.body ?? ""}
            maxLength={300}
            name="body"
            placeholder="このユーザーを紹介してください。"
            required
          />
          <div className="flex flex-wrap justify-end gap-2">
            {myIntroduction ? (
              <button
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink"
                onClick={() => setIsEditing(false)}
                type="button"
              >
                キャンセル
              </button>
            ) : null}
            <button
              className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
              type="submit"
            >
              {myIntroduction ? "更新する" : "投稿する"}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}

function AuthorLink({
  author
}: {
  author: Introduction["author"];
}) {
  if (!author?.twitter_handle) {
    return <span>{author?.display_name ?? "退会済みユーザー"}</span>;
  }

  return (
    <Link
      className="font-semibold text-ink hover:text-ringViolet"
      href={`/users/${author.twitter_handle}`}
    >
      {author.display_name} @{author.twitter_handle}
    </Link>
  );
}
