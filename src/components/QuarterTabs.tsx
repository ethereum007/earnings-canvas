import { useState } from "react";
import CoverageGrid from "./CoverageGrid";

interface Tab {
  label: string;
  quarter: string;
  badge?: string;
}

const TABS: Tab[] = [
  { label: "Q4 FY26", quarter: "Q4 FY2026", badge: "Live" },
  { label: "Q3 FY26", quarter: "Q3 FY2026" },
  { label: "Q2 FY26", quarter: "Q2 FY2026" },
  { label: "Q1 FY26", quarter: "Q1 FY2026" },
];

const QuarterTabs = () => {
  const [active, setActive] = useState(TABS[0].quarter);

  return (
    <section className="bg-zinc-950 border-b border-white/5 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-8 pb-6 border-b border-white/5">
          <span className="inline-block text-[10px] font-mono uppercase tracking-[0.22em] px-2.5 py-1 rounded-full border border-emerald-400/30 text-emerald-400 bg-emerald-400/10">
            Earnings Season Live
          </span>
          <h1 className="mt-4 text-3xl lg:text-4xl font-medium tracking-tight text-white leading-[1.05]">
            India earnings intelligence,{" "}
            <span className="text-emerald-400">
              built for institutional eyes.
            </span>
          </h1>
          <p className="mt-3 text-sm lg:text-base text-zinc-400 leading-relaxed max-w-2xl">
            Same-day institutional-grade synthesis for every Indian listed
            company. Pick a quarter to browse covered names.
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto -mx-1 px-1">
          {TABS.map((t) => {
            const isActive = active === t.quarter;
            return (
              <button
                key={t.quarter}
                onClick={() => setActive(t.quarter)}
                className={[
                  "flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-all",
                  "flex items-center gap-2 border",
                  isActive
                    ? "bg-white text-zinc-950 border-white"
                    : "text-zinc-400 hover:text-white border-white/10 hover:border-white/20 bg-transparent",
                ].join(" ")}
              >
                {t.label}
                {t.badge && (
                  <span
                    className={[
                      "text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded",
                      isActive
                        ? "bg-emerald-400/20 text-emerald-700"
                        : "bg-emerald-400/15 text-emerald-400",
                    ].join(" ")}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active grid */}
        <CoverageGrid quarter={active} />
      </div>
    </section>
  );
};

export default QuarterTabs;
