import type { UserLevelSummary } from "@/lib/levels/queries";

type LevelItem = {
  label: string;
  points: number;
};

export function UserLevelPanel({ summary }: { summary: UserLevelSummary }) {
  const remainingPoints = Math.max(
    0,
    summary.nextLevelPoints - summary.totalPoints
  );
  const items: LevelItem[] = [
    { label: "自認タイプ登録", points: summary.selfTypePoints },
    { label: "他ユーザーへの他者診断", points: summary.votesGivenPoints },
    { label: "他者からの診断", points: summary.votesReceivedPoints },
    { label: "アンケート回答", points: summary.pollAnswerPoints },
    { label: "自分のアンケートへの回答", points: summary.pollReceivedPoints },
    { label: "紹介文の投稿", points: summary.introductionsWrittenPoints },
    { label: "紹介文を書いてもらう", points: summary.introductionsReceivedPoints }
  ];

  return (
    <section className="mt-4 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ringViolet">
            User Level
          </p>
          <h2 className="mt-1 text-2xl font-bold text-ink">
            Lv.{summary.level}
            <span className="ml-2 text-base font-semibold text-slate-500">
              {summary.totalPoints}pt
            </span>
          </h2>
        </div>
        <p className="text-sm font-semibold text-slate-500">
          次のLvまで {remainingPoints}pt
        </p>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-ringTeal to-ringViolet"
          style={{
            width: `${getProgressPercent(summary.totalPoints, summary.nextLevelPoints)}%`
          }}
        />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <div
            className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
            key={item.label}
          >
            <span className="text-slate-600">{item.label}</span>
            <span className="font-bold text-ink">{item.points}pt</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function getProgressPercent(totalPoints: number, nextLevelPoints: number) {
  const currentLevelStart = Math.max(0, nextLevelPoints - 50);
  const currentLevelPoints = Math.max(0, totalPoints - currentLevelStart);
  return Math.min(100, Math.round((currentLevelPoints / 50) * 100));
}
