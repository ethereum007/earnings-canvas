import { cn, resultStatusColor } from "@/lib/utils";
import VerdictTag from "./VerdictTag";
import EstimateRevisionBadge from "./EstimateRevisionBadge";
import type { SnapshotData } from "@/types/earnings";

/**
 * SnapshotCard — institutional 90-second view.
 * Hero block on /company/[symbol]/[quarter] pages.
 */
export default function SnapshotCard({ data }: { data: SnapshotData }) {
  const reactionRel = data.stock_reaction_vs_index_pct;
  const reactionTone =
    reactionRel == null
      ? "text-zinc-500"
      : reactionRel > 1
        ? "text-emerald-400"
        : reactionRel < -1
          ? "text-red-400"
          : "text-amber-400";

  const headlineColor =
    data.headline_verdict === "BEAT"
      ? "text-emerald-400"
      : data.headline_verdict === "MISS"
        ? "text-red-400"
        : data.headline_verdict === "AWAITED"
          ? "text-zinc-400"
          : "text-amber-400";

  const guidanceColor =
    data.guidance_verdict === "RAISED"
      ? "text-emerald-400"
      : data.guidance_verdict === "CUT" ||
          data.guidance_verdict === "WITHDRAWN"
        ? "text-red-400"
        : data.guidance_verdict === "MAINTAINED"
          ? "text-amber-400"
          : "text-zinc-400";

  const positionColor =
    data.position_bias === "BUY" || data.position_bias === "ADD"
      ? "text-emerald-400"
      : data.position_bias === "REDUCE" || data.position_bias === "SELL"
        ? "text-red-400"
        : data.position_bias === "UNDER_REVIEW"
          ? "text-zinc-400"
          : "text-amber-400";

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <section className="border-b border-white/5 pb-10 mb-12">
      {/* Identity row */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-7">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-2 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">
            <span>{data.sector ?? "—"}</span>
            <span>·</span>
            <span>{data.quarter}</span>
            {data.result_date && (
              <>
                <span>·</span>
                <span>{formatDate(data.result_date)}</span>
              </>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium text-white tracking-tight leading-[1.05]">
            {data.company}
          </h1>
          <p className="mt-2 text-xs font-mono text-zinc-500">
            <span className="text-emerald-400">NSE: {data.symbol}</span>
            {data.market_cap && (
              <>
                <span className="mx-2">·</span>
                <span>{data.market_cap}</span>
              </>
            )}
          </p>
        </div>

        {data.rollup_verdict && (
          <VerdictTag
            verdict={data.rollup_verdict}
            oneliner={data.rollup_verdict_oneliner ?? undefined}
            size="lg"
          />
        )}
      </div>

      {/* 4-quadrant verdict grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {/* Headline */}
        <div className="bg-zinc-950 p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-2">
            Headline
          </div>
          <div
            className={cn(
              "text-xl md:text-2xl font-medium tabular-nums tracking-tight",
              headlineColor
            )}
          >
            {data.headline_verdict}
          </div>
          {data.headline_verdict_basis && (
            <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mt-1">
              {data.headline_verdict_basis === "OPERATIONAL"
                ? "Operational"
                : "Reported"}
            </div>
          )}
        </div>

        {/* Guidance */}
        <div className="bg-zinc-950 p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-2">
            Guidance
          </div>
          <div
            className={cn(
              "text-xl md:text-2xl font-medium tracking-tight",
              guidanceColor
            )}
          >
            {data.guidance_verdict
              ? data.guidance_verdict === "NOT_GIVEN"
                ? "N/A"
                : data.guidance_verdict
              : "—"}
          </div>
        </div>

        {/* Estimate revision */}
        <div className="bg-zinc-950 p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-2">
            Estimate Revision
          </div>
          {data.estimate_revision_direction &&
          data.estimate_revision_magnitude ? (
            <EstimateRevisionBadge
              direction={data.estimate_revision_direction}
              magnitude={data.estimate_revision_magnitude}
              metric={data.estimate_revision_metric ?? "FY+1 EPS"}
            />
          ) : (
            <div className="text-xl text-zinc-500">—</div>
          )}
        </div>

        {/* Stock reaction */}
        <div className="bg-zinc-950 p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-2">
            Stock Reaction <span className="opacity-70">(T+1)</span>
          </div>
          {data.stock_reaction_pct != null ? (
            <>
              <div
                className={cn(
                  "text-xl md:text-2xl font-medium tabular-nums tracking-tight",
                  reactionTone
                )}
              >
                {data.stock_reaction_pct > 0 ? "+" : ""}
                {data.stock_reaction_pct.toFixed(1)}%
              </div>
              {reactionRel != null && data.stock_reaction_index_name && (
                <div className="font-mono text-[10px] text-zinc-500 mt-1 tabular-nums">
                  {reactionRel > 0 ? "+" : ""}
                  {reactionRel.toFixed(1)}% vs {data.stock_reaction_index_name}
                </div>
              )}
            </>
          ) : (
            <div className="text-xl text-zinc-500">—</div>
          )}
        </div>
      </div>

      {/* What mattered */}
      {data.three_things_that_mattered &&
      data.three_things_that_mattered.length > 0 ? (
        <div className="mt-8">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-400 mb-4">
            What mattered
          </div>
          <ul className="space-y-2.5">
            {data.three_things_that_mattered.slice(0, 3).map((thing, i) => (
              <li
                key={i}
                className="flex gap-4 text-base lg:text-lg text-zinc-100 leading-snug"
              >
                <span className="font-mono text-xs text-emerald-400/60 mt-1.5 tabular-nums flex-shrink-0">
                  0{i + 1}
                </span>
                <span>{thing}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Position bias + Catalyst */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-white/5">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-2">
            Position bias
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={cn(
                "text-xl md:text-2xl font-medium tracking-tight",
                positionColor
              )}
            >
              {data.position_bias
                ? data.position_bias.replace("_", " ")
                : "—"}
            </span>
            {data.conviction && (
              <span
                className={cn(
                  "font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded",
                  data.conviction === "HIGH"
                    ? "bg-emerald-400/15 text-emerald-400"
                    : data.conviction === "MEDIUM"
                      ? "bg-amber-400/15 text-amber-400"
                      : "bg-zinc-500/15 text-zinc-300"
                )}
              >
                {data.conviction} conviction
              </span>
            )}
          </div>
        </div>

        {data.next_catalyst_event && (
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-2">
              Next catalyst
            </div>
            <div className="text-base lg:text-lg text-zinc-100 leading-snug">
              {data.next_catalyst_event}
            </div>
            {data.next_catalyst_date && (
              <div className="font-mono text-[10px] text-zinc-500 mt-1 tabular-nums">
                {formatDate(data.next_catalyst_date)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Headline status fallback chip (so the page is never empty even if no rollup) */}
      {!data.rollup_verdict && (
        <div className="mt-6">
          <span
            className={cn(
              "text-xs font-medium px-3 py-1 rounded-full border inline-flex items-center gap-2",
              resultStatusColor(data.headline_verdict)
            )}
          >
            {data.headline_verdict}
          </span>
        </div>
      )}
    </section>
  );
}
