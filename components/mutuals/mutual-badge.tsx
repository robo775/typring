import { Link2 } from "lucide-react";

type MutualBadgeProps = {
  isMutual: boolean;
};

export function MutualBadge({ isMutual }: MutualBadgeProps) {
  if (!isMutual) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700">
      <Link2 className="h-4 w-4" />
      Xで相互フォローです
    </div>
  );
}
