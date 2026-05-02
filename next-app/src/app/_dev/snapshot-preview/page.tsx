import { notFound } from "next/navigation";
import SnapshotCard from "@/components/earnings/SnapshotCard";
import VerdictTag from "@/components/earnings/VerdictTag";
import type { SnapshotData, LayerVerdict } from "@/types/earnings";

// Dev-only QA page. 404s in production.
export const dynamic = "force-dynamic";

const FIXTURES: SnapshotData[] = [
  // 1. POSITIVE — TCS-like
  {
    symbol: "TCS",
    company: "Tata Consultancy Services",
    sector: "IT Services",
    market_cap: "Large Cap",
    quarter: "Q4 FY2026",
    result_date: "2026-04-09",
    headline_verdict: "BEAT",
    headline_verdict_basis: "OPERATIONAL",
    guidance_verdict: "MAINTAINED",
    estimate_revision_direction: "UP",
    estimate_revision_magnitude: "2_TO_5",
    estimate_revision_metric: "FY27 EPS",
    stock_reaction_pct: 2.4,
    stock_reaction_vs_index_pct: 1.8,
    stock_reaction_index_name: "Nifty IT",
    three_things_that_mattered: [
      "BFSI vertical sequential growth turned positive after 4 quarters",
      "Margin walk: 90 bps tailwind from utilisation, no wage hike yet",
      "TCV at 5-year high — book-to-bill 1.4x signals visibility",
    ],
    position_bias: "ADD",
    conviction: "MEDIUM",
    next_catalyst_date: "2026-07-10",
    next_catalyst_event: "Q1 FY27 results — first full quarter of new wage cycle",
    rollup_verdict: "POSITIVE",
    rollup_verdict_oneliner:
      "BFSI inflection + TCV strength make this a credible re-rate setup",
  },
  // 2. NEUTRAL — HDFC Bank-like
  {
    symbol: "HDFCBANK",
    company: "HDFC Bank Ltd",
    sector: "Banking",
    market_cap: "Large Cap",
    quarter: "Q4 FY2026",
    result_date: "2026-04-19",
    headline_verdict: "IN LINE",
    headline_verdict_basis: "OPERATIONAL",
    guidance_verdict: "MAINTAINED",
    estimate_revision_direction: "FLAT",
    estimate_revision_magnitude: "LT_2",
    estimate_revision_metric: "FY27 EPS",
    stock_reaction_pct: 0.6,
    stock_reaction_vs_index_pct: -0.3,
    stock_reaction_index_name: "Bank Nifty",
    three_things_that_mattered: [
      "NIM held at 3.46% despite deposit cost pressure",
      "Loan growth 12.3% — tracking ahead of system, retail-led",
      "Slippages contained at 1.18%, retail unsecured stable",
    ],
    position_bias: "HOLD",
    conviction: "HIGH",
    next_catalyst_date: "2026-08-15",
    next_catalyst_event: "CD ratio normalisation milestone + RBI rate path",
    rollup_verdict: "NEUTRAL",
    rollup_verdict_oneliner:
      "Quality compounder, no surprises — wait for valuation entry",
  },
  // 3. NEGATIVE — fictional MISS scenario
  {
    symbol: "EXAMPLE",
    company: "Example Industries Ltd",
    sector: "Industrial",
    market_cap: "Mid Cap",
    quarter: "Q4 FY2026",
    result_date: "2026-04-30",
    headline_verdict: "MISS",
    headline_verdict_basis: "REPORTED",
    guidance_verdict: "CUT",
    estimate_revision_direction: "DOWN",
    estimate_revision_magnitude: "GT_5",
    estimate_revision_metric: "FY27 EPS",
    stock_reaction_pct: -8.2,
    stock_reaction_vs_index_pct: -7.5,
    stock_reaction_index_name: "Nifty 50",
    three_things_that_mattered: [
      "Margins compressed 320 bps on raw material spike",
      "Order book contracted 11% YoY — first decline in 8 quarters",
      "Capex deferral signals demand visibility issue",
    ],
    position_bias: "REDUCE",
    conviction: "HIGH",
    next_catalyst_date: "2026-07-25",
    next_catalyst_event: "Q1 FY27 — does margin guide hold or cut again?",
    rollup_verdict: "NEGATIVE",
    rollup_verdict_oneliner:
      "Demand deterioration not fully priced in; further downgrade risk",
  },
  // 4. MIXED — partial beat with red flags
  {
    symbol: "MIXEDCO",
    company: "Mixed Signals Co Ltd",
    sector: "Consumer",
    market_cap: "Large Cap",
    quarter: "Q4 FY2026",
    result_date: "2026-04-25",
    headline_verdict: "BEAT",
    headline_verdict_basis: "REPORTED",
    guidance_verdict: "WITHDRAWN",
    estimate_revision_direction: "DOWN",
    estimate_revision_magnitude: "2_TO_5",
    estimate_revision_metric: "FY27 EPS",
    stock_reaction_pct: -2.1,
    stock_reaction_vs_index_pct: -2.8,
    stock_reaction_index_name: "Nifty 50",
    three_things_that_mattered: [
      "Headline beat masked by one-off forex tailwind",
      "Volume growth slowed to 1.2% YoY — weakest in 6 quarters",
      "Mgmt withdrew FY27 margin guidance citing macro uncertainty",
    ],
    position_bias: "UNDER_REVIEW",
    conviction: "MEDIUM",
    next_catalyst_date: null,
    next_catalyst_event: null,
    rollup_verdict: "MIXED",
    rollup_verdict_oneliner:
      "Beat is cosmetic; underlying volume + guidance trends are the read",
  },
];

const ALL_VERDICTS: LayerVerdict[] = [
  "POSITIVE",
  "MIXED",
  "NEGATIVE",
  "NEUTRAL",
];

export default function SnapshotPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="py-10 space-y-12">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-400 mb-2">
          Dev preview · not linked from nav
        </div>
        <h1 className="text-2xl font-medium text-white tracking-tight">
          Snapshot Card · all 4 verdict tones
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
          QA fixtures for the institutional Snapshot Card v1. Verifies tone
          coverage (POSITIVE / NEUTRAL / NEGATIVE / MIXED) and mobile layout.
        </p>
      </div>

      {/* VerdictTag size matrix */}
      <section>
        <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">
          VerdictTag — size matrix
        </h2>
        <div className="space-y-4 rounded-xl border border-white/5 bg-zinc-900/40 p-5">
          {(["sm", "md", "lg"] as const).map((sz) => (
            <div key={sz} className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-[10px] uppercase text-zinc-500 w-8">
                {sz}
              </span>
              {ALL_VERDICTS.map((v) => (
                <VerdictTag key={v} verdict={v} size={sz} />
              ))}
              <VerdictTag
                verdict="POSITIVE"
                size={sz}
                oneliner="Inflection setup, BFSI back to growth"
              />
            </div>
          ))}
        </div>
      </section>

      {/* SnapshotCard fixtures */}
      <section className="space-y-12">
        <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
          SnapshotCard fixtures
        </h2>
        {FIXTURES.map((f, i) => (
          <div key={i}>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-3">
              Fixture {i + 1} · {f.rollup_verdict}
            </div>
            <SnapshotCard data={f} />
          </div>
        ))}
      </section>
    </div>
  );
}
