import { useState, useMemo } from "react";
import DashboardNav from "@/components/DashboardNav";
import { BROKERS, TOTAL_ANALYSTS } from "@/lib/brokers-data";
import { Search, Users, Building2, TrendingUp } from "lucide-react";

const Brokers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"analysts" | "name">("analysts");

  const filtered = useMemo(() => {
    let list = BROKERS.filter((b) => {
      if (!searchQuery) return true;
      return b.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
    if (sortBy === "name") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      list = [...list].sort((a, b) => b.analysts - a.analysts);
    }
    return list;
  }, [searchQuery, sortBy]);

  const maxAnalysts = BROKERS[0]?.analysts ?? 1;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardNav />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Broker Directory</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Research brokerages and their analyst coverage across Indian markets
            </p>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-2.5 text-center">
              <div className="text-xl font-bold text-primary">{BROKERS.length}</div>
              <div className="text-[11px] text-muted-foreground whitespace-nowrap">Brokerages</div>
            </div>
            <div className="bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-center">
              <div className="text-xl font-bold">{TOTAL_ANALYSTS.toLocaleString()}</div>
              <div className="text-[11px] text-muted-foreground whitespace-nowrap">Total analysts</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search brokerages..."
              className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy("analysts")}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                sortBy === "analysts"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/30 border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              By Team Size
            </button>
            <button
              onClick={() => setSortBy("name")}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                sortBy === "name"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/30 border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              A–Z
            </button>
          </div>
        </div>

        {/* Broker List */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              No brokerages match your search
            </div>
          ) : (
            filtered.map((broker, i) => {
              const barWidth = (broker.analysts / maxAnalysts) * 100;
              const rank = BROKERS.findIndex((b) => b.name === broker.name) + 1;
              return (
                <div
                  key={broker.name}
                  className="relative bg-card border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group overflow-hidden"
                >
                  {/* Background bar */}
                  <div
                    className="absolute inset-y-0 left-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"
                    style={{ width: `${barWidth}%` }}
                  />

                  <div className="relative flex items-center gap-4">
                    {/* Rank */}
                    <div className="w-8 text-center">
                      <span className={`text-sm font-bold ${rank <= 3 ? "text-primary" : "text-muted-foreground/60"}`}>
                        {rank}
                      </span>
                    </div>

                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                        {broker.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Research Brokerage
                      </p>
                    </div>

                    {/* Analyst count */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Users className="w-4 h-4 text-muted-foreground/50" />
                      <span className="text-lg font-bold tabular-nums">{broker.analysts}</span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">analysts</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-5 text-xs text-muted-foreground/50 text-center">
          Showing {filtered.length} of {BROKERS.length} brokerages
        </div>
      </div>
    </div>
  );
};

export default Brokers;
