"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function submitTypeVotes(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const handle = getString(formData, "handle");
  const targetUserId = getString(formData, "target_user_id");

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/users/${handle}`)}`);
  }

  if (!targetUserId || !handle) {
    redirect("/search");
  }

  if (user.id === targetUserId) {
    redirect(`/users/${handle}?error=self_vote_not_allowed`);
  }

  const selections = Array.from(formData.entries())
    .filter(([key]) => key.startsWith("vote:"))
    .map(([key, value]) => ({
      typeSystemId: key.replace("vote:", ""),
      typeValueId: typeof value === "string" ? value : ""
    }))
    .filter((selection) => selection.typeSystemId);

  for (const selection of selections) {
    if (!selection.typeValueId) {
      const { error } = await supabase
        .from("type_votes")
        .delete()
        .eq("target_user_id", targetUserId)
        .eq("voter_user_id", user.id)
        .eq("type_system_id", selection.typeSystemId);

      if (error) {
        redirect(`/users/${handle}?error=${encodeURIComponent(error.message)}`);
      }

      continue;
    }

    const { error } = await supabase.from("type_votes").upsert(
      {
        target_user_id: targetUserId,
        type_system_id: selection.typeSystemId,
        type_value_id: selection.typeValueId,
        voter_user_id: user.id
      },
      {
        onConflict: "target_user_id,voter_user_id,type_system_id"
      }
    );

    if (error) {
      redirect(`/users/${handle}?error=${encodeURIComponent(error.message)}`);
    }
  }

  revalidatePath(`/users/${handle}`);
  redirect(`/users/${handle}?voted=1`);
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
