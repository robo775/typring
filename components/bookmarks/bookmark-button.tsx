import { Bookmark, BookmarkCheck } from "lucide-react";
import { toggleProfileBookmark } from "@/lib/bookmarks/actions";

type BookmarkButtonProps = {
  handle: string;
  isBookmarked: boolean;
  isLoggedIn: boolean;
  isOwnProfile: boolean;
  targetUserId: string;
};

export function BookmarkButton({
  handle,
  isBookmarked,
  isLoggedIn,
  isOwnProfile,
  targetUserId
}: BookmarkButtonProps) {
  if (isOwnProfile) {
    return null;
  }

  return (
    <form action={toggleProfileBookmark}>
      <input name="target_user_id" type="hidden" value={targetUserId} />
      <input name="handle" type="hidden" value={handle} />
      <input
        name="next_action"
        type="hidden"
        value={isBookmarked ? "remove" : "add"}
      />
      <button
        className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold shadow-sm transition hover:-translate-y-0.5 sm:w-auto ${
          isBookmarked
            ? "border border-ringViolet bg-white text-ringViolet"
            : "bg-ink text-white"
        }`}
        type="submit"
      >
        {isBookmarked ? (
          <BookmarkCheck className="h-4 w-4" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
        {isLoggedIn
          ? isBookmarked
            ? "ブックマーク解除"
            : "ブックマーク"
          : "ログインしてブックマーク"}
      </button>
    </form>
  );
}
