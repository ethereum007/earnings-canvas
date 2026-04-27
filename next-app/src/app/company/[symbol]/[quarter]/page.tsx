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

  if (!co) {
    return { title: `${symbol} ${quarter} | EarningsCanvas` };
  }

  const title = `${co.company} — ${quarter} Results | EarningsCanvas`;
  const description =
    co.analysis_summary ||
    co.verdict_summary ||
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

const SECTIONS = [
  { id: "print", title: "Earnings print" },
  { id: "kpis", title: "Sector KPIs" },
  { id: "mgmt", title: "Management call" },
  { id: "verdict", title: "Verdict" },
] as const;

export default async function CompanyQuarterPage({
  params,
}: {
  params: { symbol: string; quarter: string };
}) {
  const symbol = decodeURIComponent(params.symbol).toUpperCase();
  const quarter = slugToQuarter(params.quarter);
  const co = await fetchCompany(symbol, quarter);
  if (!co) notFound();

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
            </h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-zinc-500">
              <span className="font-mono text-emerald-400">{co.symbol}</span>
              <span>·</span>
              <span>{co.sector ?? "—"}</span>
              {co.market_cap && (
                <>
                  <span>·</span>
                  <span>{co.market_cap}</span>
                </>
              )}
              <span>·</span>
              <span className="text-zinc-300">{quarter}</span>
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

        {(co.analysis_summary || co.verdict_summary) && (
          <p className="mt-6 text-base text-zinc-300 leading-relaxed max-w-3xl">
            {co.analysis_summary || co.verdict_summary}
          </p>
        )}

        {co.investment_signal && (
          <div className="mt-4 inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-white/5 border border-white/10">
            <span className="text-zinc-500 uppercase tracking-wider">
              Signal
            </span>
            <span className="text-white font-medium">
              {co.investment_signal}
            </span>
          </div>
        )}
      </header>

      <div className="lg:grid lg:grid-cols-[1fr_180px] lg:gap-12">
        <div className="space-y-12 min-w-0">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-20">
              <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-5">
                {s.title}
              </h2>
              {s.id === "print" && <TabPrint company={co} />}
              {s.id === "kpis" && <TabKPI company={co} />}
              {s.id === "mgmt" && <TabMgmt company={co} />}
              {s.id === "verdict" && <TabVerdict company={co} />}
            </section>
          ))}

          {/* Footer links */}
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
                Earnings call recording ↗
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
              <span className="text-zinc-600">No public sources linked yet.</span>
            )}
          </footer>
        </div>

        {/* Sticky TOC for desktop */}
        <aside className="hidden lg:block">
          <StickyTOC sections={SECTIONS} />
        </aside>
      </div>
    </article>
  );
}
