import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "홈리스 야학 — 우리들의 학교",
  description: "홈리스행동 산하 야학. 학생들의 작업물을 함께 봅니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-amber-50 text-stone-900">
        {children}
      </body>
    </html>
  );
}
