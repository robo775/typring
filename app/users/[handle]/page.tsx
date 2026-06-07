import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AdSlot } from "@/components/ads/ad-slot";
import { CompatibilityPanel } from "@/components/compatibility/compatibility-panel";
import { ProfileIntroductions } from "@/components/introductions/profile-introductions";
import { MutualBadge } from "@/components/mutuals/mutual-badge";
import { ProfileCard } from "@/components/profiles/profile-card";
import { ProfileShareActions } from "@/components/profiles/profile-share-actions";
import { SectionHeader } from "@/components/ui/section-header";
import { TypeVoteForm } from "@/components/votes/type-vote-form";
import { TypeVoteSummary } from "@/components/votes/type-vote-summary";
import { getAdVisibility } from "@/lib/ads/viewer";
import { isMutualWithProfile } from "@/lib/mutuals/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type UserTypeRow = {
  type_system_id: string;
  type_value_id: string;
};

type VoteSummaryRow = {
  total_count: number;
  type_system_id: string;
  type_value_id: string;
  vote_count: number;
};

type IntroductionRow = {
  author:
    | {
        display_name: string;
        twitter_handle: string | null;
      }
    | {
        display_name: string;
        twitter_handle: string | null;
      }[]
    | null;
  author_user_id: string;
  body: string;
  created_at: string;
  id: string;
  updated_at: string;
};

