"use client";

import { useState } from "react";
import Button from "@/components/Button";
import RatingBadge from "@/components/RatingBadge";
import FasilitasForm, { type FasilitasData } from "@/components/FasilitasForm";
import FotoGaleri from "@/components/FotoGaleri";
import FotoUpload from "@/components/FotoUpload";

interface FasilitasCardProps {
  fasilitas: FasilitasData;
  kosId: string;
  onUpdated: (updated: FasilitasData) => void;
  onDeleted: (id: string) => void;
}

export default function FasilitasCard({
  fasilitas,
  kosId,
  onUpdated,
  onDeleted,
}: FasilitasCardProps) {
  const [mode, setMode] = useState<"view" | "edit" | "confirmDelete">("view");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  // State foto lokal supaya galeri update real-time tanpa reload
  const [fotoUrls, setFotoUrls] = useState<string[]>(fasilitas.fotoUrls);

  function handleFotoAdded(url: string) {
    const newUrls = [...fotoUrls, url];
    setFotoUrls(newUrls);
    onUpdated({ ...fasilitas, fotoUrls: newUrls });
  }

  function handleFotoDeleted(url: string) {
    const newUrls = fotoUrls.filter((u) => u !== url);
    setFotoUrls(newUrls);
    onUpdated({ ...fasilitas, fotoUrls: newUrls });
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/fasilitas/${fasilitas.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setDeleteError(data.error ?? "Gagal menghapus");
        setMode("view");
        return;
      }
      onDeleted(fasilitas.id);
    } catch {
      setDeleteError("Gagal terhubung ke server");
      setMode("view");
    } finally {
      setDeleting(false);
    }
  }

  // Mode EDIT — tampilkan form inline
  if (mode === "edit") {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-emerald-600">
          Edit fasilitas
        </p>
        <FasilitasForm
          mode="edit"
          kosId={kosId}
          initial={{ ...fasilitas, fotoUrls }}
          onSuccess={(updated) => {
            onUpdated({ ...updated, fotoUrls });
            setMode("view");
          }}
          onCancel={() => setMode("view")}
        />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-100 bg-white overflow-hidden transition-shadow hover:shadow-sm">
      {/* Row utama: rating + nama + aksi */}
      <div className="flex items-start gap-3 p-4">
        {/* Rating badge */}
        <div className="shrink-0 pt-0.5">
          <RatingBadge score={fasilitas.rating} size="md" showDenom />
        </div>

        {/* Konten */}
        <div className="min-w-0 flex-1">
          <p className="font-medium text-slate-800 leading-snug">{fasilitas.nama}</p>
          {fasilitas.catatan && (
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              {fasilitas.catatan}
            </p>
          )}
          {deleteError && (
            <p className="mt-1 text-xs text-red-600">{deleteError}</p>
          )}
        </div>

        {/* Aksi */}
        <div className="shrink-0 flex items-center gap-1">
          {mode === "confirmDelete" ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">Hapus?</span>
              <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete}>
                Ya
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setMode("view")} disabled={deleting}>
                Tidak
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode("edit")}
                aria-label="Edit fasilitas"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode("confirmDelete")}
                aria-label="Hapus fasilitas"
                className="text-red-400 hover:bg-red-50 hover:text-red-600"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Section foto */}
      <div className="border-t border-slate-50 px-4 pb-4">
        {/* Galeri foto yang sudah ada */}
        {fotoUrls.length > 0 && (
          <FotoGaleri
            fasilitasId={fasilitas.id}
            urls={fotoUrls}
            onDeleted={handleFotoDeleted}
            editable
          />
        )}

        {/* Toggle upload */}
        {showUpload ? (
          <div className="mt-3">
            <FotoUpload
              fasilitasId={fasilitas.id}
              onUploaded={handleFotoAdded}
            />
            <button
              type="button"
              onClick={() => setShowUpload(false)}
              className="mt-2 text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Tutup upload
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowUpload(true)}
            className={[
              "mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-200 py-2.5 text-xs text-slate-400",
              "hover:border-emerald-300 hover:text-emerald-600 transition-colors",
            ].join(" ")}
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {fotoUrls.length > 0 ? "Tambah foto lagi" : "Tambah foto fasilitas ini"}
          </button>
        )}
      </div>
    </div>
  );
}
