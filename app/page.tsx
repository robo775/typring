import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Search, Sparkles, UserRound } from "lucide-react";
import { AdSlot } from "@/components/ads/ad-slot";
import { ProfileCard } from "@/components/profiles/profile-card";
import { SectionHeader } from "@/components/ui/section-header";
import { getAdVisibility } from "@/lib/ads/viewer";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTopVotedTypesForUser } from "@/lib/votes/queries";

type CardType = {
  system: string;
  value: string;
};

export default async function HomePage({
  searchParams
}: {
  searchParams?: { account_deleted?: string };
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const showAds = await getAdVisibility(supabase);
  let profile:
    | {
        avatar_url: string | null;
        bio: string | null;
        display_name: string;
        twitter_handle: string | null;
      }
    | null = null;
  let types: CardType[] = [];
  let votedTypes: CardType[] = [];

  if (user) {
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("avatar_url,bio,display_name,twitter_handle")
      .eq("id", user.id)
      .maybeSingle();

    profile = profileRow;

    const { data: typeSystemRows } = await supabase
      .from("type_systems")
      .select("id,name")
      .eq("is_active", true);
    const { data: typeValueRows } = await supabase
      .from("type_values")
      .select("id,code,name")
      .eq("is_active", true);
    const { data: userTypeRows } = await supabase
      .from("user_types")
      .select("type_system_id,type_value_id")
      .eq("user_id", user.id);

    const typeSystems = typeSystemRows ?? [];
    const typeValues = typeValueRows ?? [];
    types =
      userTypeRows?.flatMap((row) => {
        const system = typeSystems.find(
          (typeSystem) => typeSystem.id === row.type_system_id
        );
        const value = typeValues.find(
          (typeValue) => typeValue.id === row.type_value_id
        );

        if (!system || !value) {
          return [];
        }

        return [
          {
            system: system.name,
            value: value.name || value.code
          }
        ];
      }) ?? [];
    votedTypes = await getTopVotedTypesForUser(supabase, user.id);
  }

  const cardProfile = profile ?? {
    avatar_url: null,
    bio: "ログインすると、自分の類型をまとめたプロフィールカードを作成できます。",
    display_name: "Typring サンプル",
    twitter_handle: "typring"
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 sm:gap-10 sm:py-12">
      {searchParams?.account_deleted ? (
        <p className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-700">
          アカウントを削除しました。ご利用ありがとうございました。
        </p>
      ) : null}
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-5 sm:space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white bg-white/70 px-3 py-1 text-sm font-medium text-ringViolet shadow-sm">
            <Sparkles className="h-4 w-4" />
            Type + Ring
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-ink sm:text-5xl">
              類型でつながる、プロフィールカードSNS。
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              自認タイプを登録して、見やすいプロフィールカードを作成。気になる類型や近い組み合わせのユーザーも探せます。
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
              href={user ? "/me" : "/login"}
            >
              {user ? "プロフィールを編集" : "Xでログイン"}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:border-ringTeal"
              href="/handbook"
            >
              ハンドブックを見る
            </Link>
          </div>
        </div>
        <ProfileCard
          avatarUrl={cardProfile.avatar_url}
          bio={cardProfile.bio || "自己紹介はまだ設定されていません。"}
          displayName={cardProfile.display_name}
          handle={cardProfile.twitter_handle ?? "unknown"}
          types={types}
          votedTypes={votedTypes}
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <FeatureCard
          icon={<UserRound className="h-5 w-5" />}
          title="プロフィールカード"
          body="自認タイプと自己紹介を、スクショしやすいカードでまとめられます。"
        />
        <FeatureCard
          icon={<Search className="h-5 w-5" />}
          title="ユーザー検索"
          body="ハンドル名や類型の組み合わせから、気になるユーザーを探せます。"
        />
        <FeatureCard
          icon={<Sparkles className="h-5 w-5" />}
          title="他者診断"
          body="他のユーザーから見た類型予想を集めて、プロフィールカードに表示できます。"
        />
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Rankings"
          title="他者診断ランキング"
          description="みんなからどう見られているかを、投票数ベースで一覧できます。"
        />
        <Link
          className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink shadow-sm transition hover:-translate-y-0.5"
          href="/vote-rankings"
        >
          ランキングを見る
        </Link>
      </section>

      <AdSlot
        label="ホーム広告枠"
        show={showAds}
        slot={process.env.NEXT_PUBLIC_ADSENSE_HOME_SLOT}
      />
    </div>
  );
}

function FeatureCard({
  body,
  icon,
  title
}: {
  body: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <article className="rounded-2xl border border-white bg-white/82 p-5 shadow-sm">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-ringTeal">
        {icon}
      </div>
      <h2 className="text-base font-bold text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </article>
  );
}
