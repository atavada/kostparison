"use client";

import { useState, FormEvent } from "react";
import Button from "@/components/Button";
import { Field, Input, Textarea } from "@/components/Input";
import { getRatingTier } from "@/lib/scoring";

export interface FasilitasData {
  id: string;
  nama: string;
  rating: number;
  catatan: string | null;
  fotoUrls: string[];
}

interface FasilitasFormProps {
  mode: "create" | "edit";
  kosId: string;
  initial?: FasilitasData;
  onSuccess: (fasilitas: FasilitasData) => void;
  onCancel: () => void;
}

const tierColor: Record<string, string> = {
  high: "text-emerald-600",
  mid:  "text-amber-500",
  low:  "text-red-500",
  none: "text-slate-400",
};

const tierTrack: Record<string, string> = {
  high: "accent-emerald-500",
  mid:  "accent-amber-400",
  low:  "accent-red-500",
  none: "accent-slate-400",
};

export default function FasilitasForm({
  mode,
  kosId,
  initial,
  onSuccess,
  onCancel,
}: FasilitasFormProps) {
  const [nama, setNama] = useState(initial?.nama ?? "");
  const [rating, setRating] = useState(initial?.rating ?? 7);
  const [catatan, setCatatan] = useState(initial?.catatan ?? "");
  const [namaError, setNamaError] = useState("");
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const tier = getRatingTier(rating);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError("");
    setNamaError("");

    if (!nama.trim()) {
      setNamaError("Nama fasilitas wajib diisi");
      return;
    }

    setSubmitting(true);
    try {
      const url =
        mode === "create"
          ? `/api/kos/${kosId}/fasilitas`
          : `/api/fasilitas/${initial!.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: nama.trim(), rating, catatan: catatan.trim() || null }),
      });

      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "Terjadi kesalahan");
        return;
      }

      onSuccess(data);
    } catch {
      setServerError("Gagal terhubung ke server");
    } finally {
      setSubmitting(false);
    }
  }

  // Label deskriptif rating untuk aksesibilitas + UX
  const ratingLabel =
    rating >= 9 ? "Luar biasa" :
    rating === 8 ? "Sangat baik" :
    rating === 7 ? "Baik" :
    rating === 6 ? "Cukup baik" :
    rating === 5 ? "Cukup" :
    rating === 4 ? "Kurang" :
    rating === 3 ? "Buruk" :
    rating === 2 ? "Sangat buruk" :
    "Tidak layak";

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <Field label="Nama Fasilitas" htmlFor="f-nama" error={namaError} required>
        <Input
          id="f-nama"
          value={nama}
          onChange={(e) => { setNama(e.target.value); setNamaError(""); }}
          placeholder="Misal: Kamar mandi, WiFi, Parkir motor, AC..."
          error={!!namaError}
          autoFocus
        />
      </Field>

      {/* Slider rating — touch-friendly */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label htmlFor="f-rating" className="text-sm font-medium text-slate-700">
            Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex items-baseline gap-1.5">
            <span className={["text-3xl font-extrabold tabular-nums", tierColor[tier]].join(" ")}>
              {rating}
            </span>
            <span className="text-xs text-slate-400">/10 · {ratingLabel}</span>
          </div>
        </div>

        <input
          id="f-rating"
          type="range"
          min={1}
          max={10}
          step={1}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className={["w-full h-3 rounded-full cursor-pointer", tierTrack[tier]].join(" ")}
          aria-label={`Rating fasilitas: ${rating} dari 10`}
        />

        {/* Tick marks 1-10 */}
        <div className="flex justify-between px-0.5">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={[
                "text-xs transition-colors",
                n === rating ? tierColor[tier] + " font-bold" : "text-slate-300 hover:text-slate-500",
              ].join(" ")}
              aria-label={`Set rating ${n}`}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Visual warna range */}
        <div className="flex gap-1 text-[10px] text-slate-400 justify-between mt-0.5">
          <span className="text-red-400">1-4 Buruk</span>
          <span className="text-amber-400">5-7 Cukup</span>
          <span className="text-emerald-500">8-10 Bagus</span>
        </div>
      </div>

      <Field
        label="Catatan"
        htmlFor="f-catatan"
        hint="Opsional — detail spesifik yang perlu diingat"
      >
        <Textarea
          id="f-catatan"
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Misal: Air panas tersedia 24 jam, sinyal lemah di dalam kamar..."
          rows={2}
        />
      </Field>

      <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={submitting}>
          Batal
        </Button>
        <Button type="submit" size="sm" loading={submitting}>
          {mode === "create" ? "Tambah" : "Simpan"}
        </Button>
      </div>
    </form>
  );
}
