import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, BookOpen, ClipboardList, Gamepad2 } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";

export const metadata: Metadata = {
  title: "アクティビティ",
  description:
    "Typringの統計、ハンドブック、アンケート、ゲームをまとめて探せるページです。"
};

const activityItems = [
  {
    description: "自認タイプの組み合わせや分布を眺められます。",
    href: "/stats",
    icon: BarChart3,
    label: "統計"
  },
  {
    description: "MBTI、エニアグラムなどの類型説明を読めます。",
    href: "/handbook",
    icon: BookOpen,
    label: "ハンドブック"
  },
  {
    description: "類型別に集計できるアンケートを作成・回答できます。",
    href: "/polls",
    icon: ClipboardList,
    label: "アンケート"
  },
  {
    description: "PYRAMID MAKERなど、Typring内のミニゲームで遊べます。",
    href: "/games",
    icon: Gamepad2,
    label: "ゲーム"
  }
];

export default function ActivitiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <section className="rounded-2xl border border-white bg-white/88 p-5 shadow-sm">
        <SectionHeader
          eyebrow="Activity"
          title="アクティビティ"
          description="統計、ハンドブック、アンケート、ゲームをここにまとめました。"
        />
      </section>

      <div className="mt-5 grid gap-3">
        {activityItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              className="flex items-center gap-4 rounded-2xl border border-white bg-white/88 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-ringTeal hover:shadow-soft"
              href={item.href}
              key={item.href}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-ringTeal to-ringViolet text-white">
                <Icon className="h-6 w-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-black text-ink">
                  {item.label}
                </span>
                <span className="mt-1 block text-sm leading-6 text-slate-500">
                  {item.description}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
