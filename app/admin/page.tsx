import { redirect } from "next/navigation";
import { AdminForms } from "@/components/admin/admin-forms";
import { SectionHeader } from "@/components/ui/section-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminPage({
  searchParams
}: {
  searchParams?: { error?: string; saved?: string };
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    redirect("/");
  }

  const { data: typeSystems } = await supabase
    .from("type_systems")
    .select("id,code,name,description,position,is_active")
    .order("position", { ascending: true })
    .order("name", { ascending: true });
  const { data: typeValues } = await supabase
    .from("type_values")
    .select("id,type_system_id,code,name,description,position,is_active")
    .order("position", { ascending: true })
    .order("name", { ascending: true });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <SectionHeader
        eyebrow="管理"
        title="管理画面"
        description="類型システムと類型値を管理します。削除ではなく無効化で運用します。"
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
      <AdminForms typeSystems={typeSystems ?? []} typeValues={typeValues ?? []} />
    </div>
  );
}
