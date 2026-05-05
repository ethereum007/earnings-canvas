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
];

const QuarterTabs = () => {
  const [active, setActive] = useState(TABS[0].quarter);

  return (
    <section className="bg-background border-b border-border py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-8 pb-6 border-b border-border">
          <span className="inline-block text-[10px] font-mono uppercase tracking-[0.22em] px-2.5 py-1 rounded-full border border-emerald-500/30 text-emerald-500 bg-emerald-500/10">
            Earnings Season Live
          </span>
          <h1 className="mt-4 text-3xl lg:text-4xl font-semibold tracking-tight text-foreground leading-[1.05]">
            India earnings intelligence,{" "}
            <span className="text-emerald-500">
              built for institutional eyes.
            </span>
          </h1>
          <p className="mt-3 text-sm lg:text-base text-foreground/85 leading-relaxed max-w-2xl font-medium">
            Same-day institutional-grade synthesis for every Indian listed
            company. Pick a quarter to browse covered names, then click any
            sector to filter.
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex items-center gap-2 mb-8">
          {TABS.map((t) => {
            const isActive = active === t.quarter;
            return (
              <button
                key={t.quarter}
                onClick={() => setActive(t.quarter)}
                className={[
                  "px-4 py-2 rounded-md text-sm font-medium transition-all",
                  "flex items-center gap-2 border",
                  isActive
                    ? "bg-foreground text-background border-foreground"
                    : "text-muted-foreground hover:text-foreground border-border hover:border-muted-foreground bg-transparent",
                ].join(" ")}
              >
                {t.label}
                {t.badge && (
                  <span
                    className={[
                      "text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded",
                      isActive
                        ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                        : "bg-emerald-500/15 text-emerald-500",
                    ].join(" ")}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <CoverageGrid quarter={active} />
      </div>
    </section>
  );
};

export default QuarterTabs;
