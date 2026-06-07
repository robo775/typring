"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function updateMyProfile(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const displayName = getString(formData, "display_name");
  const bio = getString(formData, "bio");
  const allowExternalTyping = formData.get("allow_external_typing") === "on";

  if (!displayName) {
    redirect("/me?error=display_name_required");
  }

  if (displayName.length > 80) {
    redirect("/me?error=display_name_too_long");
  }

  if (bio.length > 500) {
    redirect("/me?error=bio_too_long");
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("twitter_handle")
    .eq("id", user.id)
    .maybeSingle();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      allow_external_typing: allowExternalTyping,
      bio,
      display_name: displayName
    })
    .eq("id", user.id);

  if (profileError) {
    redirect(`/me?error=${encodeURIComponent(profileError.message)}`);
  }

  const typeSelections = Array.from(formData.entries())
    .filter(([key]) => key.startsWith("type:"))
    .map(([key, value]) => ({
      typeSystemId: key.replace("type:", ""),
      typeValueId: typeof value === "string" ? value : ""
    }));

  for (const selection of typeSelections) {
    if (!selection.typeSystemId) {
      continue;
    }

    if (!selection.typeValueId) {
      const { error } = await supabase
        .from("user_types")
        .delete()
        .eq("user_id", user.id)
        .eq("type_system_id", selection.typeSystemId);

      if (error) {
        redirect(`/me?error=${encodeURIComponent(error.message)}`);
      }

      continue;
    }

    const { error } = await supabase.from("user_types").upsert(
      {
        type_system_id: selection.typeSystemId,
        type_value_id: selection.typeValueId,
        user_id: user.id
      },
      {
        onConflict: "user_id,type_system_id"
      }
    );

    if (error) {
      redirect(`/me?error=${encodeURIComponent(error.message)}`);
    }
  }

  revalidatePath("/me");
  if (existingProfile?.twitter_handle) {
    revalidatePath(`/users/${existingProfile.twitter_handle}`);
  }

  redirect("/me?saved=1");
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
