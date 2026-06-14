import { SectionHeader } from "@/components/ui/section-header";

export default function MeLoading() {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_380px]">
      <section className="rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
        <SectionHeader
          eyebrow="マイページ"
          title="読み込み中..."
          description="プロフィールを読み込み中..."
        />
      </section>
      <div className="h-96 rounded-2xl border border-white bg-white/60 shadow-sm" />
    </div>
  );
}
