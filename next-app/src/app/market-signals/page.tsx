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
    subject?: string | null;
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

function DetailPill({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <div className="border border-white/10 bg-zinc-900/70 px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-zinc-100">{value}</div>
    </div>
  );
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
        <section className="divide-y divide-white/10">
          {signals.map((signal) => (
            <article key={signal.id} className="grid gap-4 py-5 lg:grid-cols-[180px_1fr_150px]">
              <div>
                <div className="text-lg font-semibold text-white">{signal.symbol}</div>
                <div className="mt-1 text-sm text-zinc-400">{signal.company_name}</div>
                <div className="mt-2 text-xs text-zinc-500">{formatDateTime(signal.event_date)}</div>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white">
                    {EVENT_LABELS[signal.event_type] ?? signal.event_type}
                  </span>
                  <span className={`rounded-full border px-2.5 py-1 text-xs ${materialityClass(signal.materiality)}`}>
                    {signal.materiality}
                  </span>
                  {signal.order_value_text && (
                    <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-zinc-300">
                      {signal.order_value_text}
                    </span>
                  )}
                </div>
                <h2 className="mt-3 text-base font-semibold text-white">{signal.headline}</h2>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  <DetailPill label="Order value" value={signal.order_value_text} />
                  <DetailPill label="Client" value={signal.counterparty} />
                  <DetailPill label="Client type" value={signal.metadata?.client_type} />
                  <DetailPill label="Geography" value={signal.metadata?.geography} />
                </div>
                <DetailPill label="Project scope" value={signal.metadata?.order_scope} />
                {signal.why_it_matters && (
                  <div className="mt-3 border-l-2 border-emerald-400/50 bg-emerald-400/5 px-3 py-2">
                    <div className="text-[11px] uppercase tracking-wide text-emerald-300">Trade read</div>
                    <p className="mt-1 text-sm leading-6 text-zinc-200">{signal.why_it_matters}</p>
                  </div>
                )}
              </div>
              <div className="flex items-start justify-between gap-3 lg:flex-col lg:items-end">
                <div className="text-right">
                  <div className="text-xs text-zinc-500">Score</div>
                  <div className="text-2xl font-semibold text-white">{signal.signal_score}</div>
                </div>
                {signal.source_url && (
                  <a className="rounded-md border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5" href={signal.source_url} target="_blank" rel="noreferrer">
                    Source
                  </a>
                )}
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
