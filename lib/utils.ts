/**
 * Format angka ke format Rupiah
 * Contoh: 1500000 → "Rp 1.500.000"
 */
export function formatRupiah(angka: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(angka);
}

/**
 * Format tanggal ke format Indonesia
 * Contoh: 2024-01-15 → "15 Januari 2024"
 */
export function formatTanggal(tanggal: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(tanggal));
}

/**
 * Format Date ke yyyy-MM-dd untuk value input[type=date]
 */
export function toDateInputValue(tanggal: string | Date): string {
  const d = new Date(tanggal);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
