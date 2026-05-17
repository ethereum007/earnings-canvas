import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Filter, RefreshCcw, Search, TrendingUp } from "lucide-react";
import DashboardNav from "@/components/DashboardNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
};

const eventLabels: Record<string, string> = {
  order_win: "Order wins",
  capex: "Capex",
  fundraising: "Fundraise",
  m_and_a: "M&A",
  credit_rating: "Ratings",
};
const actionableEventTypes = Object.keys(eventLabels);

const materialityTone: Record<MarketSignal["materiality"], string> = {
  high: "bg-emerald/10 text-emerald border-emerald/30",
  medium: "bg-blue/10 text-blue border-blue/30",
  low: "bg-amber/10 text-amber border-amber/30",
  unknown: "bg-muted text-muted-foreground border-border",
};

const MarketSignals = () => {
  const [query, setQuery] = useState("");
  const [eventType, setEventType] = useState("order_win");

  const { data = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["market-signals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcement_signals" as never)
        .select("*")
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

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              NSE corporate filings
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-foreground">Market Signals</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Trade-focused NSE filings: order wins, capex, fundraising, M&A, and rating actions. Routine filings are filtered out.
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
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

        <section className="divide-y divide-border">
          {isLoading ? (
            <div className="py-12 text-sm text-muted-foreground">Loading market signals...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-sm text-muted-foreground">No signals found for the current filters.</div>
          ) : (
            filtered.map((signal) => (
              <article key={signal.id} className="grid gap-4 py-5 lg:grid-cols-[180px_1fr_160px]">
                <div>
                  <div className="text-lg font-semibold">{signal.symbol}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{signal.company_name}</div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {signal.event_date ? new Date(signal.event_date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Date unavailable"}
                  </div>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{eventLabels[signal.event_type] ?? signal.event_type}</Badge>
                    <Badge variant="outline" className={materialityTone[signal.materiality]}>
                      {signal.materiality}
                    </Badge>
                    {signal.order_value_text && <Badge variant="outline">{signal.order_value_text}</Badge>}
                  </div>
                  <h2 className="mt-3 text-base font-semibold">{signal.headline}</h2>
                  {signal.why_it_matters && <p className="mt-2 text-sm leading-6 text-muted-foreground">{signal.why_it_matters}</p>}
                  {signal.counterparty && <p className="mt-2 text-sm">Counterparty: {signal.counterparty}</p>}
                </div>
                <div className="flex items-start justify-between gap-3 lg:flex-col lg:items-end">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Score</div>
                    <div className="text-2xl font-semibold">{signal.signal_score}</div>
                  </div>
                  {signal.source_url && (
                    <Button asChild variant="outline" size="sm">
                      <a href={signal.source_url} target="_blank" rel="noreferrer">
                        Source
                        <ExternalLink className="ml-2 h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
};

export default MarketSignals;
