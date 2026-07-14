import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import ComparePageClient from "./ComparePageClient";
import type { KosCardData } from "@/components/KosCard";
import Link from "next/link";

export const metadata = {
  title: "Bandingkan Kos — Kostparison",
};

async function getKosList(): Promise<KosCardData[]> {
  const list = await prisma.kos.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { fasilitas: true } },
      fasilitas: { select: { rating: true } },
    },
  });
  return list.map((k) => ({
    ...k,
    tanggalSurvey: k.tanggalSurvey.toISOString(),
    createdAt: k.createdAt.toISOString(),
    updatedAt: k.updatedAt.toISOString(),
  }));
}

export default async function ComparePage() {
  const kosList = await getKosList();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Semua kos
            </Link>
            <span className="text-slate-200">|</span>
            <div>
              <h1 className="text-base font-bold text-slate-800">Bandingkan Kos</h1>
              <p className="text-xs text-slate-500">Pilih 2–3 kos untuk dibandingkan</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Suspense fallback={<div className="py-24 text-center text-slate-400">Memuat fitur perbandingan...</div>}>
          <ComparePageClient kosList={kosList} />
        </Suspense>
      </main>
    </div>
  );
}
