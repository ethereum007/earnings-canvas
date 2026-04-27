import type { AnnualContext as AnnualCtx } from "@/types/earnings";
import { cn, surpriseColor } from "@/lib/utils";

export default function AnnualContextSection({ ctx }: { ctx: AnnualCtx }) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/40 p-5">
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-xs text-zinc-500 uppercase tracking-wider">
          {ctx.fiscal_year} full-year
        </span>
        {ctx.label && (
          <span className="text-sm text-emerald-400">{ctx.label}</span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {ctx.metrics.map((m, i) => (
          <div key={i}>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
              {m.label}
            </div>
            <div className="text-xl font-medium text-white tabular-nums">
              {m.value}
            </div>
            {m.yoy_pct != null && (
              <div className={cn("text-xs mt-0.5", surpriseColor(m.yoy_pct))}>
                {m.yoy_pct > 0 ? "+" : ""}
                {m.yoy_pct}% YoY
              </div>
            )}
          </div>
        ))}
      </div>
      {ctx.caveat && (
        <div className="mt-4 pt-4 border-t border-white/5 text-xs text-zinc-400 italic">
          ⚠️ {ctx.caveat}
        </div>
      )}
    </div>
  );
}
