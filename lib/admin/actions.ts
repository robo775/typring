"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function grantAdminByHandle(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const adminUserId = await requireAdmin();
  const handle = normalizeHandle(getString(formData, "twitter_handle"));

  if (!handle) {
    redirect("/admin?error=admin_handle_required");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({ is_admin: true })
    .eq("twitter_handle", handle)
    .select("id")
    .maybeSingle();

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  if (!profile) {
    redirect("/admin?error=profile_not_found");
  }

  await logAdminAction({
    action: "grant_admin",
    adminUserId,
    targetId: profile.id,
    targetTable: "profiles"
  });
  revalidatePath("/admin");
  redirect("/admin?saved=1");
}

export async function saveTypeSystem(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const adminUserId = await requireAdmin();
  const id = getString(formData, "id");
  const code = normalizeCode(getString(formData, "code"));
  const name = getString(formData, "name");
  const description = getString(formData, "description") || null;
  const position = Number(getString(formData, "position") || 0);
  const isActive = formData.get("is_active") === "on";

  if (!code || !name) {
    redirect("/admin?error=type_system_required");
  }

  const payload = {
    code,
    description,
    is_active: isActive,
    name,
    position
  };
  const result = id
    ? await supabase.from("type_systems").update(payload).eq("id", id).select("id").single()
    : await supabase.from("type_systems").insert(payload).select("id").single();

  if (result.error) {
    redirect(`/admin?error=${encodeURIComponent(result.error.message)}`);
  }

  if (!result.data) {
    redirect("/admin?error=admin_save_failed");
  }

  await logAdminAction({
    action: id ? "update_type_system" : "create_type_system",
    adminUserId,
    targetId: result.data.id,
    targetTable: "type_systems"
  });
  revalidatePath("/admin");
  revalidatePath("/handbook");
  redirect("/admin?saved=1");
}

export async function saveTypeValue(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const adminUserId = await requireAdmin();
  const returnTo = getAdminReturnPath(getString(formData, "return_to"));
  const id = getString(formData, "id");
  const typeSystemId = getString(formData, "type_system_id");
  const code = getString(formData, "code");
  const name = getString(formData, "name");
  const description = getString(formData, "description") || null;
  const position = Number(getString(formData, "position") || 0);
  const isActive = formData.get("is_active") === "on";

  if (!typeSystemId || !code || !name) {
    redirect(withAdminMessage(returnTo, "error", "type_value_required"));
  }

  const payload = {
    code,
    description,
    is_active: isActive,
    name,
    position,
    type_system_id: typeSystemId
  };
  const result = id
    ? await supabase.from("type_values").update(payload).eq("id", id).select("id").single()
    : await supabase.from("type_values").insert(payload).select("id").single();

  if (result.error) {
    redirect(withAdminMessage(returnTo, "error", result.error.message));
  }

  if (!result.data) {
    redirect(withAdminMessage(returnTo, "error", "admin_save_failed"));
  }

  await logAdminAction({
    action: id ? "update_type_value" : "create_type_value",
    adminUserId,
    targetId: result.data.id,
    targetTable: "type_values"
  });
  revalidatePath("/admin");
  revalidatePath("/handbook");
  redirect(withAdminMessage(returnTo, "saved", "1"));
}

export async function saveFollowEdge(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const adminUserId = await requireAdmin();
  const followerHandle = normalizeHandle(getString(formData, "follower_handle"));
  const followingHandle = normalizeHandle(getString(formData, "following_handle"));

  if (!followerHandle || !followingHandle || followerHandle === followingHandle) {
    redirect("/admin?error=follow_edge_required");
  }

  const { data: accounts } = await supabase
    .from("social_accounts")
    .select("id,handle")
    .in("handle", [followerHandle, followingHandle]);
  const follower = (accounts ?? []).find((account) => account.handle === followerHandle);
  const following = (accounts ?? []).find((account) => account.handle === followingHandle);

  if (!follower || !following) {
    redirect("/admin?error=social_account_not_found");
  }

  const { error } = await supabase.from("x_follow_edges").upsert(
    {
      cached_at: new Date().toISOString(),
      follower_account_id: follower.id,
      following_account_id: following.id
    },
    {
      onConflict: "follower_account_id,following_account_id"
    }
  );

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  await logAdminAction({
    action: "cache_x_follow_edge",
    adminUserId,
    targetId: follower.id,
    targetTable: "x_follow_edges"
  });
  revalidatePath("/admin");
  revalidatePath("/mutuals");
  redirect("/admin?saved=1");
}

async function requireAdmin() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    redirect("/");
  }

  return user.id;
}

async function logAdminAction({
  action,
  adminUserId,
  targetId,
  targetTable
}: {
  action: string;
  adminUserId: string;
  targetId: string;
  targetTable: string;
}) {
  const supabase = createSupabaseServerClient();
  await supabase.from("admin_logs").insert({
    action,
    admin_user_id: adminUserId,
    target_id: targetId,
    target_table: targetTable
  });
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeCode(code: string) {
  return code.toLowerCase().replace(/[^a-z0-9_-]/g, "");
}

function normalizeHandle(handle: string) {
  return handle.replace(/^@/, "").toLowerCase();
}

function getAdminReturnPath(value: string) {
  if (!value || !value.startsWith("/admin") || value.startsWith("//")) {
    return "/admin";
  }

  return value;
}

function withAdminMessage(path: string, key: "error" | "saved", value: string) {
  const url = new URL(path, "http://localhost");
  url.searchParams.set(key, value);
  return `${url.pathname}${url.search}`;
}
