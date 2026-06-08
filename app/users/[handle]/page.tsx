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
import { getTopVotedTypesForUser } from "@/lib/votes/queries";

type UserTypeRow = {
  type_system_id: string;
  type_value_id: string;
};

type VoteSummaryRow = {
  first_voted_at: string | null;
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

type ProfileType = {
  system: string;
  value: string;
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
    .select("id,allow_external_typing,avatar_url,bio,display_name,twitter_handle")
    .eq("twitter_handle", handle)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  const { data: userTypeRows } = await supabase
    .from("user_types")
    .select("type_system_id,type_value_id")
    .eq("user_id", profile.id);
  const userTypes = (userTypeRows ?? []) as UserTypeRow[];
  const { data: activeTypeSystemRows } = await supabase
    .from("type_systems")
    .select("id,code,name,position")
    .eq("is_active", true)
    .order("position", { ascending: true })
    .order("name", { ascending: true });
  const { data: activeTypeValueRows } = await supabase
    .from("type_values")
    .select("id,type_system_id,code,name,position")
    .eq("is_active", true)
    .order("position", { ascending: true })
    .order("name", { ascending: true });

  const activeTypeSystems = activeTypeSystemRows ?? [];
  const activeTypeValues = activeTypeValueRows ?? [];
  const profileTypes = activeTypeSystems
    .map((system) => {
      const userType = userTypes.find(
        (type) => type.type_system_id === system.id
      );

      if (!userType) {
        return null;
      }

      const value = activeTypeValues.find(
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
    .filter((type): type is ProfileType => type !== null);
  const votedTypes = await getTopVotedTypesForUser(supabase, profile.id);

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
        firstVotedAt: vote.first_voted_at,
        system: system.name,
        systemPosition: system.position ?? 0,
        totalCount: vote.total_count,
        value: value.name || value.code,
        valuePosition: value.position ?? 0,
        voteCount: vote.vote_count
      };
    })
    .filter(
      (
        item
      ): item is {
        firstVotedAt: string | null;
        percentage: number;
        system: string;
        systemPosition: number;
        totalCount: number;
        value: string;
        valuePosition: number;
        voteCount: number;
      } => item !== null
    )
    .sort((a, b) => {
      if (a.systemPosition !== b.systemPosition) {
        return a.systemPosition - b.systemPosition;
      }

      if (a.voteCount !== b.voteCount) {
        return b.voteCount - a.voteCount;
      }

      const firstVoteDiff = getTime(a.firstVotedAt) - getTime(b.firstVotedAt);

      if (firstVoteDiff !== 0) {
        return firstVoteDiff;
      }

      return a.valuePosition - b.valuePosition;
    });

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

  const { data: createdPolls } = await supabase
    .from("polls")
    .select("id,slug,title,question,description,status")
    .eq("creator_user_id", profile.id)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(6);

  const showAds = await getAdVisibility(supabase);
  const showExternalTyping = profile.allow_external_typing ?? true;
  const visibleVotedTypes = showExternalTyping ? votedTypes : [];
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
        showVotedTypes={showExternalTyping}
        types={profileTypes}
        votedTypes={visibleVotedTypes}
      />
      <div className="lg:hidden">
        <AdSlot
          className="lg:hidden"
          label="プロフィール 広告枠"
          show={showAds}
          slot={process.env.NEXT_PUBLIC_ADSENSE_PROFILE_SLOT}
        />
      </div>
      <section className="space-y-4">
        <MutualBadge isMutual={Boolean(isMutual)} />
        <ProfileShareActions
          avatarUrl={profile.avatar_url}
          bio={profile.bio ?? "このユーザーはまだ自己紹介を書いていません。"}
          displayName={profile.display_name}
          handle={profile.twitter_handle ?? handle}
          profileUrl={profileUrl}
          showVotedTypes={showExternalTyping}
          types={profileTypes}
          votedTypes={visibleVotedTypes}
        />
        {searchParams?.voted ? (
          <StatusMessage>他者診断の投票を保存しました。</StatusMessage>
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
              title="他者診断"
              description="この人がどの類型に見えるかを投票できます。集計結果は匿名で表示されます。"
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
        <section className="rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
          <h2 className="text-lg font-bold text-ink">作成したアンケート</h2>
          {(createdPolls ?? []).length > 0 ? (
            <div className="mt-4 grid gap-3">
              {(createdPolls ?? []).map((poll) => (
                <a
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-ringTeal"
                  href={`/polls/${poll.slug}`}
                  key={poll.id}
                >
                  <p className="font-bold text-ink">{poll.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                    {poll.question}
                  </p>
                </a>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              公開中のアンケートはまだありません。
            </p>
          )}
        </section>
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
          label="プロフィール 広告枠"
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

function getTime(value: string | null) {
  if (!value) {
    return Number.MAX_SAFE_INTEGER;
  }

  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : Number.MAX_SAFE_INTEGER;
}
