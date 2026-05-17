import Link from "next/link";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type MarketSignal = {
  id: string;
  symbol: string;
  company_name: string | null;
  event_type: string;
  headline: string;
  event_date: string | null;
  order_value_text: string | null;
  order_value_inr_cr: number | null;
  counterparty: string | null;
  materiality: "high" | "medium" | "low" | "unknown";
  why_it_matters: string | null;
  signal_score: number;
  confidence: "high" | "medium" | "low";
  source_url: string | null;
  metadata: {
    order_scope?: string | null;
    geography?: string | null;
    client_type?: string | null;
    trade_read?: string | null;
    announcement_summary?: string | null;
    execution_timeline?: string | null;
    subject?: string | null;
    direction?: string | null;
    action?: string | null;
    confidence_label?: string | null;
    fno?: string | null;
  } | null;
};

const EVENT_LABELS: Record<string, string> = {
  order_win: "Order wins",
  capex: "Capex",
  fundraising: "Fundraise",
  m_and_a: "M&A",
  credit_rating: "Ratings",
};

const EVENT_TYPES = Object.keys(EVENT_LABELS);

export const metadata: Metadata = {
  title: "Market Signals | EarningsCanvas",
  description:
    "Daily actionable NSE corporate filing signals: order wins, capex, fundraising, M&A and ratings.",
};

function todayInIST() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

