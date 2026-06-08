type VoteSummaryItem = {
  firstVotedAt?: string | null;
  percentage: number;
  system: string;
  totalCount: number;
  value: string;
  voteCount: number;
};

type TypeVoteSummaryProps = {
  items: VoteSummaryItem[];
};

export function TypeVoteSummary({ items }: TypeVoteSummaryProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-500">
        まだ他者診断の投票はありません。
      </div>
    );
  }

  const groups = groupBySystem(items);

  return (
    <div className="space-y-4 rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
      {groups.map((group) => (
        <section className="space-y-3" key={group.system}>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-bold text-ink">{group.system}</h3>
            <span className="text-xs font-semibold text-slate-400">
              {group.items[0]?.totalCount ?? 0}票
            </span>
          </div>
          <ol className="space-y-2">
            {group.items.map((item, index) => (
              <li
                className="rounded-xl border border-slate-100 bg-white/80 p-3"
                key={`${item.system}-${item.value}`}
              >
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={
                        index === 0
                          ? "flex h-7 min-w-10 shrink-0 items-center justify-center rounded-full bg-red-100 px-2 text-xs font-bold text-red-700"
                          : "flex h-7 min-w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-bold text-slate-500"
                      }
                    >
                      {index + 1}位
                    </span>
                    <span className="truncate font-semibold text-ink">
                      {item.value}
                    </span>
                  </div>
                  <span className="shrink-0 font-semibold text-ink">
                    {item.percentage}%
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={
                      index === 0
                        ? "h-full rounded-full bg-gradient-to-r from-red-400 to-ringViolet"
                        : "h-full rounded-full bg-gradient-to-r from-ringTeal to-ringViolet"
                    }
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {item.totalCount}票中 {item.voteCount}票
                </p>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

function groupBySystem(items: VoteSummaryItem[]) {
  const groups = new Map<string, VoteSummaryItem[]>();

  for (const item of items) {
    const group = groups.get(item.system) ?? [];
    group.push(item);
    groups.set(item.system, group);
  }

  return Array.from(groups.entries()).map(([system, groupItems]) => ({
    items: groupItems.sort((a, b) => {
      if (a.voteCount !== b.voteCount) {
        return b.voteCount - a.voteCount;
      }

      if (a.percentage !== b.percentage) {
        return b.percentage - a.percentage;
      }

      const firstVoteDiff =
        getTime(a.firstVotedAt ?? null) - getTime(b.firstVotedAt ?? null);

      if (firstVoteDiff !== 0) {
        return firstVoteDiff;
      }

      return a.value.localeCompare(b.value);
    }),
    system
  }));
}

function getTime(value: string | null) {
  if (!value) {
    return Number.MAX_SAFE_INTEGER;
  }

  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : Number.MAX_SAFE_INTEGER;
}
