import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const VERDICT_META: Record<
  string,
  { emoji: string; bg: string; border: string }
> = {
  POSITIVE: {
    emoji: "🟢",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/30",
  },
  MIXED: {
    emoji: "🟡",
    bg: "bg-amber-400/10",
    border: "border-amber-400/30",
  },
  NEGATIVE: {
    emoji: "🔴",
    bg: "bg-red-400/10",
    border: "border-red-400/30",
  },
  NEUTRAL: {
    emoji: "⚪",
    bg: "bg-zinc-400/10",
    border: "border-zinc-400/30",
  },
};

const ORDER: Record<string, number> = {
  POSITIVE: 0,
  MIXED: 1,
  NEUTRAL: 2,
  NEGATIVE: 3,
  none: 4,
};

const STATUS_COLOR: Record<string, string> = {
  BEAT: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10",
  "IN LINE": "text-amber-500 border-amber-500/30 bg-amber-500/10",
  MISS: "text-red-500 border-red-500/30 bg-red-500/10",
  AWAITED: "text-muted-foreground border-border bg-secondary",
};

interface Row {
  id: string;
  symbol: string;
  company: string;
  sector: string | null;
  quarter: string;
  result_status: string;
  rollup_verdict: string | null;
  rollup_verdict_oneliner: string | null;
  position_bias: string | null;
}

const CoverageGrid = ({ quarter }: { quarter: string }) => {
  const [sector, setSector] = useState<string>("All");

  const { data, isLoading } = useQuery({
    queryKey: ["coverage", quarter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("earnings_season_with_analysis" as never)
        .select(
          "id, symbol, company, sector, quarter, result_status, rollup_verdict, rollup_verdict_oneliner, position_bias"
        )
        .eq("quarter", quarter);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const sectors = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of data ?? []) {
      const s = c.sector ?? "Other";
      counts[s] = (counts[s] ?? 0) + 1;
    }
    const list = Object.entries(counts).sort(
      ([a], [b]) => a.localeCompare(b)
    );
    return list;
  }, [data]);

  if (isLoading) {
    return (
      <div className="text-center text-muted-foreground text-sm py-12">
        Loading {quarter} coverage…
      </div>
    );
  }

  const all = data ?? [];
  if (all.length === 0) {
    return (
      <div className="text-center text-muted-foreground text-sm py-12">
        No {quarter} reports yet.
      </div>
    );
  }

  const filtered =
    sector === "All"
      ? all
      : all.filter((c) => (c.sector ?? "Other") === sector);

  const sorted = [...filtered].sort((a, b) => {
    const va = a.rollup_verdict ?? "none";
    const vb = b.rollup_verdict ?? "none";
    if ((ORDER[va] ?? 9) !== (ORDER[vb] ?? 9))
      return (ORDER[va] ?? 9) - (ORDER[vb] ?? 9);
    return a.company.localeCompare(b.company);
  });

  return (
    <div>
      {/* Stats + sector filter */}
      <div className="mb-6 pb-4 border-b border-border flex items-end justify-between flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">
          <span className="text-emerald-500 font-medium">
            {filtered.length} compan{filtered.length === 1 ? "y" : "ies"}
          </span>
          {sector !== "All" && (
            <>
              {" "}
              in <span className="text-foreground">{sector}</span>
            </>
          )}
          {sector === "All" && all.length > filtered.length && (
            <> · {all.length - filtered.length} hidden by filter</>
          )}
        </p>
        <a
          href="/earnings"
          className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
        >
          Full season tracker →
        </a>
      </div>

      {/* Sector pills */}
      {sectors.length > 1 && (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setSector("All")}
            className={[
              "px-3 py-1.5 rounded-md text-xs font-medium transition-all border",
              sector === "All"
                ? "bg-foreground text-background border-foreground"
                : "text-muted-foreground hover:text-foreground border-border hover:border-muted-foreground",
            ].join(" ")}
          >
            All <span className="opacity-60">· {all.length}</span>
          </button>
          {sectors.map(([s, count]) => (
            <button
              key={s}
              onClick={() => setSector(s)}
              className={[
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all border",
                sector === s
                  ? "bg-foreground text-background border-foreground"
                  : "text-muted-foreground hover:text-foreground border-border hover:border-muted-foreground",
              ].join(" ")}
            >
              {s} <span className="opacity-60">· {count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sorted.map((co) => {
          const verdict = co.rollup_verdict ?? "none";
          const meta = VERDICT_META[verdict];
          const slug = co.quarter.replace(/\s+/g, "-");
          const biasColor =
            co.position_bias === "BUY" || co.position_bias === "ADD"
              ? "text-emerald-500"
              : co.position_bias === "REDUCE" || co.position_bias === "SELL"
                ? "text-red-500"
                : "text-amber-500";
          return (
            <a
              key={co.id}
              href={`/company/${co.symbol}/${slug}`}
              className="group block rounded-2xl border border-border bg-card p-5 hover:border-muted-foreground/40 hover:bg-card/70 transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-1">
                    {co.sector ?? "—"}
                  </div>
                  <h3 className="text-base lg:text-lg font-medium text-foreground tracking-tight truncate">
                    {co.company}
                  </h3>
                </div>
                {meta ? (
                  <span
                    aria-hidden
                    className={`text-[10px] flex items-center justify-center w-6 h-6 rounded-full border flex-shrink-0 ${meta.bg} ${meta.border}`}
                    title={verdict}
                  >
                    {meta.emoji}
                  </span>
                ) : (
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border flex-shrink-0 ${
                      STATUS_COLOR[co.result_status] ??
                      "text-muted-foreground border-border"
                    }`}
                  >
                    {co.result_status}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="text-emerald-500">{co.symbol}</span>
                {co.position_bias && (
                  <>
                    <span className="text-muted-foreground/60">·</span>
                    <span className={`uppercase tracking-wider ${biasColor}`}>
                      {co.position_bias.replace("_", " ")}
                    </span>
                  </>
                )}
              </div>

              {co.rollup_verdict_oneliner && (
                <p className="mt-3 text-sm text-foreground/80 leading-snug line-clamp-2 group-hover:text-foreground transition-colors">
                  {co.rollup_verdict_oneliner}
                </p>
              )}

              <div className="mt-4 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 group-hover:text-emerald-500 transition-colors">
                <span>Read analysis</span>
                <span aria-hidden>→</span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default CoverageGrid;
