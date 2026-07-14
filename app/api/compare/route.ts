import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/compare?ids=id1,id2,id3
// Fetch data lengkap beberapa kos sekaligus untuk halaman perbandingan
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("ids");

    if (!idsParam) {
      return NextResponse.json({ error: "Parameter ids wajib diisi" }, { status: 400 });
    }

    const ids = idsParam
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (ids.length < 2 || ids.length > 3) {
      return NextResponse.json(
        { error: "Pilih 2 sampai 3 kos untuk dibandingkan" },
        { status: 400 }
      );
    }

    const kosList = await prisma.kos.findMany({
      where: { id: { in: ids } },
      include: {
        fasilitas: { orderBy: { nama: "asc" } },
      },
    });

    // Pertahankan urutan sesuai ids yang diminta
    const ordered = ids
      .map((id) => kosList.find((k) => k.id === id))
      .filter(Boolean);

    // Serialisasi Date
    const serialized = ordered.map((k) => ({
      ...k,
      tanggalSurvey: k!.tanggalSurvey.toISOString(),
      createdAt: k!.createdAt.toISOString(),
      updatedAt: k!.updatedAt.toISOString(),
      fasilitas: k!.fasilitas.map((f) => ({
        ...f,
        createdAt: f.createdAt.toISOString(),
        updatedAt: f.updatedAt.toISOString(),
      })),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error("[GET /api/compare]", error);
    return NextResponse.json({ error: "Gagal mengambil data perbandingan" }, { status: 500 });
  }
}
