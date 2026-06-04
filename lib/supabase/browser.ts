import { createBrowserClient } from "@supabase/ssr";
import { getPublicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

export function createSupabaseBrowserClient() {
  const env = getPublicEnv();

  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error("Missing Supabase public environment variables.");
  }

  return createBrowserClient<Database>(env.supabaseUrl, env.supabaseAnonKey);
}
