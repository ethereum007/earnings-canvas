import type { EarningsSeasonRow, SectorKPI } from "@/types/earnings";
import { cn } from "@/lib/utils";

export default function TabKPI({ company: co }: { company: EarningsSeasonRow }) {
  const kpis = (co.sector_kpis ?? []) as SectorKPI[];

  if (!kpis.length) {
    return (
      <p className="text-sm text-zinc-500">
        KPI data not yet available for this company.
      </p>
    );
  }

  return (
    <div>
      <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">
        {co.sector ?? "Sector"} KPIs — {co.quarter}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className="bg-zinc-900 rounded-xl p-4 border border-white/5"
          >
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
              {kpi.label}
            </div>
            <div className="text-xl font-medium text-white tabular-nums mb-1">
              {kpi.value}
            </div>
            <div
              className={cn(
                "text-xs",
                kpi.negative ? "text-red-400" : "text-emerald-400"
              )}
            >
              {kpi.delta}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
