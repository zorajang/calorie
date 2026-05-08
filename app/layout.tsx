import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Calorie",
  description: "Personal calorie tracking app"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
