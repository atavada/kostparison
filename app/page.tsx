import Link from "next/link";
import { prisma } from "@/lib/prisma";
import KosCard, { KosCardData } from "@/components/KosCard";

async function getKosList(): Promise<KosCardData[]> {
  const list = await prisma.kos.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { fasilitas: true } } },
  });
  // Serialisasi Date → string agar aman dikirim ke Client Component
  return list.map((k) => ({
    ...k,
    tanggalSurvey: k.tanggalSurvey.toISOString(),
    createdAt: k.createdAt.toISOString(),
    updatedAt: k.updatedAt.toISOString(),
  }));
}

export default async function HomePage() {
  const kosList = await getKosList();
  const isEmpty = kosList.length === 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">
              Kostparison
            </h1>
            <p className="text-xs text-slate-500">Catatan survey kos pribadi</p>
          </div>
          <Link
            href="/kos/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Kos
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {isEmpty ? (
          <EmptyState />
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                {kosList.length} kos tercatat
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {kosList.map((kos) => (
                <KosCard key={kos.id} kos={kos} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100">
        <svg
          className="h-10 w-10 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </div>
      <h2 className="mb-2 text-xl font-semibold text-slate-700">
        Belum ada kos tercatat
      </h2>
      <p className="mb-8 max-w-sm text-sm text-slate-500">
        Mulai catat hasil survey kos pertama Anda. Tambahkan informasi, harga,
        dan rating fasilitas untuk memudahkan perbandingan.
      </p>
      <Link
        href="/kos/new"
        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Catat Kos Pertama
      </Link>
    </div>
  );
}
