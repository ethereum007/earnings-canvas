import type { KeyQuote } from "@/types/earnings";

/**
 * Magazine-style pull quotes. Display-size, generous whitespace, attribution
 * below in caps. Optional interpretation paragraph beneath each quote.
 */
export default function KeyQuotes({ quotes }: { quotes: KeyQuote[] }) {
  if (!quotes?.length) return null;
  return (
    <div className="space-y-12">
      {quotes.map((q, i) => (
        <figure key={i} className="max-w-3xl">
          <div
            aria-hidden
            className="text-emerald-400/40 text-6xl leading-none font-serif mb-2 select-none"
          >
            &ldquo;
          </div>
          <blockquote className="text-2xl lg:text-3xl text-white font-medium leading-snug tracking-tight">
            {q.quote}
          </blockquote>
          <figcaption className="mt-5 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            <span className="text-zinc-300">{q.speaker}</span>
            {q.title && <span className="ml-2">· {q.title}</span>}
          </figcaption>
          {q.interpretation && (
            <p className="mt-5 text-sm text-zinc-400 leading-relaxed border-l border-white/10 pl-4">
              {q.interpretation}
            </p>
          )}
        </figure>
      ))}
    </div>
  );
}
