import Link from "next/link";
import { AdminForms } from "@/components/admin/admin-forms";
import { SectionHeader } from "@/components/ui/section-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type UserTypeCountRow = {
  type_system_id: string;
  type_value_id: string;
};

export default async function AdminPage({
  searchParams
}: {
  searchParams?: { error?: string; saved?: string; system?: string };
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
            eyebrow="管理"
            title="ログインが必要です"
            description="管理画面を開くには、管理者権限のあるアカウントでログインしてください。"
          />
          <Link
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            href="/login?next=/admin"
          >
            Xでログイン
          </Link>
        </section>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md flex-col justify-center px-4 py-12">
        <section className="rounded-2xl border border-white bg-white/88 p-6 shadow-soft">
          <SectionHeader
            eyebrow="管理"
            title="管理者権限が必要です"
            description="この画面を開けるのは管理者だけです。必要な場合は、既存の管理者に権限付与を依頼してください。"
          />
          <Link
            className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-ink"
            href="/me"
          >
            マイページへ
          </Link>
        </section>
      </div>
    );
  }

  const { data: typeSystems } = await supabase
    .from("type_systems")
    .select("id,code,name,description,position,is_active")
    .order("position", { ascending: true })
    .order("name", { ascending: true });

  const systems = typeSystems ?? [];
  const requestedSystemId = searchParams?.system ?? "";
  const selectedSystemId = systems.some((system) => system.id === requestedSystemId)
    ? requestedSystemId
    : systems[0]?.id ?? "";

  const { data: typeValues } = selectedSystemId
    ? await supabase
        .from("type_values")
        .select("id,type_system_id,code,name,description,position,is_active")
        .eq("type_system_id", selectedSystemId)
        .order("position", { ascending: true })
        .order("name", { ascending: true })
    : { data: [] };
  const { data: userTypeRows } = await supabase
    .from("user_types")
    .select("type_system_id,type_value_id");
  const counts = getRegistrationCounts((userTypeRows ?? []) as UserTypeCountRow[]);
  const systemsWithCounts = systems.map((system) => ({
    ...system,
    registrationCount: counts.systems.get(system.id) ?? 0
  }));
  const valuesWithCounts = (typeValues ?? []).map((value) => ({
    ...value,
    registrationCount: counts.values.get(value.id) ?? 0
  }));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <SectionHeader
        eyebrow="管理"
        title="管理画面"
        description="類型システムを選択して、その配下の類型値だけを編集します。数が増えても追いやすい縦リスト構成です。"
      />
      {searchParams?.saved ? (
        <p className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-700">
          保存しました。
        </p>
      ) : null}
      {searchParams?.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error}
        </p>
      ) : null}
      <AdminForms
        selectedSystemId={selectedSystemId}
        typeSystems={systemsWithCounts}
        typeValues={valuesWithCounts}
      />
    </div>
  );
}

function getRegistrationCounts(rows: UserTypeCountRow[]) {
  const systems = new Map<string, number>();
  const values = new Map<string, number>();

  for (const row of rows) {
    systems.set(row.type_system_id, (systems.get(row.type_system_id) ?? 0) + 1);
    values.set(row.type_value_id, (values.get(row.type_value_id) ?? 0) + 1);
  }

  return { systems, values };
}
