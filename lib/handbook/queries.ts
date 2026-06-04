import { createSupabaseServerClient } from "@/lib/supabase/server";

type Supabase = ReturnType<typeof createSupabaseServerClient>;

export async function getActiveTypeSystems(supabase: Supabase) {
  const { data } = await supabase
    .from("type_systems")
    .select("id,code,name,description")
    .eq("is_active", true)
    .order("position", { ascending: true })
    .order("name", { ascending: true });

  return data ?? [];
}

export async function getTypeSystemByCode(supabase: Supabase, code: string) {
  const { data } = await supabase
    .from("type_systems")
    .select("id,code,name,description")
    .eq("code", code)
    .eq("is_active", true)
    .maybeSingle();

  return data;
}

export async function getActiveTypeValuesBySystemId(
  supabase: Supabase,
  typeSystemId: string
) {
  const { data } = await supabase
    .from("type_values")
    .select("id,type_system_id,code,name,description")
    .eq("type_system_id", typeSystemId)
    .eq("is_active", true)
    .order("position", { ascending: true })
    .order("name", { ascending: true });

  return data ?? [];
}

export async function getTypeValueBySystemAndCode({
  code,
  supabase,
  typeSystemId
}: {
  code: string;
  supabase: Supabase;
  typeSystemId: string;
}) {
  const { data } = await supabase
    .from("type_values")
    .select("id,type_system_id,code,name,description")
    .eq("type_system_id", typeSystemId)
    .eq("code", code)
    .eq("is_active", true)
    .maybeSingle();

  return data;
}

export async function getProfilesForTypeValue({
  supabase,
  typeSystemId,
  typeValueId
}: {
  supabase: Supabase;
  typeSystemId: string;
  typeValueId: string;
}) {
  const { data: userTypes } = await supabase
    .from("user_types")
    .select("user_id")
    .eq("type_system_id", typeSystemId)
    .eq("type_value_id", typeValueId)
    .limit(24);

  const userIds = (userTypes ?? []).map((userType) => userType.user_id);

  if (userIds.length === 0) {
    return [];
  }

  const { data } = await supabase
    .from("profiles")
    .select("id,avatar_url,bio,display_name,twitter_handle")
    .in("id", userIds)
    .not("twitter_handle", "is", null)
    .order("created_at", { ascending: false });

  return data ?? [];
}

