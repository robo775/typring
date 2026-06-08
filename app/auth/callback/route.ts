import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ensureProfileForUser } from "@/lib/auth/profile";
import { getPublicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeNextPath(requestUrl.searchParams.get("next"));
  const isAvatarRefresh = requestUrl.searchParams.get("avatar_refresh") === "1";
  const redirectUrl = new URL(next, requestUrl.origin);

  if (next === "/me") {
    redirectUrl.searchParams.set("auth", "callback");
  }

  if (isAvatarRefresh) {
    redirectUrl.searchParams.set("avatar_refreshed", "1");
  }

  const redirectResponse = NextResponse.redirect(redirectUrl);
  type CookieOptions = Parameters<typeof redirectResponse.cookies.set>[2];
  type CookieToSet = {
    name: string;
    options?: CookieOptions;
    value: string;
  };

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=oauth_code_missing", requestUrl.origin)
    );
  }

  if (code) {
    const env = getPublicEnv();

    if (!env.supabaseUrl || !env.supabaseAnonKey) {
      return NextResponse.redirect(
        new URL("/login?error=Missing%20Supabase%20environment%20variables", requestUrl.origin)
      );
    }

    const supabase = createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, options, value }) => {
            request.cookies.set(name, value);
            redirectResponse.cookies.set(name, value, options);
          });
        }
      }
    });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
      );
    }

    const user = data.user ?? data.session?.user ?? null;

    if (!user) {
      return NextResponse.redirect(
        new URL("/login?error=session_user_missing", requestUrl.origin)
      );
    }

    try {
      await ensureProfileForUser(user);
    } catch (profileError) {
      const message =
        profileError instanceof Error
          ? profileError.message
          : "Failed to create profile";

      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(message)}`, requestUrl.origin)
      );
    }
  }

  return redirectResponse;
}

function getSafeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/me";
  }

  return value;
}
