"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function saveProfileIntroduction(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const handle = getString(formData, "handle");
  const targetUserId = getString(formData, "target_user_id");
  const body = getString(formData, "body");

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/users/${handle}`)}`);
  }

  if (!handle || !targetUserId) {
    redirect("/search");
  }

  if (user.id === targetUserId) {
    redirect(`/users/${handle}?error=introduction_self_not_allowed`);
  }

  if (!body) {
    redirect(`/users/${handle}?error=introduction_body_required`);
  }

  if (body.length > 300) {
    redirect(`/users/${handle}?error=introduction_body_too_long`);
  }

  const { error } = await supabase.from("profile_introductions").upsert(
    {
      author_user_id: user.id,
      body,
      target_user_id: targetUserId
    },
    {
      onConflict: "target_user_id,author_user_id"
    }
  );

  if (error) {
    redirect(`/users/${handle}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/users/${handle}`);
  redirect(`/users/${handle}?introduced=1`);
}

export async function deleteProfileIntroduction(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const handle = getString(formData, "handle");
  const introductionId = getString(formData, "introduction_id");

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/users/${handle}`)}`);
  }

  if (!handle || !introductionId) {
    redirect("/search");
  }

  const { error } = await supabase
    .from("profile_introductions")
    .delete()
    .eq("id", introductionId)
    .eq("author_user_id", user.id);

  if (error) {
    redirect(`/users/${handle}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/users/${handle}`);
  redirect(`/users/${handle}?introduction_deleted=1`);
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
