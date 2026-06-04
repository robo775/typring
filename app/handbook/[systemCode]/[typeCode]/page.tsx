import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ads/ad-slot";
import { ProfileCard } from "@/components/profiles/profile-card";
import { SectionHeader } from "@/components/ui/section-header";
import {
  getProfilesForTypeValue,
  getTypeSystemByCode,
  getTypeValueBySystemAndCode
} from "@/lib/handbook/queries";
import { getAdVisibility } from "@/lib/ads/viewer";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params
}: {
  params: { systemCode: string; typeCode: string };
}): Promise<Metadata> {
  const supabase = createSupabaseServerClient();
  const system = await getTypeSystemByCode(supabase, params.systemCode);

  if (!system) {
    return {
      title: "類型が見つかりません",
      description: "指定された類型は見つかりませんでした。"
    };
  }

  const typeValue = await getTypeValueBySystemAndCode({
    code: params.typeCode,
    supabase,
    typeSystemId: system.id
  });

  if (!typeValue) {
    return {
      title: "類型が見つかりません",
      description: "指定された類型は見つかりませんでした。"
    };
  }

  return {
    title: `${typeValue.name || typeValue.code} ${system.name}`,
    description:
      typeValue.description ??
      `${system.name}の${typeValue.name || typeValue.code}についてのページです。`
  };
}

export default async function HandbookTypePage({
  params
}: {
  params: { systemCode: string; typeCode: string };
}) {
  const supabase = createSupabaseServerClient();
  const system = await getTypeSystemByCode(supabase, params.systemCode);

  if (!system) {
    notFound();
  }

  const typeValue = await getTypeValueBySystemAndCode({
    code: params.typeCode,
    supabase,
    typeSystemId: system.id
  });

  if (!typeValue) {
    notFound();
  }

  const profiles = await getProfilesForTypeValue({
    supabase,
    typeSystemId: system.id,
    typeValueId: typeValue.id
  });
  const showAds = await getAdVisibility(supabase);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <SectionHeader
        eyebrow={system.name}
        title={typeValue.name || typeValue.code}
        description={`${typeValue.name || typeValue.code}の説明と、登録しているユーザーを表示します。`}
      />
      <article className="rounded-2xl border border-white bg-white/88 p-5 text-sm leading-7 text-slate-600 shadow-sm">
        {typeValue.description ??
          "この類型の説明文はまだ登録されていません。管理画面から編集できます。"}
      </article>
      <AdSlot
        label="ハンドブック広告枠"
        show={showAds}
        slot={process.env.NEXT_PUBLIC_ADSENSE_HANDBOOK_SLOT}
      />

      <section className="space-y-4">
        <SectionHeader
          eyebrow="ユーザー"
          title="登録ユーザー"
          description={`${typeValue.name || typeValue.code}を自己申告しているユーザーです。`}
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
                  types={[
                    {
                      system: system.name,
                      value: typeValue.name || typeValue.code
                    }
                  ]}
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
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-500">
            この類型を登録しているユーザーはまだいません。
          </div>
        )}
      </section>
    </div>
  );
}
