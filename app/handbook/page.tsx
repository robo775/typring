import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";
import { getActiveTypeSystems } from "@/lib/handbook/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function HandbookPage() {
  const supabase = createSupabaseServerClient();
  const typeSystems = await getActiveTypeSystems(supabase);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <SectionHeader
        eyebrow="ハンドブック"
        title="類型ハンドブック"
        description="Typringのマスタデータから、類型システムと類型値を閲覧できます。"
      />
      {typeSystems.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {typeSystems.map((system) => (
            <Link
              className="rounded-2xl border border-white bg-white/88 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-ringTeal"
              href={`/handbook/${encodeURIComponent(system.code)}`}
              key={system.id}
            >
              <h2 className="text-lg font-bold text-ink">{system.name}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {system.description ?? "類型値と登録ユーザーを確認できます。"}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-500">
          有効な類型システムがありません。Supabaseのseedを適用してください。
        </div>
      )}
    </div>
  );
}
