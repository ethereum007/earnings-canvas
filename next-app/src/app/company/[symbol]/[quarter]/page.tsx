import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { EarningsSeasonRow } from "@/types/earnings";
import { cn, resultStatusColor } from "@/lib/utils";
import { quarterToSlug, slugToQuarter } from "@/lib/slug";

import TabPrint from "@/components/earnings/tabs/TabPrint";
import TabKPI from "@/components/earnings/tabs/TabKPI";
import TabMgmt from "@/components/earnings/tabs/TabMgmt";
import TabVerdict from "@/components/earnings/tabs/TabVerdict";
import StickyTOC from "@/components/company/StickyTOC";

import VerdictTLDR from "@/components/report/VerdictTLDR";
import ReportHighlights from "@/components/report/ReportHighlights";
import AnnualContextSection from "@/components/report/AnnualContext";
import SegmentScorecard from "@/components/report/SegmentScorecard";
import SegmentNarratives from "@/components/report/SegmentNarratives";
import KeyQuotes from "@/components/report/KeyQuotes";
import SectorEcho from "@/components/report/SectorEcho";
import TradeIdeaCard from "@/components/report/TradeIdea";
import RecentAnnouncements from "@/components/report/RecentAnnouncements";
import TradingViewWidget from "@/components/report/TradingViewWidget";
import Markdown from "@/components/markdown/Markdown";

export const revalidate = 600; // 10 min ISR

export async function generateStaticParams() {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("earnings_season_with_analysis")
    .select("symbol, quarter");

  return (data ?? []).map((r) => ({
    symbol: r.symbol as string,
    quarter: quarterToSlug(r.quarter as string),
  }));
}

async function fetchCompany(symbol: string, quarter: string) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("earnings_season_with_analysis")
    .select("*")
    .eq("symbol", symbol)
    .eq("quarter", quarter)
    .maybeSingle();
  return data as EarningsSeasonRow | null;
}

export async function generateMetadata({
  params,
}: {
  params: { symbol: string; quarter: string };
}): Promise<Metadata> {
  const symbol = decodeURIComponent(params.symbol).toUpperCase();
  const quarter = slugToQuarter(params.quarter);
  const co = await fetchCompany(symbol, quarter);

  if (!co) return { title: `${symbol} ${quarter} | EarningsCanvas` };

  const title = `${co.company} — ${quarter} Results | EarningsCanvas`;
  const description =
    co.verdict_summary ||
    co.analysis_summary ||
    `${co.company} (${co.symbol}) ${quarter} earnings analysis — sector KPIs, management commentary, analyst verdict.`;

  const score =
    co.verdict_score != null
      ? co.verdict_score > 1
        ? co.verdict_score.toFixed(1)
        : (co.verdict_score * 10).toFixed(1)
      : co.sentiment_score != null
        ? (co.sentiment_score > 1
            ? co.sentiment_score
            : co.sentiment_score * 10
          ).toFixed(1)
        : "—";

  const ogParams = new URLSearchParams({
    company: co.company,
    status: co.result_status,
    score,
    sector: co.sector ?? "",
  });
  const ogUrl = `/api/og/earnings?${ogParams.toString()}`;

  return {
    title,
    description: description.slice(0, 200),
    openGraph: {
      title,
      description: description.slice(0, 200),
      type: "article",
      url: `/company/${symbol}/${params.quarter}`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description.slice(0, 200),
      images: [ogUrl],
    },
  };
}