function addDays(dateText: string, days: number) {
  const date = new Date(`${dateText}T00:00:00+05:30`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function istRange(dateText: string) {
  const start = new Date(`${dateText}T00:00:00+05:30`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

function formatDateTime(value: string | null) {
  if (!value) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function hrefFor(params: { date: string; type: string; q?: string }) {
  const search = new URLSearchParams();
  search.set("date", params.date);
  search.set("type", params.type);
  if (params.q) search.set("q", params.q);
  return `/market-signals?${search.toString()}`;
}

function materialityClass(materiality: MarketSignal["materiality"]) {
  if (materiality === "high") return "border-emerald-400/40 bg-emerald-400/10 text-emerald-300";
  if (materiality === "medium") return "border-sky-400/40 bg-sky-400/10 text-sky-300";
  if (materiality === "low") return "border-amber-400/40 bg-amber-400/10 text-amber-300";
  return "border-zinc-700 bg-zinc-900 text-zinc-400";
}

function directionFor(signal: MarketSignal) {
  if (signal.metadata?.direction) return signal.metadata.direction;
  if (["order_win", "capex", "m_and_a"].includes(signal.event_type)) return "BULLISH";
  return "NEUTRAL";
}

function actionFor(signal: MarketSignal) {
  if (signal.metadata?.action) return signal.metadata.action;
  if (signal.event_type === "order_win" && signal.signal_score >= 70) return "BUY MOMENTUM";
  return "WATCH";
}

function confidenceFor(signal: MarketSignal) {
  if (signal.metadata?.confidence_label) return signal.metadata.confidence_label;
  if (signal.signal_score >= 80) return "HIGH";
  if (signal.signal_score >= 55) return "MEDIUM";
  return "LOW";
}

function summaryFor(signal: MarketSignal) {
  if (signal.metadata?.announcement_summary) return signal.metadata.announcement_summary;
  const bits = [];
  if (signal.order_value_text) bits.push(`Order value: ${signal.order_value_text}`);
  if (signal.counterparty) bits.push(`Client: ${signal.counterparty}`);
  if (signal.metadata?.client_type) bits.push(signal.metadata.client_type);
  if (signal.metadata?.geography) bits.push(signal.metadata.geography);
  if (signal.metadata?.execution_timeline) bits.push(`Execution: ${signal.metadata.execution_timeline}`);
  if (signal.metadata?.order_scope) bits.push(`Scope: ${signal.metadata.order_scope}`);
  if (bits.length) return bits.join(" | ");
  return signal.why_it_matters ?? signal.headline;
}

function directionClass(direction: string) {
  if (direction === "BULLISH") return "text-emerald-300";
  if (direction === "BEARISH") return "text-red-300";
  return "text-zinc-300";
}

export default async function MarketSignalsPage({
  searchParams,
}: {
  searchParams: { date?: string; type?: string; q?: string };
}) {
  const selectedDate = searchParams.date ?? todayInIST();
  const selectedType = searchParams.type ?? "order_win";
  const query = (searchParams.q ?? "").trim();
  const { start, end } = istRange(selectedDate);
  const supabase = createSupabaseServerClient();

  let request = supabase
    .from("announcement_signals")
    .select("*")
    .gte("event_date", start)
    .lt("event_date", end)
    .in("event_type", EVENT_TYPES)
    .order("signal_score", { ascending: false })
    .order("event_date", { ascending: false })
    .limit(250);

  if (selectedType !== "all" && EVENT_TYPES.includes(selectedType)) {
    request = request.eq("event_type", selectedType);
  }
  if (query) {
    request = request.or(`symbol.ilike.%${query}%,company_name.ilike.%${query}%,headline.ilike.%${query}%`);
  }

  const { data, error } = await request;
  const signals = ((data ?? []) as MarketSignal[]).filter((signal) =>
    EVENT_TYPES.includes(signal.event_type)
  );
  const orderWins = signals.filter((signal) => signal.event_type === "order_win").length;
  const withValue = signals.filter((signal) => signal.order_value_text).length;
  const topPicks = signals
    .filter((signal) => actionFor(signal) === "BUY MOMENTUM")
    .slice(0, 3);

  return (
    <div className="py-10">
      <div className="flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
            NSE trade signals
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Market Signals
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            Actionable filings only: order wins, capex, fundraising, M&A and rating actions. Routine notices stay out of the feed.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link className="rounded-md border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5" href={hrefFor({ date: addDays(selectedDate, -1), type: selectedType, q: query })}>
            Previous
          </Link>
          <form className="flex items-center gap-2" action="/market-signals">
            <input type="date" name="date" defaultValue={selectedDate} className="rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white" />
            <input type="hidden" name="type" value={selectedType} />
            {query && <input type="hidden" name="q" value={query} />}
            <button className="rounded-md border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5" type="submit">
              Go
            </button>
          </form>
          <Link className="rounded-md border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5" href={hrefFor({ date: addDays(selectedDate, 1), type: selectedType, q: query })}>
            Next
          </Link>
          <Link className="rounded-md border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300" href={hrefFor({ date: todayInIST(), type: selectedType, q: query })}>
            Today
          </Link>
        </div>
      </div>

      <section className="grid gap-3 py-5 sm:grid-cols-3">
        <div className="border border-white/10 bg-zinc-900/60 p-4">
          <div className="text-sm text-zinc-400">Order wins</div>
          <div className="mt-1 text-2xl font-semibold text-white">{orderWins}</div>
        </div>
        <div className="border border-white/10 bg-zinc-900/60 p-4">
          <div className="text-sm text-zinc-400">Signals shown</div>
          <div className="mt-1 text-2xl font-semibold text-white">{signals.length}</div>
        </div>
        <div className="border border-white/10 bg-zinc-900/60 p-4">
          <div className="text-sm text-zinc-400">With disclosed value</div>
          <div className="mt-1 text-2xl font-semibold text-white">{withValue}</div>
        </div>
      </section>

      <div className="flex flex-col gap-3 border-y border-white/10 py-4 md:flex-row md:items-center md:justify-between">
        <form action="/market-signals" className="flex flex-1 gap-2">
          <input type="hidden" name="date" value={selectedDate} />
          <input type="hidden" name="type" value={selectedType} />
          <input name="q" defaultValue={query} placeholder="Search symbol, company, headline" className="min-w-0 flex-1 rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600" />
          <button type="submit" className="rounded-md border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5">
            Search
          </button>
        </form>
        <div className="flex flex-wrap gap-2">
          <Link href={hrefFor({ date: selectedDate, type: "all", q: query })} className={`rounded-md px-3 py-2 text-sm ${selectedType === "all" ? "bg-white text-zinc-950" : "border border-white/10 text-zinc-300 hover:bg-white/5"}`}>
            All
          </Link>
          {Object.entries(EVENT_LABELS).map(([type, label]) => (
            <Link key={type} href={hrefFor({ date: selectedDate, type, q: query })} className={`rounded-md px-3 py-2 text-sm ${selectedType === type ? "bg-white text-zinc-950" : "border border-white/10 text-zinc-300 hover:bg-white/5"}`}>
              {label}
            </Link>
          ))}
        </div>
      </div>

      {error ? (
        <div className="py-10 text-sm text-red-300">Could not load market signals: {error.message}</div>
      ) : signals.length === 0 ? (
        <div className="py-12 text-sm text-zinc-400">
          No trade signals found for {selectedDate} with the current filters.
        </div>
      ) : (
        <>
          <section className="overflow-x-auto border border-white/10">
            <table className="min-w-[1080px] w-full border-collapse text-sm">
              <thead className="bg-zinc-900 text-left text-xs uppercase tracking-wide text-zinc-400">
                <tr>
                  <th className="w-12 border-b border-white/10 px-3 py-3">#</th>
                  <th className="w-32 border-b border-white/10 px-3 py-3">Stock</th>
                  <th className="border-b border-white/10 px-3 py-3">Announcement Summary</th>
                  <th className="w-28 border-b border-white/10 px-3 py-3">Direction</th>
                  <th className="w-20 border-b border-white/10 px-3 py-3">F&O</th>
                  <th className="w-36 border-b border-white/10 px-3 py-3">Action</th>
                  <th className="w-28 border-b border-white/10 px-3 py-3">Confidence</th>
                  <th className="w-20 border-b border-white/10 px-3 py-3">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {signals.map((signal, index) => {
                  const direction = directionFor(signal);
                  return (
                    <tr key={signal.id} className="align-top hover:bg-white/[0.03]">
                      <td className="px-3 py-3 text-zinc-500">{index + 1}</td>
                      <td className="px-3 py-3">
                        <div className="font-semibold text-white">{signal.symbol}</div>
                        <div className="mt-1 text-xs text-zinc-500">{formatDateTime(signal.event_date)}</div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-medium text-white">{signal.headline}</div>
                        <div className="mt-1 leading-6 text-zinc-300">{summaryFor(signal)}</div>
                        {signal.why_it_matters && (
                          <div className="mt-2 text-xs text-emerald-300">{signal.why_it_matters}</div>
                        )}
                      </td>
                      <td className={`px-3 py-3 font-semibold ${directionClass(direction)}`}>
                        <span className="mr-1">{direction === "BULLISH" ? "●" : direction === "BEARISH" ? "●" : "○"}</span>
                        {direction}
                      </td>
                      <td className="px-3 py-3 text-zinc-300">{signal.metadata?.fno ?? "NO"}</td>
                      <td className="px-3 py-3 font-semibold text-white">{actionFor(signal)}</td>
                      <td className="px-3 py-3 text-zinc-300">{confidenceFor(signal)}</td>
                      <td className="px-3 py-3">
                        {signal.source_url && (
                          <a className="text-emerald-300 hover:text-emerald-200" href={signal.source_url} target="_blank" rel="noreferrer">
                            PDF
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
          {topPicks.length > 0 && (
            <section className="mt-6 border border-emerald-400/20 bg-emerald-400/5 p-4">
              <h2 className="text-sm font-semibold text-emerald-300">CIO&apos;s Top 3 Picks</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {topPicks.map((signal) => (
                  <div key={signal.id} className="border border-white/10 bg-zinc-950/70 p-3">
                    <div className="font-semibold text-white">{signal.symbol}</div>
                    <div className="mt-1 text-sm text-zinc-300">{summaryFor(signal)}</div>
                    <div className="mt-2 text-xs text-emerald-300">{actionFor(signal)} | {confidenceFor(signal)}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
