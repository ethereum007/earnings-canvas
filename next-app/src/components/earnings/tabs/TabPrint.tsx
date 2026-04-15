import type { EarningsSeasonRow, BeatQualityItem } from "@/types/earnings";
import { calcPctSurprise, formatCr, cn, surpriseColor } from "@/lib/utils";

export default function TabPrint({ company: co }: { company: EarningsSeasonRow }) {
  const rows = [
    {
      label: "Revenue",
      est: co.revenue_est,
      act: co.revenue_act,
      fmt: formatCr,
      suffix: "%",
    },
    {
      label: "PAT",
      est: co.pat_est,
      act: co.pat_act,
      fmt: formatCr,
      suffix: "%",
    },
    {
      label: "EBITDA",
      est: co.ebitda_est,
      act: co.ebitda_act,
      fmt: formatCr,
      suffix: "%",
    },
    {
      label: "EBIT margin %",
      est: co.ebit_margin_est,
      act: co.ebit_margin_act,
      fmt: (v: number | null | undefined) => (v != null ? `${v}%` : "—"),
      surpriseFn: (a?: number | null, e?: number | null) =>
        a != null && e != null ? Math.round((a - e) * 100) : null,
      suffix: "bps",
    },
  ];

  const beatQuality = (co.beat_quality ?? []) as BeatQualityItem[];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
          P&amp;L scorecard
        </h3>
        <div className="rounded-xl border border-white/5 overflow-hidden">
          <div className="grid grid-cols-4 gap-0 bg-zinc-900 px-4 py-2 text-[10px] text-zinc-500 uppercase tracking-wider">
            <span>Metric</span>
            <span className="text-right">Estimate</span>
            <span className="text-right">Actual</span>
            <span className="text-right">Surprise</span>
          </div>
          {rows.map((r) => {
            const surprise = r.surpriseFn
              ? r.surpriseFn(r.act, r.est)
              : calcPctSurprise(r.act, r.est);
            return (
              <div
                key={r.label}
                className="grid grid-cols-4 gap-0 px-4 py-3 border-t border-white/5"
              >
                <span className="text-sm text-zinc-300">{r.label}</span>
                <span className="text-sm text-zinc-500 text-right tabular-nums">
                  {r.est != null ? r.fmt(r.est) : "—"}
                </span>
                <span className="text-sm font-medium text-white text-right tabular-nums">
                  {r.act != null ? r.fmt(r.act) : "—"}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium text-right tabular-nums",
                    surpriseColor(surprise)
                  )}
                >
                  {surprise !== null
                    ? `${surprise > 0 ? "+" : ""}${surprise}${r.suffix}`
                    : "—"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {beatQuality.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
            Quality of beat
          </h3>
          <div className="space-y-2">
            {beatQuality.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full flex-shrink-0",
                    item.ok ? "bg-emerald-400" : "bg-red-400"
                  )}
                />
                <span className="text-sm text-zinc-300">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
