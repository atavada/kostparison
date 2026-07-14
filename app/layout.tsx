import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kostparison — Catatan Survey Kos",
  description: "Aplikasi pribadi untuk mencatat dan membandingkan hasil survey kos dengan rating per fasilitas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 font-sans">{children}</body>
    </html>
  );
}
