import type { KeyQuote } from "@/types/earnings";

export default function KeyQuotes({ quotes }: { quotes: KeyQuote[] }) {
  if (!quotes?.length) return null;
  return (
    <div className="space-y-6">
      {quotes.map((q, i) => (
        <div key={i}>
          <blockquote className="border-l-2 border-emerald-400/40 pl-4 text-base italic text-zinc-200 leading-relaxed">
            &ldquo;{q.quote}&rdquo;
          </blockquote>
          <div className="mt-2 ml-5 text-xs text-zinc-500">
            — {q.speaker}
            {q.title && <span>, {q.title}</span>}
          </div>
          {q.interpretation && (
            <p className="mt-3 ml-5 text-sm text-zinc-400 leading-relaxed">
              {q.interpretation}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
