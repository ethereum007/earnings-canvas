import { useState } from "react";
import DashboardNav from "@/components/DashboardNav";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

const SIGNALS = [
  {
    id: 1,
    sector: "Defence Electronics",
    signal: "DAP 2026 — 'Owned by India' shift raises indigenous content bar to 60%. ₹1.11L Cr domestic procurement earmarked FY25-26. Buy (Indian) route eliminated — only IDDM qualifies.",
    stage: "Committee → Gazette H2 2026",
    stageCode: "committee" as const,
    source: "Ministry of Defence Draft DAP 2026",
    sourceUrl: "https://www.mod.gov.in",
    catalystDate: "H2 2026",
    stocks: [
      { ticker: "MTAR", name: "MTAR Technologies", thesis: "Precision defence components, IDDM certified", earningsDate: "May 2026", confirmed: null },
      { ticker: "DATAPATTNS", name: "Data Patterns", thesis: "Radar & EW subsystems, 5th PIL beneficiary", earningsDate: "May 2026", confirmed: null },
      { ticker: "CENTUM", name: "Centum Electronics", thesis: "Defence electronics modules, export grade", earningsDate: "May 2026", confirmed: null },
      { ticker: "ASTRAMICRO", name: "Astra Microwave", thesis: "Microwave components for EW, radar — direct PIL play", earningsDate: "May 2026", confirmed: "partial" as const },
    ],
  },
  {
    id: 2,
    sector: "Water / ZLD",
    signal: "Liquid Waste Management Rules (effective Oct 2025) mandate 20% wastewater reuse by 2027-28, rising to 50% by 2030-31 for all bulk consumers. UP just approved its own Safe Reuse Policy targeting 100% reuse by 2032.",
    stage: "Gazette Notified — Enforcement Live",
    stageCode: "gazette" as const,
    source: "MoEFCC Gazette Oct 2024",
    sourceUrl: "https://moef.gov.in",
    catalystDate: "FY2027-28 compliance deadline",
    stocks: [
      { ticker: "WABAG", name: "VA Tech Wabag", thesis: "Pure-play wastewater treatment EPC — only listed co at scale", earningsDate: "May 2026", confirmed: "yes" as const },
      { ticker: "IONEXCHANG", name: "Ion Exchange India", thesis: "ZLD systems, industrial water treatment — order book growing", earningsDate: "May 2026", confirmed: "partial" as const },
      { ticker: "THERMAX", name: "Thermax", thesis: "ZLD + wastewater recycling division, large cap but direct beneficiary", earningsDate: "May 2026", confirmed: null },
    ],
  },
  {
    id: 3,
    sector: "Electronics Components",
    signal: "ECMS PLI ₹22,919 Cr approved Mar 2025. 22 proposals covering PCB, camera modules, connectors. Upstream supply chain for mobile/laptop PLI — disbursals begin FY26-27.",
    stage: "PLI Approved — Capex Cycle Beginning",
    stageCode: "early" as const,
    source: "MeitY ECMS PLI Jan 2026",
    sourceUrl: "https://www.meity.gov.in",
    catalystDate: "FY2026-27 first disbursals",
    stocks: [
      { ticker: "KAYNES", name: "Kaynes Technology", thesis: "PCB + IoT modules, PLI beneficiary, capex done", earningsDate: "May 2026", confirmed: "partial" as const },
      { ticker: "SYRMA", name: "Syrma SGS", thesis: "EMS + PCB assembly, ECMS PLI applicant", earningsDate: "May 2026", confirmed: null },
      { ticker: "AVALON", name: "Avalon Technologies", thesis: "High-mix PCB for defence + EV — dual policy play", earningsDate: "May 2026", confirmed: null },
    ],
  },
  {
    id: 4,
    sector: "Medical Devices",
    signal: "Medical Devices PLI concludes FY2026-27. Companies with FDA/CE approvals will re-rate as export manufacturers post-incentive. Window to identify these before the narrative shifts is now.",
    stage: "PLI Wind-Down → Export Phase",
    stageCode: "transition" as const,
    source: "Dept of Pharmaceuticals PLI",
    sourceUrl: "https://pharma-dept.gov.in",
    catalystDate: "FY2026-27 PLI conclusion",
    stocks: [
      { ticker: "POLYMED", name: "Poly Medicure", thesis: "Export-grade medical devices, FDA approved, 60%+ revenue from exports", earningsDate: "May 2026", confirmed: "yes" as const },
      { ticker: "HINDUSYRINGES", name: "Hindustan Syringes", thesis: "Largest syringe maker, PLI + sustained export demand", earningsDate: "May 2026", confirmed: null },
    ],
  },
  {
    id: 5,
    sector: "Recycling / ESG",
    signal: "Plastic Waste Management Rules — phased recycled content targets 2025-29. rPET mandate for F&B packaging by Mar 2026. GANECOS was the first mover; next wave of beneficiaries remains under-owned.",
    stage: "Gazette Notified — Phased Implementation",
    stageCode: "gazette" as const,
    source: "MoEFCC Plastic Waste Rules 2024",
    sourceUrl: "https://moef.gov.in",
    catalystDate: "Mar 2026 first compliance milestone",
    stocks: [
      { ticker: "UFLEX", name: "Uflex", thesis: "Flexible packaging + rPET films, direct mandate beneficiary", earningsDate: "Aug 2026", confirmed: null },
      { ticker: "GANECOS", name: "Ganesha Ecosphere", thesis: "rPET bottle-to-bottle, FDA/EFSA/FSSAI certified — original signal", earningsDate: "Aug 2026", confirmed: "partial" as const },
    ],
  },
  {
    id: 6,
    sector: "Nuclear Energy",
    signal: "SHAPE India Act (Dec 2025) opens atomic energy to private players for the first time since 1962. ₹20,000 Cr SMR mission launched. US nuclear reactors to be built in India with local manufacturing and possible tech transfer.",
    stage: "Act Passed — Licensing Framework Being Drafted",
    stageCode: "gazette" as const,
    source: "SHAPE India Bill 2025 — PRS India",
    sourceUrl: "https://prsindia.org/billtrack/the-sustainable-harnessing-and-advancementof-nuclear-energy-for-transforming-india-bill-2025",
    catalystDate: "Private licensing rules expected FY2026-27",
    isNew: true,
    stocks: [
      { ticker: "LT", name: "Larsen & Toubro", thesis: "Heavy engineering for nuclear vessels, pressure vessels — already NPCIL vendor", earningsDate: "May 2026", confirmed: null },
      { ticker: "BHEL", name: "BHEL", thesis: "Nuclear turbines, steam generators — core NPCIL supplier for decades", earningsDate: "May 2026", confirmed: null },
      { ticker: "WALCHANNAG", name: "Walchandnagar Industries", thesis: "Nuclear-grade forging and pressure vessels, niche monopoly player", earningsDate: "Aug 2026", confirmed: null },
      { ticker: "GODREJIND", name: "Godrej Industries", thesis: "Godrej & Boyce makes nuclear-grade components — re-rating candidate", earningsDate: "May 2026", confirmed: null },
    ],
  },
  {
    id: 7,
    sector: "Insurance / BFSI",
    signal: "100% FDI in insurance passed Dec 2025. Combined with Bima Trinity (Vistaar, Vaahak, Sugam), this restructures distribution and capital architecture of entire sector. Foreign capital inflows = valuation re-rating for listed Indian insurers + brokers become acquisition targets.",
    stage: "Act Passed — FDI Rules Being Notified",
    stageCode: "gazette" as const,
    source: "Insurance Amendment Act 2025 — PRS India",
    sourceUrl: "https://prsindia.org/",
    catalystDate: "FDI notification + Bima Vistaar rollout FY2026",
    isNew: true,
    stocks: [
      { ticker: "PBFINTECH", name: "PB Fintech (Policybazaar)", thesis: "Largest insurance aggregator — distribution moat deepens with Bima Sugam", earningsDate: "May 2026", confirmed: "partial" as const },
      { ticker: "STARHEALTH", name: "Star Health Insurance", thesis: "Listed standalone health insurer — acquisition target or FDI beneficiary", earningsDate: "May 2026", confirmed: null },
      { ticker: "GODIGIT", name: "Go Digit", thesis: "Tech-first insurer, FDI-ready architecture, growth-stage beneficiary", earningsDate: "May 2026", confirmed: null },
      { ticker: "CDSL", name: "CDSL", thesis: "Bima Sugam digital insurance infra — CDSL is the proposed backbone", earningsDate: "May 2026", confirmed: null },
    ],
  },
  {
    id: 8,
    sector: "Capital Markets",
    signal: "Securities Markets Code 2025 being examined by Joint Parliamentary Committee with SEBI ex-chairman testimony. Consolidates SEBI Act, Depositories Act, Securities Contracts Act into one code — biggest structural change to Indian capital markets in 25 years.",
    stage: "Committee Examining — Earliest Signal",
    stageCode: "committee" as const,
    source: "PRS India — Securities Markets Code JPC",
    sourceUrl: "https://prsindia.org/parliament-committees",
    catalystDate: "Committee report expected mid-2026",
    isNew: true,
    stocks: [
      { ticker: "BSE", name: "BSE Ltd", thesis: "Exchange infrastructure — new asset classes, participant categories from new code", earningsDate: "May 2026", confirmed: null },
      { ticker: "CDSL", name: "CDSL", thesis: "Depository infrastructure — settlement reforms and new securities types directly benefit", earningsDate: "May 2026", confirmed: null },
      { ticker: "CAMSINFO", name: "CAMS", thesis: "Registrar/transfer agent — new fund categories and products from code restructure", earningsDate: "May 2026", confirmed: null },
    ],
  },
];

