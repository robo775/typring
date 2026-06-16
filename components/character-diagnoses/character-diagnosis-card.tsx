import { Sparkles } from "lucide-react";
import { TypeTag } from "@/components/types/type-tag";
import { cn } from "@/lib/utils/cn";

type CharacterTopType = {
  system: string;
  value: string;
};

type CharacterDiagnosisCardProps = {
  characterName: string;
  className?: string;
  description?: string | null;
  imageUrl: string | null;
  topTypes: CharacterTopType[];
  voteCount?: number;
  workTitle: string | null;
};

export function CharacterDiagnosisCard({
  characterName,
  className,
  description,
  imageUrl,
  topTypes,
  voteCount,
  workTitle
}: CharacterDiagnosisCardProps) {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-white bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg",
        className
      )}
    >
      <div className="bg-gradient-to-br from-ringTeal via-ringBlue to-ringViolet p-5 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/80 bg-white/20 text-xl font-bold">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" className="h-full w-full object-cover" src={imageUrl} />
            ) : (
              <Sparkles className="h-7 w-7" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white/80">
              {workTitle ?? "作品名未設定"}
            </p>
            <h2 className="truncate text-xl font-bold">{characterName}</h2>
          </div>
        </div>
      </div>
      <div className="space-y-4 p-5">
        {description ? (
          <p className="line-clamp-3 text-sm leading-6 text-slate-600">
            {description}
          </p>
        ) : null}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold text-slate-400">他者診断 1位</p>
            {typeof voteCount === "number" ? (
              <p className="text-xs font-bold text-slate-400">{voteCount}票</p>
            ) : null}
          </div>
          {topTypes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {topTypes.map((type) => (
                <TypeTag
                  key={`${type.system}-${type.value}`}
                  system={type.system}
                  value={type.value}
                  variant="voted"
                />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
              まだ投票が集まっていません。
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
