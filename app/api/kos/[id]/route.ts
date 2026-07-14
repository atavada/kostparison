import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// GET /api/kos/[id] — detail kos + semua fasilitas
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const kos = await prisma.kos.findUnique({
      where: { id },
      include: { fasilitas: { orderBy: { createdAt: "asc" } } },
    });

    if (!kos) {
      return NextResponse.json({ error: "Kos tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(kos);
  } catch (error) {
    console.error("[GET /api/kos/[id]]", error);
    return NextResponse.json({ error: "Gagal mengambil data kos" }, { status: 500 });
  }
}

// PUT /api/kos/[id] — update kos
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nama, alamat, harga, kontakPemilik, tanggalSurvey, catatan } = body;

    // Cek keberadaan
    const existing = await prisma.kos.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Kos tidak ditemukan" }, { status: 404 });
    }

    // Validasi field wajib
    if (!nama || typeof nama !== "string" || nama.trim() === "") {
      return NextResponse.json({ error: "Nama kos wajib diisi" }, { status: 400 });
    }
    if (!alamat || typeof alamat !== "string" || alamat.trim() === "") {
      return NextResponse.json({ error: "Alamat kos wajib diisi" }, { status: 400 });
    }
    const hargaNum = Number(harga);
    if (!harga || isNaN(hargaNum) || hargaNum <= 0 || !Number.isInteger(hargaNum)) {
      return NextResponse.json(
        { error: "Harga harus berupa angka positif" },
        { status: 400 }
      );
    }

    const updated = await prisma.kos.update({
      where: { id },
      data: {
        nama: nama.trim(),
        alamat: alamat.trim(),
        harga: hargaNum,
        kontakPemilik: kontakPemilik?.trim() || null,
        tanggalSurvey: tanggalSurvey ? new Date(tanggalSurvey) : existing.tanggalSurvey,
        catatan: catatan?.trim() || null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUT /api/kos/[id]]", error);
    return NextResponse.json({ error: "Gagal mengupdate data kos" }, { status: 500 });
  }
}

// DELETE /api/kos/[id] — hapus kos (cascade ke fasilitas via schema)
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const existing = await prisma.kos.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Kos tidak ditemukan" }, { status: 404 });
    }

    await prisma.kos.delete({ where: { id } });
    return NextResponse.json({ message: "Kos berhasil dihapus" });
  } catch (error) {
    console.error("[DELETE /api/kos/[id]]", error);
    return NextResponse.json({ error: "Gagal menghapus kos" }, { status: 500 });
  }
}
