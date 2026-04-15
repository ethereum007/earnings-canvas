"use client";
import { useState } from "react";
import type { EarningsSeasonRow } from "@/types/earnings";
import EarningsCard from "./EarningsCard";
import EarningsDetailDrawer from "./EarningsDetailDrawer";

export default function EarningsGrid({
  companies,
}: {
  companies: EarningsSeasonRow[];
}) {
  const [selected, setSelected] = useState<EarningsSeasonRow | null>(null);

  const reported = companies.filter((c) => c.result_status !== "AWAITED");
  const awaited = companies.filter((c) => c.result_status === "AWAITED");

  if (companies.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-zinc-500">
          No companies in the season tracker yet. Seed some rows into{" "}
          <code className="text-zinc-400">earnings_season</code> to see them
          here.
        </p>
      </div>
    );
  }

  return (
    <>
      {reported.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">
            Results declared ({reported.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reported.map((co) => (
              <EarningsCard
                key={co.id}
                company={co}
                onClick={() => setSelected(co)}
              />
            ))}
          </div>
        </section>
      )}

      {awaited.length > 0 && (
        <section>
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">
            Awaited ({awaited.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {awaited.map((co) => (
              <EarningsCard
                key={co.id}
                company={co}
                onClick={() => setSelected(co)}
                compact
              />
            ))}
          </div>
        </section>
      )}

      {selected && (
        <EarningsDetailDrawer
          company={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
