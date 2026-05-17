import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight, Filter, RefreshCcw, Search, TrendingUp } from "lucide-react";
import DashboardNav from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

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
    direction?: string | null;
    action?: string | null;
    confidence_label?: string | null;
    fno?: string | null;
  } | null;
};

const eventLabels: Record<string, string> = {
  order_win: "Order wins",
  capex: "Capex",
  fundraising: "Fundraise",
  m_and_a: "M&A",
  credit_rating: "Ratings",
};
const actionableEventTypes = Object.keys(eventLabels);

const startOfLocalDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};
const toDateInput = (date: Date) => format(date, "yyyy-MM-dd");

const directionFor = (signal: MarketSignal) => {
  if (signal.metadata?.direction) return signal.metadata.direction;
  if (["order_win", "capex", "m_and_a"].includes(signal.event_type)) return "BULLISH";
  return "NEUTRAL";
};

const actionFor = (signal: MarketSignal) => {
  if (signal.metadata?.action) return signal.metadata.action;
  if (signal.event_type === "order_win" && signal.signal_score >= 70) return "BUY MOMENTUM";
  return "WATCH";
};

const confidenceFor = (signal: MarketSignal) => {
  if (signal.metadata?.confidence_label) return signal.metadata.confidence_label;
  if (signal.signal_score >= 80) return "HIGH";
  if (signal.signal_score >= 55) return "MEDIUM";
  return "LOW";
};

const summaryFor = (signal: MarketSignal) => {
  const bits = [];
  if (signal.order_value_text) bits.push(`Order value: ${signal.order_value_text}`);
  if (signal.counterparty) bits.push(`Client: ${signal.counterparty}`);
  if (signal.metadata?.client_type) bits.push(signal.metadata.client_type);
  if (signal.metadata?.geography) bits.push(signal.metadata.geography);
  if (signal.metadata?.order_scope) bits.push(`Scope: ${signal.metadata.order_scope}`);
  if (bits.length) return bits.join(" | ");
  return signal.why_it_matters ?? signal.headline;
};

const directionClass = (direction: string) => {
  if (direction === "BULLISH") return "text-emerald-600";
  if (direction === "BEARISH") return "text-red-600";
  return "text-muted-foreground";
};

