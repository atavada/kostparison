import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// PUT /api/fasilitas/[id] — update nama, rating, catatan (fotoUrls dikelola via /foto endpoint)
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const existing = await prisma.fasilitas.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Fasilitas tidak ditemukan" }, { status: 404 });
    }

    const body = await req.json();
    const { nama, rating, catatan } = body;

    if (!nama || typeof nama !== "string" || nama.trim() === "") {
      return NextResponse.json({ error: "Nama fasilitas wajib diisi" }, { status: 400 });
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || !Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 10) {
      return NextResponse.json(
        { error: "Rating harus berupa angka bulat antara 1 sampai 10" },
        { status: 400 }
      );
    }

    const updated = await prisma.fasilitas.update({
      where: { id },
      data: {
        nama: nama.trim(),
        rating: ratingNum,
        catatan: catatan?.trim() || null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUT /api/fasilitas/[id]]", error);
    return NextResponse.json({ error: "Gagal mengupdate fasilitas" }, { status: 500 });
  }
}

// DELETE /api/fasilitas/[id] — hapus fasilitas beserta semua fotonya dari Blob
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const existing = await prisma.fasilitas.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Fasilitas tidak ditemukan" }, { status: 404 });
    }

    // Hapus semua foto dari Vercel Blob sebelum hapus record
    if (existing.fotoUrls.length > 0) {
      try {
        await del(existing.fotoUrls);
      } catch (blobErr) {
        console.warn("[DELETE fasilitas] Gagal hapus foto dari Blob:", blobErr);
        // Lanjutkan hapus record meski Blob gagal — lebih baik orphan file
        // daripada data fasilitas tidak bisa dihapus
      }
    }

    await prisma.fasilitas.delete({ where: { id } });
    return NextResponse.json({ message: "Fasilitas berhasil dihapus" });
  } catch (error) {
    console.error("[DELETE /api/fasilitas/[id]]", error);
    return NextResponse.json({ error: "Gagal menghapus fasilitas" }, { status: 500 });
  }
}
