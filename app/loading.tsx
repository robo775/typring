export default function Loading() {
  return (
    <div className="mx-auto flex max-w-6xl px-4 py-8">
      <div className="w-full rounded-2xl border border-white bg-white/80 p-5 shadow-sm">
        <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-4 h-8 w-2/3 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-6 grid gap-3">
          <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

