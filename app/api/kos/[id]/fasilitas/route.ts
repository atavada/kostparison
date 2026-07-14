import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// GET /api/kos/[id]/fasilitas — semua fasilitas milik satu kos
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id: kosId } = await params;

    const kos = await prisma.kos.findUnique({ where: { id: kosId }, select: { id: true } });
    if (!kos) {
      return NextResponse.json({ error: "Kos tidak ditemukan" }, { status: 404 });
    }

    const fasilitas = await prisma.fasilitas.findMany({
      where: { kosId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(fasilitas);
  } catch (error) {
    console.error("[GET /api/kos/[id]/fasilitas]", error);
    return NextResponse.json({ error: "Gagal mengambil data fasilitas" }, { status: 500 });
  }
}

// POST /api/kos/[id]/fasilitas — tambah fasilitas baru ke kos
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id: kosId } = await params;

    const kos = await prisma.kos.findUnique({ where: { id: kosId }, select: { id: true } });
    if (!kos) {
      return NextResponse.json({ error: "Kos tidak ditemukan" }, { status: 404 });
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

    const fasilitas = await prisma.fasilitas.create({
      data: {
        nama: nama.trim(),
        rating: ratingNum,
        catatan: catatan?.trim() || null,
        fotoUrls: [],
        kosId,
      },
    });

    return NextResponse.json(fasilitas, { status: 201 });
  } catch (error) {
    console.error("[POST /api/kos/[id]/fasilitas]", error);
    return NextResponse.json({ error: "Gagal menambah fasilitas" }, { status: 500 });
  }
}
