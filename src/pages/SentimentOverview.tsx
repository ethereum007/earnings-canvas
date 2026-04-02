import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardNav from "@/components/DashboardNav";
import { getSignalColor, getSignalLabel, getSentimentColor, getToneEmoji } from "@/lib/signal-utils";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const SentimentOverview = () => {
  const { data: rankings, isLoading } = useQuery({
    queryKey: ["sentiment_rankings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sentiment_rankings")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const sectorAverages = useMemo(() => {
    if (!rankings) return [];
    const sectors: Record<string, { total: number; count: number }> = {};
    rankings.forEach((r) => {
      const s = r.sector ?? "Unknown";
      if (!sectors[s]) sectors[s] = { total: 0, count: 0 };
      sectors[s].total += r.sentiment_score ?? 0;
      sectors[s].count++;
    });
    return Object.entries(sectors)
      .map(([sector, { total, count }]) => ({ sector, avg: total / count, count }))
      .sort((a, b) => b.avg - a.avg);
  }, [rankings]);

  const getRowBg = (score: number | null) => {
    if (score === null) return "";
    if (score >= 0.3) return "bg-emerald/5";
    if (score >= -0.3) return "bg-amber/5";
    return "bg-rose/5";
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Sentiment Rankings</h1>
          <p className="text-sm text-muted-foreground">Companies ranked by AI-analyzed earnings call sentiment</p>
        </div>

        {/* Sector Averages */}
        {sectorAverages.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 text-foreground">Average Sentiment by Sector</h2>
            <div className="flex flex-wrap gap-3">
              {sectorAverages.map((s) => (
                <div key={s.sector} className="bg-card/60 rounded-lg border border-border px-4 py-3">
                  <div className="text-xs text-muted-foreground">{s.sector}</div>
                  <div className={`text-lg font-bold ${getSentimentColor(s.avg)}`}>{s.avg.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">{s.count} {s.count === 1 ? "company" : "companies"}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rankings Table */}
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 bg-card rounded" />
            ))}
          </div>
        ) : (
          <div className="bg-card/60 rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">#</TableHead>
                  <TableHead className="text-muted-foreground">Symbol</TableHead>
                  <TableHead className="text-muted-foreground">Name</TableHead>
                  <TableHead className="text-muted-foreground">Sector</TableHead>
                  <TableHead className="text-muted-foreground">Quarter</TableHead>
                  <TableHead className="text-muted-foreground">Signal</TableHead>
                  <TableHead className="text-muted-foreground text-right">Sentiment</TableHead>
                  <TableHead className="text-muted-foreground">Tone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankings?.map((r, i) => (
                  <TableRow key={`${r.symbol}-${r.quarter}`} className={`border-border ${getRowBg(r.sentiment_score)}`}>
                    <TableCell className="font-mono text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-bold text-foreground">{r.symbol}</TableCell>
                    <TableCell className="text-muted-foreground">{r.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs text-muted-foreground">{r.sector}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{r.quarter}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-md border ${getSignalColor(r.investment_signal)}`}>
                        {getSignalLabel(r.investment_signal)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-mono font-bold ${getSentimentColor(r.sentiment_score)}`}>
                        {r.sentiment_score?.toFixed(2) ?? "N/A"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {getToneEmoji(r.mgmt_tone)} {r.mgmt_tone}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
};

export default SentimentOverview;