export default async function UserProfilePage({
  params,
  searchParams
}: {
  params: { handle: string };
  searchParams?: {
    error?: string;
    introduction_deleted?: string;
    introduced?: string;
    voted?: string;
  };
}) {
  const supabase = createSupabaseServerClient();
  const handle = params.handle.replace(/^@/, "").toLowerCase();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,avatar_url,bio,display_name,twitter_handle")
    .eq("twitter_handle", handle)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  const { data: visibilitySettings } = await supabase
    .from("profiles")
    .select("allow_external_typing")
    .eq("id", profile.id)
    .maybeSingle();

  const { data: userTypeRows } = await supabase
    .from("user_types")
    .select("type_system_id,type_value_id")
    .eq("user_id", profile.id);
  const userTypes = (userTypeRows ?? []) as UserTypeRow[];

  const { data: activeTypeSystemRows } = await supabase
    .from("type_systems")
    .select("id,code,name")
    .eq("is_active", true)
    .order("position", { ascending: true })
    .order("name", { ascending: true });

  const { data: activeTypeValueRows } = await supabase
    .from("type_values")
    .select("id,type_system_id,code,name")
    .eq("is_active", true)
    .order("position", { ascending: true })
    .order("name", { ascending: true });

  const activeTypeSystems = activeTypeSystemRows ?? [];
  const activeTypeValues = activeTypeValueRows ?? [];
  const typeSystemIds = userTypes.map((userType) => userType.type_system_id);
  const typeValueIds = userTypes.map((userType) => userType.type_value_id);

  const typeSystemResult =
    typeSystemIds.length > 0
      ? await supabase.from("type_systems").select("id,name").in("id", typeSystemIds)
      : { data: [] };
  const typeValueResult =
    typeValueIds.length > 0
      ? await supabase.from("type_values").select("id,code,name").in("id", typeValueIds)
      : { data: [] };

  const typeSystems = typeSystemResult.data ?? [];
  const typeValues = typeValueResult.data ?? [];
  const profileTypes = userTypes
    .map((userType) => {
      const system = typeSystems.find(
        (typeSystem) => typeSystem.id === userType.type_system_id
      );
      const value = typeValues.find(
        (typeValue) => typeValue.id === userType.type_value_id
      );

      if (!system || !value) {
        return null;
      }

      return {
        system: system.name,
        value: value.name || value.code
      };
    })
    .filter((type): type is { system: string; value: string } => type !== null);

  const { data: voteSummaryRows } = await supabase.rpc("get_type_vote_summary", {
    p_target_user_id: profile.id
  });
  const { data: ownVoteRows } =
    user && user.id !== profile.id
      ? await supabase
          .from("type_votes")
          .select("type_system_id,type_value_id")
          .eq("target_user_id", profile.id)
          .eq("voter_user_id", user.id)
      : { data: [] };
  const currentVoteValueIds = new Map(
    ((ownVoteRows ?? []) as UserTypeRow[]).map((vote) => [
      vote.type_system_id,
      vote.type_value_id
    ])
  );
  const voteSummaryItems = ((voteSummaryRows ?? []) as VoteSummaryRow[])
    .map((vote) => {
      const system = activeTypeSystems.find(
        (typeSystem) => typeSystem.id === vote.type_system_id
      );
      const value = activeTypeValues.find(
        (typeValue) => typeValue.id === vote.type_value_id
      );

      if (!system || !value || vote.total_count === 0) {
        return null;
      }

      return {
        percentage: Math.round((vote.vote_count / vote.total_count) * 100),
        system: system.name,
        totalCount: vote.total_count,
        value: value.name || value.code,
        voteCount: vote.vote_count
      };
    })
    .filter(
      (item): item is {
        percentage: number;
        system: string;
        totalCount: number;
        value: string;
        voteCount: number;
      } => item !== null
    );

  const { data: introductionRows } = await supabase
    .from("profile_introductions")
    .select("id,author_user_id,body,created_at,updated_at,author:profiles!profile_introductions_author_user_id_fkey(display_name,twitter_handle)")
    .eq("target_user_id", profile.id)
    .order("updated_at", { ascending: false });
  const introductions = ((introductionRows ?? []) as unknown as IntroductionRow[]).map(
    (introduction) => ({
      author: Array.isArray(introduction.author)
        ? introduction.author[0] ?? null
        : introduction.author,
      author_user_id: introduction.author_user_id,
      body: introduction.body,
      created_at: introduction.created_at,
      id: introduction.id,
      updated_at: introduction.updated_at
    })
  );

  const showAds = await getAdVisibility(supabase);
  const showExternalTyping = visibilitySettings?.allow_external_typing ?? true;
  const showAiCompatibility =
    process.env.NEXT_PUBLIC_ENABLE_AI_COMPATIBILITY === "true";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const profileUrl = `${appUrl.replace(/\/$/, "")}/users/${profile.twitter_handle ?? handle}`;
  const isMutual =
    user && user.id !== profile.id
      ? await isMutualWithProfile({
          supabase,
          targetUserId: profile.id,
          viewerUserId: user.id
        })
      : false;
  const { data: latestCompatibility } =
    showAiCompatibility && user && user.id !== profile.id
      ? await supabase
          .from("compatibility_results")
          .select("result_text")
          .eq("requester_user_id", user.id)
          .eq("target_user_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      : { data: null };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[380px_1fr]">
      <ProfileCard
        avatarUrl={profile.avatar_url}
        bio={profile.bio ?? "このユーザーはまだ自己紹介を書いていません。"}
        displayName={profile.display_name}
        handle={profile.twitter_handle ?? handle}
        types={profileTypes}
      />
      <div className="lg:hidden">
        <AdSlot
          className="lg:hidden"
          label="プロフィール広告枠"
          show={showAds}
          slot={process.env.NEXT_PUBLIC_ADSENSE_PROFILE_SLOT}
        />
      </div>
      <section className="space-y-4">
        <MutualBadge isMutual={Boolean(isMutual)} />
        <ProfileShareActions
          displayName={profile.display_name}
          profileUrl={profileUrl}
          types={profileTypes}
        />
        {searchParams?.voted ? (
          <StatusMessage>投票を保存しました。</StatusMessage>
        ) : null}
        {searchParams?.introduced ? (
          <StatusMessage>紹介文を保存しました。</StatusMessage>
        ) : null}
        {searchParams?.introduction_deleted ? (
          <StatusMessage>紹介文を削除しました。</StatusMessage>
        ) : null}
        {searchParams?.error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {searchParams.error}
          </p>
        ) : null}
        {showExternalTyping ? (
          <>
            <SectionHeader
              eyebrow="Votes"
              title="類型予想"
              description="この人がどの類型に見えるか、匿名で投票できます。集計結果は割合で表示されます。"
            />
            <TypeVoteForm
              currentVoteValueIds={currentVoteValueIds}
              handle={profile.twitter_handle ?? handle}
              isLoggedIn={Boolean(user)}
              isOwnProfile={user?.id === profile.id}
              targetUserId={profile.id}
              typeSystems={activeTypeSystems}
              typeValues={activeTypeValues}
            />
            <TypeVoteSummary items={voteSummaryItems} />
          </>
        ) : null}
        <ProfileIntroductions
          currentUserId={user?.id ?? null}
          handle={profile.twitter_handle ?? handle}
          introductions={introductions}
          isOwnProfile={user?.id === profile.id}
          targetUserId={profile.id}
        />
        {showAiCompatibility ? (
          <CompatibilityPanel
            handle={profile.twitter_handle ?? handle}
            isLoggedIn={Boolean(user)}
            isOwnProfile={user?.id === profile.id}
            latestResult={latestCompatibility?.result_text ?? null}
            targetUserId={profile.id}
          />
        ) : null}
        <AdSlot
          className="hidden lg:block"
          label="プロフィール広告枠"
          show={showAds}
          slot={process.env.NEXT_PUBLIC_ADSENSE_PROFILE_SLOT}
        />
      </section>
    </div>
  );
}

function StatusMessage({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-700">
      {children}
    </p>
  );
}
