"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function StickyTOC({
  sections,
}: {
  sections: ReadonlyArray<{ id: string; title: string }>;
}) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const observers = sections.map((s) => {
      const el = document.getElementById(s.id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(s.id);
        },
        { rootMargin: "-30% 0px -60% 0px" }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, [sections]);

  return (
    <nav className="sticky top-24">
      <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-3">
        On this page
      </div>
      <ul className="space-y-1.5 border-l border-white/5">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={cn(
                "block pl-4 -ml-px py-1 text-sm border-l transition-colors",
                active === s.id
                  ? "text-white border-emerald-400"
                  : "text-zinc-500 border-transparent hover:text-zinc-300"
              )}
            >
              {s.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
