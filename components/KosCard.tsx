import Link from "next/link";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import { hitungOverallScore } from "@/lib/scoring";
import RatingBadge from "@/components/RatingBadge";

export interface KosCardData {
  id: string;
  nama: string;
  alamat: string;
  harga: number;
  tanggalSurvey: string | Date;
  catatan?: string | null;
  _count: { fasilitas: number };
  fasilitas?: { rating: number }[];
}

export default function KosCard({ kos }: { kos: KosCardData }) {
  const jumlahFasilitas = kos._count.fasilitas;
  const overallScore = kos.fasilitas ? hitungOverallScore(kos.fasilitas) : null;

  return (
    <Link
      href={`/kos/${kos.id}`}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
    >
      {/* Header: nama + score */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <h2 className="font-semibold text-slate-800 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
          {kos.nama}
        </h2>
        <div className="shrink-0 flex flex-col items-end gap-1">
          <RatingBadge score={overallScore} size="sm" showDenom />
        </div>
      </div>

      {/* Alamat */}
      <p className="mb-4 flex items-start gap-1.5 text-sm text-slate-500 line-clamp-2">
        <svg
          className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        {kos.alamat}
      </p>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-lg font-bold text-emerald-600">
          {formatRupiah(kos.harga)}
          <span className="text-xs font-normal text-slate-400">/bln</span>
        </span>
        <span className="text-xs text-slate-400">
          {jumlahFasilitas > 0
            ? `${jumlahFasilitas} fasilitas`
            : "Belum ada fasilitas"
          }
          {" · "}
          {formatTanggal(kos.tanggalSurvey)}
        </span>
      </div>
    </Link>
  );
}
