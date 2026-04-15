import type { EarningsSeasonRow, VerdictSignal } from "@/types/earnings";
import { signalDotColor, cn } from "@/lib/utils";

function asArray(x: unknown): unknown[] {
  return Array.isArray(x) ? x : [];
}

export default function TabVerdict({
  company: co,
}: {
  company: EarningsSeasonRow;
}) {
  const score = co.verdict_score ?? co.sentiment_score ?? 0;
  const scoreColor =
    score >= 7.5
      ? "text-emerald-400 border-emerald-400/40"
      : score >= 5.5
        ? "text-amber-400 border-amber-400/40"
        : "text-red-400 border-red-400/40";

  const signals = (co.verdict_signals ?? []) as VerdictSignal[];
  const greenFlags = asArray(co.green_flags);
  const redFlags = asArray(co.red_flags);
  const risks = asArray(co.risks);

  const summary = co.verdict_summary ?? co.analysis_summary;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-6">
        <div
          className={cn(
            "flex-shrink-0 w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center",
            scoreColor
          )}
        >
          <span className="text-2xl font-medium tabular-nums">
            {score ? Number(score).toFixed(1) : "—"}
          </span>
          <span className="text-[9px] text-zinc-500 uppercase tracking-wider">
            score
          </span>
        </div>
        <div className="flex-1">
          {summary && (
            <p className="text-sm text-zinc-300 mb-3 leading-relaxed">
              {summary}
            </p>
          )}
          {co.investment_signal && (
            <div className="mb-3">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider mr-2">
                Signal
              </span>
              <span className="text-sm text-white font-medium">
                {co.investment_signal}
              </span>
              {co.signal_rationale && (
                <p className="text-xs text-zinc-500 mt-1">
                  {co.signal_rationale}
                </p>
              )}
            </div>
          )}
          <div className="space-y-2">
            {signals.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full flex-shrink-0",
                    signalDotColor(s.color)
                  )}
                />
                <span className="text-sm text-zinc-300">{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {greenFlags.length > 0 && (
        <FlagList title="Green flags" items={greenFlags} positive />
      )}
      {redFlags.length > 0 && (
        <FlagList title="Red flags" items={redFlags} positive={false} />
      )}
      {risks.length > 0 && (
        <FlagList title="Risks" items={risks} positive={false} />
      )}

      {co.bull_case && (
        <NarrativeBlock title="Bull case" body={co.bull_case} color="emerald" />
      )}
      {co.bear_case && (
        <NarrativeBlock title="Bear case" body={co.bear_case} color="red" />
      )}
    </div>
  );
}

function FlagList({
  title,
  items,
  positive,
}: {
  title: string;
  items: unknown[];
  positive: boolean;
}) {
  return (
    <div>
      <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
        {title}
      </h3>
      <div className="space-y-2">
        {items.map((item, i) => {
          const text = typeof item === "string" ? item : JSON.stringify(item);
          return (
            <div key={i} className="flex items-center gap-3">
              <div
                className={cn(
                  "w-2 h-2 rounded-full flex-shrink-0",
                  positive ? "bg-emerald-400" : "bg-red-400"
                )}
              />
              <span className="text-sm text-zinc-300">{text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NarrativeBlock({
  title,
  body,
  color,
}: {
  title: string;
  body: string;
  color: "emerald" | "red";
}) {
  const borderColor =
    color === "emerald" ? "border-emerald-400/30" : "border-red-400/30";
  return (
    <div className={cn("rounded-xl border p-4", borderColor)}>
      <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
        {title}
      </div>
      <p className="text-sm text-zinc-300 leading-relaxed">{body}</p>
    </div>
  );
}
