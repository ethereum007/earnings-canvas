import type { SectorEchoItem } from "@/types/earnings";
import Link from "next/link";
import { cn } from "@/lib/utils";

const DOT: Record<SectorEchoItem["color"], string> = {
  green: "bg-emerald-400",
  red: "bg-red-400",
  amber: "bg-amber-400",
};

export default function SectorEcho({ items }: { items: SectorEchoItem[] }) {
  if (!items?.length) return null;
  return (
    <div className="rounded-xl border border-white/5 overflow-hidden">
      <div className="grid grid-cols-12 bg-zinc-900 px-4 py-2 text-[10px] text-zinc-500 uppercase tracking-wider">
        <span className="col-span-3">Stock</span>
        <span className="col-span-9">Read-across</span>
      </div>
      {items.map((it, i) => (
        <div
          key={i}
          className="grid grid-cols-12 px-4 py-3 border-t border-white/5 items-start gap-3"
        >
          <span className="col-span-3 flex items-center gap-2 text-sm font-medium text-zinc-200">
            <span
              className={cn(
                "w-2 h-2 rounded-full flex-shrink-0",
                DOT[it.color]
              )}
            />
            <span className="font-mono text-emerald-400 text-xs">
              {it.ticker}
            </span>
            {it.name && (
              <span className="text-zinc-400 text-xs hidden sm:inline">
                {it.name}
              </span>
            )}
          </span>
          <span className="col-span-9 text-sm text-zinc-300">{it.note}</span>
        </div>
      ))}
    </div>
  );
}
