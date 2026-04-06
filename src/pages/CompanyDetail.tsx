import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardNav from "@/components/DashboardNav";
import { getSignalColor, getSignalLabel, getSentimentColor, getToneEmoji } from "@/lib/signal-utils";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, AlertTriangle, CheckCircle, XCircle, Eye, Target } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

const toStringArray = (val: Json | null): string[] => {
  if (!val || !Array.isArray(val)) return [];
  return val.filter((v): v is string => typeof v === "string");
};

interface KeyTakeaway {
  point: string;
  category: string;
  impact: string;
  significance: string;
}

const toTakeaways = (val: Json | null): KeyTakeaway[] => {
  if (!val || !Array.isArray(val)) return [];
  return val.map((item) => {
    if (typeof item === "string") {
      return { point: item, category: "Insight", impact: "Neutral", significance: "MEDIUM" };
    }
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const obj = item as Record<string, unknown>;
      return {
        point: (obj.point as string) ?? (obj.takeaway as string) ?? String(item),
        category: (obj.category as string) ?? "Insight",
        impact: (obj.impact as string) ?? "Neutral",
        significance: (obj.significance as string) ?? "MEDIUM",
      };
    }
    return { point: String(item), category: "Insight", impact: "Neutral", significance: "MEDIUM" };
  });
};

interface GuidanceTarget {
  metric?: string;
  target?: string;
  detail?: string;
}

interface Guidance {
  revenue_outlook?: string;
  margin_outlook?: string;
  specific_targets?: GuidanceTarget[];
  confidence_level?: string;
  guidance_vs_reality?: string;
  capex_plans?: string;
}

const toGuidance = (val: Json | null): Guidance | null => {
  if (!val || typeof val !== "object" || Array.isArray(val)) return null;
  return val as unknown as Guidance;
};

interface Risk {
  risk: string;
  severity: string;
  probability: string;
  detail: string;
}

const toRisks = (val: Json | null): Risk[] => {
  if (!val || !Array.isArray(val)) return [];
  return val.map((item) => {
    if (typeof item === "string") {
      return { risk: item, severity: "Medium", probability: "Medium", detail: "" };
    }
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const obj = item as Record<string, unknown>;
      return {
        risk: (obj.risk as string) ?? String(item),
        severity: (obj.severity as string) ?? "Medium",
        probability: (obj.probability as string) ?? "Medium",
        detail: (obj.detail as string) ?? "",
      };
    }
    return { risk: String(item), severity: "Medium", probability: "Medium", detail: "" };
  });
};

interface KeyNumber {
  metric?: string;
  value?: string;
  change?: string;
  context?: string;
}

const toKeyNumbers = (val: Json | null): KeyNumber[] => {
  if (!val || !Array.isArray(val)) return [];
  return val as unknown as KeyNumber[];
};

const SentimentGauge = ({ score }: { score: number | null }) => {
  const s = score ?? 0;
  const angle = -90 + (s + 1) * 90; // -90 to 90 degrees
  return (
    <div className="relative w-48 h-24 mx-auto">
      <svg viewBox="0 0 200 100" className="w-full h-full">
        <defs>
          <linearGradient id="gaugeGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="hsl(0, 72%, 51%)" />
            <stop offset="50%" stopColor="hsl(38, 92%, 50%)" />
            <stop offset="100%" stopColor="hsl(160, 60%, 45%)" />
          </linearGradient>
        </defs>
        <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke="hsl(217,33%,20%)" strokeWidth="12" strokeLinecap="round" />
        <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke="url(#gaugeGrad)" strokeWidth="12" strokeLinecap="round" />
        <line
          x1="100" y1="90"
          x2={100 + 60 * Math.cos((angle * Math.PI) / 180)}
          y2={90 + 60 * Math.sin((angle * Math.PI) / 180)}
          stroke="hsl(var(--foreground))" strokeWidth="3" strokeLinecap="round"
        />
        <circle cx="100" cy="90" r="5" fill="hsl(var(--foreground))" />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 text-center">
        <span className={`text-2xl font-bold ${getSentimentColor(score)}`}>{s.toFixed(2)}</span>
      </div>
    </div>
  );
};

