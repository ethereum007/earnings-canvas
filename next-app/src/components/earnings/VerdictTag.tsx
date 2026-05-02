import { cn } from "@/lib/utils";
import {
  LAYER_VERDICT_CONFIG,
  type LayerVerdict,
} from "@/types/earnings";

/**
 * VerdictTag — pill component used across all 5 layer modules.
 * Pure presentational, server-component-safe.
 */
export default function VerdictTag({
  verdict,
  oneliner,
  size = "md",
  showLabel = true,
  className,
}: {
  verdict: LayerVerdict;
  oneliner?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}) {
  const cfg = LAYER_VERDICT_CONFIG[verdict];

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 gap-1.5",
    md: "text-xs px-3 py-1.5 gap-2",
    lg: "text-sm px-4 py-2 gap-2.5",
  } as const;

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border font-mono uppercase tracking-wider",
        cfg.bg,
        cfg.text,
        cfg.border,
        sizeClasses[size],
        className
      )}
    >
      <span aria-hidden>{cfg.emoji}</span>
      {showLabel && <span className="font-medium">{cfg.label}</span>}
      {oneliner && (
        <>
          <span className="opacity-40">·</span>
          <span className="normal-case font-normal tracking-normal">
            {oneliner}
          </span>
        </>
      )}
    </div>
  );
}
