import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import Button from "@/components/Button";
import DeleteButton from "@/components/DeleteButton";
import FasilitasSection from "@/components/FasilitasSection";

type Props = { params: Promise<{ id: string }> };

async function getKos(id: string) {
  return prisma.kos.findUnique({
    where: { id },
    include: { fasilitas: { orderBy: { createdAt: "asc" } } },
  });
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const kos = await getKos(id);
  return { title: kos ? `${kos.nama} — Kostparison` : "Kos tidak ditemukan" };
}

export default async function KosDetailPage({ params }: Props) {
  const { id } = await params;
  const kos = await getKos(id);

  if (!kos) notFound();

  // Serialisasi fasilitas untuk client component
  const fasilitasSerial = kos.fasilitas.map((f) => ({
    id: f.id,
    nama: f.nama,
    rating: f.rating,
    catatan: f.catatan,
    fotoUrls: f.fotoUrls,
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Semua kos
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-6">
        {/* Card info utama kos */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {/* Nama + aksi */}
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{kos.nama}</h1>
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {kos.alamat}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/kos/${kos.id}/edit`}>
                <Button variant="secondary" size="sm">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </Button>
              </Link>
              <DeleteButton kosId={kos.id} kosNama={kos.nama} />
            </div>
          </div>

          {/* Info grid */}
          <dl className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
            <InfoItem label="Harga / Bulan">
              <span className="text-lg font-bold text-emerald-600">
                {formatRupiah(kos.harga)}
              </span>
            </InfoItem>
            <InfoItem label="Tanggal Survey">
              {formatTanggal(kos.tanggalSurvey)}
            </InfoItem>
            <InfoItem label="Jumlah Fasilitas">
              {kos.fasilitas.length} item
            </InfoItem>
            {kos.kontakPemilik && (
              <InfoItem label="Kontak Pemilik">
                {kos.kontakPemilik}
              </InfoItem>
            )}
          </dl>

          {kos.catatan && (
            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                Catatan Umum
              </p>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {kos.catatan}
              </p>
            </div>
          )}
        </div>

        {/* Overall score + daftar fasilitas — Client Component */}
        <FasilitasSection kosId={kos.id} initialFasilitas={fasilitasSerial} />
      </main>
    </div>
  );
}

function InfoItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="mb-0.5 text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="text-sm font-medium text-slate-700">{children}</dd>
    </div>
  );
}
