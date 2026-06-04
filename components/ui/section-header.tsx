type SectionHeaderProps = {
  description?: string;
  eyebrow?: string;
  title: string;
};

export function SectionHeader({
  description,
  eyebrow,
  title
}: SectionHeaderProps) {
  return (
    <div className="space-y-2">
      {eyebrow ? (
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-ringViolet">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        {title}
      </h1>
      {description ? (
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          {description}
        </p>
      ) : null}
    </div>
  );
}

