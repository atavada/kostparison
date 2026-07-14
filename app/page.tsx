export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 mb-2">
          <svg
            className="w-8 h-8 text-emerald-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-semibold text-slate-800 tracking-tight">
          Kostparison
        </h1>
        <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">
          Setup Berhasil
        </p>
        <div className="pt-4 border-t border-slate-200">
          <p className="text-slate-400 text-xs">
            Survey kos · Rating fasilitas · Analisis AI
          </p>
        </div>
      </div>
    </div>
  );
}
