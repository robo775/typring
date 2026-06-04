import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Search, Sparkles, UserRound } from "lucide-react";
import { AdSlot } from "@/components/ads/ad-slot";
import { ProfileCard } from "@/components/profiles/profile-card";
import { SectionHeader } from "@/components/ui/section-header";
import { getAdVisibility } from "@/lib/ads/viewer";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const showAds =
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? await getAdVisibility(createSupabaseServerClient())
      : true;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-8 sm:py-12">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white bg-white/70 px-3 py-1 text-sm font-medium text-ringViolet shadow-sm">
            <Sparkles className="h-4 w-4" />
            Type + Ring
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              類型でつながる、プロフィールカードSNS。
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              自分の類型を登録して、見やすいプロフィールカードを作成。MBTI、エニアグラム、ソシオニクスなどの組み合わせから、近い感覚の人を探せます。
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
              href="/login"
            >
              Xでログイン
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
          avatarUrl={null}
          bio="Typringのプロフィールカード例です。ログインすると、自分の類型カードを作成できます。"
          displayName="Typring サンプル"
          handle="typring"
          types={[]}
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <FeatureCard
          icon={<UserRound className="h-5 w-5" />}
          title="プロフィールカード"
          body="自己申告の類型を、スクショしやすいカードで表示します。"
        />
        <FeatureCard
          icon={<Search className="h-5 w-5" />}
          title="類型検索"
          body="ハンドル名や複数の類型条件からユーザーを探せます。"
        />
        <FeatureCard
          icon={<Sparkles className="h-5 w-5" />}
          title="ハンドブック"
          body="類型ごとの説明と、該当ユーザー一覧を見られます。"
        />
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="人気の類型"
          title="人気の類型"
          description="類型タグはDBマスタから動的に表示されます。"
        />
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4 text-sm text-slate-500">
          Supabaseの初期データを投入すると、ここに類型タグが表示されます。
        </div>
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

