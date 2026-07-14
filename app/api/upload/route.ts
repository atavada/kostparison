import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

// Pilihan: server upload (bukan client upload pattern).
// Alasan: foto kos dari kamera HP rata-rata 1-5 MB — masih dalam batas
// serverless function (body limit Next.js 6 MB via next.config.ts).
// Server upload lebih sederhana: tidak perlu token exchange bolak-balik,
// tidak butuh komponen client khusus, dan cukup untuk use case personal ini.
// Kalau ke depan butuh upload > 4.5 MB per file, baru switch ke client upload
// dengan handleUpload() + route handler token.

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "File tidak ditemukan dalam request" },
        { status: 400 }
      );
    }

    // Validasi tipe
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Tipe file tidak didukung. Hanya: JPG, PNG, WebP` },
        { status: 400 }
      );
    }

    // Validasi ukuran
    if (file.size > MAX_SIZE_BYTES) {
      const maxMb = MAX_SIZE_BYTES / (1024 * 1024);
      return NextResponse.json(
        { error: `Ukuran file melebihi batas ${maxMb} MB` },
        { status: 400 }
      );
    }

    // Buat pathname unik: fasilitas/<timestamp>-<nama-asli-sanitized>
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const safeName = file.name
      .replace(/\.[^.]+$/, "")                 // hapus ekstensi
      .replace(/[^a-zA-Z0-9-_]/g, "-")         // sanitasi karakter
      .slice(0, 40)                              // potong kalau terlalu panjang
      .toLowerCase();
    const pathname = `fasilitas/${Date.now()}-${safeName}.${ext}`;

    const blob = await put(pathname, file, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({ url: blob.url }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/upload]", error);

    // Pesan error spesifik dari Vercel Blob
    if (error instanceof Error) {
      if (error.message.includes("token") || error.message.includes("BLOB_READ_WRITE_TOKEN")) {
        return NextResponse.json(
          { error: "Token Blob belum dikonfigurasi. Isi BLOB_READ_WRITE_TOKEN di .env" },
          { status: 500 }
        );
      }
      if (error.message.includes("Too large") || error.message.includes("size")) {
        return NextResponse.json(
          { error: "File terlalu besar untuk di-upload ke storage" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ error: "Gagal mengupload foto" }, { status: 500 });
  }
}
