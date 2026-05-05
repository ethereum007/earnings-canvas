import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const VERDICT_META: Record<
  string,
  { emoji: string; bg: string; text: string; border: string }
> = {
  POSITIVE: {
    emoji: "🟢",
    bg: "bg-emerald-400/10",
    text: "text-emerald-400",
    border: "border-emerald-400/30",
  },
  MIXED: {
    emoji: "🟡",
    bg: "bg-amber-400/10",
    text: "text-amber-400",
    border: "border-amber-400/30",
  },
  NEGATIVE: {
    emoji: "🔴",
    bg: "bg-red-400/10",
    text: "text-red-400",
    border: "border-red-400/30",
  },
  NEUTRAL: {
    emoji: "⚪",
    bg: "bg-zinc-500/10",
    text: "text-zinc-300",
    border: "border-zinc-500/30",
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
  BEAT: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  "IN LINE": "text-amber-400 border-amber-400/30 bg-amber-400/10",
  MISS: "text-red-400 border-red-400/30 bg-red-400/10",
  AWAITED: "text-zinc-400 border-zinc-500/30 bg-zinc-500/10",
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

  if (isLoading) {
    return (
      <div className="text-center text-zinc-500 text-sm py-12">
        Loading {quarter} coverage…
      </div>
    );
  }

  const companies = data ?? [];
  if (companies.length === 0) {
    return (
      <div className="text-center text-zinc-500 text-sm py-12">
        No {quarter} reports yet.
      </div>
    );
  }

  const sorted = [...companies].sort((a, b) => {
    const va = a.rollup_verdict ?? "none";
    const vb = b.rollup_verdict ?? "none";
    if ((ORDER[va] ?? 9) !== (ORDER[vb] ?? 9))
      return (ORDER[va] ?? 9) - (ORDER[vb] ?? 9);
    return a.company.localeCompare(b.company);
  });

  return (
    <div>
      <div className="mb-6 pb-4 border-b border-white/5 flex items-end justify-between flex-wrap gap-3">
        <p className="text-sm text-zinc-400">
          <span className="text-emerald-400 font-medium">
            {companies.length} companies
          </span>{" "}
          covered. Each report includes Snapshot, P&amp;L vs Consensus,
          Strategic Threads, Management Quotes, Sector Echo, Trade Idea.
        </p>
        <a
          href="/earnings"
          className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500 hover:text-white transition-colors"
        >
          Full season tracker →
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sorted.map((co) => {
          const verdict = co.rollup_verdict ?? "none";
          const meta = VERDICT_META[verdict];
          const slug = co.quarter.replace(/\s+/g, "-");
          const biasColor =
            co.position_bias === "BUY" || co.position_bias === "ADD"
              ? "text-emerald-400"
              : co.position_bias === "REDUCE" || co.position_bias === "SELL"
                ? "text-red-400"
                : "text-amber-400";
          return (
            <a
              key={co.id}
              href={`/company/${co.symbol}/${slug}`}
              className="group block rounded-2xl border border-white/5 bg-zinc-900/40 p-5 hover:border-white/15 hover:bg-zinc-900/70 transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500 mb-1">
                    {co.sector ?? "—"}
                  </div>
                  <h3 className="text-base lg:text-lg font-medium text-white tracking-tight truncate">
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
                      "text-zinc-400 border-zinc-700"
                    }`}
                  >
                    {co.result_status}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="text-emerald-400">{co.symbol}</span>
                {co.position_bias && (
                  <>
                    <span className="text-zinc-600">·</span>
                    <span className={`uppercase tracking-wider ${biasColor}`}>
                      {co.position_bias.replace("_", " ")}
                    </span>
                  </>
                )}
              </div>

              {co.rollup_verdict_oneliner && (
                <p className="mt-3 text-sm text-zinc-300 leading-snug line-clamp-2 group-hover:text-zinc-100 transition-colors">
                  {co.rollup_verdict_oneliner}
                </p>
              )}

              <div className="mt-4 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-600 group-hover:text-emerald-400 transition-colors">
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
