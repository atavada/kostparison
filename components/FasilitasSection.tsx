"use client";

import { useState } from "react";
import Button from "@/components/Button";
import FasilitasCard from "@/components/FasilitasCard";
import FasilitasForm, { type FasilitasData } from "@/components/FasilitasForm";
import RatingBadge from "@/components/RatingBadge";
import { hitungOverallScore } from "@/lib/scoring";

interface FasilitasSectionProps {
  kosId: string;
  initialFasilitas: FasilitasData[];
}

export default function FasilitasSection({ kosId, initialFasilitas }: FasilitasSectionProps) {
  const [fasilitas, setFasilitas] = useState<FasilitasData[]>(initialFasilitas);
  const [showAddForm, setShowAddForm] = useState(false);

  const overallScore = hitungOverallScore(fasilitas);

  function handleAdded(newF: FasilitasData) {
    setFasilitas((prev) => [...prev, newF]);
    setShowAddForm(false);
  }

  function handleUpdated(updated: FasilitasData) {
    setFasilitas((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  }

  function handleDeleted(id: string) {
    setFasilitas((prev) => prev.filter((f) => f.id !== id));
  }

  return (
    <div className="space-y-6">
      {/* Overall Score Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Overall Score
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {fasilitas.length > 0
                ? `Rata-rata dari ${fasilitas.length} fasilitas`
                : "Belum ada fasilitas dinilai"}
            </p>
          </div>
          <RatingBadge score={overallScore} size="lg" showDenom />
        </div>

        {/* Mini bar chart per fasilitas */}
        {fasilitas.length > 0 && (
          <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-4">
            {fasilitas.map((f) => (
              <div key={f.id} className="flex items-center gap-2 text-xs">
                <span className="w-28 shrink-0 truncate text-slate-500">{f.nama}</span>
                <div className="flex-1 rounded-full bg-slate-100 h-1.5 overflow-hidden">
                  <div
                    className={[
                      "h-full rounded-full transition-all",
                      f.rating >= 8 ? "bg-emerald-400" :
                      f.rating >= 5 ? "bg-amber-400" :
                      "bg-red-400",
                    ].join(" ")}
                    style={{ width: `${f.rating * 10}%` }}
                  />
                </div>
                <span className="w-6 text-right font-medium text-slate-600 tabular-nums">
                  {f.rating}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fasilitas Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">Fasilitas</h2>
            {fasilitas.length > 0 && (
              <p className="text-xs text-slate-400">{fasilitas.length} item</p>
            )}
          </div>
          {!showAddForm && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAddForm(true)}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Fasilitas
            </Button>
          )}
        </div>

        {/* Inline add form */}
        {showAddForm && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50/40 p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-emerald-600">
              Fasilitas baru
            </p>
            <FasilitasForm
              mode="create"
              kosId={kosId}
              onSuccess={handleAdded}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {/* List fasilitas */}
        {fasilitas.length === 0 && !showAddForm ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 py-10 text-center">
            <svg
              className="mb-3 h-8 w-8 text-slate-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-sm text-slate-500">Belum ada fasilitas ditambahkan</p>
            <p className="mt-1 text-xs text-slate-400">
              Klik &ldquo;Tambah Fasilitas&rdquo; untuk mulai menilai
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {fasilitas.map((f) => (
              <FasilitasCard
                key={f.id}
                fasilitas={f}
                kosId={kosId}
                onUpdated={handleUpdated}
                onDeleted={handleDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
