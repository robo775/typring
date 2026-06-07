"use server";

import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function deleteMyAccount(formData: FormData) {
  const confirmation = getString(formData, "confirmation");

  if (confirmation !== "削除") {
    redirect("/me?error=delete_confirmation_mismatch");
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/me");
  }

  let adminSupabase: ReturnType<typeof createSupabaseAdminClient>;

  try {
    adminSupabase = createSupabaseAdminClient();
  } catch {
    redirect("/me?error=account_delete_not_configured");
  }

  const { error } = await adminSupabase.auth.admin.deleteUser(user.id);

  if (error) {
    redirect(`/me?error=${encodeURIComponent(error.message)}`);
  }

  await supabase.auth.signOut();
  redirect("/?account_deleted=1");
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
