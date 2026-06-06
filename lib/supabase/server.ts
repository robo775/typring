import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPublicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

type SupabaseCookieToSet = {
  name: string;
  value: string;
  options?: Parameters<ReturnType<typeof cookies>["set"]>[2];
};

export function createSupabaseServerClient(): SupabaseClient<any> {
  const env = getPublicEnv();

  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error("Missing Supabase public environment variables.");
  }

  const cookieStore = cookies();

  return createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: SupabaseCookieToSet[]) {
        cookiesToSet.forEach(({ name, options, value }) => {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // Server components cannot set cookies. Route handlers and server actions can.
          }
        });
      }
    }
  }) as unknown as SupabaseClient<any>;
}
