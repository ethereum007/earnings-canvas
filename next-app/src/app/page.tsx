import Link from "next/link";

export default function HomePage() {
  return (
    <div className="py-20">
      <div className="max-w-2xl">
        <span className="text-xs font-medium px-2 py-0.5 rounded-full border border-emerald-400/30 text-emerald-400 bg-emerald-400/10">
          Q4 FY26 Season Live
        </span>
        <h1 className="mt-4 text-4xl font-medium tracking-tight text-white">
          India earnings intelligence,{" "}
          <span className="text-emerald-400">
            built for institutional eyes.
          </span>
        </h1>
        <p className="mt-4 text-base text-zinc-400 leading-relaxed">
          Track every Q4 FY26 result in real time. Sector KPIs, management
          commentary, analyst verdicts — all in one place.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Link
            href="/earnings"
            className="px-4 py-2 rounded-md text-sm font-medium bg-white text-zinc-950 hover:bg-zinc-200 transition-colors"
          >
            View Q4 FY26 Season →
          </Link>
          <Link
            href="/policy"
            className="px-4 py-2 rounded-md text-sm font-medium text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 transition-colors"
          >
            Policy Alpha
          </Link>
        </div>
      </div>
    </div>
  );
}
