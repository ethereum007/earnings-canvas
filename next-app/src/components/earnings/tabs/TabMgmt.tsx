import type { EarningsSeasonRow } from "@/types/earnings";
import { sentimentBadge, cn } from "@/lib/utils";

// key_takeaways from earnings_analyses is loosely typed jsonb — render defensively.
function asArray(x: unknown): unknown[] {
  return Array.isArray(x) ? x : [];
}

function renderTakeaway(t: unknown, i: number) {
  if (typeof t === "string") {
    return (
      <li key={i} className="text-sm text-zinc-300 leading-relaxed">
        • {t}
      </li>
    );
  }
  if (t && typeof t === "object") {
    const rec = t as Record<string, unknown>;
    const theme = (rec.theme ?? rec.title ?? rec.label) as string | undefined;
    const quote = (rec.quote ?? rec.text ?? rec.body) as string | undefined;
    const sentiment = rec.sentiment as string | undefined;
    return (
      <div key={i} className="border-l-2 border-white/10 pl-4">
        <div className="flex items-center gap-2 mb-1.5">
          {theme && (
            <span className="text-sm font-medium text-white">{theme}</span>
          )}
          {sentiment && (
            <span
              className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-medium",
                sentimentBadge(sentiment)
              )}
            >
              {sentiment}
            </span>
          )}
        </div>
        {quote && (
          <p className="text-sm text-zinc-400 leading-relaxed">{quote}</p>
        )}
      </div>
    );
  }
  return null;
}

export default function TabMgmt({ company: co }: { company: EarningsSeasonRow }) {
  const takeaways = asArray(co.key_takeaways);
  const guidance = asArray(co.guidance);

  const hasContent = takeaways.length > 0 || guidance.length > 0 || co.mgmt_tone;

  if (!hasContent) {
    return (
      <p className="text-sm text-zinc-500">
        Management commentary not yet available.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {co.mgmt_tone && (
        <div>
          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
            Management tone
          </h3>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium",
                sentimentBadge(co.mgmt_tone)
              )}
            >
              {co.mgmt_tone}
            </span>
            {co.mgmt_confidence != null && (
              <span className="text-xs text-zinc-400">
                Confidence{" "}
                <span className="text-white">{co.mgmt_confidence}/10</span>
              </span>
            )}
          </div>
        </div>
      )}

      {takeaways.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">
            Key takeaways
          </h3>
          <div className="space-y-4">{takeaways.map(renderTakeaway)}</div>
        </div>
      )}

      {guidance.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
            Guidance
          </h3>
          <ul className="space-y-2">
            {guidance.map((g, i) => {
              if (typeof g === "string") {
                return (
                  <li key={i} className="text-sm text-zinc-300">
                    • {g}
                  </li>
                );
              }
              if (g && typeof g === "object") {
                const rec = g as Record<string, unknown>;
                return (
                  <li
                    key={i}
                    className="text-sm text-zinc-300 border-l-2 border-white/10 pl-3"
                  >
                    {(rec.metric as string) ?? ""}{" "}
                    {rec.prior != null && (
                      <span className="text-zinc-500">
                        {String(rec.prior)} →{" "}
                      </span>
                    )}
                    {rec.new != null && (
                      <span className="text-white font-medium">
                        {String(rec.new)}
                      </span>
                    )}
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
