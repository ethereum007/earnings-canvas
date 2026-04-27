"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { EarningsSeasonRow } from "@/types/earnings";
import { X, ExternalLink } from "lucide-react";
import { cn, resultStatusColor } from "@/lib/utils";
import { companyHref } from "@/lib/slug";
import TabPrint from "./tabs/TabPrint";
import TabKPI from "./tabs/TabKPI";
import TabMgmt from "./tabs/TabMgmt";
import TabVerdict from "./tabs/TabVerdict";

const TABS = ["Earnings print", "Sector KPIs", "Mgmt call", "Verdict"] as const;

export default function EarningsDetailDrawer({
  company,
  onClose,
}: {
  company: EarningsSeasonRow;
  onClose: () => void;
}) {
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-zinc-950 border-l border-white/5 z-50 overflow-y-auto">
        <div className="sticky top-0 bg-zinc-950/95 backdrop-blur border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-base font-medium text-white">
                {company.company}
              </h2>
              <span
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full border",
                  resultStatusColor(company.result_status)
                )}
              >
                {company.result_status}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              {company.sector ?? "—"} · {company.quarter}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href={companyHref(company.symbol, company.quarter)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 border border-white/10 transition-colors flex items-center gap-1.5"
              title="Open full analysis page"
            >
              Full page
              <ExternalLink size={12} />
            </Link>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="border-b border-white/5 px-6 flex gap-0 overflow-x-auto">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={cn(
                "text-sm py-3 px-4 border-b-2 transition-colors -mb-px whitespace-nowrap",
                tab === i
                  ? "text-white border-white"
                  : "text-zinc-500 border-transparent hover:text-zinc-300"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 0 && <TabPrint company={company} />}
          {tab === 1 && <TabKPI company={company} />}
          {tab === 2 && <TabMgmt company={company} />}
          {tab === 3 && <TabVerdict company={company} />}
        </div>
      </div>
    </>
  );
}
