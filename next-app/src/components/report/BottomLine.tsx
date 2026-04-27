import type { BottomLineItem } from "@/types/earnings";

/**
 * Bottom-line recap — 4 emoji-bullets, magazine-cover scannable.
 */
export default function BottomLine({ items }: { items: BottomLineItem[] }) {
  if (!items?.length) return null;
  return (
    <div className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/5 to-transparent p-7 lg:p-8">
      <div className="text-[10px] uppercase tracking-[0.22em] text-emerald-400 mb-5">
        Bottom line
      </div>
      <ul className="space-y-3">
        {items.map((it, i) => (
          <li key={i} className="flex gap-3 items-start text-base lg:text-lg text-white">
            <span className="text-xl flex-shrink-0 leading-tight">{it.emoji}</span>
            <span className="leading-snug">{it.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
