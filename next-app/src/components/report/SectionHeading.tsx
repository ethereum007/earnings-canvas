import { cn } from "@/lib/utils";

/**
 * Editorial section heading: numbered prefix + title.
 *   01 / The 60-second read
 */
export default function SectionHeading({
  num,
  children,
  className,
}: {
  num: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex items-baseline gap-4", className)}>
      <span className="text-xs font-mono text-emerald-400 tabular-nums">
        {String(num).padStart(2, "0")}
      </span>
      <span className="text-zinc-600">/</span>
      <h2 className="text-base lg:text-lg font-medium text-white tracking-tight">
        {children}
      </h2>
      <span className="h-px flex-1 bg-white/5 mb-1.5" />
    </div>
  );
}
