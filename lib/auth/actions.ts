"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signInWithTwitter(formData?: FormData) {
  const supabase = createSupabaseServerClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const next = getSafeNextPath(formData?.get("next"));

  const { data, error } = await supabase.auth.signInWithOAuth({
    options: {
      redirectTo: `${appUrl}/auth/callback?next=${encodeURIComponent(next)}`
    },
    provider: "twitter"
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  if (data.url) {
    redirect(data.url);
  }

  redirect("/login?error=oauth_url_missing");
}

export async function signOut() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

function getSafeNextPath(value: FormDataEntryValue | null | undefined) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/me";
  }

  return value;
}
