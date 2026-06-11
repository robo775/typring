"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function toggleProfileBookmark(formData: FormData) {
  const targetUserId = getString(formData, "target_user_id");
  const handle = getString(formData, "handle").replace(/^@/, "");
  const nextAction = getString(formData, "next_action");
  const profilePath = handle ? `/users/${encodeURIComponent(handle)}` : "/search";
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(profilePath)}`);
  }

  if (!targetUserId || targetUserId === user.id) {
    redirect(`${profilePath}?error=bookmark_not_allowed`);
  }

  if (nextAction === "remove") {
    await supabase
      .from("profile_bookmarks")
      .delete()
      .eq("viewer_user_id", user.id)
      .eq("target_user_id", targetUserId);
  } else {
    await supabase.from("profile_bookmarks").upsert({
      target_user_id: targetUserId,
      viewer_user_id: user.id
    });
  }

  revalidatePath(profilePath);
  revalidatePath("/bookmarks");
  redirect(
    `${profilePath}?bookmark=${nextAction === "remove" ? "removed" : "saved"}`
  );
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
