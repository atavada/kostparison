import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// POST /api/fasilitas/[id]/foto — tambah URL foto ke fotoUrls array
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const existing = await prisma.fasilitas.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Fasilitas tidak ditemukan" }, { status: 404 });
    }

    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL foto wajib diisi" }, { status: 400 });
    }

    const updated = await prisma.fasilitas.update({
      where: { id },
      data: {
        fotoUrls: { push: url },
      },
    });

    return NextResponse.json({ fotoUrls: updated.fotoUrls }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/fasilitas/[id]/foto]", error);
    return NextResponse.json({ error: "Gagal menyimpan URL foto" }, { status: 500 });
  }
}

// DELETE /api/fasilitas/[id]/foto — hapus satu foto dari array + hapus dari Blob
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const existing = await prisma.fasilitas.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Fasilitas tidak ditemukan" }, { status: 404 });
    }

    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL foto yang akan dihapus wajib diisi" }, { status: 400 });
    }

    if (!existing.fotoUrls.includes(url)) {
      return NextResponse.json({ error: "Foto tidak ditemukan di fasilitas ini" }, { status: 404 });
    }

    // Hapus dari Vercel Blob storage terlebih dahulu
    try {
      await del(url);
    } catch (blobErr) {
      // Jika file sudah tidak ada di Blob, lanjutkan saja
      console.warn("[DELETE foto] Blob file tidak ditemukan, tetap lanjut hapus dari DB:", blobErr);
    }

    // Hapus URL dari array di database
    const newFotoUrls = existing.fotoUrls.filter((u) => u !== url);
    const updated = await prisma.fasilitas.update({
      where: { id },
      data: { fotoUrls: newFotoUrls },
    });

    return NextResponse.json({ fotoUrls: updated.fotoUrls });
  } catch (error) {
    console.error("[DELETE /api/fasilitas/[id]/foto]", error);
    return NextResponse.json({ error: "Gagal menghapus foto" }, { status: 500 });
  }
}
