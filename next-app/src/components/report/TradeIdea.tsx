import type { TradeIdea } from "@/types/earnings";

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-12 gap-3 py-1.5 text-sm">
      <span className="col-span-3 sm:col-span-2 text-zinc-500">{label}</span>
      <span className="col-span-9 sm:col-span-10 text-zinc-200">{children}</span>
    </div>
  );
}

export default function TradeIdeaCard({ trade }: { trade: TradeIdea }) {
  if (!trade) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-5 font-mono">
      <div className="text-[10px] uppercase tracking-wider text-emerald-400 mb-3">
        Trade idea {trade.view_horizon ? `· ${trade.view_horizon}` : ""}
      </div>
      <Row label="Setup">{trade.setup}</Row>
      <Row label="Entry">
        <span className="text-white">{trade.entry}</span>
      </Row>
      <Row label="Stop">
        <span className="text-red-400">{trade.stop_loss}</span>
      </Row>
      {trade.targets.map((t, i) => (
        <Row key={i} label={`Target ${i + 1}`}>
          <span className="text-emerald-400">{t.price}</span>
          {t.upside_pct != null && (
            <span className="text-zinc-500">
              {" "}
              ({t.upside_pct > 0 ? "+" : ""}
              {t.upside_pct}%)
            </span>
          )}
          {t.catalyst && (
            <span className="text-zinc-500"> · {t.catalyst}</span>
          )}
        </Row>
      ))}
      {trade.risk_reward && <Row label="RR">{trade.risk_reward}</Row>}
      {trade.sizing && <Row label="Sizing">{trade.sizing}</Row>}
      {trade.hedge && <Row label="Hedge">{trade.hedge}</Row>}
      {trade.verify_levels && (
        <div className="mt-4 pt-3 border-t border-white/5 text-xs text-amber-400/80 font-sans">
          ⚠️ Verify levels against today&apos;s chart before publishing.
        </div>
      )}
    </div>
  );
}
