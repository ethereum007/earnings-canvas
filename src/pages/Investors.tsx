import { useState, useMemo } from "react";
import DashboardNav from "@/components/DashboardNav";
import { INVESTORS, INVESTOR_COUNTRIES, INVESTOR_CITIES } from "@/lib/investors-data";
import { Search, MapPin, Building2, ChevronDown, Globe, Info } from "lucide-react";

const Investors = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return INVESTORS.filter((inv) => {
      if (countryFilter !== "All" && inv.country !== countryFilter) return false;
      if (cityFilter !== "All" && inv.city !== cityFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          inv.name.toLowerCase().includes(q) ||
          inv.city.toLowerCase().includes(q) ||
          inv.comments.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [searchQuery, countryFilter, cityFilter]);

  const withComments = INVESTORS.filter((i) => i.comments).length;
  const countries = new Set(INVESTORS.map((i) => i.country).filter(Boolean));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardNav />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Investor Directory</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Key institutional investor relationships across global markets
            </p>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-2.5 text-center">
              <div className="text-xl font-bold text-primary">{INVESTORS.length}</div>
              <div className="text-[11px] text-muted-foreground whitespace-nowrap">Total investors</div>
            </div>
            <div className="bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-center">
              <div className="text-xl font-bold">{countries.size}</div>
              <div className="text-[11px] text-muted-foreground whitespace-nowrap">Countries</div>
            </div>
            <div className="bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-center">
              <div className="text-xl font-bold">{withComments}</div>
              <div className="text-[11px] text-muted-foreground whitespace-nowrap">With profiles</div>
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
              placeholder="Search investors, cities, strategies..."
              className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <SelectFilter label="Country" value={countryFilter} options={INVESTOR_COUNTRIES} onChange={setCountryFilter} />
            <SelectFilter label="City" value={cityFilter} options={INVESTOR_CITIES} onChange={setCityFilter} />
          </div>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              No investors match your filters
            </div>
          ) : (
            filtered.map((inv, i) => (
              <div
                key={`${inv.name}-${i}`}
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer group"
                onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors">
                    {inv.name}
                  </h3>
                  {inv.comments && (
                    <Info className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />
                  )}
                </div>

                <div className="flex flex-col gap-1.5 text-xs text-muted-foreground mb-3">
                  {inv.city && inv.city !== "NA" && inv.city !== "N/A" && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                      <span>{inv.city}{inv.country ? `, ${inv.country}` : ""}</span>
                    </div>
                  )}
                  {inv.address && inv.address !== "Not Available" && inv.address !== "NA" && inv.address !== "N/A" && (
                    <div className="flex items-start gap-1.5">
                      <Building2 className="w-3 h-3 text-muted-foreground/40 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{inv.address}</span>
                    </div>
                  )}
                </div>

                {inv.comments && (
                  <p className={`text-xs text-muted-foreground/70 leading-relaxed ${expandedIdx === i ? "" : "line-clamp-2"}`}>
                    {inv.comments}
                  </p>
                )}

                {inv.country && inv.country !== "India" && (
                  <div className="mt-3 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-primary/60" />
                    <span className="text-[10px] text-primary/60 font-medium uppercase tracking-wider">{inv.country}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-5 text-xs text-muted-foreground/50 text-center">
          Showing {filtered.length} of {INVESTORS.length} investors
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
        <option value="All">All {label === "Country" ? "Countries" : "Cities"}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
    </div>
  );
}

export default Investors;
