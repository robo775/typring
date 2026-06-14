import Link from "next/link";
import { DeleteAccountSection } from "@/components/account/delete-account-section";
import {
  MyWrittenIntroductions,
  type WrittenIntroductionItem
} from "@/components/introductions/my-written-introductions";
import { UserLevelPanel } from "@/components/levels/user-level-panel";
import { AvatarRefreshForm } from "@/components/profiles/avatar-refresh-form";
import { ProfileCard } from "@/components/profiles/profile-card";
import { ProfileEditForm } from "@/components/profiles/profile-edit-form";
import { SectionHeader } from "@/components/ui/section-header";
import { ensureProfileForUser } from "@/lib/auth/profile";
import { getUserLevelSummary } from "@/lib/levels/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTopVotedTypesForUser } from "@/lib/votes/queries";

export default async function MePage({
  searchParams
}: {
  searchParams?: {
    avatar_refreshed?: string;
    error?: string;
    introPage?: string;
    saved?: string;
  };
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md flex-col justify-center px-4 py-12">
        <section className="rounded-2xl border border-white bg-white/88 p-6 shadow-soft">
          <SectionHeader
            eyebrow="マイページ"
            title="ログインが必要です"
            description="プロフィールカードを作成・編集するには、Xアカウントでログインしてください。"
          />
          <Link
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            href="/login?next=/me"
          >
            Xでログイン
          </Link>
        </section>
      </div>
    );
  }

  await ensureProfileForUser(user);

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url,bio,display_name,twitter_handle")
    .eq("id", user.id)
    .single();
  const { data: visibilitySettings } = await supabase
    .from("profiles")
    .select("allow_external_typing")
    .eq("id", user.id)
    .maybeSingle();
  const { data: typeSystemRows } = await supabase
    .from("type_systems")
    .select("id,code,name")
    .eq("is_active", true)
    .order("position", { ascending: true })
    .order("name", { ascending: true });
  const { data: typeValueRows } = await supabase
    .from("type_values")
    .select("id,type_system_id,code,name")
    .eq("is_active", true)
    .order("position", { ascending: true })
    .order("name", { ascending: true });
  const { data: userTypeRows } = await supabase
    .from("user_types")
    .select("type_system_id,type_value_id")
    .eq("user_id", user.id);

  const typeSystems = typeSystemRows ?? [];
  const typeValues = typeValueRows ?? [];
  const userTypes = userTypeRows ?? [];
  const displayName = profile?.display_name ?? "Typring user";
  const handle = profile?.twitter_handle ?? "unknown";
  const bio = profile?.bio ?? "";
  const currentTypeValueIds = new Map(
    userTypes.map((userType) => [userType.type_system_id, userType.type_value_id])
  );
  const previewTypes = typeSystems
    .map((system) => {
      const userType = userTypes.find(
        (type) => type.type_system_id === system.id
      );

      if (!userType) {
        return null;
      }

      const value = typeValues.find(
        (typeValue) => typeValue.id === userType.type_value_id
      );

      if (!value) {
        return null;
      }

      return {
        system: system.name,
        value: value.name || value.code
      };
    })
    .filter((type): type is { system: string; value: string } => type !== null);
  const votedTypes = await getTopVotedTypesForUser(supabase, user.id);
  const levelSummary = await getUserLevelSummary(supabase, user.id);
  const showExternalTyping = visibilitySettings?.allow_external_typing ?? true;
  const visibleVotedTypes = showExternalTyping ? votedTypes : [];
  const introductionPage = getPageNumber(searchParams?.introPage);
  const introductionPageSize = 10;
  const introductionFrom = (introductionPage - 1) * introductionPageSize;
  const introductionTo = introductionFrom + introductionPageSize;
  const {
    data: writtenIntroductionRows,
    error: writtenIntroductionError
  } = await supabase
    .from("profile_introductions")
    .select("id,body,created_at,updated_at,target_profile:profiles!profile_introductions_target_user_id_fkey(display_name,twitter_handle,avatar_url)")
    .eq("author_user_id", user.id)
    .order("updated_at", { ascending: false })
    .order("created_at", { ascending: false })
    .range(introductionFrom, introductionTo);
  const writtenIntroductionItems = (
    (writtenIntroductionRows ?? []) as unknown as Array<
      Omit<WrittenIntroductionItem, "target_profile"> & {
        target_profile:
          | WrittenIntroductionItem["target_profile"]
          | WrittenIntroductionItem["target_profile"][];
      }
    >
  ).map((introduction) => ({
    ...introduction,
    target_profile: Array.isArray(introduction.target_profile)
      ? introduction.target_profile[0] ?? null
      : introduction.target_profile
  }));
  const hasNextIntroductionPage =
    writtenIntroductionItems.length > introductionPageSize;
  const visibleWrittenIntroductions = writtenIntroductionItems.slice(
    0,
    introductionPageSize
  );

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
          <SectionHeader
            eyebrow="マイページ"
            title="プロフィール編集"
            description="表示名、自己紹介、自認タイプを編集できます。保存した内容はプロフィールカードに反映されます。"
          />
          {searchParams?.saved ? (
            <p className="mt-4 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-700">
              保存しました。
            </p>
          ) : null}
          {searchParams?.avatar_refreshed ? (
            <p className="mt-4 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-700">
              Xアイコンを再取得しました。
            </p>
          ) : null}
          {searchParams?.error ? (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {searchParams.error}
            </p>
          ) : null}
          {profile?.twitter_handle ? (
            <Link
              className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-ringTeal bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-teal-50 sm:w-auto"
              href={`/users/${encodeURIComponent(profile.twitter_handle)}`}
            >
              自分のプロフィールを見る
            </Link>
          ) : null}
          <AvatarRefreshForm />
          <UserLevelPanel summary={levelSummary} />
          <ProfileEditForm
            allowExternalTyping={visibilitySettings?.allow_external_typing ?? true}
            bio={bio}
            currentTypeValueIds={currentTypeValueIds}
            displayName={displayName}
            typeSystems={typeSystems}
            typeValues={typeValues}
          />
        </section>
        <MyWrittenIntroductions
          currentPage={introductionPage}
          hasError={Boolean(writtenIntroductionError)}
          hasNextPage={hasNextIntroductionPage}
          introductions={visibleWrittenIntroductions}
        />
        <DeleteAccountSection />
      </div>
      <ProfileCard
        avatarUrl={profile?.avatar_url ?? null}
        bio={bio || "自己紹介はまだ設定されていません。"}
        displayName={displayName}
        handle={handle}
        levelSummary={levelSummary}
        showVotedTypes={showExternalTyping}
        types={previewTypes}
        votedTypes={visibleVotedTypes}
      />
    </div>
  );
}

function getPageNumber(value: string | undefined) {
  const page = Number(value);

  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return page;
}
