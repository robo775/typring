type TypeTagProps = {
  system: string;
  value: string;
  variant?: "self" | "voted";
};

export function TypeTag({ system, value, variant = "self" }: TypeTagProps) {
  return (
    <span
      className={
        variant === "voted"
          ? "inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-900"
          : "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-ink"
      }
    >
      <span className={variant === "voted" ? "text-violet-500" : "text-slate-500"}>
        {system}
      </span>
      <span>{value}</span>
    </span>
  );
}
