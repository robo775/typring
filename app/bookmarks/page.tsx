import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileCard } from "@/components/profiles/profile-card";
import { SectionHeader } from "@/components/ui/section-header";
import { getUserLevelSummaries } from "@/lib/levels/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTopVotedTypesForUsers } from "@/lib/votes/queries";

type BookmarkRow = {
  created_at: string;
  target_user_id: string;
};

type ProfileResult = {
  allow_external_typing?: boolean;
  avatar_url: string | null;
  bio: string | null;
  display_name: string;
  id: string;
  twitter_handle: string | null;
};

type ProfileTypeWithPosition = {
  position: number;
  system: string;
  value: string;
  valuePosition: number;
};

export default async function BookmarksPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/bookmarks");
  }

  const { data: bookmarkRows } = await supabase
    .from("profile_bookmarks")
    .select("target_user_id,created_at")
    .eq("viewer_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);
  const bookmarks = (bookmarkRows ?? []) as BookmarkRow[];
  const targetUserIds = bookmarks.map((bookmark) => bookmark.target_user_id);
  const profileOrder = new Map(
    bookmarks.map((bookmark, index) => [bookmark.target_user_id, index])
  );
  const { data: profileRows } =
    targetUserIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id,allow_external_typing,avatar_url,bio,display_name,twitter_handle")
          .in("id", targetUserIds)
      : { data: [] };
  const profiles = ((profileRows ?? []) as ProfileResult[]).sort(
    (a, b) => (profileOrder.get(a.id) ?? 0) - (profileOrder.get(b.id) ?? 0)
  );
  const userIds = profiles.map((profile) => profile.id);
  const profileTypesByUserId = await getProfileTypesByUserId(supabase, userIds);
  const votedTypesByUserId = await getTopVotedTypesForUsers(supabase, userIds);
  const levelSummariesByUserId = await getUserLevelSummaries(supabase, userIds);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <SectionHeader
        eyebrow="Bookmarks"
        title="ブックマーク"
        description="あとで見返したいプロフィールをまとめて確認できます。"
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
                levelSummary={levelSummariesByUserId.get(profile.id)}
                showVotedTypes={profile.allow_external_typing ?? true}
                types={profileTypesByUserId.get(profile.id) ?? []}
                votedTypes={
                  profile.allow_external_typing === false
                    ? []
                    : votedTypesByUserId.get(profile.id) ?? []
                }
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
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm leading-6 text-slate-500">
          まだブックマークしたプロフィールはありません。気になるユーザーのプロフィールページからブックマークできます。
        </div>
      )}
    </div>
  );
}

async function getProfileTypesByUserId(
  supabase: ReturnType<typeof createSupabaseServerClient>,
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
      ? await supabase
          .from("type_systems")
          .select("id,name,position")
          .in("id", typeSystemIds)
      : { data: [] };
  const typeValueResult =
    typeValueIds.length > 0
      ? await supabase
          .from("type_values")
          .select("id,code,name,position")
          .in("id", typeValueIds)
      : { data: [] };
  const typeSystems = typeSystemResult.data ?? [];
  const typeValues = typeValueResult.data ?? [];
  const profileTypesByUserId = new Map<string, ProfileTypeWithPosition[]>();

  for (const row of rows) {
    const system = typeSystems.find((typeSystem) => typeSystem.id === row.type_system_id);
    const value = typeValues.find((typeValue) => typeValue.id === row.type_value_id);

    if (!system || !value) {
      continue;
    }

    const profileTypes = profileTypesByUserId.get(row.user_id) ?? [];
    profileTypes.push({
      position: system.position ?? 0,
      system: system.name,
      value: value.name || value.code,
      valuePosition: value.position ?? 0
    });
    profileTypesByUserId.set(
      row.user_id,
      profileTypes.sort((a, b) => {
        if (a.position !== b.position) {
          return a.position - b.position;
        }

        return a.valuePosition - b.valuePosition;
      })
    );
  }

  return new Map(
    Array.from(profileTypesByUserId.entries()).map(([userId, profileTypes]) => [
      userId,
      profileTypes.map(({ system, value }) => ({ system, value }))
    ])
  );
}
