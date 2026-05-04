import Link from "next/link";
import { cn, resultStatusColor } from "@/lib/utils";
import {
  LAYER_VERDICT_CONFIG,
  type EarningsSeasonRow,
  type LayerVerdict,
} from "@/types/earnings";
import { quarterToSlug } from "@/lib/slug";

/**
 * Q4 FY26 coverage grid for the home page.
 * Compact card per company → links to /company/{symbol}/{quarter}.
 */
export default function QuarterCoverageGrid({
  companies,
  quarter,
}: {
  companies: EarningsSeasonRow[];
  quarter: string;
}) {
  if (!companies?.length) return null;

  // Sort: rollup verdict severity (POSITIVE first → NEGATIVE last), then alpha
  const verdictOrder: Record<LayerVerdict | "none", number> = {
    POSITIVE: 0,
    MIXED: 1,
    NEUTRAL: 2,
    NEGATIVE: 3,
    none: 4,
  };

  const sorted = [...companies].sort((a, b) => {
    const va = (a.rollup_verdict ?? "none") as keyof typeof verdictOrder;
    const vb = (b.rollup_verdict ?? "none") as keyof typeof verdictOrder;
    if (verdictOrder[va] !== verdictOrder[vb]) {
      return verdictOrder[va] - verdictOrder[vb];
    }
    return a.company.localeCompare(b.company);
  });

  return (
    <section className="py-12 lg:py-16">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8 pb-4 border-b border-white/5">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-emerald-400 mb-2">
            Coverage · {quarter}
          </div>
          <h2 className="text-2xl lg:text-3xl font-medium text-white tracking-tight">
            Q4 FY26 Earnings —{" "}
            <span className="text-emerald-400">{companies.length} companies</span>
          </h2>
          <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
            Institutional-grade analysis of Indian Q4 FY26 results. Each report
            includes the snapshot card, P&amp;L vs consensus, strategic threads,
            management quotes, sector echo, and a concrete trade idea.
          </p>
        </div>
        <Link
          href={`/earnings?q=${encodeURIComponent(quarter)}`}
          className="text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
        >
          Full season tracker
          <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sorted.map((co) => (
          <CompanyCard key={co.id} co={co} />
        ))}
      </div>
    </section>
  );
}

function CompanyCard({ co }: { co: EarningsSeasonRow }) {
  const verdictCfg = co.rollup_verdict
    ? LAYER_VERDICT_CONFIG[co.rollup_verdict]
    : null;

  return (
    <Link
      href={`/company/${co.symbol}/${quarterToSlug(co.quarter)}`}
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
        {verdictCfg ? (
          <span
            aria-hidden
            className={cn(
              "text-[10px] flex items-center justify-center w-6 h-6 rounded-full border flex-shrink-0",
              verdictCfg.bg,
              verdictCfg.border
            )}
            title={verdictCfg.label}
          >
            {verdictCfg.emoji}
          </span>
        ) : (
          <span
            className={cn(
              "text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border flex-shrink-0",
              resultStatusColor(co.result_status)
            )}
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
            <span
              className={cn(
                "uppercase tracking-wider",
                co.position_bias === "BUY" || co.position_bias === "ADD"
                  ? "text-emerald-400"
                  : co.position_bias === "REDUCE" ||
                      co.position_bias === "SELL"
                    ? "text-red-400"
                    : "text-amber-400"
              )}
            >
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
    </Link>
  );
}
