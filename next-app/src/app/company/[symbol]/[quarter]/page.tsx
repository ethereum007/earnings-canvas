import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { EarningsSeasonRow } from "@/types/earnings";
import { cn, resultStatusColor } from "@/lib/utils";
import { quarterToSlug, slugToQuarter } from "@/lib/slug";

import StickyTOC from "@/components/company/StickyTOC";
import SectionHeading from "@/components/report/SectionHeading";
import VerdictTLDR from "@/components/report/VerdictTLDR";
import HeroStats from "@/components/report/HeroStats";
import SnapshotCard from "@/components/earnings/SnapshotCard";
import PnLLayer from "@/components/earnings/PnLLayer";
import type { SnapshotData, PnLLayerData } from "@/types/earnings";
import ReportHighlights from "@/components/report/ReportHighlights";
import HeadlineNumbersTable from "@/components/report/HeadlineNumbersTable";
import AnnualContextSection from "@/components/report/AnnualContext";
import SegmentScorecard from "@/components/report/SegmentScorecard";
import SegmentNarratives from "@/components/report/SegmentNarratives";
import KeyQuotes from "@/components/report/KeyQuotes";
import SectorEcho from "@/components/report/SectorEcho";
import TradeIdeaCard from "@/components/report/TradeIdea";
import RecentAnnouncements from "@/components/report/RecentAnnouncements";
import TradingViewWidget from "@/components/report/TradingViewWidget";
import BottomLine from "@/components/report/BottomLine";
import DistributionCopyPanel from "@/components/report/DistributionCopyPanel";
import StrategicThreads from "@/components/report/StrategicThreads";
import ConcallQAIntel from "@/components/report/ConcallQAIntel";
import Markdown from "@/components/markdown/Markdown";
import TabKPI from "@/components/earnings/tabs/TabKPI";
import TabPrint from "@/components/earnings/tabs/TabPrint";
import TabMgmt from "@/components/earnings/tabs/TabMgmt";
import TabVerdict from "@/components/earnings/tabs/TabVerdict";

