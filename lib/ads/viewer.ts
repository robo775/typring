import { shouldShowAds } from "@/lib/ads/visibility";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAdVisibility(supabase: ReturnType<typeof createSupabaseServerClient>) {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return true;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .maybeSingle();

  return shouldShowAds(profile);
}

