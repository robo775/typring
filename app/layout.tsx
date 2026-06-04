import type { Metadata } from "next";
import type { ReactNode } from "react";
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
  { href: "/", label: "ホーム" },
  { href: "/search", label: "検索" },
  { href: "/handbook", label: "ハンドブック" },
  { href: "/me", label: "マイページ" }
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
          <header className="sticky top-0 z-20 border-b border-white/70 bg-white/80 backdrop-blur">
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
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
