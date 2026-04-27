import type { EarningsSeasonRow } from "@/types/earnings";
import { cn } from "@/lib/utils";

/**
 * Banner-style hero TL;DR. The verdict + conviction + signal — designed
 * to be impossible to miss at the top of the page.
 */
export default function VerdictTLDR({ co }: { co: EarningsSeasonRow }) {
  const rawScore = co.verdict_score ?? co.sentiment_score ?? 0;
  const score = rawScore > 0 && rawScore <= 1 ? rawScore * 10 : rawScore;
  const summary = co.verdict_summary ?? co.analysis_summary;

  if (!summary && !co.investment_signal && score === 0) return null;

  const signal = (co.investment_signal ?? "").toUpperCase();
  const accentColor = signal.includes("BUY")
    ? "border-emerald-400/40 from-emerald-400/10"
    : signal.includes("SELL")
      ? "border-red-400/40 from-red-400/10"
      : "border-amber-400/40 from-amber-400/10";

  const signalText = signal.includes("BUY")
    ? "text-emerald-400"
    : signal.includes("SELL")
      ? "text-red-400"
      : "text-amber-400";

  return (
    <div
      className={cn(
        "rounded-2xl border p-7 lg:p-10 bg-gradient-to-br to-zinc-950",
        accentColor
      )}
    >
      <div className="flex items-baseline gap-3 mb-5 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
        <span>The verdict</span>
        <span className="h-px flex-1 bg-white/5" />
        <span>EarningsCanvas read</span>
      </div>

      {/* Verdict line */}
      {co.investment_signal && (
        <div className="mb-6 flex items-baseline gap-4 flex-wrap">
          <span
            className={cn(
              "text-4xl lg:text-5xl font-medium tracking-tight",
              signalText
            )}
          >
            {co.investment_signal}
          </span>
          {score > 0 && (
            <span className="text-zinc-500 text-base lg:text-lg">
              · Conviction
              <span className="ml-2 text-white font-medium tabular-nums">
                {score.toFixed(1)}
                <span className="text-zinc-600">/10</span>
              </span>
            </span>
          )}
        </div>
      )}

      {summary && (
        <p className="text-xl lg:text-2xl text-zinc-100 leading-snug max-w-4xl">
          {summary}
        </p>
      )}

      {co.signal_rationale && (
        <p className="mt-4 text-sm text-zinc-400 max-w-3xl leading-relaxed">
          {co.signal_rationale}
        </p>
      )}
    </div>
  );
}
