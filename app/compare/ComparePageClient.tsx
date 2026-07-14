"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SelectableKosCard from "@/components/SelectableKosCard";
import CompareTable, { type KosCompareData } from "@/components/CompareTable";
import Button from "@/components/Button";
import type { KosCardData } from "@/components/KosCard";

const MAX_SELECT = 3;
const MIN_SELECT = 2;

interface ComparePageClientProps {
  kosList: KosCardData[];
}

export default function ComparePageClient({ kosList }: ComparePageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Inisialisasi pilihan dari query param ?ids=
  const initialIds = (searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_SELECT);

  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds);
  const [compareData, setCompareData] = useState<KosCompareData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCompared, setHasCompared] = useState(initialIds.length >= MIN_SELECT);

  // Fetch data perbandingan saat halaman dimuat dengan ids dari URL
  const fetchCompare = useCallback(async (ids: string[]) => {
    if (ids.length < MIN_SELECT) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/compare?ids=${ids.join(",")}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal memuat data perbandingan");
        setCompareData(null);
        return;
      }
      // Validasi: kalau beberapa id tidak ditemukan (kos sudah dihapus)
      if (data.length < ids.length) {
        const foundIds = (data as KosCompareData[]).map((k) => k.id);
        const missingCount = ids.filter((id) => !foundIds.includes(id)).length;
        if (missingCount > 0) {
          setError(
            `${missingCount} kos yang dipilih sudah tidak ada (mungkin telah dihapus). ` +
            `Menampilkan ${data.length} kos yang ditemukan.`
          );
        }
      }
      if (data.length < MIN_SELECT) {
        setError("Tidak cukup kos valid untuk dibandingkan. Pilih ulang.");
        setCompareData(null);
        return;
      }
      setCompareData(data);
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch jika ada ids di URL saat pertama load
  useEffect(() => {
    if (initialIds.length >= MIN_SELECT) {
      fetchCompare(initialIds);
    }
    // Hanya run sekali saat mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= MAX_SELECT) return prev;
      return [...prev, id];
    });
    // Reset hasil saat pilihan berubah
    if (hasCompared) {
      setHasCompared(false);
      setCompareData(null);
      setError(null);
    }
  }

  function handleBandingkan() {
    if (selectedIds.length < MIN_SELECT) return;
    // Update URL supaya bisa di-share/bookmark
    router.replace(`/compare?ids=${selectedIds.join(",")}`);
    setHasCompared(true);
    fetchCompare(selectedIds);
  }

  function handleReset() {
    setSelectedIds([]);
    setCompareData(null);
    setError(null);
    setHasCompared(false);
    router.replace("/compare");
  }

  // Edge case: belum cukup kos
  if (kosList.length < MIN_SELECT) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
          <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
        </div>
        <h2 className="mb-2 text-lg font-semibold text-slate-700">
          Belum cukup kos untuk dibandingkan
        </h2>
        <p className="mb-6 max-w-sm text-sm text-slate-500">
          Tambahkan minimal 2 kos terlebih dahulu sebelum bisa menggunakan fitur perbandingan.
        </p>
        <a
          href="/kos/new"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Kos
        </a>
      </div>
    );
  }

  const canBandingkan = selectedIds.length >= MIN_SELECT;
  const showResult = hasCompared && (compareData !== null || error !== null);

  return (
    <div className="space-y-8">
      {/* Panel pilih kos */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700">
              Pilih kos yang ingin dibandingkan
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {selectedIds.length === 0
                ? `Pilih ${MIN_SELECT}–${MAX_SELECT} kos`
                : selectedIds.length === MAX_SELECT
                ? "Sudah memilih 3 kos (maksimal)"
                : `${selectedIds.length} dipilih · pilih ${MIN_SELECT - selectedIds.length > 0 ? MIN_SELECT - selectedIds.length : 0} lagi`}
            </p>
          </div>

          {/* Indikator slot */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: MAX_SELECT }).map((_, i) => (
              <div
                key={i}
                className={[
                  "h-2.5 w-2.5 rounded-full transition-colors",
                  i < selectedIds.length ? "bg-emerald-500" : "bg-slate-200",
                ].join(" ")}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>

        {/* Grid kos yang bisa dipilih */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {kosList.map((kos) => {
            const isSelected = selectedIds.includes(kos.id);
            const isDisabled = !isSelected && selectedIds.length >= MAX_SELECT;
            return (
              <SelectableKosCard
                key={kos.id}
                kos={kos}
                selected={isSelected}
                disabled={isDisabled}
                onToggle={toggleSelect}
              />
            );
          })}
        </div>

        {/* Action bar */}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
          {showResult && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Ganti Pilihan
            </Button>
          )}
          <div className="ml-auto flex items-center gap-3">
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => { setSelectedIds([]); setCompareData(null); setError(null); setHasCompared(false); }}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Reset pilihan
              </button>
            )}
            <Button
              onClick={handleBandingkan}
              disabled={!canBandingkan}
              loading={loading}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              {canBandingkan
                ? `Bandingkan ${selectedIds.length} Kos`
                : `Pilih minimal ${MIN_SELECT} kos`}
            </Button>
          </div>
        </div>
      </div>

      {/* Hasil perbandingan */}
      {showResult && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">
              Hasil Perbandingan
            </h2>
            <p className="text-xs text-slate-400">
              URL ini bisa disimpan atau dibagikan
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Memuat data perbandingan...
            </div>
          )}

          {!loading && compareData && compareData.length >= MIN_SELECT && (
            <CompareTable kosList={compareData} />
          )}
        </div>
      )}
    </div>
  );
}
