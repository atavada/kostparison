/**
 * Logika perhitungan overall score kos berdasarkan rata-rata rating fasilitas.
 */

export type RatingTier = "high" | "mid" | "low" | "none";

/**
 * Hitung rata-rata rating dari array fasilitas.
 * Kembalikan null jika belum ada fasilitas sama sekali.
 */
export function hitungOverallScore(
  fasilitas: { rating: number }[]
): number | null {
  if (fasilitas.length === 0) return null;
  const total = fasilitas.reduce((sum, f) => sum + f.rating, 0);
  const rata = total / fasilitas.length;
  // Bulatkan ke 1 desimal
  return Math.round(rata * 10) / 10;
}

/**
 * Tentukan tier warna berdasarkan nilai rating.
 * - high : 8–10  (hijau / emerald)
 * - mid  : 5–7   (kuning / amber)
 * - low  : 1–4   (merah / red)
 * - none : null  (belum ada data)
 */
export function getRatingTier(score: number | null): RatingTier {
  if (score === null) return "none";
  if (score >= 8) return "high";
  if (score >= 5) return "mid";
  return "low";
}

/**
 * Format score menjadi string tampilan.
 * null → "—"
 */
export function formatScore(score: number | null): string {
  if (score === null) return "—";
  // Tampilkan dengan 1 desimal hanya jika ada angka di belakang koma
  return score % 1 === 0 ? String(score) : score.toFixed(1);
}
