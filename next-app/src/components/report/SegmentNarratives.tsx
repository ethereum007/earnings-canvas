import type { SegmentNarrative } from "@/types/earnings";
import Markdown from "@/components/markdown/Markdown";

export default function SegmentNarratives({
  narratives,
}: {
  narratives: SegmentNarrative[];
}) {
  if (!narratives?.length) return null;
  return (
    <div className="space-y-8">
      {narratives.map((n, i) => (
        <div key={i} className="border-l-2 border-emerald-400/30 pl-5">
          <h3 className="text-base font-medium text-white">
            {n.segment}
            {n.label && (
              <span className="text-zinc-500 font-normal text-sm ml-2">
                · {n.label}
              </span>
            )}
          </h3>
          <div className="mt-3">
            <Markdown>{n.body_md}</Markdown>
          </div>
        </div>
      ))}
    </div>
  );
}