const CompanyDetail = () => {
  const { symbol } = useParams<{ symbol: string }>();

  const { data: analysis, isLoading } = useQuery({
    queryKey: ["company", symbol],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("latest_analyses")
        .select("*")
        .eq("symbol", symbol!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!symbol,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-card rounded w-1/3" />
            <div className="h-32 bg-card rounded" />
            <div className="h-48 bg-card rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-20 text-center">
          <p className="text-muted-foreground text-lg">Company not found.</p>
          <Link to="/" className="text-primary mt-4 inline-block hover:underline">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const greenFlags = toStringArray(analysis.green_flags);
  const redFlags = toStringArray(analysis.red_flags);
  const toneEvidence = toStringArray(analysis.tone_evidence);
  const dodgedQuestions = toStringArray(analysis.dodged_questions);
  const watchlist = toStringArray(analysis.next_quarter_watchlist);
  const takeaways = toTakeaways(analysis.key_takeaways);
  const guidance = toGuidance(analysis.guidance);
  const risks = toRisks(analysis.risks);
  const keyNumbers = toKeyNumbers(analysis.key_numbers);

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8">
        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        {/* Hero */}
        <div className="bg-card/60 rounded-lg border border-border p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{analysis.name}</h1>
              <p className="text-muted-foreground mt-1">{analysis.symbol} · {analysis.sector} · {analysis.quarter}</p>
            </div>
            <span className={`text-sm font-semibold px-3 py-1.5 rounded-md border ${getSignalColor(analysis.investment_signal)}`}>
              {getSignalLabel(analysis.investment_signal)}
            </span>
          </div>
          <SentimentGauge score={analysis.sentiment_score} />
          <p className="text-center text-sm text-muted-foreground mt-2">
            {analysis.sentiment_label}
          </p>
        </div>

        {/* Executive Summary */}
        {analysis.summary && (
          <div className="bg-card/60 rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold mb-3 text-foreground">Executive Summary</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{analysis.summary}</p>
          </div>
        )}

        {/* Bull vs Bear */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.bull_case && (
            <div className="bg-card/60 rounded-lg border border-emerald/30 p-6">
              <h3 className="text-sm font-semibold text-emerald mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> Bull Case
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{analysis.bull_case}</p>
            </div>
          )}
          {analysis.bear_case && (
            <div className="bg-card/60 rounded-lg border border-rose/30 p-6">
              <h3 className="text-sm font-semibold text-rose mb-3 flex items-center gap-2">
                <XCircle className="h-4 w-4" /> Bear Case
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{analysis.bear_case}</p>
            </div>
          )}
        </div>

        {/* Key Numbers */}
        {keyNumbers.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 text-foreground">Key Numbers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {keyNumbers.map((kn, i) => (
                <div key={i} className="bg-card/60 rounded-lg border border-border p-4">
                  <div className="text-xs text-muted-foreground mb-1">{kn.metric}</div>
                  <div className="text-xl font-bold text-foreground">{kn.value}</div>
                  {kn.change && <div className="text-xs text-muted-foreground mt-1">{kn.change}</div>}
                  {kn.context && <div className="text-xs text-muted-foreground mt-1">{kn.context}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Takeaways */}
        {takeaways.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 text-foreground">Key Takeaways</h2>
            <div className="space-y-2">
              {takeaways.map((t, i) => (
                <div key={i} className="bg-card/60 rounded-lg border border-border p-4 flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={`text-xs ${
                        t.impact === "Positive" ? "text-emerald border-emerald/30" :
                        t.impact === "Negative" ? "text-rose border-rose/30" :
                        "text-amber border-amber/30"
                      }`}>{t.category}</Badge>
                      {t.significance === "HIGH" && (
                        <Badge className="bg-primary/20 text-primary text-xs">HIGH</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{t.point}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Flags */}
        {(greenFlags.length > 0 || redFlags.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {greenFlags.length > 0 && (
              <div className="bg-card/60 rounded-lg border border-emerald/30 p-6">
                <h3 className="text-sm font-semibold text-emerald mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Green Flags ({greenFlags.length})
                </h3>
                <ul className="space-y-2">
                  {greenFlags.map((f, i) => (
                    <li key={i} className="text-sm text-muted-foreground leading-relaxed flex gap-2">
                      <span className="text-emerald mt-0.5 shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {redFlags.length > 0 && (
              <div className="bg-card/60 rounded-lg border border-rose/30 p-6">
                <h3 className="text-sm font-semibold text-rose mb-3 flex items-center gap-2">
                  <XCircle className="h-4 w-4" /> Red Flags ({redFlags.length})
                </h3>
                <ul className="space-y-2">
                  {redFlags.map((f, i) => (
                    <li key={i} className="text-sm text-muted-foreground leading-relaxed flex gap-2">
                      <span className="text-rose mt-0.5 shrink-0">✗</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Guidance */}
        {guidance && (
          <div className="bg-card/60 rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" /> Management Guidance
            </h2>
            <div className="space-y-3">
              {guidance.revenue_outlook && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Revenue Outlook</div>
                  <p className="text-sm text-foreground/80">{guidance.revenue_outlook}</p>
                </div>
              )}
              {guidance.margin_outlook && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Margin Outlook</div>
                  <p className="text-sm text-foreground/80">{guidance.margin_outlook}</p>
                </div>
              )}
              {guidance.specific_targets && guidance.specific_targets.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Specific Targets</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {guidance.specific_targets.map((t, i) => (
                      <div key={i} className="bg-secondary/50 rounded-md p-3">
                        <div className="text-xs text-muted-foreground">{t.metric}</div>
                        <div className="text-sm font-semibold text-foreground">{t.target}</div>
                        {t.detail && <div className="text-xs text-muted-foreground mt-1">{t.detail}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Management Tone */}
        <div className="bg-card/60 rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Management Tone</h2>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-3xl">{getToneEmoji(analysis.mgmt_tone)}</span>
            <div>
              <div className="font-semibold text-foreground">{analysis.mgmt_tone ?? "N/A"}</div>
              <div className="text-sm text-muted-foreground">
                Confidence: {analysis.mgmt_confidence != null ? `${(analysis.mgmt_confidence * 100).toFixed(0)}%` : "N/A"}
              </div>
            </div>
          </div>
          {toneEvidence.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Evidence</div>
              <ul className="space-y-1">
                {toneEvidence.map((e, i) => (
                  <li key={i} className="text-sm text-muted-foreground">• {e}</li>
                ))}
              </ul>
            </div>
          )}
          {dodgedQuestions.length > 0 && (
            <div>
              <div className="text-xs text-amber uppercase tracking-wider mb-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Dodged Questions
              </div>
              <ul className="space-y-1">
                {dodgedQuestions.map((q, i) => (
                  <li key={i} className="text-sm text-amber/80 bg-amber-muted/50 rounded-md p-2">{q}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Risks */}
        {risks.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 text-foreground">Risks</h2>
            <div className="space-y-2">
              {risks.map((r, i) => (
                <div key={i} className="bg-card/60 rounded-lg border border-border p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-amber" />
                    <span className="text-sm font-medium text-foreground">{r.risk}</span>
                    <Badge variant="outline" className="text-xs">{r.severity}</Badge>
                    <Badge variant="outline" className="text-xs">{r.probability}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">{r.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Watchlist */}
        {watchlist.length > 0 && (
          <div className="bg-purple-muted/50 rounded-lg border border-purple/30 p-6">
            <h2 className="text-lg font-semibold mb-3 text-purple flex items-center gap-2">
              <Eye className="h-5 w-5" /> Next Quarter Watchlist
            </h2>
            <ul className="space-y-2">
              {watchlist.map((w, i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                  <span className="text-purple shrink-0">▸</span> {w}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Source Links */}
        <div className="flex flex-wrap gap-3">
          {analysis.transcript_url && (
            <a href={analysis.transcript_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline bg-card/60 rounded-lg border border-border px-4 py-2">
              <ExternalLink className="h-4 w-4" /> Raw Transcript
            </a>
          )}
          {analysis.ppt_url && (
            <a href={analysis.ppt_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline bg-card/60 rounded-lg border border-border px-4 py-2">
              <ExternalLink className="h-4 w-4" /> Investor PPT
            </a>
          )}
          {analysis.recording_url && (
            <a href={analysis.recording_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline bg-card/60 rounded-lg border border-border px-4 py-2">
              <ExternalLink className="h-4 w-4" /> Recording
            </a>
          )}
        </div>
      </main>
    </div>
  );
};

export default CompanyDetail;
