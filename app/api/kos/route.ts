import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/kos — semua kos, terbaru dulu, include jumlah fasilitas
export async function GET() {
  try {
    const kosList = await prisma.kos.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { fasilitas: true } },
      },
    });
    return NextResponse.json(kosList);
  } catch (error) {
    console.error("[GET /api/kos]", error);
    return NextResponse.json(
      { error: "Gagal mengambil data kos" },
      { status: 500 }
    );
  }
}

// POST /api/kos — buat kos baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama, alamat, harga, kontakPemilik, tanggalSurvey, catatan } = body;

    // Validasi field wajib
    if (!nama || typeof nama !== "string" || nama.trim() === "") {
      return NextResponse.json(
        { error: "Nama kos wajib diisi" },
        { status: 400 }
      );
    }
    if (!alamat || typeof alamat !== "string" || alamat.trim() === "") {
      return NextResponse.json(
        { error: "Alamat kos wajib diisi" },
        { status: 400 }
      );
    }
    const hargaNum = Number(harga);
    if (!harga || isNaN(hargaNum) || hargaNum <= 0 || !Number.isInteger(hargaNum)) {
      return NextResponse.json(
        { error: "Harga harus berupa angka positif" },
        { status: 400 }
      );
    }

    const kos = await prisma.kos.create({
      data: {
        nama: nama.trim(),
        alamat: alamat.trim(),
        harga: hargaNum,
        kontakPemilik: kontakPemilik?.trim() || null,
        tanggalSurvey: tanggalSurvey ? new Date(tanggalSurvey) : new Date(),
        catatan: catatan?.trim() || null,
      },
    });

    return NextResponse.json(kos, { status: 201 });
  } catch (error) {
    console.error("[POST /api/kos]", error);
    return NextResponse.json(
      { error: "Gagal membuat data kos" },
      { status: 500 }
    );
  }
}
