type VoteSummaryItem = {
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
        まだ予想投票はありません。
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
      {items.map((item) => (
        <div className="space-y-2" key={`${item.system}-${item.value}`}>
          <div className="flex items-center justify-between gap-3 text-sm">
            <div>
              <span className="font-semibold text-ink">{item.system}</span>
              <span className="ml-2 text-slate-600">{item.value}</span>
            </div>
            <span className="font-semibold text-ink">{item.percentage}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-ringTeal to-ringViolet"
              style={{ width: `${item.percentage}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">
            {item.totalCount}票中 {item.voteCount}票
          </p>
        </div>
      ))}
    </div>
  );
}
