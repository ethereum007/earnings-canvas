import type { SegmentNarrative } from "@/types/earnings";
import Markdown from "@/components/markdown/Markdown";
import { cn } from "@/lib/utils";

export default function SegmentNarratives({
  narratives,
}: {
  narratives: SegmentNarrative[];
}) {
  if (!narratives?.length) return null;
  return (
    <div className="space-y-12">
      {narratives.map((n, i) => (
        <div key={i}>
          <div className="flex items-baseline gap-3 mb-5 pb-3 border-b border-white/5">
            <h3 className="text-xl lg:text-2xl font-medium text-white tracking-tight">
              {n.segment}
            </h3>
            {n.label && (
              <span className="text-zinc-500 text-sm italic">— {n.label}</span>
            )}
          </div>

          {n.key_stats?.length ? (
            <div
              className={cn(
                "grid gap-px bg-white/5 rounded-xl overflow-hidden border border-white/5 mb-6",
                n.key_stats.length === 2 && "grid-cols-2",
                n.key_stats.length === 3 && "grid-cols-3",
                n.key_stats.length === 4 && "grid-cols-2 md:grid-cols-4",
                (n.key_stats.length === 1 || n.key_stats.length > 4) &&
                  "grid-cols-2 md:grid-cols-3"
              )}
            >
              {n.key_stats.map((s, j) => (
                <div key={j} className="bg-zinc-950 px-5 py-4">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-[0.18em] mb-1.5">
                    {s.label}
                  </div>
                  <div className="text-2xl lg:text-[28px] font-medium text-white tracking-tight tabular-nums leading-tight">
                    {s.value}
                  </div>
                  {s.sub && (
                    <div
                      className={cn(
                        "mt-1 text-[11px] tabular-nums",
                        s.positive === false
                          ? "text-red-400"
                          : "text-emerald-400"
                      )}
                    >
                      {s.sub}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : null}

          <Markdown>{n.body_md}</Markdown>
        </div>
      ))}
    </div>
  );
}
