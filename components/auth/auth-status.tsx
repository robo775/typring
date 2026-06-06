import Link from "next/link";
import { signOut } from "@/lib/auth/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function AuthStatus() {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return (
        <Link
          className="rounded-full bg-ink px-3 py-2 text-sm font-semibold text-white"
          href="/login"
        >
          ログイン
        </Link>
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    return (
      <div className="flex items-center gap-2">
        {profile?.is_admin ? (
          <Link
            className="rounded-full border border-violet-200 bg-white px-3 py-2 text-sm font-semibold text-ringViolet"
            href="/admin"
          >
            管理
          </Link>
        ) : null}
        <form action={signOut}>
          <button
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-ink"
            type="submit"
          >
            ログアウト
          </button>
        </form>
      </div>
    );
  } catch {
    return (
      <Link
        className="rounded-full bg-ink px-3 py-2 text-sm font-semibold text-white"
        href="/login"
      >
        ログイン
      </Link>
    );
  }
}
