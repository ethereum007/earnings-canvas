import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { EarningsSeasonRow, SeasonSummary } from "@/types/earnings";
import SeasonStatsBar from "@/components/earnings/SeasonStatsBar";
import EarningsGrid from "@/components/earnings/EarningsGrid";
import QuarterSelector from "@/components/earnings/QuarterSelector";

export const revalidate = 300; // ISR — rebuild every 5 minutes

const DEFAULT_QUARTER = "Q3 FY2026";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { q?: string };
}): Promise<Metadata> {
  const quarter = searchParams.q ?? DEFAULT_QUARTER;
  return {
    title: `${quarter} Earnings Season | EarningsCanvas`,
    description: `Track India ${quarter} earnings results — beats, misses, sector KPIs, management commentary and analyst verdicts.`,
  };
}

export default async function EarningsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const supabase = createSupabaseServerClient();

  // First, get the list of available quarters so the selector is dynamic
  const { data: quartersAvailable } = await supabase
    .from("earnings_quarters_available")
    .select("quarter, company_count")
    .order("quarter", { ascending: false });

  const available = (quartersAvailable ?? []).map((r) => r.quarter as string);
  const quarter =
    searchParams.q && available.includes(searchParams.q)
      ? searchParams.q
      : available[0] ?? DEFAULT_QUARTER;

  const [{ data: companies }, { data: summaryRow }] = await Promise.all([
    supabase
      .from("earnings_season_with_analysis")
      .select("*")
      .eq("quarter", quarter)
      .order("result_status", { ascending: true })
      .order("company", { ascending: true }),
    supabase
      .from("earnings_season_summary")
      .select("*")
      .eq("quarter", quarter)
      .maybeSingle(),
  ]);

  const summary: SeasonSummary = summaryRow ?? {
    quarter,
    total_companies: 0,
    beats: 0,
    misses: 0,
    in_line: 0,
    awaited: 0,
    avg_pat_surprise_pct: null,
  };

  const isCurrentSeason = quarter === "Q4 FY2026" || quarter === "Q4 FY26";

  return (
    <div className="py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          {isCurrentSeason ? (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full border border-emerald-400/30 text-emerald-400 bg-emerald-400/10">
              Season Live
            </span>
          ) : (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-400 bg-zinc-900">
              Archived
            </span>
          )}
          <span className="text-xs text-zinc-500">{quarter}</span>
        </div>
        <h1 className="text-2xl font-medium text-white tracking-tight">
          {quarter} Earnings Season
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          India&apos;s biggest companies — results, sector KPIs, management
          calls, analyst verdicts
        </p>
      </div>

      {available.length > 1 && (
        <QuarterSelector quarters={available} active={quarter} />
      )}

      <SeasonStatsBar summary={summary} />

      <EarningsGrid
        companies={(companies as EarningsSeasonRow[] | null) ?? []}
      />
    </div>
  );
}
