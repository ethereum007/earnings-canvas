import type { SegmentRow, SegmentColor } from "@/types/earnings";
import { cn } from "@/lib/utils";

const DOT: Record<SegmentColor, { dot: string; bar: string; bg: string }> = {
  green: {
    dot: "bg-emerald-400",
    bar: "bg-emerald-400/70",
    bg: "bg-emerald-400/5",
  },
  red: { dot: "bg-red-400", bar: "bg-red-400/70", bg: "bg-red-400/5" },
  amber: { dot: "bg-amber-400", bar: "bg-amber-400/70", bg: "bg-amber-400/5" },
  gray: { dot: "bg-zinc-500", bar: "bg-zinc-500/60", bg: "bg-zinc-500/5" },
};

/**
 * Segment scorecard — emoji/color row, EBITDA value, YoY chip,
 * and a horizontal bar showing relative magnitude vs the largest segment.
 */
export default function SegmentScorecard({
  segments,
}: {
  segments: SegmentRow[];
}) {
  if (!segments?.length) return null;

  // Compute relative width (bar) — parse the digit prefix from ebitda strings
  const numericValues = segments.map((s) => {
    const match = s.ebitda.match(/[\d,]+(\.\d+)?/);
    return match ? parseFloat(match[0].replace(/,/g, "")) : 0;
  });
  const maxVal = Math.max(...numericValues, 1);

  return (
    <div className="rounded-2xl border border-white/5 overflow-hidden">
      <div className="grid grid-cols-12 bg-zinc-900 px-5 py-2.5 text-[10px] text-zinc-500 uppercase tracking-[0.18em]">
        <span className="col-span-5">Segment</span>
        <span className="col-span-3 text-right">EBITDA</span>
        <span className="col-span-2 text-right">YoY</span>
        <span className="col-span-2 text-right">Read</span>
      </div>
      {segments.map((s, i) => {
        const styles = DOT[s.color];
        const widthPct = Math.round((numericValues[i] / maxVal) * 100);
        return (
          <div
            key={i}
            className={cn(
              "relative grid grid-cols-12 px-5 py-4 border-t border-white/5 items-center"
            )}
          >
            {/* magnitude bar (background) */}
            <div
              className={cn("absolute left-0 top-0 bottom-0", styles.bg)}
              style={{ width: `${widthPct}%` }}
            />
            <div className="col-span-5 relative flex items-center gap-3">
              <span
                className={cn(
                  "w-2 h-2 rounded-full flex-shrink-0",
                  styles.dot
                )}
              />
              <span className="font-medium text-zinc-100 text-sm">
                {s.name}
              </span>
              <span
                className={cn(
                  "ml-auto sm:ml-0 hidden sm:block h-1 rounded-full max-w-[120px] flex-shrink-0",
                  styles.bar
                )}
                style={{ width: `${widthPct}px` }}
              />
            </div>
            <span className="col-span-3 relative text-right text-sm font-medium text-white tabular-nums">
              {s.ebitda}
            </span>
            <span
              className={cn(
                "col-span-2 relative text-right text-sm font-medium tabular-nums",
                s.yoy_pct != null && s.yoy_pct >= 0
                  ? "text-emerald-400"
                  : "text-red-400"
              )}
            >
              {s.yoy_pct != null
                ? `${s.yoy_pct > 0 ? "+" : ""}${s.yoy_pct}%`
                : "—"}
            </span>
            <span className="col-span-2 relative text-right text-xs text-zinc-400">
              {s.note ?? ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}
