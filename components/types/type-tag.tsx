type TypeTagProps = {
  system: string;
  value: string;
};

export function TypeTag({ system, value }: TypeTagProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-ink">
      <span className="text-slate-500">{system}</span>
      <span>{value}</span>
    </span>
  );
}

