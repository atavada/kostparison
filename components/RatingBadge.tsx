import { getRatingTier, formatScore, type RatingTier } from "@/lib/scoring";

interface RatingBadgeProps {
  score: number | null;
  /** "sm" untuk badge kecil di list/card, "lg" untuk display besar di header detail */
  size?: "sm" | "md" | "lg";
  /** Tampilkan label "/10" di sebelah angka */
  showDenom?: boolean;
}

const tierStyles: Record<RatingTier, { bg: string; text: string; ring: string }> = {
  high: { bg: "bg-emerald-100", text: "text-emerald-700", ring: "ring-emerald-200" },
  mid:  { bg: "bg-amber-100",   text: "text-amber-700",   ring: "ring-amber-200"   },
  low:  { bg: "bg-red-100",     text: "text-red-700",     ring: "ring-red-200"     },
  none: { bg: "bg-slate-100",   text: "text-slate-400",   ring: "ring-slate-200"   },
};

const sizeStyles = {
  sm: { wrap: "px-2 py-0.5 text-xs rounded-full",     num: "font-semibold" },
  md: { wrap: "px-2.5 py-1 text-sm rounded-lg",       num: "font-bold"     },
  lg: { wrap: "px-4 py-2.5 text-2xl rounded-xl ring-2", num: "font-extrabold tabular-nums" },
};

export default function RatingBadge({
  score,
  size = "sm",
  showDenom = false,
}: RatingBadgeProps) {
  const tier = getRatingTier(score);
  const { bg, text, ring } = tierStyles[tier];
  const { wrap, num } = sizeStyles[size];

  return (
    <span
      className={[bg, text, ring, wrap, "inline-flex items-baseline gap-0.5 whitespace-nowrap"].join(" ")}
      title={score !== null ? `Rating: ${formatScore(score)} / 10` : "Belum ada rating"}
    >
      <span className={num}>{formatScore(score)}</span>
      {showDenom && score !== null && (
        <span className="text-[0.6em] font-normal opacity-60">/10</span>
      )}
    </span>
  );
}
