import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardNav from "@/components/DashboardNav";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getSignalColor, getSignalLabel, getSentimentColor, getToneEmoji, getSentimentBarWidth } from "@/lib/signal-utils";
import { Search } from "lucide-react";

type SortMode = "sentiment" | "name" | "recent";

const Dashboard = () => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("sentiment");
  const navigate = useNavigate();

  const { data: analyses, isLoading } = useQuery({
    queryKey: ["latest_analyses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("latest_analyses")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    if (!analyses) return [];
    let result = analyses.filter((a) => {
      const q = search.toLowerCase();
      if (!q) return true;
      return (
        a.name?.toLowerCase().includes(q) ||
        a.symbol?.toLowerCase().includes(q) ||
        a.sector?.toLowerCase().includes(q)
      );
    });

    result.sort((a, b) => {
      if (sort === "sentiment") return (b.sentiment_score ?? 0) - (a.sentiment_score ?? 0);
      if (sort === "name") return (a.name ?? "").localeCompare(b.name ?? "");
      return new Date(b.analyzed_at ?? 0).getTime() - new Date(a.analyzed_at ?? 0).getTime();
    });

    return result;
  }, [analyses, search, sort]);

  const signalCounts = useMemo(() => {
    if (!analyses) return { bullish: 0, neutral: 0, bearish: 0 };
    return analyses.reduce(
      (acc, a) => {
        const s = a.investment_signal;
        if (s === "STRONG_BUY" || s === "BUY") acc.bullish++;
        else if (s === "HOLD") acc.neutral++;
        else acc.bearish++;
        return acc;
      },
      { bullish: 0, neutral: 0, bearish: 0 }
    );
  }, [analyses]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple to-emerald bg-clip-text text-transparent">
              EarningsCanvas
            </span>
          </h1>
          <p className="text-muted-foreground text-sm">AI-powered earnings call analysis for Indian markets</p>
          <div className="flex gap-2 mt-4">
            <Badge className="bg-emerald-muted text-emerald border border-emerald/30">
              {signalCounts.bullish} Bullish
            </Badge>
            <Badge className="bg-amber-muted text-amber border border-amber/30">
              {signalCounts.neutral} Neutral
            </Badge>
            <Badge className="bg-rose-muted text-rose border border-rose/30">
              {signalCounts.bearish} Bearish
            </Badge>
          </div>
        </div>

        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by company, symbol, or sector..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
          <div className="flex gap-1">
            {(["sentiment", "name", "recent"] as SortMode[]).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  sort === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {s === "recent" ? "Most Recent" : `By ${s}`}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg border border-border p-5 animate-pulse h-48" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No companies found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((a) => (
              <button
                key={a.id}
                onClick={() => navigate(`/company/${a.symbol}`)}
                className="bg-card/60 rounded-lg border border-border p-5 text-left hover:bg-card hover:scale-[1.02] hover:border-primary/40 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                      {a.symbol}
                    </div>
                    <div className="text-sm text-muted-foreground truncate max-w-[180px]">
                      {a.name}
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md border ${getSignalColor(a.investment_signal)}`}>
                    {getSignalLabel(a.investment_signal)}
                  </span>
                </div>

                {a.sector && (
                  <Badge variant="outline" className="text-xs mb-3 text-muted-foreground">
                    {a.sector}
                  </Badge>
                )}

                {/* Sentiment bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Sentiment</span>
                    <span className={getSentimentColor(a.sentiment_score)}>
                      {a.sentiment_score?.toFixed(2) ?? "N/A"}
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose via-amber to-emerald rounded-full transition-all"
                      style={{ width: `${getSentimentBarWidth(a.sentiment_score)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {getToneEmoji(a.mgmt_tone)} {a.mgmt_tone ?? "N/A"}
                  </span>
                  <span className="text-xs">{a.quarter}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
