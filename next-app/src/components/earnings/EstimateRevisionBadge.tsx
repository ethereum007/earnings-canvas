import { ArrowUp, ArrowRight, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EstimateDirection, EstimateMagnitude } from "@/types/earnings";

const ARROW: Record<EstimateDirection, React.ReactNode> = {
  UP: <ArrowUp className="w-3.5 h-3.5" />,
  FLAT: <ArrowRight className="w-3.5 h-3.5" />,
  DOWN: <ArrowDown className="w-3.5 h-3.5" />,
};

const MAGNITUDE_LABEL: Record<EstimateMagnitude, string> = {
  LT_2: "<2%",
  "2_TO_5": "2–5%",
  GT_5: ">5%",
};

const COLORS: Record<EstimateDirection, string> = {
  UP: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  FLAT: "text-zinc-300 bg-zinc-500/10 border-zinc-500/30",
  DOWN: "text-red-400 bg-red-400/10 border-red-400/30",
};

export default function EstimateRevisionBadge({
  direction,
  magnitude,
  metric = "FY+1 EPS",
}: {
  direction: EstimateDirection;
  magnitude: EstimateMagnitude;
  metric?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-md border font-mono text-xs",
        COLORS[direction]
      )}
    >
      {ARROW[direction]}
      <span className="font-medium">{MAGNITUDE_LABEL[magnitude]}</span>
      <span className="opacity-60">·</span>
      <span className="opacity-80">{metric}</span>
    </div>
  );
}
