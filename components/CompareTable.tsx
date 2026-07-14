"use client";

import { useState } from "react";
import Link from "next/link";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import { hitungOverallScore, formatScore, getRatingTier } from "@/lib/scoring";
import RatingBadge from "@/components/RatingBadge";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface KosCompareData {
  id: string;
  nama: string;
  alamat: string;
  harga: number;
  kontakPemilik: string | null;
  tanggalSurvey: string;
  catatan: string | null;
  fasilitas: {
    id: string;
    nama: string;
    rating: number;
    catatan: string | null;
    fotoUrls: string[];
  }[];
}

interface CompareTableProps {
  kosList: KosCompareData[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Kumpulkan semua nama fasilitas unik, diurutkan alfabet */
function getNamaFasilitasUnik(kosList: KosCompareData[]): string[] {
  const set = new Set<string>();
  kosList.forEach((k) => k.fasilitas.forEach((f) => set.add(f.nama)));
  return Array.from(set).sort((a, b) => a.localeCompare(b, "id"));
}

/** Cari rating fasilitas tertentu dari satu kos, null jika tidak ada */
function getRatingFasilitas(kos: KosCompareData, namaFasilitas: string): number | null {
  const f = kos.fasilitas.find(
    (f) => f.nama.toLowerCase() === namaFasilitas.toLowerCase()
  );
  return f?.rating ?? null;
}

/** Cari foto pertama fasilitas tertentu dari satu kos */
function getFotoFasilitas(kos: KosCompareData, namaFasilitas: string): string | null {
  const f = kos.fasilitas.find(
    (f) => f.nama.toLowerCase() === namaFasilitas.toLowerCase()
  );
  return f?.fotoUrls?.[0] ?? null;
}

/** Cari nilai tertinggi dari array angka/null — kembalikan null jika semua null */
function getMaxRating(ratings: (number | null)[]): number | null {
  const valid = ratings.filter((r): r is number => r !== null);
  return valid.length > 0 ? Math.max(...valid) : null;
}

// ─── Sub-komponen: Thumbnail foto kecil + lightbox sederhana ─────────────────

function FotoThumb({ url, alt }: { url: string | null; alt: string }) {
  const [open, setOpen] = useState(false);

  if (!url) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100" title="Tidak ada foto">
        <svg className="h-5 w-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block h-10 w-10 overflow-hidden rounded-md bg-slate-100 ring-1 ring-slate-200 hover:ring-emerald-400 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        aria-label={`Lihat foto ${alt}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={alt} className="h-full w-full object-cover" loading="lazy" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setOpen(false)}
            aria-label="Tutup"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={alt}
            className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

// ─── Sub-komponen: Sel rating di tabel ───────────────────────────────────────

function RatingCell({
  rating,
  isHighest,
}: {
  rating: number | null;
  isHighest: boolean;
}) {
  if (rating === null) {
    return (
      <span className="text-slate-300 text-sm select-none">—</span>
    );
  }

  const tier = getRatingTier(rating);
  const tierTextColor =
    tier === "high" ? "text-emerald-700" :
    tier === "mid"  ? "text-amber-700"   :
                      "text-red-700";

  return (
    <span className={[
      "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-bold tabular-nums",
      isHighest
        ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-400"
        : `${tierTextColor} bg-slate-50`,
    ].join(" ")}>
      {isHighest && (
        <svg className="h-3 w-3 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )}
      {rating}
    </span>
  );
}

// ─── Komponen utama ───────────────────────────────────────────────────────────

export default function CompareTable({ kosList }: CompareTableProps) {
  const namaFasilitasUnik = getNamaFasilitasUnik(kosList);
  const overallScores = kosList.map((k) => hitungOverallScore(k.fasilitas));
  const maxOverall = getMaxRating(overallScores);
  const minHarga = Math.min(...kosList.map((k) => k.harga));

  // ─── Ringkasan cepat ───────────────────────────────────────────────────────

  const kosTertinggi = kosList.filter((k, i) => overallScores[i] === maxOverall && maxOverall !== null);
  const kosTermurah = kosList.filter((k) => k.harga === minHarga);

  return (
    <div className="space-y-4">
      {/* Ringkasan cepat */}
      <div className="flex flex-wrap gap-2">
        {kosTertinggi.length > 0 && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Skor tertinggi: {kosTertinggi.map((k) => k.nama).join(", ")}
          </div>
        )}
        {kosTermurah.length > 0 && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Termurah: {kosTermurah.map((k) => k.nama).join(", ")}
          </div>
        )}
        {kosList.every((_, i) => overallScores[i] === null) && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-500">
            Belum ada kos yang memiliki fasilitas dengan rating
          </div>
        )}
      </div>

      {/* Tabel perbandingan — horizontal scroll, sticky kolom label */}
      {/* Pendekatan: overflow-x-auto + sticky first column.
          Dipilih karena: lebih informatif (semua kos terlihat sekaligus),
          pattern universal di aplikasi perbandingan, dan mudah di-scroll
          horizontal di mobile. Kolom label disticky agar konteks baris
          tidak hilang saat scroll. */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <thead>
            {/* Baris nama kos */}
            <tr className="border-b border-slate-200">
              <th className="sticky left-0 z-10 w-36 bg-slate-50 px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 sm:w-44">
                Fasilitas
              </th>
              {kosList.map((kos, i) => (
                <th
                  key={kos.id}
                  className="min-w-[160px] px-4 py-3 text-left align-top"
                >
                  <Link
                    href={`/kos/${kos.id}`}
                    className="font-semibold text-slate-800 hover:text-emerald-700 transition-colors line-clamp-2 leading-snug"
                  >
                    {kos.nama}
                  </Link>
                  <p className="mt-0.5 text-xs text-slate-400 font-normal line-clamp-1">
                    {kos.alamat}
                  </p>
                  <p className="mt-1 text-xs text-slate-400 font-normal">
                    Survey {formatTanggal(kos.tanggalSurvey)}
                  </p>
                </th>
              ))}
            </tr>

            {/* Baris harga */}
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <td className="sticky left-0 z-10 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
                Harga / bln
              </td>
              {kosList.map((kos) => (
                <td key={kos.id} className="px-4 py-3">
                  <span className={[
                    "font-bold",
                    kos.harga === minHarga ? "text-blue-600" : "text-slate-700",
                  ].join(" ")}>
                    {formatRupiah(kos.harga)}
                  </span>
                  {kos.harga === minHarga && (
                    <span className="ml-1.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
                      Termurah
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* Baris overall score */}
            <tr className="border-b-2 border-slate-200">
              <td className="sticky left-0 z-10 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
                Overall Score
              </td>
              {kosList.map((kos, i) => {
                const score = overallScores[i];
                const isMax = score !== null && score === maxOverall;
                return (
                  <td key={kos.id} className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <RatingBadge
                        score={score}
                        size={isMax ? "md" : "sm"}
                        showDenom
                      />
                      {isMax && score !== null && (
                        <span className="text-[10px] font-medium text-emerald-600">
                          Terbaik
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {kos.fasilitas.length} fasilitas
                    </p>
                  </td>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {namaFasilitasUnik.length === 0 ? (
              <tr>
                <td
                  colSpan={kosList.length + 1}
                  className="px-4 py-8 text-center text-sm text-slate-400"
                >
                  Tidak ada kos yang memiliki data fasilitas
                </td>
              </tr>
            ) : (
              namaFasilitasUnik.map((namaFasilitas, rowIdx) => {
                const ratings = kosList.map((k) => getRatingFasilitas(k, namaFasilitas));
                const maxRating = getMaxRating(ratings);

                return (
                  <tr
                    key={namaFasilitas}
                    className={[
                      "border-b border-slate-100 last:border-0",
                      rowIdx % 2 === 1 ? "bg-slate-50/40" : "bg-white",
                    ].join(" ")}
                  >
                    {/* Label fasilitas — sticky */}
                    <td className={[
                      "sticky left-0 z-10 px-4 py-3 text-xs font-medium text-slate-600",
                      rowIdx % 2 === 1 ? "bg-slate-50" : "bg-white",
                    ].join(" ")}>
                      <span className="line-clamp-2 leading-snug">{namaFasilitas}</span>
                    </td>

                    {/* Sel tiap kos */}
                    {kosList.map((kos, colIdx) => {
                      const rating = ratings[colIdx];
                      const foto = getFotoFasilitas(kos, namaFasilitas);
                      const isHighest = rating !== null && rating === maxRating && maxRating !== null;

                      return (
                        <td
                          key={kos.id}
                          className={[
                            "px-4 py-3",
                            isHighest ? "bg-emerald-50/60" : "",
                          ].join(" ")}
                        >
                          <div className="flex items-center gap-2">
                            <FotoThumb url={foto} alt={`${namaFasilitas} — ${kos.nama}`} />
                            <RatingCell rating={rating} isHighest={isHighest} />
                          </div>
                          {/* Catatan fasilitas jika ada */}
                          {(() => {
                            const f = kos.fasilitas.find(
                              (f) => f.nama.toLowerCase() === namaFasilitas.toLowerCase()
                            );
                            return f?.catatan ? (
                              <p className="mt-1 text-[10px] text-slate-400 leading-relaxed line-clamp-2">
                                {f.catatan}
                              </p>
                            ) : null;
                          })()}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
