import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileCard } from "@/components/profiles/profile-card";
import { SectionHeader } from "@/components/ui/section-header";
import {
  getMutualProfiles,
  getProfileTypesForUsers
} from "@/lib/mutuals/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function MutualsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/mutuals");
  }

  const profiles = await getMutualProfiles(supabase, user.id);
  const profileTypesByUserId = await getProfileTypesForUsers(
    supabase,
    profiles.map((profile) => profile.id)
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <SectionHeader
        eyebrow="X相互"
        title="X相互ユーザー"
        description="キャッシュ済みのフォロー情報をもとに、Typring登録済みユーザーの相互フォローだけを表示します。"
      />
      {profiles.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {profiles.map((profile) => {
            const card = (
              <ProfileCard
                avatarUrl={profile.avatar_url}
                bio={profile.bio ?? "このユーザーはまだ自己紹介を書いていません。"}
                displayName={profile.display_name}
                handle={profile.twitter_handle ?? "unknown"}
                types={profileTypesByUserId.get(profile.id) ?? []}
              />
            );

            return profile.twitter_handle ? (
              <Link
                href={`/users/${encodeURIComponent(profile.twitter_handle)}`}
                key={profile.id}
              >
                {card}
              </Link>
            ) : (
              <div key={profile.id}>{card}</div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-sm leading-6 text-slate-500">
          キャッシュ済みのX相互ユーザーはまだありません。このページにはTypring登録済みユーザーだけが表示されます。
        </div>
      )}
    </div>
  );
}
