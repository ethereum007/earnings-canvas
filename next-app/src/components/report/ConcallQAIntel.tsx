import type { ConcallQAItem, TonalRead } from "@/types/earnings";
import { cn } from "@/lib/utils";

const TONAL_STYLE: Record<TonalRead, string> = {
  defensive: "text-amber-400 bg-amber-400/10",
  promotional: "text-blue-400 bg-blue-400/10",
  measured: "text-zinc-300 bg-white/5",
  evasive: "text-red-400 bg-red-400/10",
  confident: "text-emerald-400 bg-emerald-400/10",
};

export default function ConcallQAIntel({
  items,
}: {
  items: ConcallQAItem[];
}) {
  if (!items?.length) return null;

  return (
    <div className="space-y-8">
      {items.map((q, i) => (
        <div key={i} className="border-l-2 border-white/10 pl-6 relative">
          <span className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-[9px] text-emerald-400 font-mono">
            Q
          </span>

          {/* Question */}
          <div className="mb-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1.5">
              {q.analyst_name && q.brokerage
                ? `${q.analyst_name} · ${q.brokerage}`
                : q.analyst_name || q.brokerage || "Question"}
            </div>
            <p className="text-base font-medium text-white leading-snug">
              {q.question_theme}
            </p>
            {q.question_full && (
              <p className="mt-1.5 text-sm text-zinc-400 leading-relaxed italic">
                &ldquo;{q.question_full}&rdquo;
              </p>
            )}
          </div>

          {/* Answer */}
          <div className="rounded-xl bg-zinc-900/60 border border-white/5 p-5 space-y-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1.5">
                {q.mgmt_speaker}
              </div>
              <p className="text-sm text-zinc-200 leading-relaxed">
                {q.mgmt_answer}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
              {q.tonal_read && (
                <span
                  className={cn(
                    "text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full",
                    TONAL_STYLE[q.tonal_read]
                  )}
                >
                  🎯 {q.tonal_read}
                </span>
              )}
              {q.deflection_flag && (
                <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full text-red-400 bg-red-400/10">
                  🔴 deflection
                </span>
              )}
            </div>

            {q.deflection_flag && (
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-red-400 mb-1.5">
                  What they avoided
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {q.deflection_flag}
                </p>
              </div>
            )}

            {q.what_they_didnt_say && (
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1.5">
                  Silent signal
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed italic">
                  {q.what_they_didnt_say}
                </p>
              </div>
            )}
          </div>

          {/* EC interpretation */}
          <div className="mt-4 ml-2 flex gap-3 text-sm">
            <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-medium flex-shrink-0 pt-0.5">
              EC read
            </span>
            <p className="text-zinc-300 leading-relaxed">
              {q.ec_interpretation}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
