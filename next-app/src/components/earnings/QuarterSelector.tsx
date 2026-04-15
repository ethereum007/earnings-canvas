import Link from "next/link";
import { cn } from "@/lib/utils";

export default function QuarterSelector({
  quarters,
  active,
}: {
  quarters: string[];
  active: string;
}) {
  return (
    <div className="flex items-center gap-1 mb-6 overflow-x-auto">
      <span className="text-[10px] text-zinc-500 uppercase tracking-wider mr-2 flex-shrink-0">
        Season
      </span>
      {quarters.map((q) => (
        <Link
          key={q}
          href={`/earnings?q=${encodeURIComponent(q)}`}
          className={cn(
            "px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
            q === active
              ? "bg-white text-zinc-950"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          )}
        >
          {q}
        </Link>
      ))}
    </div>
  );
}
