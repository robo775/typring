import { AtSign, ExternalLink } from "lucide-react";
import { TypeTag } from "@/components/types/type-tag";
import { cn } from "@/lib/utils/cn";

type ProfileType = {
  system: string;
  value: string;
};

type ProfileCardProps = {
  avatarUrl: string | null;
  bio: string;
  className?: string;
  displayName: string;
  handle: string;
  showVotedTypes?: boolean;
  types: ProfileType[];
  votedTypes?: ProfileType[];
};

export function ProfileCard({
  avatarUrl,
  bio,
  className,
  displayName,
  handle,
  showVotedTypes = false,
  types,
  votedTypes = []
}: ProfileCardProps) {
  const normalizedHandle = handle.replace(/^@/, "");
  const canLinkToX = /^[A-Za-z0-9_]{1,15}$/.test(normalizedHandle);

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-white bg-white shadow-soft",
        className
      )}
    >
      <div className="bg-gradient-to-br from-ringTeal via-ringBlue to-ringViolet p-5 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/80 bg-white/20 text-xl font-bold">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                className="h-full w-full object-cover"
                src={avatarUrl}
              />
            ) : (
              displayName.slice(0, 1).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold">{displayName}</h2>
            {canLinkToX ? (
              <a
                className="mt-1 flex items-center gap-1 text-sm text-white/82 underline-offset-4 hover:underline"
                href={`https://x.com/${normalizedHandle}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <AtSign className="h-3.5 w-3.5" />
                <span className="truncate">{normalizedHandle}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </a>
            ) : (
              <p className="mt-1 flex items-center gap-1 text-sm text-white/82">
                <AtSign className="h-3.5 w-3.5" />
                <span className="truncate">{handle}</span>
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-4 p-5">
        <p className="text-sm leading-6 text-slate-600">{bio}</p>
        <TypeSection
          emptyText="自認タイプはまだ登録されていません。"
          label="自認"
          types={types}
        />
        {showVotedTypes ? (
          <TypeSection
            emptyText="他者診断はまだ集まっていません。"
            label="他者診断 1位"
            muted
            types={votedTypes}
          />
        ) : null}
      </div>
    </article>
  );
}

function TypeSection({
  emptyText,
  label,
  muted = false,
  types
}: {
  emptyText: string;
  label: string;
  muted?: boolean;
  types: ProfileType[];
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-slate-400">{label}</p>
      {types.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {types.map((type) => (
            <TypeTag
              key={`${label}-${type.system}-${type.value}`}
              system={type.system}
              value={type.value}
              variant={muted ? "voted" : "self"}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
          {emptyText}
        </p>
      )}
    </div>
  );
}
