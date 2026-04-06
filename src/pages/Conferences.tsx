import { useState, useMemo } from "react";
import DashboardNav from "@/components/DashboardNav";
import { CONFERENCES, BROKERS, CITIES, GEOGRAPHIES } from "@/lib/conferences-data";
import { Calendar, MapPin, Building2, Search, ChevronDown } from "lucide-react";

function parseDate(dateStr: string): Date {
  const months: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  const parts = dateStr.split(" ");
  if (parts.length !== 3) return new Date(0);
  return new Date(parseInt(parts[2]), months[parts[1]] || 0, parseInt(parts[0]));
}

function getStatus(startDate: string, finishDate: string): "upcoming" | "ongoing" | "past" {
  const now = new Date();
  const start = parseDate(startDate);
  const end = parseDate(finishDate);
  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "ongoing";
  return "past";
}

const statusConfig = {
  upcoming: { label: "Upcoming", className: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  ongoing: { label: "Live Now", className: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" },
  past: { label: "Past", className: "text-muted-foreground bg-muted/50 border-border" },
};

const Conferences = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [brokerFilter, setBrokerFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");
  const [geoFilter, setGeoFilter] = useState("All");
  const [showPast, setShowPast] = useState(false);

  const filtered = useMemo(() => {
    return CONFERENCES.filter((c) => {
      const status = getStatus(c.startDate, c.finishDate);
      if (!showPast && status === "past") return false;
      if (brokerFilter !== "All" && c.broker !== brokerFilter) return false;
      if (cityFilter !== "All" && c.city !== cityFilter) return false;
      if (geoFilter !== "All" && c.geography !== geoFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.broker.toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
      }
      return true;
    });
  }, [searchQuery, brokerFilter, cityFilter, geoFilter, showPast]);

  const upcomingCount = CONFERENCES.filter((c) => getStatus(c.startDate, c.finishDate) === "upcoming").length;
  const ongoingCount = CONFERENCES.filter((c) => getStatus(c.startDate, c.finishDate) === "ongoing").length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardNav />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Conferences</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Broker investor conferences across India & global markets
            </p>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            {ongoingCount > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-2.5 text-center">
                <div className="text-xl font-bold text-yellow-500">{ongoingCount}</div>
                <div className="text-[11px] text-muted-foreground whitespace-nowrap">Live now</div>
              </div>
            )}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 text-center">
              <div className="text-xl font-bold text-emerald-500">{upcomingCount}</div>
              <div className="text-[11px] text-muted-foreground whitespace-nowrap">Upcoming</div>
            </div>
            <div className="bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-center">
              <div className="text-xl font-bold">{CONFERENCES.length}</div>
              <div className="text-[11px] text-muted-foreground whitespace-nowrap">Total tracked</div>
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
              placeholder="Search conferences, brokers..."
              className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <SelectFilter label="Broker" value={brokerFilter} options={BROKERS} onChange={setBrokerFilter} />
            <SelectFilter label="City" value={cityFilter} options={CITIES} onChange={setCityFilter} />
            <SelectFilter label="Region" value={geoFilter} options={GEOGRAPHIES} onChange={setGeoFilter} />
            <button
              onClick={() => setShowPast(!showPast)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                showPast
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              {showPast ? "Hide past" : "Show past"}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/30">
                  {["Event", "Broker", "Dates", "City", "Status"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] text-muted-foreground/60 font-semibold tracking-wider uppercase border-b border-border whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                      No conferences match your filters
                    </td>
                  </tr>
                ) : (
                  filtered.map((conf, i) => {
                    const status = getStatus(conf.startDate, conf.finishDate);
                    const sc = statusConfig[status];
                    return (
                      <tr
                        key={`${conf.name}-${conf.startDate}-${i}`}
                        className={`hover:bg-secondary/20 transition-colors ${i < filtered.length - 1 ? "border-b border-border/50" : ""}`}
                      >
                        <td className="px-5 py-3.5 max-w-[350px]">
                          <div className="font-medium leading-snug">{conf.name}</div>
                          {conf.contact && (
                            <div className="text-[11px] text-muted-foreground/60 mt-0.5">Contact: {conf.contact}</div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                            <span className="text-muted-foreground">{conf.broker || "—"}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                            <span className="text-muted-foreground text-xs">
                              {conf.startDate === conf.finishDate ? conf.startDate : `${conf.startDate} — ${conf.finishDate}`}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                            <span className="text-muted-foreground text-xs">
                              {conf.city ? `${conf.city}, ${conf.geography}` : conf.geography}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${sc.className}`}>
                            {status === "ongoing" && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1.5 animate-pulse" />}
                            {sc.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-border text-xs text-muted-foreground/60">
            Showing {filtered.length} of {CONFERENCES.length} conferences · Source: Churchgate Partners IR Toolkit
          </div>
        </div>
      </div>
    </div>
  );
};

function SelectFilter({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 bg-secondary/30 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
      >
        <option value="All">All {label}s</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
    </div>
  );
}

export default Conferences;
