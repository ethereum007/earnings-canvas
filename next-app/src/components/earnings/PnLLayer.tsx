import { cn } from "@/lib/utils";
import VerdictTag from "./VerdictTag";
import type {
  LayerVerdict,
  MetricVerdict,
  PnLLayerData,
  PnLMetric,
} from "@/types/earnings";

const METRIC_VERDICT_COLOR: Record<MetricVerdict, string> = {
  BEAT: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  INLINE: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  MISS: "text-red-400 bg-red-400/10 border-red-400/30",
};

const PCT_TONE = (n: number | null | undefined): string => {
  if (n == null) return "text-zinc-500";
  if (n > 1) return "text-emerald-400";
  if (n < -1) return "text-red-400";
  return "text-amber-400";
};

const FMT_PCT = (n: number | null | undefined, suffix = "%"): string => {
  if (n == null) return "—";
  return `${n > 0 ? "+" : ""}${n.toFixed(1)}${suffix}`;
};

/**
 * Auto-derive the cascading layer1_verdict from the metrics array
 * if not explicitly provided. Rules:
 *   2+ misses        → NEGATIVE
 *   1 miss + others  → MIXED
 *   all beats        → POSITIVE
 *   any miss          → MIXED
 *   else              → NEUTRAL
 */
export function deriveLayer1Verdict(metrics: PnLMetric[]): LayerVerdict {
  const counts: Record<MetricVerdict, number> = { BEAT: 0, INLINE: 0, MISS: 0 };
  let counted = 0;
  for (const m of metrics) {
    if (m.verdict) {
      counts[m.verdict]++;
      counted++;
    }
  }
  if (counted === 0) return "NEUTRAL";
  if (counts.MISS >= 2) return "NEGATIVE";
  if (counts.MISS === 1) return "MIXED";
  if (counts.BEAT === counted) return "POSITIVE";
  if (counts.BEAT > counts.INLINE) return "POSITIVE";
  return "NEUTRAL";
}

export default function PnLLayer({
  data,
  layerVerdict,
}: {
  data: PnLLayerData;
  layerVerdict?: LayerVerdict | null;
}) {
  const verdict: LayerVerdict =
    layerVerdict ?? deriveLayer1Verdict(data.metrics);

  return (
    <div className="space-y-5">
      {/* Section verdict tag + oneliner */}
      <div className="flex items-start gap-3 flex-wrap">
        <VerdictTag verdict={verdict} size="md" />
        {data.verdict_oneliner && (
          <span className="text-sm text-zinc-300 leading-relaxed flex-1 min-w-0">
            {data.verdict_oneliner}
          </span>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-2xl border border-white/5 overflow-hidden">
        <div className="grid grid-cols-12 bg-zinc-900 px-5 py-2.5 text-[10px] text-zinc-500 uppercase tracking-[0.18em]">
          <span className="col-span-3">Metric</span>
          <span className="col-span-2 text-right">Estimate</span>
          <span className="col-span-2 text-right">Actual</span>
          <span className="col-span-1 text-right">Surprise</span>
          <span className="col-span-1 text-right">YoY</span>
          <span className="col-span-1 text-center">Read</span>
          <span className="col-span-2">Driver</span>
        </div>
        {data.metrics.map((m, i) => (
          <div
            key={i}
            className="grid grid-cols-12 px-5 py-3.5 border-t border-white/5 items-center"
          >
            <span className="col-span-3 text-sm text-zinc-200 font-medium">
              {m.metric}
            </span>
            <span className="col-span-2 text-right text-sm text-zinc-500 tabular-nums">
              {m.estimate ?? "—"}
            </span>
            <span className="col-span-2 text-right text-sm text-white font-medium tabular-nums">
              {m.actual}
            </span>
            <span
              className={cn(
                "col-span-1 text-right text-sm tabular-nums",
                PCT_TONE(m.surprise_pct)
              )}
            >
              {FMT_PCT(m.surprise_pct)}
            </span>
            <span
              className={cn(
                "col-span-1 text-right text-sm tabular-nums",
                PCT_TONE(m.yoy_pct)
              )}
            >
              {FMT_PCT(m.yoy_pct)}
            </span>
            <span className="col-span-1 flex justify-center">
              {m.verdict ? (
                <span
                  className={cn(
                    "text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded border",
                    METRIC_VERDICT_COLOR[m.verdict]
                  )}
                >
                  {m.verdict}
                </span>
              ) : (
                <span className="text-zinc-600">—</span>
              )}
            </span>
            <span className="col-span-2 text-xs text-zinc-400 leading-snug">
              {m.driver ?? ""}
            </span>
          </div>
        ))}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {data.metrics.map((m, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/5 bg-zinc-900/40 p-4"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <span className="text-base text-white font-medium">
                {m.metric}
              </span>
              {m.verdict && (
                <span
                  className={cn(
                    "text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded border flex-shrink-0",
                    METRIC_VERDICT_COLOR[m.verdict]
                  )}
                >
                  {m.verdict}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm tabular-nums mb-2">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-0.5">
                  Estimate
                </div>
                <div className="text-zinc-300">{m.estimate ?? "—"}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-0.5">
                  Actual
                </div>
                <div className="text-white font-medium">{m.actual}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-0.5">
                  Surprise
                </div>
                <div className={PCT_TONE(m.surprise_pct)}>
                  {FMT_PCT(m.surprise_pct)}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-0.5">
                  YoY
                </div>
                <div className={PCT_TONE(m.yoy_pct)}>{FMT_PCT(m.yoy_pct)}</div>
              </div>
            </div>
            {m.driver && (
              <div className="text-xs text-zinc-400 mt-2 pt-2 border-t border-white/5 leading-snug">
                {m.driver}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Caveats */}
      {data.caveats && data.caveats.length > 0 && (
        <div className="space-y-1.5">
          {data.caveats.map((c, i) => (
            <div
              key={i}
              className="flex gap-2 text-xs text-zinc-400 italic leading-relaxed"
            >
              <span className="text-amber-400 flex-shrink-0">⚠️</span>
              <span>{c}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
