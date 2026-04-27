import type { Announcement } from "@/types/earnings";

export default function RecentAnnouncements({
  items,
}: {
  items: Announcement[];
}) {
  if (!items?.length) return null;
  return (
    <ul className="space-y-3">
      {items.map((a, i) => (
        <li key={i} className="flex gap-3 text-sm">
          <span className="text-zinc-500 tabular-nums w-28 flex-shrink-0">
            {a.date}
          </span>
          <span className="text-zinc-300">{a.text}</span>
        </li>
      ))}
    </ul>
  );
}