export const revalidate = 600;

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
  const description = (
    co.verdict_summary ||
    co.analysis_summary ||
    `${co.company} (${co.symbol}) ${quarter} earnings analysis`
  ).slice(0, 200);

  const score =
    co.verdict_score != null
      ? co.verdict_score > 1
        ? co.verdict_score.toFixed(1)
        : (co.verdict_score * 10).toFixed(1)
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
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `/company/${symbol}/${params.quarter}`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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

  // ── Detect rich vs legacy
  const hasRich = Boolean(
    (co.report_highlights && co.report_highlights.length) ||
      co.annual_context ||
      (co.segments && co.segments.length) ||
      (co.segment_narratives && co.segment_narratives.length) ||
      (co.key_quotes && co.key_quotes.length) ||
      (co.sector_echo && co.sector_echo.length) ||
      co.trade_idea ||
      co.long_form_intro
  );

  // Watchlist questions for the call (when transcript not yet available)
  const watchlistQs = Array.isArray(co.dodged_questions)
    ? (co.dodged_questions as unknown[]).filter(
        (q) => typeof q === "string"
      ) as string[]
    : [];

  const strategicThreads = co.strategic_threads ?? [];
  const concallQA = co.concall_qa ?? [];

  // Build SnapshotData for the hero card
  const snapshot: SnapshotData = {
    symbol: co.symbol,
    company: co.company,
    sector: co.sector,
    market_cap: co.market_cap,
    quarter: co.quarter,
    result_date: co.result_date,
    headline_verdict: co.result_status,
    headline_verdict_basis: co.headline_verdict_basis ?? null,
    guidance_verdict: co.guidance_verdict ?? null,
    estimate_revision_direction: co.estimate_revision_direction ?? null,
    estimate_revision_magnitude: co.estimate_revision_magnitude ?? null,
    estimate_revision_metric: co.estimate_revision_metric ?? null,
    stock_reaction_pct: co.stock_reaction_pct ?? null,
    stock_reaction_vs_index_pct: co.stock_reaction_vs_index_pct ?? null,
    stock_reaction_index_name: co.stock_reaction_index_name ?? null,
    three_things_that_mattered: co.three_things_that_mattered ?? null,
    position_bias: co.position_bias ?? null,
    conviction: co.conviction ?? null,
    next_catalyst_date: co.next_catalyst_date ?? null,
    next_catalyst_event: co.next_catalyst_event ?? null,
    rollup_verdict: co.rollup_verdict ?? null,
    rollup_verdict_oneliner: co.rollup_verdict_oneliner ?? null,
    layer1_verdict: co.layer1_verdict,
    layer2_verdict: co.layer2_verdict,
    layer3_verdict: co.layer3_verdict,
    layer4_verdict: co.layer4_verdict,
    layer5_verdict: co.layer5_verdict,
  };

  const pnlLayer = (co.pnl_layer ?? null) as PnLLayerData | null;
  const hasPnlLayer = Boolean(pnlLayer && pnlLayer.metrics?.length);

  // Detect if snapshot card should render: any snapshot field populated
  const hasSnapshot = Boolean(
    snapshot.rollup_verdict ||
      snapshot.position_bias ||
      snapshot.three_things_that_mattered?.length ||
      snapshot.guidance_verdict ||
      snapshot.estimate_revision_direction ||
      snapshot.stock_reaction_pct != null ||
      snapshot.next_catalyst_event
  );

  // Forward tracker
  const forwardTracker = Array.isArray(co.next_quarter_watchlist)
    ? (co.next_quarter_watchlist as Array<{
        emoji?: string;
        text?: string;
        color?: string;
      }>)
    : [];

  // Sector KPIs (from earnings_season.sector_kpis jsonb)
  const sectorKpis = Array.isArray(co.sector_kpis) ? co.sector_kpis : [];

  // ── Build TOC dynamically
  const toc: { id: string; title: string }[] = [];
  let n = 0;
  const push = (id: string, title: string) => {
    n++;
    toc.push({ id, title });
  };
  if (hasRich) {
    if (!hasSnapshot) push("verdict", "Verdict");
    push(hasPnlLayer ? "pnl" : "snapshot", hasPnlLayer ? "P&L vs Consensus" : "Headline numbers");
    if (co.report_highlights?.length) push("highlights", "60-second read");
    if (co.long_form_intro) push("intro", "The story");
    if (co.annual_context) push("annual", "Annual context");
    if (co.segments?.length) push("segments", "Segment scorecard");
    if (co.segment_narratives?.length) push("deepdives", "Segment deep-dives");
    if (sectorKpis.length) push("kpis", "Sector KPIs");
    if (strategicThreads.length) push("threads", "Strategic threads");
    if (co.key_quotes?.length) push("mgmt", "Management call");
    if (concallQA.length || watchlistQs.length) push("qa", "Q&A intelligence");
    if (forwardTracker.length) push("forward", "Forward tracker");
    if (co.sector_echo?.length) push("echo", "Sector echo");
    if (co.trade_idea) push("trade", "Trade idea");
    push("chart", "Live chart");
    if (co.recent_announcements?.length)
      push("announcements", "Announcements");
    if (co.bottom_line?.length) push("bottom", "Bottom line");
    if (co.distribution_copy) push("share", "Share copy");
  } else {
    push("snapshot", "Earnings print");
    if (sectorKpis.length) push("kpis", "Sector KPIs");
    push("mgmt", "Management call");
    push("verdict-legacy", "Verdict");
  }

  // Helper for stable section numbers
  let sec = 0;
  const next = () => ++sec;

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

      {/* Hero — SnapshotCard if we have institutional fields, otherwise legacy header */}
      {hasSnapshot ? (
        <SnapshotCard data={snapshot} />
      ) : (
        <header className="mb-10 pb-8 border-b border-white/5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl lg:text-[44px] font-medium text-white tracking-tight leading-[1.1]">
                {co.company}
                <span className="text-zinc-500 font-normal text-xl lg:text-2xl ml-2 lg:ml-3">
                  · {quarter}
                </span>
              </h1>
              <div className="mt-3 flex items-center gap-3 text-sm text-zinc-500 flex-wrap font-mono">
                <span className="text-emerald-400">NSE: {co.symbol}</span>
                {co.sector && (
                  <>
                    <span>·</span>
                    <span className="font-sans">{co.sector}</span>
                  </>
                )}
                {co.market_cap && (
                  <>
                    <span>·</span>
                    <span>{co.market_cap}</span>
                  </>
                )}
                {co.result_date && (
                  <>
                    <span>·</span>
                    <span className="font-sans">
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
      )}

      <div className="lg:grid lg:grid-cols-[1fr_200px] lg:gap-12">
        <div className="space-y-14 min-w-0">
          {hasRich ? (
            <>
              {/* 01 · Verdict TL;DR — skip when SnapshotCard is rendering (it covers verdict) */}
              {!hasSnapshot && (
                <section id="verdict" className="scroll-mt-20">
                  <SectionHeading num={next()}>The verdict</SectionHeading>
                  <VerdictTLDR co={co} />
                </section>
              )}

              {/* 02 · P&L vs Consensus (Layer 1) — supersedes Headline numbers when present */}
              {hasPnlLayer ? (
                <section id="pnl" className="scroll-mt-20">
                  <SectionHeading num={next()}>
                    P&amp;L vs Consensus
                  </SectionHeading>
                  <PnLLayer
                    data={pnlLayer!}
                    layerVerdict={co.layer1_verdict}
                  />
                </section>
              ) : (
                <section id="snapshot" className="scroll-mt-20">
                  <SectionHeading num={next()}>Headline numbers</SectionHeading>
                  <div className="space-y-5">
                    <HeroStats co={co} />
                    <HeadlineNumbersTable co={co} />
                  </div>
                </section>
              )}

              {/* 03 · 60-second read */}
              {co.report_highlights?.length ? (
                <section id="highlights" className="scroll-mt-20">
                  <SectionHeading num={next()}>
                    The 60-second read
                  </SectionHeading>
                  <ReportHighlights highlights={co.report_highlights} />
                </section>
              ) : null}

              {/* 04 · The story (long-form intro with drop cap) */}
              {co.long_form_intro && (
                <section id="intro" className="scroll-mt-20">
                  <SectionHeading num={next()}>The story</SectionHeading>
                  <div className="drop-cap max-w-3xl text-base lg:text-lg text-zinc-200 leading-relaxed">
                    <Markdown>{co.long_form_intro}</Markdown>
                  </div>
                </section>
              )}

              {/* 05 · Annual context */}
              {co.annual_context && (
                <section id="annual" className="scroll-mt-20">
                  <SectionHeading num={next()}>Annual context</SectionHeading>
                  <AnnualContextSection ctx={co.annual_context} />
                </section>
              )}

              {/* 06 · Segment scorecard */}
              {co.segments?.length ? (
                <section id="segments" className="scroll-mt-20">
                  <SectionHeading num={next()}>Segment scorecard</SectionHeading>
                  <SegmentScorecard segments={co.segments} />
                </section>
              ) : null}

              {/* 07 · Segment deep-dives */}
              {co.segment_narratives?.length ? (
                <section id="deepdives" className="scroll-mt-20">
                  <SectionHeading num={next()}>Segment deep-dives</SectionHeading>
                  <SegmentNarratives narratives={co.segment_narratives} />
                </section>
              ) : null}

              {/* 08 · Sector KPIs */}
              {sectorKpis.length ? (
                <section id="kpis" className="scroll-mt-20">
                  <SectionHeading num={next()}>Sector KPIs</SectionHeading>
                  <TabKPI company={co} />
                </section>
              ) : null}

              {/* 09 · Strategic threads — the institutional synthesis layer */}
              {strategicThreads.length ? (
                <section id="threads" className="scroll-mt-20">
                  <SectionHeading num={next()}>
                    Strategic threads — connecting the dots
                  </SectionHeading>
                  <StrategicThreads threads={strategicThreads} />
                </section>
              ) : null}

              {/* 10 · Management call */}
              {co.key_quotes?.length ? (
                <section id="mgmt" className="scroll-mt-20">
                  <SectionHeading num={next()}>What management said</SectionHeading>
                  <KeyQuotes quotes={co.key_quotes} />
                </section>
              ) : null}

              {/* 11 · Q&A intelligence — structured if transcript present, else watchlist */}
              {concallQA.length ? (
                <section id="qa" className="scroll-mt-20">
                  <SectionHeading num={next()}>Concall Q&amp;A intelligence</SectionHeading>
                  <ConcallQAIntel items={concallQA} />
                </section>
              ) : watchlistQs.length ? (
                <section id="qa" className="scroll-mt-20">
                  <SectionHeading num={next()}>Concall Q&amp;A intelligence</SectionHeading>
                  <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-5 mb-4 text-sm text-amber-300">
                    🕐 Transcript drops in 24–48 hours. Page will be updated with Q&A breakdown — analyst questions, management answers, deflection flags, and EarningsCanvas interpretation.
                  </div>
                  <div className="text-xs text-zinc-500 uppercase tracking-[0.18em] mb-3">
                    Watchlist questions for the call
                  </div>
                  <ul className="space-y-2.5">
                    {watchlistQs.map((q, i) => (
                      <li key={i} className="flex gap-3 text-sm text-zinc-300">
                        <span className="text-zinc-600">→</span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {/* 11 · Forward tracker */}
              {forwardTracker.length ? (
                <section id="forward" className="scroll-mt-20">
                  <SectionHeading num={next()}>
                    Forward tracker · what to watch
                  </SectionHeading>
                  <ul className="space-y-3">
                    {forwardTracker.map((f, i) => (
                      <li
                        key={i}
                        className="flex gap-3 items-start text-sm text-zinc-200"
                      >
                        <span className="text-base flex-shrink-0">
                          {f.emoji ?? "•"}
                        </span>
                        <span className="leading-relaxed">{f.text}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {/* 12 · Sector echo */}
              {co.sector_echo?.length ? (
                <section id="echo" className="scroll-mt-20">
                  <SectionHeading num={next()}>Sector echo</SectionHeading>
                  <SectorEcho items={co.sector_echo} />
                </section>
              ) : null}

              {/* 13 · Trade idea */}
              {co.trade_idea && (
                <section id="trade" className="scroll-mt-20">
                  <SectionHeading num={next()}>Trade idea</SectionHeading>
                  <TradeIdeaCard trade={co.trade_idea} />
                </section>
              )}

              {/* 14 · Live chart */}
              <section id="chart" className="scroll-mt-20">
                <SectionHeading num={next()}>Live chart</SectionHeading>
                <TradingViewWidget symbol={`NSE:${co.symbol}`} />
              </section>

              {/* 15 · Recent announcements */}
              {co.recent_announcements?.length ? (
                <section id="announcements" className="scroll-mt-20">
                  <SectionHeading num={next()}>NSE corporate announcements</SectionHeading>
                  <RecentAnnouncements items={co.recent_announcements} />
                </section>
              ) : null}

              {/* 16 · Bottom line */}
              {co.bottom_line?.length ? (
                <section id="bottom" className="scroll-mt-20">
                  <SectionHeading num={next()}>Bottom line</SectionHeading>
                  <BottomLine items={co.bottom_line} />
                </section>
              ) : null}

              {/* 17 · Distribution copy */}
              {co.distribution_copy && (
                <section id="share" className="scroll-mt-20">
                  <SectionHeading num={next()}>Share copy</SectionHeading>
                  <DistributionCopyPanel copy={co.distribution_copy} />
                </section>
              )}
            </>
          ) : (
            <>
              <section id="snapshot" className="scroll-mt-20">
                <SectionHeading num={next()}>Earnings print</SectionHeading>
                <TabPrint company={co} />
              </section>
              {sectorKpis.length ? (
                <section id="kpis" className="scroll-mt-20">
                  <SectionHeading num={next()}>Sector KPIs</SectionHeading>
                  <TabKPI company={co} />
                </section>
              ) : null}
              <section id="mgmt" className="scroll-mt-20">
                <SectionHeading num={next()}>Management call</SectionHeading>
                <TabMgmt company={co} />
              </section>
              <section id="verdict-legacy" className="scroll-mt-20">
                <SectionHeading num={next()}>Verdict</SectionHeading>
                <TabVerdict company={co} />
              </section>
            </>
          )}

          {/* Sources */}
          <footer className="pt-10 border-t border-white/5 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
            <span className="uppercase tracking-[0.18em] text-[10px]">Sources</span>
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
            <span className="ml-auto text-zinc-600 italic">
              Last updated{" "}
              {new Date(co.updated_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              . Research, not advice.
            </span>
          </footer>
        </div>

        <aside className="hidden lg:block">
          <StickyTOC sections={toc} />
        </aside>
      </div>
    </article>
  );
}
