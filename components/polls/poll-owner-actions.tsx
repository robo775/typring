"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { deletePoll } from "@/lib/polls/actions";

type PollOwnerActionsProps = {
  pollId: string;
  slug: string;
};

export function PollOwnerActions({ pollId, slug }: PollOwnerActionsProps) {
  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
      <h2 className="text-lg font-bold text-ink">作成者メニュー</h2>
      <div className="mt-4 grid gap-2">
        <Link
          className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
          href={`/polls/${slug}/edit`}
        >
          <Pencil className="h-4 w-4" />
          編集する
        </Link>
        <form
          action={deletePoll}
          onSubmit={(event) => {
            if (
              !window.confirm(
                "このアンケートを削除しますか？回答データも削除されます。"
              )
            ) {
              event.preventDefault();
            }
          }}
        >
          <input name="poll_id" type="hidden" value={pollId} />
          <input name="slug" type="hidden" value={slug} />
          <button
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700"
            type="submit"
          >
            <Trash2 className="h-4 w-4" />
            削除する
          </button>
        </form>
      </div>
    </section>
  );
}
