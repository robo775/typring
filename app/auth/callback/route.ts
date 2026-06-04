import { NextResponse, type NextRequest } from "next/server";
import { ensureProfileForUser } from "@/lib/auth/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeNextPath(requestUrl.searchParams.get("next"));

  if (code) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
      );
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
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
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}

function getSafeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/me";
  }

  return value;
}
