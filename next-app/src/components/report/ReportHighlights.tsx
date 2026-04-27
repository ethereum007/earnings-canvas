import type { ReportHighlight, HighlightKind } from "@/types/earnings";
import Markdown from "@/components/markdown/Markdown";
import { cn } from "@/lib/utils";

const META: Record<
  HighlightKind,
  { emoji: string; label: string; color: string }
> = {
  worked: {
    emoji: "📈",
    label: "What worked",
    color: "border-emerald-400/30",
  },
  broke: { emoji: "📉", label: "What broke", color: "border-red-400/30" },
  disclosure: {
    emoji: "🎯",
    label: "Big disclosure",
    color: "border-blue-400/30",
  },
  capital: {
    emoji: "💰",
    label: "Capital return",
    color: "border-amber-400/30",
  },
};

const ORDER: HighlightKind[] = ["worked", "broke", "disclosure", "capital"];

export default function ReportHighlights({
  highlights,
}: {
  highlights: ReportHighlight[];
}) {
  if (!highlights?.length) return null;
  // Stable order: worked / broke / disclosure / capital
  const sorted = [...highlights].sort(
    (a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind)
  );
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {sorted.map((h, i) => {
        const m = META[h.kind];
        return (
          <div
            key={i}
            className={cn("rounded-xl border bg-zinc-900/50 p-4", m.color)}
          >
            <div className="flex items-center gap-2 mb-2 text-xs text-zinc-500 uppercase tracking-wider">
              <span className="text-base">{m.emoji}</span>
              {m.label}
            </div>
            <Markdown>{h.text}</Markdown>
          </div>
        );
      })}
    </div>
  );
}
