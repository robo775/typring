import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionHeader } from "@/components/ui/section-header";
import {
  getActiveTypeValuesBySystemId,
  getTypeSystemByCode
} from "@/lib/handbook/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params
}: {
  params: { systemCode: string };
}): Promise<Metadata> {
  const supabase = createSupabaseServerClient();
  const system = await getTypeSystemByCode(supabase, params.systemCode);

  if (!system) {
    return {
      title: "類型システムが見つかりません",
      description: "指定された類型システムは見つかりませんでした。"
    };
  }

  return {
    title: `${system.name} ハンドブック`,
    description: system.description ?? `${system.name}の類型一覧です。`
  };
}

export default async function HandbookSystemPage({
  params
}: {
  params: { systemCode: string };
}) {
  const supabase = createSupabaseServerClient();
  const system = await getTypeSystemByCode(supabase, params.systemCode);

  if (!system) {
    notFound();
  }

  const typeValues = await getActiveTypeValuesBySystemId(supabase, system.id);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <SectionHeader
        eyebrow="類型システム"
        title={system.name}
        description={system.description ?? "有効な類型値を一覧できます。"}
      />
      {typeValues.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {typeValues.map((typeValue) => (
            <Link
              className="rounded-2xl border border-white bg-white/88 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-ringTeal"
              href={`/handbook/${encodeURIComponent(system.code)}/${encodeURIComponent(
                typeValue.code
              )}`}
              key={typeValue.id}
            >
              <h2 className="text-lg font-bold text-ink">
                {typeValue.name || typeValue.code}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {typeValue.description ??
                  "説明文は管理画面から追加できます。"}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-500">
          有効な類型値がありません。
        </div>
      )}
    </div>
  );
}
