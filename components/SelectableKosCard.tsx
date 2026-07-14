"use client";

import { formatRupiah, formatTanggal } from "@/lib/utils";
import { hitungOverallScore } from "@/lib/scoring";
import RatingBadge from "@/components/RatingBadge";
import type { KosCardData } from "@/components/KosCard";

interface SelectableKosCardProps {
  kos: KosCardData;
  selected: boolean;
  disabled: boolean; // true kalau sudah pilih 3 dan ini bukan salah satunya
  onToggle: (id: string) => void;
}

export default function SelectableKosCard({
  kos,
  selected,
  disabled,
  onToggle,
}: SelectableKosCardProps) {
  const overallScore = kos.fasilitas ? hitungOverallScore(kos.fasilitas) : null;
  const jumlahFasilitas = kos._count.fasilitas;

  return (
    <button
      type="button"
      onClick={() => onToggle(kos.id)}
      disabled={disabled}
      aria-pressed={selected}
      className={[
        "relative flex flex-col w-full rounded-xl border-2 p-5 text-left transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
        selected
          ? "border-emerald-500 bg-emerald-50 shadow-md"
          : disabled
          ? "border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed"
          : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm cursor-pointer",
      ].join(" ")}
    >
      {/* Checkbox indicator */}
      <span
        className={[
          "absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
          selected
            ? "border-emerald-500 bg-emerald-500"
            : "border-slate-300 bg-white",
        ].join(" ")}
        aria-hidden="true"
      >
        {selected && (
          <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>

      {/* Nama + score */}
      <div className="mb-3 flex items-start gap-2 pr-8">
        <h3 className={[
          "font-semibold leading-snug line-clamp-2",
          selected ? "text-emerald-800" : "text-slate-800",
        ].join(" ")}>
          {kos.nama}
        </h3>
      </div>

      {/* Score */}
      <div className="mb-3">
        <RatingBadge score={overallScore} size="sm" showDenom />
      </div>

      {/* Alamat */}
      <p className="mb-4 flex items-start gap-1.5 text-xs text-slate-500 line-clamp-2">
        <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {kos.alamat}
      </p>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
        <span className={["text-base font-bold", selected ? "text-emerald-700" : "text-emerald-600"].join(" ")}>
          {formatRupiah(kos.harga)}
          <span className="text-xs font-normal text-slate-400">/bln</span>
        </span>
        <span className="text-xs text-slate-400">
          {jumlahFasilitas} fasilitas · {formatTanggal(kos.tanggalSurvey)}
        </span>
      </div>
    </button>
  );
}
