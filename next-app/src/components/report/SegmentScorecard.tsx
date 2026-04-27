import type { SegmentRow, SegmentColor } from "@/types/earnings";
import { cn } from "@/lib/utils";

const DOT: Record<SegmentColor, string> = {
  green: "bg-emerald-400",
  red: "bg-red-400",
  amber: "bg-amber-400",
  gray: "bg-zinc-500",
};

export default function SegmentScorecard({
  segments,
}: {
  segments: SegmentRow[];
}) {
  if (!segments?.length) return null;
  return (
    <div className="rounded-xl border border-white/5 overflow-hidden">
      <div className="grid grid-cols-12 gap-0 bg-zinc-900 px-4 py-2 text-[10px] text-zinc-500 uppercase tracking-wider">
        <span className="col-span-5">Segment</span>
        <span className="col-span-3 text-right">EBITDA</span>
        <span className="col-span-2 text-right">YoY</span>
        <span className="col-span-2 text-right">Read</span>
      </div>
      {segments.map((s, i) => (
        <div
          key={i}
          className="grid grid-cols-12 gap-0 px-4 py-3 border-t border-white/5 items-center"
        >
          <span className="col-span-5 flex items-center gap-2.5 text-sm text-zinc-200">
            <span
              className={cn("w-2 h-2 rounded-full flex-shrink-0", DOT[s.color])}
            />
            <span className="font-medium">{s.name}</span>
          </span>
          <span className="col-span-3 text-right text-sm font-medium text-white tabular-nums">
            {s.ebitda}
          </span>
          <span
            className={cn(
              "col-span-2 text-right text-sm font-medium tabular-nums",
              s.yoy_pct != null && s.yoy_pct >= 0
                ? "text-emerald-400"
                : "text-red-400"
            )}
          >
            {s.yoy_pct != null
              ? `${s.yoy_pct > 0 ? "+" : ""}${s.yoy_pct}%`
              : "—"}
          </span>
          <span className="col-span-2 text-right text-xs text-zinc-500">
            {s.note ?? ""}
          </span>
        </div>
      ))}
    </div>
  );
}
