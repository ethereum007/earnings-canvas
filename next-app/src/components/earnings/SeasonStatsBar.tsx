import type { SeasonSummary } from "@/types/earnings";

export default function SeasonStatsBar({
  summary,
}: {
  summary: SeasonSummary;
}) {
  const reported = summary.beats + summary.misses + summary.in_line;
  const stats = [
    {
      label: "Reported",
      value: `${reported}/${summary.total_companies}`,
    },
    { label: "Beats", value: summary.beats, color: "text-emerald-400" },
    { label: "Misses", value: summary.misses, color: "text-red-400" },
    { label: "In line", value: summary.in_line, color: "text-amber-400" },
    { label: "Awaited", value: summary.awaited, color: "text-zinc-400" },
    {
      label: "Avg PAT surprise",
      value:
        summary.avg_pat_surprise_pct !== null
          ? `${summary.avg_pat_surprise_pct > 0 ? "+" : ""}${summary.avg_pat_surprise_pct}%`
          : "—",
      color:
        summary.avg_pat_surprise_pct !== null
          ? summary.avg_pat_surprise_pct > 0
            ? "text-emerald-400"
            : "text-red-400"
          : "text-zinc-500",
    },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-px bg-white/5 rounded-xl overflow-hidden mb-8 border border-white/5">
      {stats.map((s) => (
        <div key={s.label} className="bg-zinc-950 px-4 py-3">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
            {s.label}
          </div>
          <div
            className={`text-xl font-medium tabular-nums ${s.color ?? "text-white"}`}
          >
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}
