import type {
  StrategicThread,
  ThreadCategory,
  Confidence,
  ImpactHorizon,
} from "@/types/earnings";
import { cn } from "@/lib/utils";

const CATEGORY_LABEL: Record<ThreadCategory, string> = {
  capital: "Capital",
  product: "Product",
  "m&a": "M&A",
  pricing: "Pricing",
  capex: "Capex",
  regulatory: "Regulatory",
  partnership: "Partnership",
  other: "Strategy",
};

const CONFIDENCE_STYLE: Record<Confidence, string> = {
  high: "text-emerald-400",
  medium: "text-amber-400",
  low: "text-zinc-500",
};

const HORIZON_LABEL: Record<ImpactHorizon, string> = {
  "0-3m": "0–3 months",
  "3-6m": "3–6 months",
  "6-12m": "6–12 months",
  "12-24m": "12–24 months",
  "24m+": "24+ months",
};

export default function StrategicThreads({
  threads,
}: {
  threads: StrategicThread[];
}) {
  if (!threads?.length) return null;

  return (
    <div className="space-y-6">
      <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
        Causal chains connecting management actions to forward financial
        impact. Each thread shows the move, the read, what could break it,
        and what to watch next quarter.
      </p>

      {threads.map((t, i) => (
        <div
          key={i}
          className="rounded-2xl border border-white/10 bg-zinc-900/40 overflow-hidden"
        >
          {/* Header strip */}
          <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border-b border-white/10 text-xs">
            <span className="font-mono text-emerald-400 tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="font-medium text-white tracking-tight text-sm lg:text-base flex-1 truncate">
              {t.title}
            </span>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 text-[10px] uppercase tracking-wider">
              {CATEGORY_LABEL[t.category]}
            </span>
            <span className="hidden sm:inline text-zinc-500 text-[10px] uppercase tracking-wider">
              {HORIZON_LABEL[t.impact_horizon]}
            </span>
            <span
              className={cn(
                "text-[10px] uppercase tracking-wider font-medium",
                CONFIDENCE_STYLE[t.confidence]
              )}
            >
              {t.confidence} conf
            </span>
          </div>

          <div className="p-6 space-y-5">
            {t.segments_affected?.length > 0 && (
              <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-[0.18em]">
                <span>Affects</span>
                <span className="text-zinc-300 font-sans normal-case tracking-normal text-xs">
                  {t.segments_affected.join(" · ")}
                </span>
              </div>
            )}

            <Field label="The move">
              <p className="text-sm text-zinc-200 leading-relaxed">
                {t.the_move}
              </p>
            </Field>

            <Field label="Evidence">
              <blockquote className="text-sm text-zinc-300 italic border-l-2 border-emerald-400/40 pl-3 leading-relaxed">
                &ldquo;{t.evidence}&rdquo;
              </blockquote>
              {t.evidence_speaker && (
                <div className="mt-1.5 ml-3 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  — {t.evidence_speaker}
                </div>
              )}
            </Field>

            <Field label="The read">
              <p className="text-sm text-zinc-200 leading-relaxed">
                {t.forward_read}
              </p>
            </Field>

            {t.hindrances?.length > 0 && (
              <Field label="What could break this" tone="warn">
                <ul className="space-y-1.5">
                  {t.hindrances.map((h, j) => (
                    <li
                      key={j}
                      className="flex gap-2 text-sm text-zinc-300 leading-relaxed"
                    >
                      <span className="text-amber-400 flex-shrink-0">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </Field>
            )}

            <Field label="Next-quarter check" tone="check">
              <p className="text-sm text-zinc-200 leading-relaxed">
                {t.next_q_check}
              </p>
            </Field>
          </div>
        </div>
      ))}
    </div>
  );
}

function Field({
  label,
  tone,
  children,
}: {
  label: string;
  tone?: "warn" | "check";
  children: React.ReactNode;
}) {
  const labelColor =
    tone === "warn"
      ? "text-amber-400"
      : tone === "check"
        ? "text-emerald-400"
        : "text-zinc-500";
  const prefix = tone === "warn" ? "⚠️ " : tone === "check" ? "📍 " : "";
  return (
    <div>
      <div
        className={cn(
          "text-[10px] uppercase tracking-[0.2em] mb-2",
          labelColor
        )}
      >
        {prefix}
        {label}
      </div>
      {children}
    </div>
  );
}
