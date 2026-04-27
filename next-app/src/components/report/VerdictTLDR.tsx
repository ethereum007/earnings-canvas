import type { EarningsSeasonRow } from "@/types/earnings";
import { cn } from "@/lib/utils";

/**
 * Hero TL;DR card — the verdict + conviction + signal at the top.
 * Pulls from existing fields (verdict_score, verdict_summary, investment_signal).
 */
export default function VerdictTLDR({ co }: { co: EarningsSeasonRow }) {
  const rawScore = co.verdict_score ?? co.sentiment_score ?? 0;
  const score = rawScore > 0 && rawScore <= 1 ? rawScore * 10 : rawScore;
  const summary = co.verdict_summary ?? co.analysis_summary;

  if (!summary && !co.investment_signal && score === 0) return null;

  const signal = (co.investment_signal ?? "").toUpperCase();
  const signalColor =
    signal.includes("BUY")
      ? "text-emerald-400 border-emerald-400/40 bg-emerald-400/10"
      : signal.includes("SELL")
        ? "text-red-400 border-red-400/40 bg-red-400/10"
        : "text-amber-400 border-amber-400/40 bg-amber-400/10";

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/80 to-zinc-950 p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-3 text-xs text-zinc-500 uppercase tracking-wider">
        <span>TL;DR</span>
        {co.investment_signal && (
          <span
            className={cn(
              "px-2 py-0.5 rounded-full border text-[11px] font-medium normal-case",
              signalColor
            )}
          >
            {co.investment_signal}
          </span>
        )}
        {score > 0 && (
          <span className="text-zinc-500">
            Conviction <span className="text-white">{score.toFixed(1)}/10</span>
          </span>
        )}
      </div>
      {summary && (
        <p className="text-lg lg:text-xl text-white leading-relaxed">
          {summary}
        </p>
      )}
    </div>
  );
}
