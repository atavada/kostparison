import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import KosForm from "@/components/KosForm";
import { toDateInputValue } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const kos = await prisma.kos.findUnique({ where: { id }, select: { nama: true } });
  return { title: kos ? `Edit ${kos.nama} — Kostparison` : "Kos tidak ditemukan" };
}

export default async function EditKosPage({ params }: Props) {
  const { id } = await params;
  const kos = await prisma.kos.findUnique({ where: { id } });

  if (!kos) notFound();

  const initialValues = {
    nama: kos.nama,
    alamat: kos.alamat,
    harga: String(kos.harga),
    kontakPemilik: kos.kontakPemilik ?? "",
    tanggalSurvey: toDateInputValue(kos.tanggalSurvey),
    catatan: kos.catatan ?? "",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-4 sm:px-6">
          <Link
            href={`/kos/${kos.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke detail
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Edit Kos</h1>
          <p className="mt-1 text-sm text-slate-500 line-clamp-1">
            {kos.nama}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <KosForm mode="edit" initialValues={initialValues} kosId={kos.id} />
        </div>
      </main>
    </div>
  );
}
