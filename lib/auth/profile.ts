import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
type TypedSupabaseClient = SupabaseClient<Database>;

export function getTwitterProfileFromUser(user: User): ProfileInsert {
  const metadata = user.user_metadata ?? {};
  const identities = user.identities ?? [];
  const twitterIdentity = identities.find(
    (identity) => identity.provider === "twitter"
  );
  const identityData = twitterIdentity?.identity_data ?? {};

  const handle =
    asString(metadata.user_name) ??
    asString(metadata.preferred_username) ??
    asString(metadata.screen_name) ??
    asString(identityData.user_name) ??
    asString(identityData.preferred_username) ??
    asString(identityData.screen_name);

  const displayName =
    asString(metadata.full_name) ??
    asString(metadata.name) ??
    asString(identityData.full_name) ??
    asString(identityData.name) ??
    handle ??
    "Typring user";

  return {
    avatar_url:
      asString(metadata.avatar_url) ??
      asString(metadata.picture) ??
      asString(identityData.avatar_url) ??
      asString(identityData.picture),
    display_name: displayName,
    id: user.id,
    twitter_handle: normalizeHandle(handle),
    twitter_id:
      asString(metadata.provider_id) ??
      asString(metadata.sub) ??
      asString(identityData.provider_id) ??
      asString(identityData.sub) ??
      twitterIdentity?.id ??
      null
  };
}

export async function ensureProfileForUser(user: User) {
  const supabase: TypedSupabaseClient = createSupabaseAdminClient();
  const profile = getTwitterProfileFromUser(user);
  const { data: existingProfile, error: selectError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) {
    throw new Error(`Failed to read profile: ${selectError.message}`);
  }

  if (!existingProfile) {
    const { error } = await supabase.from("profiles").insert(profile);

    if (error) {
      throw new Error(`Failed to create profile: ${error.message}`);
    }

    await syncTwitterSocialAccount(supabase, profile);
    return;
  }

  const updateProfile: ProfileUpdate = {};

  if (profile.avatar_url) {
    updateProfile.avatar_url = profile.avatar_url;
  }

  if (profile.twitter_handle) {
    updateProfile.twitter_handle = profile.twitter_handle;
  }

  if (profile.twitter_id) {
    updateProfile.twitter_id = profile.twitter_id;
  }

  if (Object.keys(updateProfile).length === 0) {
    await syncTwitterSocialAccount(supabase, profile);
    return;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updateProfile)
    .eq("id", user.id);

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  await syncTwitterSocialAccount(supabase, profile);
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function normalizeHandle(handle: string | null) {
  return handle?.replace(/^@/, "").toLowerCase() ?? null;
}

async function syncTwitterSocialAccount(
  supabase: TypedSupabaseClient,
  profile: ProfileInsert
) {
  if (!profile.twitter_id || !profile.twitter_handle) {
    return;
  }

  const { error } = await supabase.from("social_accounts").upsert(
    {
      avatar_url: profile.avatar_url,
      handle: profile.twitter_handle,
      provider: "twitter",
      provider_user_id: profile.twitter_id,
      user_id: profile.id
    },
    {
      onConflict: "provider,user_id"
    }
  );

  if (error) {
    throw new Error(`Failed to sync social account: ${error.message}`);
  }
}