export default async function CompanyQuarterPage({
  params,
}: {
  params: { symbol: string; quarter: string };
}) {
  const symbol = decodeURIComponent(params.symbol).toUpperCase();
  const quarter = slugToQuarter(params.quarter);
  const co = await fetchCompany(symbol, quarter);
  if (!co) notFound();

  // Decide layout: rich if any of the new fields populated, else legacy 4-section
  const hasRich = Boolean(
    (co.report_highlights && co.report_highlights.length) ||
      co.annual_context ||
      (co.segments && co.segments.length) ||
      (co.segment_narratives && co.segment_narratives.length) ||
      (co.key_quotes && co.key_quotes.length) ||
      (co.sector_echo && co.sector_echo.length) ||
      co.trade_idea ||
      (co.recent_announcements && co.recent_announcements.length) ||
      co.long_form_intro
  );

  // Build TOC dynamically from sections that will actually render
  const sections: { id: string; title: string }[] = [];
  if (hasRich) {
    if (co.long_form_intro) sections.push({ id: "intro", title: "TL;DR" });
    if (co.report_highlights?.length)
      sections.push({ id: "highlights", title: "60-second read" });
    sections.push({ id: "print", title: "Headline numbers" });
    if (co.annual_context)
      sections.push({ id: "annual", title: "Annual context" });
    if (co.segments?.length)
      sections.push({ id: "segments", title: "Segment scorecard" });
    if (co.segment_narratives?.length)
      sections.push({ id: "deepdives", title: "Segment deep-dives" });
    if (co.key_quotes?.length)
      sections.push({ id: "mgmt", title: "Management call" });
    sections.push({ id: "verdict", title: "Verdict" });
    if (co.sector_echo?.length)
      sections.push({ id: "echo", title: "Sector echo" });
    if (co.trade_idea) sections.push({ id: "trade", title: "Trade idea" });
    sections.push({ id: "chart", title: "Live chart" });
    if (co.recent_announcements?.length)
      sections.push({ id: "announcements", title: "Announcements" });
  } else {
    sections.push(
      { id: "print", title: "Earnings print" },
      { id: "kpis", title: "Sector KPIs" },
      { id: "mgmt", title: "Management call" },
      { id: "verdict", title: "Verdict" }
    );
  }

  return (
    <article className="py-8 lg:py-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-zinc-500 mb-6 flex items-center gap-2">
        <Link href="/earnings" className="hover:text-white transition-colors">
          Earnings
        </Link>
        <span>›</span>
        <Link
          href={`/earnings?q=${encodeURIComponent(quarter)}`}
          className="hover:text-white transition-colors"
        >
          {quarter}
        </Link>
        <span>›</span>
        <span className="text-zinc-300">{co.company}</span>
      </nav>

      {/* Hero */}
      <header className="mb-10 pb-8 border-b border-white/5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl lg:text-4xl font-medium text-white tracking-tight">
              {co.company}
              <span className="text-zinc-500 font-normal text-lg lg:text-xl ml-3">
                · {quarter}
              </span>
            </h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-zinc-500 flex-wrap">
              <span className="font-mono text-emerald-400">
                NSE: {co.symbol}
              </span>
              <span>·</span>
              <span>{co.sector ?? "—"}</span>
              {co.market_cap && (
                <>
                  <span>·</span>
                  <span>{co.market_cap}</span>
                </>
              )}
              {co.result_date && (
                <>
                  <span>·</span>
                  <span>
                    Reported{" "}
                    {new Date(co.result_date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </>
              )}
            </div>
          </div>
          <span
            className={cn(
              "text-sm font-medium px-3 py-1 rounded-full border",
              resultStatusColor(co.result_status)
            )}
          >
            {co.result_status}
          </span>
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[1fr_180px] lg:gap-12">
        <div className="space-y-12 min-w-0">
          {hasRich ? (
            <>
              {/* TL;DR hero card — always shown for rich pages */}
              <VerdictTLDR co={co} />

              {co.long_form_intro && (
                <section id="intro" className="scroll-mt-20">
                  <Markdown>{co.long_form_intro}</Markdown>
                </section>
              )}

              {co.report_highlights?.length ? (
                <section id="highlights" className="scroll-mt-20">
                  <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-5">
                    The 60-second read
                  </h2>
                  <ReportHighlights highlights={co.report_highlights} />
                </section>
              ) : null}

              <section id="print" className="scroll-mt-20">
                <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-5">
                  Headline numbers
                </h2>
                <TabPrint company={co} />
              </section>

              {co.annual_context && (
                <section id="annual" className="scroll-mt-20">
                  <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-5">
                    Annual context
                  </h2>
                  <AnnualContextSection ctx={co.annual_context} />
                </section>
              )}

              {co.segments?.length ? (
                <section id="segments" className="scroll-mt-20">
                  <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-5">
                    Segment scorecard
                  </h2>
                  <SegmentScorecard segments={co.segments} />
                </section>
              ) : null}

              {co.segment_narratives?.length ? (
                <section id="deepdives" className="scroll-mt-20">
                  <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-5">
                    Segment deep-dives
                  </h2>
                  <SegmentNarratives narratives={co.segment_narratives} />
                </section>
              ) : null}

              {co.key_quotes?.length ? (
                <section id="mgmt" className="scroll-mt-20">
                  <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-5">
                    Management call
                  </h2>
                  <KeyQuotes quotes={co.key_quotes} />
                </section>
              ) : null}

              <section id="verdict" className="scroll-mt-20">
                <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-5">
                  Verdict
                </h2>
                <TabVerdict company={co} />
              </section>

              {co.sector_echo?.length ? (
                <section id="echo" className="scroll-mt-20">
                  <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-5">
                    Sector echo
                  </h2>
                  <SectorEcho items={co.sector_echo} />
                </section>
              ) : null}

              {co.trade_idea && (
                <section id="trade" className="scroll-mt-20">
                  <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-5">
                    Trade idea
                  </h2>
                  <TradeIdeaCard trade={co.trade_idea} />
                </section>
              )}

              <section id="chart" className="scroll-mt-20">
                <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-5">
                  Live chart
                </h2>
                <TradingViewWidget symbol={`NSE:${co.symbol}`} />
              </section>

              {co.recent_announcements?.length ? (
                <section id="announcements" className="scroll-mt-20">
                  <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-5">
                    Recent announcements
                  </h2>
                  <RecentAnnouncements items={co.recent_announcements} />
                </section>
              ) : null}
            </>
          ) : (
            <>
              {/* Legacy 4-section layout */}
              <section id="print" className="scroll-mt-20">
                <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-5">
                  Earnings print
                </h2>
                <TabPrint company={co} />
              </section>
              <section id="kpis" className="scroll-mt-20">
                <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-5">
                  Sector KPIs
                </h2>
                <TabKPI company={co} />
              </section>
              <section id="mgmt" className="scroll-mt-20">
                <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-5">
                  Management call
                </h2>
                <TabMgmt company={co} />
              </section>
              <section id="verdict" className="scroll-mt-20">
                <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-5">
                  Verdict
                </h2>
                <TabVerdict company={co} />
              </section>
            </>
          )}

          {/* Footer source links */}
          <footer className="pt-10 border-t border-white/5 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
            <span>Sources:</span>
            {co.transcript_url && (
              <a
                href={co.transcript_url}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-300 hover:text-white underline-offset-2 hover:underline"
              >
                Transcript ↗
              </a>
            )}
            {co.recording_url && (
              <a
                href={co.recording_url}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-300 hover:text-white underline-offset-2 hover:underline"
              >
                Recording ↗
              </a>
            )}
            {co.ppt_url && (
              <a
                href={co.ppt_url}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-300 hover:text-white underline-offset-2 hover:underline"
              >
                Investor presentation ↗
              </a>
            )}
            {!co.transcript_url && !co.recording_url && !co.ppt_url && (
              <span className="text-zinc-600">
                No public sources linked yet.
              </span>
            )}
          </footer>
        </div>

        <aside className="hidden lg:block">
          <StickyTOC sections={sections} />
        </aside>
      </div>
    </article>
  );
}
