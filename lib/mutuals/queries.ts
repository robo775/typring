import { createSupabaseServerClient } from "@/lib/supabase/server";

type Supabase = ReturnType<typeof createSupabaseServerClient>;

type MutualProfileIdRow = {
  mutual_user_id: string;
};

export async function getMutualProfileIds(supabase: Supabase, userId: string) {
  const { data } = await supabase.rpc("get_x_mutual_profile_ids", {
    p_user_id: userId
  });

  return ((data ?? []) as MutualProfileIdRow[]).map((row) => row.mutual_user_id);
}

export async function getMutualProfiles(supabase: Supabase, userId: string) {
  const mutualProfileIds = await getMutualProfileIds(supabase, userId);

  if (mutualProfileIds.length === 0) {
    return [];
  }

  const { data } = await supabase
    .from("profiles")
    .select("id,avatar_url,bio,display_name,twitter_handle")
    .in("id", mutualProfileIds)
    .not("twitter_handle", "is", null)
    .order("display_name", { ascending: true });

  return data ?? [];
}

export async function isMutualWithProfile({
  supabase,
  targetUserId,
  viewerUserId
}: {
  supabase: Supabase;
  targetUserId: string;
  viewerUserId: string;
}) {
  if (viewerUserId === targetUserId) {
    return false;
  }

  const { data } = await supabase.rpc("is_x_mutual", {
    p_target_user_id: targetUserId,
    p_viewer_user_id: viewerUserId
  });

  return data ?? false;
}

export async function getProfileTypesForUsers(
  supabase: Supabase,
  userIds: string[]
) {
  if (userIds.length === 0) {
    return new Map<string, { system: string; value: string }[]>();
  }

  const { data: userTypes } = await supabase
    .from("user_types")
    .select("user_id,type_system_id,type_value_id")
    .in("user_id", userIds);

  const rows = userTypes ?? [];
  const typeSystemIds = Array.from(new Set(rows.map((row) => row.type_system_id)));
  const typeValueIds = Array.from(new Set(rows.map((row) => row.type_value_id)));
  const typeSystemResult =
    typeSystemIds.length > 0
      ? await supabase.from("type_systems").select("id,name").in("id", typeSystemIds)
      : { data: [] };
  const typeValueResult =
    typeValueIds.length > 0
      ? await supabase.from("type_values").select("id,code,name").in("id", typeValueIds)
      : { data: [] };
  const typeSystems = typeSystemResult.data ?? [];
  const typeValues = typeValueResult.data ?? [];
  const profileTypesByUserId = new Map<string, { system: string; value: string }[]>();

  for (const row of rows) {
    const system = typeSystems.find((typeSystem) => typeSystem.id === row.type_system_id);
    const value = typeValues.find((typeValue) => typeValue.id === row.type_value_id);

    if (!system || !value) {
      continue;
    }

    const profileTypes = profileTypesByUserId.get(row.user_id) ?? [];
    profileTypes.push({
      system: system.name,
      value: value.name || value.code
    });
    profileTypesByUserId.set(row.user_id, profileTypes);
  }

  return profileTypesByUserId;
}
