"use client";

import { useRef, useState } from "react";

interface PendingFile {
  id: string;           // local ID unik
  file: File;
  previewUrl: string;   // object URL untuk preview lokal
  status: "pending" | "uploading" | "done" | "error";
  progress: number;     // 0-100
  errorMsg?: string;
  uploadedUrl?: string; // URL dari Vercel Blob setelah upload berhasil
}

interface FotoUploadProps {
  fasilitasId: string;
  onUploaded: (url: string) => void; // dipanggil tiap kali satu foto selesai terupload
}

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function FotoUpload({ fasilitasId, onUploaded }: FotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<PendingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  function updateItem(id: string, patch: Partial<PendingFile>) {
    setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function addFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    const valid = arr.filter((f) => {
      if (!ALLOWED_TYPES.includes(f.type)) return false;
      if (f.size > MAX_SIZE_BYTES) return false;
      return true;
    });

    const invalid = arr.filter((f) => !valid.includes(f));
    if (invalid.length > 0) {
      // Tampilkan error untuk file yang tidak valid
      const errItems: PendingFile[] = invalid.map((f) => ({
        id: crypto.randomUUID(),
        file: f,
        previewUrl: "",
        status: "error",
        progress: 0,
        errorMsg: !ALLOWED_TYPES.includes(f.type)
          ? "Tipe tidak didukung (JPG/PNG/WebP)"
          : `Ukuran melebihi ${MAX_SIZE_MB} MB`,
      }));
      setQueue((prev) => [...prev, ...errItems]);
    }

    const newItems: PendingFile[] = valid.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      previewUrl: URL.createObjectURL(f),
      status: "pending",
      progress: 0,
    }));

    setQueue((prev) => [...prev, ...newItems]);

    // Upload otomatis semua file yang baru ditambahkan
    newItems.forEach((item) => uploadFile(item));
  }

  async function uploadFile(item: PendingFile) {
    updateItem(item.id, { status: "uploading", progress: 10 });

    try {
      // Step 1: upload ke /api/upload
      const formData = new FormData();
      formData.append("file", item.file);

      // Simulasi progress: 10 → 80 sebelum response
      updateItem(item.id, { progress: 40 });

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      updateItem(item.id, { progress: 70 });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        updateItem(item.id, {
          status: "error",
          progress: 0,
          errorMsg: uploadData.error ?? "Upload gagal",
        });
        return;
      }

      const blobUrl: string = uploadData.url;

      // Step 2: simpan URL ke database via /api/fasilitas/[id]/foto
      const saveRes = await fetch(`/api/fasilitas/${fasilitasId}/foto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: blobUrl }),
      });

      if (!saveRes.ok) {
        const saveData = await saveRes.json();
        updateItem(item.id, {
          status: "error",
          progress: 0,
          errorMsg: saveData.error ?? "Gagal menyimpan foto",
        });
        return;
      }

      updateItem(item.id, { status: "done", progress: 100, uploadedUrl: blobUrl });
      onUploaded(blobUrl);

      // Bersihkan preview setelah selesai (tunda sedikit supaya ada feedback visual)
      setTimeout(() => {
        URL.revokeObjectURL(item.previewUrl);
        setQueue((prev) => prev.filter((i) => i.id !== item.id));
      }, 1200);
    } catch {
      updateItem(item.id, {
        status: "error",
        progress: 0,
        errorMsg: "Gagal terhubung ke server",
      });
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = ""; // reset supaya file yang sama bisa diupload ulang
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  }

  const hasQueue = queue.length > 0;

  return (
    <div className="space-y-3">
      {/* Drop zone — pakai <label> native agar reliable di semua mobile browser */}
      <label
        htmlFor="foto-upload-input"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={[
          "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors",
          isDragging
            ? "border-emerald-400 bg-emerald-50"
            : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50",
        ].join(" ")}
        aria-label="Pilih atau ambil foto"
      >
        <svg className="mb-2 h-7 w-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm font-medium text-slate-600">
          Pilih foto atau ambil dengan kamera
        </p>
        <p className="mt-0.5 text-xs text-slate-400">
          JPG, PNG, WebP · maks {MAX_SIZE_MB} MB per foto
        </p>

        {/* Input — capture="environment" buka kamera belakang di HP */}
        <input
          id="foto-upload-input"
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          capture="environment"
          onChange={handleInputChange}
          className="sr-only"
        />
      </label>

      {/* Antrian upload */}
      {hasQueue && (
        <div className="space-y-2">
          {queue.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white p-2">
              {/* Thumbnail preview */}
              {item.previewUrl ? (
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-12 w-12 shrink-0 rounded-md bg-red-50 flex items-center justify-center">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}

              {/* Info + progress */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-slate-700">{item.file.name}</p>
                {item.status === "error" ? (
                  <p className="text-xs text-red-500">{item.errorMsg}</p>
                ) : item.status === "done" ? (
                  <p className="text-xs text-emerald-600">Tersimpan</p>
                ) : (
                  <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Status icon */}
              <div className="shrink-0">
                {item.status === "uploading" && (
                  <svg className="h-4 w-4 animate-spin text-emerald-500" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {item.status === "done" && (
                  <svg className="h-4 w-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {item.status === "error" && (
                  <button
                    type="button"
                    onClick={() => setQueue((prev) => prev.filter((i) => i.id !== item.id))}
                    className="text-xs text-slate-400 hover:text-slate-600"
                    aria-label="Hapus dari antrian"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