const MarketSignals = () => {
  const [query, setQuery] = useState("");
  const [eventType, setEventType] = useState("order_win");
  const [selectedDate, setSelectedDate] = useState(() => startOfLocalDay(new Date()));

  const dateRange = useMemo(() => {
    const start = startOfLocalDay(selectedDate);
    const end = addDays(start, 1);
    return {
      startIso: start.toISOString(),
      endIso: end.toISOString(),
      label: format(start, "dd MMM yyyy"),
    };
  }, [selectedDate]);

  const { data = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["market-signals", toDateInput(selectedDate)],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcement_signals" as never)
        .select("*")
        .gte("event_date", dateRange.startIso)
        .lt("event_date", dateRange.endIso)
        .order("signal_score", { ascending: false })
        .order("event_date", { ascending: false })
        .limit(250);
      if (error) throw error;
      return (data ?? []) as unknown as MarketSignal[];
    },
  });

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return data.filter((signal) => {
      if (!actionableEventTypes.includes(signal.event_type)) return false;
      const matchesType = eventType === "all" || signal.event_type === eventType;
      const blob = `${signal.symbol} ${signal.company_name ?? ""} ${signal.headline}`.toLowerCase();
      return matchesType && (!needle || blob.includes(needle));
    });
  }, [data, eventType, query]);

  const topStats = useMemo(() => {
    const actionable = data.filter((signal) => actionableEventTypes.includes(signal.event_type));
    const orderWins = actionable.filter((signal) => signal.event_type === "order_win").length;
    const highScore = actionable.length;
    const withValue = actionable.filter((signal) => signal.order_value_text).length;
    return { orderWins, highScore, withValue };
  }, [data]);

  const topPicks = useMemo(
    () => filtered.filter((signal) => actionFor(signal) === "BUY MOMENTUM").slice(0, 3),
    [filtered],
  );

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              NSE corporate filings for {dateRange.label}
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-foreground">Market Signals</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Trade-focused NSE filings: order wins, capex, fundraising, M&A, and rating actions. Routine filings are filtered out.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setSelectedDate((date) => addDays(date, -1))} aria-label="Previous day">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-44 justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.label}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(startOfLocalDay(date))}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedDate((date) => addDays(date, 1))}
              disabled={toDateInput(selectedDate) >= toDateInput(new Date())}
              aria-label="Next day"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => setSelectedDate(startOfLocalDay(new Date()))}>
              Today
            </Button>
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <section className="grid gap-3 py-5 sm:grid-cols-3">
          <div className="border border-border bg-card p-4">
            <div className="text-sm text-muted-foreground">Order wins</div>
            <div className="mt-1 text-2xl font-semibold">{topStats.orderWins}</div>
          </div>
          <div className="border border-border bg-card p-4">
            <div className="text-sm text-muted-foreground">Actionable signals</div>
            <div className="mt-1 text-2xl font-semibold">{topStats.highScore}</div>
          </div>
          <div className="border border-border bg-card p-4">
            <div className="text-sm text-muted-foreground">With disclosed value</div>
            <div className="mt-1 text-2xl font-semibold">{topStats.withValue}</div>
          </div>
        </section>

        <div className="flex flex-col gap-3 border-y border-border py-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search symbol, company, headline" className="pl-9" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All trade signals</SelectItem>
                {Object.entries(eventLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <section>
          {isLoading ? (
            <div className="py-12 text-sm text-muted-foreground">Loading market signals...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-sm text-muted-foreground">No trade signals found for {dateRange.label} with the current filters.</div>
          ) : (
            <>
              <div className="overflow-x-auto border border-border">
                <table className="min-w-[1080px] w-full border-collapse text-sm">
                  <thead className="bg-secondary text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="w-12 border-b border-border px-3 py-3">#</th>
                      <th className="w-36 border-b border-border px-3 py-3">Stock</th>
                      <th className="border-b border-border px-3 py-3">Announcement Summary</th>
                      <th className="w-28 border-b border-border px-3 py-3">Direction</th>
                      <th className="w-20 border-b border-border px-3 py-3">F&O</th>
                      <th className="w-36 border-b border-border px-3 py-3">Action</th>
                      <th className="w-28 border-b border-border px-3 py-3">Confidence</th>
                      <th className="w-20 border-b border-border px-3 py-3">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((signal, index) => {
                      const direction = directionFor(signal);
                      return (
                        <tr key={signal.id} className="align-top hover:bg-secondary/40">
                          <td className="px-3 py-3 text-muted-foreground">{index + 1}</td>
                          <td className="px-3 py-3">
                            <div className="font-semibold">{signal.symbol}</div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {signal.event_date ? new Date(signal.event_date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Date unavailable"}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="font-medium">{signal.headline}</div>
                            <div className="mt-1 leading-6 text-muted-foreground">{summaryFor(signal)}</div>
                            {signal.why_it_matters && <div className="mt-2 text-xs text-emerald">{signal.why_it_matters}</div>}
                          </td>
                          <td className={`px-3 py-3 font-semibold ${directionClass(direction)}`}>
                            <span className="mr-1">{direction === "BULLISH" ? "●" : direction === "BEARISH" ? "●" : "○"}</span>
                            {direction}
                          </td>
                          <td className="px-3 py-3">{signal.metadata?.fno ?? "NO"}</td>
                          <td className="px-3 py-3 font-semibold">{actionFor(signal)}</td>
                          <td className="px-3 py-3">{confidenceFor(signal)}</td>
                          <td className="px-3 py-3">
                            {signal.source_url && (
                              <a className="text-emerald hover:underline" href={signal.source_url} target="_blank" rel="noreferrer">
                                PDF
                              </a>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {topPicks.length > 0 && (
                <div className="mt-6 border border-emerald/20 bg-emerald/5 p-4">
                  <h2 className="text-sm font-semibold text-emerald">CIO's Top 3 Picks</h2>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    {topPicks.map((signal) => (
                      <div key={signal.id} className="border border-border bg-card p-3">
                        <div className="font-semibold">{signal.symbol}</div>
                        <div className="mt-1 text-sm text-muted-foreground">{summaryFor(signal)}</div>
                        <div className="mt-2 text-xs text-emerald">{actionFor(signal)} | {confidenceFor(signal)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default MarketSignals;
