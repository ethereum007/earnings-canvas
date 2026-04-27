import type { EarningsSeasonRow } from "@/types/earnings";
import { cn, formatCr, surpriseColor } from "@/lib/utils";

/**
 * Canonical "Headline numbers" table — Q value · YoY · Verdict.
 * Falls back to nothing if no actuals exist.
 */
function verdictBadge(yoy: number | null | undefined, threshold = 0) {
  if (yoy == null) return { label: "—", cls: "text-zinc-500" };
  if (yoy > threshold + 2) return { label: "✅ Beat", cls: "text-emerald-400" };
  if (yoy < threshold - 2) return { label: "🔴 Miss", cls: "text-red-400" };
  return { label: "⚠️ Inline", cls: "text-amber-400" };
}

export default function HeadlineNumbersTable({
  co,
}: {
  co: EarningsSeasonRow;
}) {
  const rows = [
    {
      label: "Revenue",
      value: formatCr(co.revenue_act ?? undefined),
      yoy: co.revenue_yoy_pct,
    },
    {
      label: "EBITDA",
      value: formatCr(co.ebitda_act ?? undefined),
      yoy: null as number | null,
    },
    {
      label: "PAT",
      value: formatCr(co.pat_act ?? undefined),
      yoy: co.pat_yoy_pct,
    },
  ].filter((r) => r.value !== "—");

  if (!rows.length) return null;

  return (
    <div className="rounded-2xl border border-white/5 overflow-hidden">
      <div className="grid grid-cols-12 bg-zinc-900 px-5 py-2.5 text-[10px] text-zinc-500 uppercase tracking-[0.18em]">
        <span className="col-span-4">Metric</span>
        <span className="col-span-3 text-right">{co.quarter}</span>
        <span className="col-span-2 text-right">YoY</span>
        <span className="col-span-3 text-right">Verdict</span>
      </div>
      {rows.map((r) => {
        const v = verdictBadge(r.yoy);
        return (
          <div
            key={r.label}
            className="grid grid-cols-12 px-5 py-3.5 border-t border-white/5 items-center"
          >
            <span className="col-span-4 text-sm text-zinc-200">{r.label}</span>
            <span className="col-span-3 text-right text-base font-medium text-white tabular-nums">
              {r.value}
            </span>
            <span
              className={cn(
                "col-span-2 text-right text-sm tabular-nums",
                surpriseColor(r.yoy ?? null)
              )}
            >
              {r.yoy != null
                ? `${r.yoy > 0 ? "+" : ""}${r.yoy}%`
                : "—"}
            </span>
            <span
              className={cn(
                "col-span-3 text-right text-sm font-medium",
                v.cls
              )}
            >
              {v.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
