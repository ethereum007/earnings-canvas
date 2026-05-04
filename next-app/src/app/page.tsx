import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { EarningsSeasonRow } from "@/types/earnings";
import QuarterCoverageGrid from "@/components/home/QuarterCoverageGrid";

export const revalidate = 300; // 5 min ISR

const FEATURED_QUARTER = "Q4 FY2026";

export default async function HomePage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("earnings_season_with_analysis")
    .select("*")
    .eq("quarter", FEATURED_QUARTER);
  const companies = (data ?? []) as EarningsSeasonRow[];

  return (
    <>
      {/* Hero */}
      <section className="pt-16 pb-10 lg:pt-24 lg:pb-14">
        <div className="max-w-3xl">
          <span className="inline-block text-[10px] font-mono uppercase tracking-[0.22em] px-2.5 py-1 rounded-full border border-emerald-400/30 text-emerald-400 bg-emerald-400/10">
            Q4 FY26 Season Live
          </span>
          <h1 className="mt-5 text-4xl lg:text-5xl font-medium tracking-tight text-white leading-[1.05]">
            India earnings intelligence,{" "}
            <span className="text-emerald-400">
              built for institutional eyes.
            </span>
          </h1>
          <p className="mt-5 text-base lg:text-lg text-zinc-400 leading-relaxed max-w-2xl">
            Same-day institutional-grade synthesis for every Q4 FY26 result.
            Snapshot card, P&amp;L vs consensus, strategic threads,
            management commentary, sector read-across, and a concrete
            trade idea — all in one place.
          </p>
          <div className="mt-7 flex items-center gap-3 flex-wrap">
            <a
              href="#coverage"
              className="px-4 py-2.5 rounded-md text-sm font-medium bg-white text-zinc-950 hover:bg-zinc-200 transition-colors"
            >
              View Q4 FY26 coverage →
            </a>
            <Link
              href="/earnings"
              className="px-4 py-2.5 rounded-md text-sm font-medium text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 transition-colors"
            >
              Season tracker
            </Link>
            <Link
              href="/policy"
              className="px-4 py-2.5 rounded-md text-sm font-medium text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 transition-colors"
            >
              Policy Alpha
            </Link>
          </div>
        </div>
      </section>

      {/* Q4 FY26 coverage grid */}
      <div id="coverage" className="scroll-mt-20">
        <QuarterCoverageGrid
          companies={companies}
          quarter={FEATURED_QUARTER}
        />
      </div>
    </>
  );
}
