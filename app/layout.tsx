import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BarChart3, BookOpen, Home, Search, Trophy, UserRound } from "lucide-react";
import Link from "next/link";
import { AdsenseScript } from "@/components/ads/adsense-script";
import { AuthStatus } from "@/components/auth/auth-status";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Typring",
    template: "%s | Typring"
  },
  description:
    "Typringは、MBTI・エニアグラム・ソシオニクスなどの類型でつながるSNS兼ハンドブックです。"
};

const navItems = [
  { href: "/", label: "ホーム", icon: Home },
  { href: "/search", label: "検索", icon: Search },
  { href: "/stats", label: "統計", icon: BarChart3 },
  { href: "/vote-rankings", label: "他者診断", icon: Trophy },
  { href: "/handbook", label: "ハンドブック", icon: BookOpen },
  { href: "/me", label: "マイページ", icon: UserRound }
];

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <AdsenseScript />
        <div className="min-h-screen">
          <header className="sticky top-0 z-20 border-b border-white/70 bg-white/86 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <Link className="text-lg font-bold tracking-tight text-ink" href="/">
                Typring
              </Link>
              <div className="flex items-center gap-2">
                <nav className="hidden items-center gap-1 text-sm font-medium text-slate-600 sm:flex">
                  {navItems.map((item) => (
                    <Link
                      className="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-ink"
                      href={item.href}
                      key={item.href}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <AuthStatus />
              </div>
            </div>
          </header>
          <main className="pb-20 sm:pb-0">{children}</main>
          <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/80 bg-white/92 px-2 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] pt-2 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:hidden">
            <div className="mx-auto grid max-w-md grid-cols-6 gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[10px] font-semibold leading-none text-slate-600 transition active:bg-slate-100 active:text-ink"
                    href={item.href}
                    key={item.href}
                  >
                    <Icon aria-hidden className="h-5 w-5" />
                    <span className="max-w-full truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </body>
    </html>
  );
}
