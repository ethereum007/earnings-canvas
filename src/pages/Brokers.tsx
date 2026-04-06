import { useState, useMemo } from "react";
import DashboardNav from "@/components/DashboardNav";
import { BROKERS, TOTAL_ANALYSTS } from "@/lib/brokers-data";
import { Search, Users, Building2, ChevronDown, ChevronUp, Linkedin, Briefcase } from "lucide-react";

const Brokers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"analysts" | "name">("analysts");
  const [expandedBroker, setExpandedBroker] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = BROKERS.filter((b) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      // Search broker name or analyst names or companies
      return (
        b.name.toLowerCase().includes(q) ||
        b.analysts.some(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.companies.some((c) => c.toLowerCase().includes(q))
        )
      );
    });
    if (sortBy === "name") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      list = [...list].sort((a, b) => b.analysts.length - a.analysts.length);
    }
    return list;
  }, [searchQuery, sortBy]);

  const maxAnalysts = BROKERS[0]?.analysts.length ?? 1;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardNav />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Broker Directory</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Research brokerages, their analysts, and company coverage across Indian markets
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
              placeholder="Search brokerages, analysts, or companies..."
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
            filtered.map((broker) => {
              const barWidth = (broker.analysts.length / maxAnalysts) * 100;
              const rank = BROKERS.findIndex((b) => b.name === broker.name) + 1;
              const isExpanded = expandedBroker === broker.name;

              return (
                <div key={broker.name} className="rounded-xl border border-border overflow-hidden">
                  {/* Broker header row */}
                  <button
                    onClick={() => setExpandedBroker(isExpanded ? null : broker.name)}
                    className="relative w-full bg-card p-4 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group text-left"
                  >
                    {/* Background bar */}
                    <div
                      className="absolute inset-y-0 left-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"
                      style={{ width: `${barWidth}%` }}
                    />

                    <div className="relative flex items-center gap-4">
                      <div className="w-8 text-center">
                        <span className={`text-sm font-bold ${rank <= 3 ? "text-primary" : "text-muted-foreground/60"}`}>
                          {rank}
                        </span>
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                          {broker.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Click to view analysts & coverage
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Users className="w-4 h-4 text-muted-foreground/50" />
                        <span className="text-lg font-bold tabular-nums">{broker.analysts.length}</span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">analysts</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground ml-1" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground ml-1" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded analyst list */}
                  {isExpanded && (
                    <div className="border-t border-border bg-secondary/20 divide-y divide-border">
                      {broker.analysts.map((analyst, idx) => (
                        <div key={idx} className="px-4 py-3 sm:px-6">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{analyst.name}</span>
                                {analyst.linkedin && (
                                  <a
                                    href={analyst.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:text-primary/80"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Linkedin className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                              {analyst.title && (
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <Briefcase className="w-3 h-3 text-muted-foreground/50" />
                                  <span className="text-xs text-muted-foreground">{analyst.title}</span>
                                </div>
                              )}
                              {analyst.companies.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {analyst.companies.map((company, ci) => (
                                    <span
                                      key={ci}
                                      className="inline-block text-[11px] px-2 py-0.5 rounded-md bg-primary/5 border border-primary/10 text-muted-foreground"
                                    >
                                      {company}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="shrink-0 text-xs text-muted-foreground/50 tabular-nums">
                              {analyst.companies.length} cos
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
