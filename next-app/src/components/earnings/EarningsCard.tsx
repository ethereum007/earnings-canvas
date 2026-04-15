import type { EarningsSeasonRow } from "@/types/earnings";
import {
  calcPctSurprise,
  resultStatusColor,
  surpriseColor,
  formatCr,
  cn,
} from "@/lib/utils";

export default function EarningsCard({
  company: co,
  onClick,
  compact,
}: {
  company: EarningsSeasonRow;
  onClick: () => void;
  compact?: boolean;
}) {
  const revSurprise = calcPctSurprise(co.revenue_act, co.revenue_est);
  const patSurprise = calcPctSurprise(co.pat_act, co.pat_est);
  const marginSurprise =
    co.ebit_margin_act != null && co.ebit_margin_est != null
      ? Math.round((co.ebit_margin_act - co.ebit_margin_est) * 100) // bps
      : null;

  if (compact) {
    return (
      <button
        onClick={onClick}
        className="text-left p-4 rounded-xl border border-white/5 bg-zinc-900 hover:border-white/10 hover:bg-zinc-800/80 transition-all"
      >
        <div className="text-sm font-medium text-white mb-1">{co.company}</div>
        <div className="text-xs text-zinc-500 mb-2">{co.sector ?? "—"}</div>
        <span
          className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full border",
            resultStatusColor(co.result_status)
          )}
        >
          {co.result_status}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="text-left p-5 rounded-xl border border-white/5 bg-zinc-900 hover:border-white/10 hover:bg-zinc-800/70 transition-all group w-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-base font-medium text-white">{co.company}</div>
          <div className="text-xs text-zinc-500 mt-0.5">{co.sector ?? "—"}</div>
        </div>
        <span
          className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full border",
            resultStatusColor(co.result_status)
          )}
        >
          {co.result_status}
        </span>
      </div>

      {co.result_status !== "AWAITED" && (
        <>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "Revenue", val: revSurprise, suffix: "%" },
              { label: "PAT", val: patSurprise, suffix: "%" },
              { label: "Margin", val: marginSurprise, suffix: "bps" },
            ].map((m) => (
              <div key={m.label} className="bg-zinc-950 rounded-lg p-2">
                <div className="text-[10px] text-zinc-500 mb-1">{m.label}</div>
                <div
                  className={cn(
                    "text-sm font-medium tabular-nums",
                    surpriseColor(m.val)
                  )}
                >
                  {m.val !== null
                    ? `${m.val > 0 ? "+" : ""}${m.val}${m.suffix}`
                    : "—"}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-zinc-500">
              PAT {formatCr(co.pat_act)}
              {co.pat_yoy_pct != null && (
                <span className={cn("ml-1", surpriseColor(co.pat_yoy_pct))}>
                  ({co.pat_yoy_pct > 0 ? "+" : ""}
                  {co.pat_yoy_pct}% YoY)
                </span>
              )}
            </div>
            {co.verdict_score != null && (
              <div className="text-xs text-zinc-400">
                Score{" "}
                <span className="text-white font-medium">
                  {co.verdict_score}/10
                </span>
              </div>
            )}
          </div>
        </>
      )}

      <div className="mt-3 text-xs text-zinc-600 group-hover:text-zinc-400 transition-colors">
        Analyse →
      </div>
    </button>
  );
}