type StageCode = "committee" | "gazette" | "early" | "transition";

const STAGE_CONFIG: Record<StageCode, { label: string; colorClass: string; bgClass: string }> = {
  committee:  { label: "Committee examining", colorClass: "text-yellow-500", bgClass: "bg-yellow-500/10 border-yellow-500/20" },
  gazette:    { label: "Gazette / Act passed", colorClass: "text-emerald-500", bgClass: "bg-emerald-500/10 border-emerald-500/20" },
  early:      { label: "PLI approved",        colorClass: "text-indigo-400", bgClass: "bg-indigo-500/10 border-indigo-500/20" },
  transition: { label: "Transition phase",    colorClass: "text-purple-400", bgClass: "bg-purple-500/10 border-purple-500/20" },
};

const CONFIRM_CONFIG: Record<string, { label: string; dotClass: string; badgeClass: string }> = {
  yes:     { label: "Confirmed", dotClass: "bg-emerald-500", badgeClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  partial: { label: "Partial",   dotClass: "bg-yellow-500", badgeClass: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" },
  null:    { label: "Watching",  dotClass: "bg-muted-foreground/30", badgeClass: "text-muted-foreground bg-muted/50 border-border" },
};

function getConfirmationHints(stageCode: StageCode): string[] {
  const hints: Record<StageCode, string[]> = {
    gazette: [
      "Mgmt citing new order enquiries from compliance-driven buyers",
      "Capacity utilisation crossing 70%+",
      "Revenue from mandated segment broken out or growing",
      "New long-term supply agreements signed",
    ],
    committee: [
      "Mgmt awareness of incoming regulation in concall",
      "Capex plans aligned to anticipated demand",
      "Any government pre-qualification or empanelment",
      "Committee recommendations favourable to sector",
    ],
    early: [
      "PLI disbursals received, reflected in other income",
      "Capacity additions commencing as guided",
      "Order book growth from PLI-linked customers",
      "Export revenue beginning to scale",
    ],
    transition: [
      "Export revenue as % of total crossing 50%+",
      "FDA / CE approvals obtained or applied for",
      "Margin stability post-PLI wind-down",
      "New markets not dependent on incentives",
    ],
  };
  return hints[stageCode] || hints["gazette"];
}

const FLOW_STEPS = ["Policy signal spotted", "Thesis built", "Stock enters radar", "Quarterly earnings drop", "Confirmed or killed"];

const PolicyAlpha = () => {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filterSector, setFilterSector] = useState("All");
  const [showNewOnly, setShowNewOnly] = useState(false);

  const sectors = ["All", ...Array.from(new Set(SIGNALS.map((s) => s.sector)))];
  const filtered = SIGNALS.filter((s) => {
    const sectorOk = filterSector === "All" || s.sector === filterSector;
    const newOk = !showNewOnly || s.isNew;
    return sectorOk && newOk;
  });

  const totalStocks = SIGNALS.reduce((a, s) => a + s.stocks.length, 0);
  const confirmedCount = SIGNALS.reduce((a, s) => a + s.stocks.filter((st) => st.confirmed === "yes").length, 0);
  const partialCount = SIGNALS.reduce((a, s) => a + s.stocks.filter((st) => st.confirmed === "partial").length, 0);
  const newCount = SIGNALS.filter((s) => s.isNew).length;

  const stats = [
    { num: SIGNALS.length, label: "Active signals" },
    { num: totalStocks, label: "Stocks tracked" },
    { num: confirmedCount, label: "Earnings confirmed", highlight: "text-emerald-500" },
    { num: partialCount, label: "Partial confirm", highlight: "text-yellow-500" },
    { num: newCount, label: "New this scan", highlight: "text-primary" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardNav />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Policy Alpha</h1>
            <p className="text-sm text-muted-foreground mt-1">Regulatory signals → stock thesis → earnings confirmation</p>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            {stats.map((s) => (
              <div key={s.label} className="bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                <div className={`text-xl font-bold ${s.highlight || "text-foreground"}`}>{s.num}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 whitespace-nowrap">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Flow strip */}
        <div className="flex items-center gap-0 mb-7 bg-secondary/30 border border-border rounded-xl px-5 py-3.5 overflow-x-auto">
          {FLOW_STEPS.map((step, i) => (
            <div key={i} className="flex items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-[22px] h-[22px] rounded-full bg-secondary border border-border flex items-center justify-center text-[10px] text-muted-foreground font-bold">
                  {i + 1}
                </div>
                <span className={`text-xs ${i === 3 ? "text-primary font-semibold" : "text-muted-foreground"}`}>{step}</span>
              </div>
              {i < FLOW_STEPS.length - 1 && <span className="text-border mx-3 text-sm">→</span>}
            </div>
          ))}
        </div>

        {/* Sector filters */}
        <div className="flex gap-1.5 mb-6 flex-wrap items-center">
          <div className="flex gap-1.5 flex-wrap flex-1">
            {sectors.map((s) => (
              <button
                key={s}
                onClick={() => setFilterSector(s)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  filterSector === s
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowNewOnly(!showNewOnly)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap shrink-0 ${
              showNewOnly
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500 font-semibold"
                : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground"
            }`}
          >
            ✦ New signals only
          </button>
        </div>

        {/* Signal cards */}
        <div className="flex flex-col gap-3.5">
          {filtered.map((signal) => {
            const stageConf = STAGE_CONFIG[signal.stageCode];
            const isOpen = expanded === signal.id;

            return (
              <div
                key={signal.id}
                className={`bg-card border rounded-xl overflow-hidden transition-all ${
                  isOpen ? "border-primary/30 shadow-lg shadow-primary/5" : signal.isNew ? "border-emerald-500/25" : "border-border"
                }`}
              >
                {/* Header */}
                <div
                  onClick={() => setExpanded(isOpen ? null : signal.id)}
                  className="px-6 py-5 cursor-pointer flex items-start justify-between gap-4 hover:bg-secondary/20 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
                      <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">{signal.sector}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${stageConf.colorClass} ${stageConf.bgClass}`}>
                        {stageConf.label}
                      </span>
                      {signal.isNew && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 tracking-wide">
                          ✦ NEW
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">{signal.signal}</p>
                    <div className="flex items-center gap-5 flex-wrap text-[11px]">
                      <div className="flex gap-1.5">
                        <span className="text-muted-foreground/60">Source:</span>
                        <a href={signal.sourceUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-primary hover:underline flex items-center gap-1">
                          {signal.source} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="flex gap-1.5">
                        <span className="text-muted-foreground/60">Catalyst:</span>
                        <span className="text-muted-foreground font-medium">{signal.catalystDate}</span>
                      </div>
                      <div className="flex gap-1.5">
                        <span className="text-muted-foreground/60">Stocks:</span>
                        <span className="text-muted-foreground font-medium">{signal.stocks.length} tracked</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2.5 shrink-0">
                    <div className="flex gap-1.5 items-center">
                      {signal.stocks.map((st) => {
                        const c = CONFIRM_CONFIG[String(st.confirmed)] || CONFIRM_CONFIG["null"];
                        return (
                          <div
                            key={st.ticker}
                            title={`${st.ticker}: ${c.label}`}
                            className={`w-2.5 h-2.5 rounded-full ${st.confirmed ? c.dotClass : "border-2 border-muted-foreground/30"}`}
                          />
                        );
                      })}
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                {/* Expanded content */}
                {isOpen && (
                  <div className="border-t border-border">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-secondary/30">
                            {["Ticker", "Company", "Thesis", "Next earnings", "Confirmation"].map((h) => (
                              <th key={h} className="text-left px-5 py-2.5 text-[11px] text-muted-foreground/60 font-semibold tracking-wider uppercase border-b border-border whitespace-nowrap">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {signal.stocks.map((stock, i) => {
                            const conf = CONFIRM_CONFIG[String(stock.confirmed)] || CONFIRM_CONFIG["null"];
                            return (
                              <tr key={stock.ticker} className={`hover:bg-secondary/20 transition-colors ${i < signal.stocks.length - 1 ? "border-b border-border/50" : ""}`}>
                                <td className="px-5 py-3.5">
                                  <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">{stock.ticker}</span>
                                </td>
                                <td className="px-5 py-3.5 font-medium whitespace-nowrap">{stock.name}</td>
                                <td className="px-5 py-3.5 text-muted-foreground max-w-[300px] leading-relaxed">{stock.thesis}</td>
                                <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap text-xs">{stock.earningsDate}</td>
                                <td className="px-5 py-3.5">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${conf.badgeClass}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${conf.dotClass} shrink-0`} />
                                    {conf.label}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Confirmation hints */}
                    <div className="mx-5 mb-5 p-4 bg-secondary/20 border border-border rounded-xl">
                      <div className="text-[11px] text-muted-foreground/60 font-semibold mb-2.5 uppercase tracking-wider">
                        What to look for in next earnings call
                      </div>
                      <div className="flex gap-5 flex-wrap">
                        {getConfirmationHints(signal.stageCode).map((hint, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground max-w-[240px]">
                            <span className="text-primary shrink-0 mt-0.5 font-bold">→</span>
                            <span className="leading-relaxed">{hint}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-5 mt-5 items-center flex-wrap">
          <span className="text-[11px] text-muted-foreground/60 font-semibold uppercase tracking-wider">Legend:</span>
          {[
            { dotClass: "bg-emerald-500", label: "Confirmed in earnings" },
            { dotClass: "bg-yellow-500", label: "Partial — mgmt commentary" },
            { dotClass: "border-2 border-muted-foreground/30", label: "Watching — next quarter" },
          ].map((d) => (
            <div key={d.label} className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${d.dotClass} shrink-0`} />
              <span className="text-xs text-muted-foreground">{d.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-emerald-500 font-bold">✦ NEW</span>
            <span className="text-xs text-muted-foreground">Added from PRS scan</span>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-4 p-4 bg-secondary/20 border border-border rounded-xl flex items-start gap-2.5">
          <span className="text-primary text-sm shrink-0 mt-0.5">ℹ</span>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="font-semibold text-foreground/80">Confirmation logic: </strong>
            "Watching" → "Partial" when mgmt explicitly references the policy tailwind or capacity utilisation crosses 70%+. "Partial" → "Confirmed" when revenue from the mandated segment shows measurable growth in reported financials. Signals reviewed quarterly post earnings. Source: PRS India monthly scans + Ministry gazettes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PolicyAlpha;
