import type { EarningsSeasonRow } from "@/types/earnings";
import { cn, formatCr, surpriseColor } from "@/lib/utils";

interface Stat {
  label: string;
  value: string;
  yoy?: number | null;
  caveat?: string;
}

export default function HeroStats({ co }: { co: EarningsSeasonRow }) {
  const stats: Stat[] = [
    {
      label: "Revenue",
      value: formatCr(co.revenue_act ?? undefined),
      yoy: co.revenue_yoy_pct ?? null,
    },
    {
      label: "PAT",
      value: formatCr(co.pat_act ?? undefined),
      yoy: co.pat_yoy_pct ?? null,
    },
    {
      label: "EBITDA",
      value: formatCr(co.ebitda_act ?? undefined),
    },
  ];

  // Suppress entire strip if no actuals at all
  if (stats.every((s) => s.value === "—")) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
      {stats.map((s) => (
        <div key={s.label} className="bg-zinc-950 px-6 py-5">
          <div className="text-[10px] text-zinc-500 uppercase tracking-[0.18em] mb-2">
            {s.label}
          </div>
          <div className="text-3xl lg:text-4xl font-medium text-white tracking-tight tabular-nums">
            {s.value}
          </div>
          {s.yoy != null && (
            <div className={cn("mt-2 text-xs tabular-nums", surpriseColor(s.yoy))}>
              {s.yoy > 0 ? "▲" : s.yoy < 0 ? "▼" : "■"}
              <span className="ml-1">
                {s.yoy > 0 ? "+" : ""}
                {s.yoy}% YoY
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
