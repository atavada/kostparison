"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { Field, Input, Textarea } from "@/components/Input";
import { toDateInputValue } from "@/lib/utils";

export interface KosFormValues {
  nama: string;
  alamat: string;
  harga: string; // string karena dari input
  kontakPemilik: string;
  tanggalSurvey: string;
  catatan: string;
}

interface KosFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<KosFormValues>;
  kosId?: string; // diperlukan saat edit
}

const defaultValues: KosFormValues = {
  nama: "",
  alamat: "",
  harga: "",
  kontakPemilik: "",
  tanggalSurvey: toDateInputValue(new Date()),
  catatan: "",
};

export default function KosForm({ mode, initialValues, kosId }: KosFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<KosFormValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [errors, setErrors] = useState<Partial<KosFormValues>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function set(field: keyof KosFormValues) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
      setErrors((er) => ({ ...er, [field]: undefined }));
    };
  }

  // Format angka ke tampilan ribuan saat user mengetik harga
  function handleHargaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "");
    setValues((v) => ({ ...v, harga: raw }));
    setErrors((er) => ({ ...er, harga: undefined }));
  }

  function validate(): boolean {
    const newErrors: Partial<KosFormValues> = {};
    if (!values.nama.trim()) newErrors.nama = "Nama kos wajib diisi";
    if (!values.alamat.trim()) newErrors.alamat = "Alamat wajib diisi";
    const hargaNum = Number(values.harga);
    if (!values.harga || isNaN(hargaNum) || hargaNum <= 0) {
      newErrors.harga = "Harga harus berupa angka positif";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        nama: values.nama.trim(),
        alamat: values.alamat.trim(),
        harga: Number(values.harga),
        kontakPemilik: values.kontakPemilik.trim() || null,
        tanggalSurvey: values.tanggalSurvey || null,
        catatan: values.catatan.trim() || null,
      };

      const url = mode === "create" ? "/api/kos" : `/api/kos/${kosId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error ?? "Terjadi kesalahan, coba lagi.");
        return;
      }

      // Redirect ke halaman detail kos
      // Gunakan window.location untuk hard navigation — lebih reliable di mobile
      // karena router.push() kadang gagal setelah async fetch di iOS Safari
      const targetId = mode === "create" ? data.id : kosId;
      window.location.href = `/kos/${targetId}`;
    } catch {
      setServerError("Gagal terhubung ke server. Periksa koneksi internet.");
    } finally {
      setSubmitting(false);
    }
  }

  // Tampilan harga dengan pemisah ribuan
  const hargaDisplay = values.harga
    ? Number(values.harga).toLocaleString("id-ID")
    : "";

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <Field label="Nama Kos" htmlFor="nama" error={errors.nama} required>
        <Input
          id="nama"
          value={values.nama}
          onChange={set("nama")}
          placeholder="Misal: Kos Pak Budi, Kos Melati Indah"
          error={!!errors.nama}
          autoFocus={mode === "create"}
        />
      </Field>

      <Field label="Alamat" htmlFor="alamat" error={errors.alamat} required>
        <Textarea
          id="alamat"
          value={values.alamat}
          onChange={set("alamat")}
          placeholder="Alamat lengkap kos"
          error={!!errors.alamat}
          rows={2}
        />
      </Field>

      <Field
        label="Harga per Bulan"
        htmlFor="harga"
        error={errors.harga}
        required
        hint="Masukkan angka saja tanpa titik atau koma"
      >
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-400">
            Rp
          </span>
          <Input
            id="harga"
            inputMode="numeric"
            value={hargaDisplay}
            onChange={handleHargaChange}
            placeholder="1.500.000"
            error={!!errors.harga}
            className="pl-9"
          />
        </div>
      </Field>

      <Field
        label="Kontak Pemilik"
        htmlFor="kontakPemilik"
        hint="Nomor HP atau nama — opsional"
      >
        <Input
          id="kontakPemilik"
          value={values.kontakPemilik}
          onChange={set("kontakPemilik")}
          placeholder="Misal: 0812-3456-7890 atau Bu Sari"
        />
      </Field>

      <Field label="Tanggal Survey" htmlFor="tanggalSurvey">
        <Input
          id="tanggalSurvey"
          type="date"
          value={values.tanggalSurvey}
          onChange={set("tanggalSurvey")}
        />
      </Field>

      <Field label="Catatan Umum" htmlFor="catatan" hint="Kesan umum, hal yang perlu diingat — opsional">
        <Textarea
          id="catatan"
          value={values.catatan}
          onChange={set("catatan")}
          placeholder="Misal: Lingkungan tenang, pemilik ramah, parkir motor ada tapi sempit"
          rows={4}
        />
      </Field>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={submitting}
        >
          Batal
        </Button>
        <Button type="submit" loading={submitting}>
          {mode === "create" ? "Simpan Kos" : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  );
}
