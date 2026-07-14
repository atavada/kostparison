"use client";

import { useState, useEffect, useCallback } from "react";

interface FotoGaleriProps {
  fasilitasId: string;
  urls: string[];
  onDeleted: (url: string) => void;
  /** Kalau false, tombol hapus disembunyikan (mode view-only) */
  editable?: boolean;
}

export default function FotoGaleri({
  fasilitasId,
  urls,
  onDeleted,
  editable = true,
}: FotoGaleriProps) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [confirmDeleteUrl, setConfirmDeleteUrl] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Navigasi keyboard di lightbox
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!lightboxUrl) return;
      if (e.key === "Escape") setLightboxUrl(null);
      if (e.key === "ArrowRight") {
        const next = (lightboxIdx + 1) % urls.length;
        setLightboxIdx(next);
        setLightboxUrl(urls[next]);
      }
      if (e.key === "ArrowLeft") {
        const prev = (lightboxIdx - 1 + urls.length) % urls.length;
        setLightboxIdx(prev);
        setLightboxUrl(urls[prev]);
      }
    },
    [lightboxUrl, lightboxIdx, urls]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // Lock scroll saat lightbox terbuka
  useEffect(() => {
    if (lightboxUrl) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [lightboxUrl]);

  async function handleDelete(url: string) {
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/fasilitas/${fasilitasId}/foto`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const data = await res.json();
        setDeleteError(data.error ?? "Gagal menghapus foto");
        return;
      }
      setConfirmDeleteUrl(null);
      onDeleted(url);
    } catch {
      setDeleteError("Gagal terhubung ke server");
    } finally {
      setDeleting(false);
    }
  }

  function openLightbox(url: string, idx: number) {
    setLightboxIdx(idx);
    setLightboxUrl(url);
  }

  if (urls.length === 0) return null;

  return (
    <>
      {/* Grid thumbnail */}
      <div className="mt-3 grid grid-cols-3 gap-1.5 sm:grid-cols-4">
        {urls.map((url, idx) => (
          <div key={url} className="group relative aspect-square overflow-hidden rounded-lg bg-slate-100">
            {/* Thumbnail */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Foto fasilitas ${idx + 1}`}
              className="h-full w-full cursor-zoom-in object-cover transition-transform group-hover:scale-105"
              onClick={() => openLightbox(url, idx)}
              loading="lazy"
            />

            {/* Overlay aksi — muncul saat hover */}
            {editable && (
              <div className="absolute inset-0 flex items-start justify-end bg-black/0 p-1 opacity-0 transition-all group-hover:bg-black/20 group-hover:opacity-100">
                {confirmDeleteUrl === url ? (
                  <div className="flex gap-1 rounded-md bg-black/70 p-1">
                    <button
                      onClick={() => handleDelete(url)}
                      disabled={deleting}
                      className="rounded px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-red-500 transition-colors disabled:opacity-50"
                    >
                      {deleting ? "..." : "Hapus"}
                    </button>
                    <button
                      onClick={() => { setConfirmDeleteUrl(null); setDeleteError(""); }}
                      disabled={deleting}
                      className="rounded px-1.5 py-0.5 text-[10px] text-white hover:bg-white/20 transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteUrl(url); }}
                    className="rounded-md bg-black/60 p-1 text-white hover:bg-red-600 transition-colors"
                    aria-label="Hapus foto ini"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {deleteError && (
        <p className="mt-1 text-xs text-red-600">{deleteError}</p>
      )}

      {/* Lightbox modal */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxUrl(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Foto fullscreen"
        >
          {/* Tombol tutup */}
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
            onClick={() => setLightboxUrl(null)}
            aria-label="Tutup"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigasi kiri */}
          {urls.length > 1 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                const prev = (lightboxIdx - 1 + urls.length) % urls.length;
                setLightboxIdx(prev);
                setLightboxUrl(urls[prev]);
              }}
              aria-label="Foto sebelumnya"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Gambar utama */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxUrl}
            alt={`Foto ${lightboxIdx + 1} dari ${urls.length}`}
            className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Navigasi kanan */}
          {urls.length > 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                const next = (lightboxIdx + 1) % urls.length;
                setLightboxIdx(next);
                setLightboxUrl(urls[next]);
              }}
              aria-label="Foto berikutnya"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Counter */}
          {urls.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
              {lightboxIdx + 1} / {urls.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
