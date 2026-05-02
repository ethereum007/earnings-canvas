export type ResultStatus = "BEAT" | "MISS" | "IN LINE" | "AWAITED";

export interface SectorKPI {
  label: string;
  value: string;
  delta: string;
  negative: boolean;
}

export interface VerdictSignal {
  color: "green" | "red" | "amber" | "blue" | "gray";
  text: string;
}

export interface BeatQualityItem {
  ok: boolean;
  text: string;
}

/** Row of the earnings_season_with_analysis view. */
export interface EarningsSeasonRow {
  id: string;
  quarter: string;
  result_date: string | null;
  result_status: ResultStatus;

  // Estimates + actuals
  revenue_est: number | null;
  pat_est: number | null;
  ebitda_est: number | null;
  ebit_margin_est: number | null;
  revenue_act: number | null;
  pat_act: number | null;
  ebitda_act: number | null;
  ebit_margin_act: number | null;

  // YoY
  revenue_yoy_pct: number | null;
  pat_yoy_pct: number | null;

  // Sector KPIs + verdict
  sector_kpis: SectorKPI[];
  verdict_score: number | null;
  verdict_summary: string | null;
  verdict_signals: VerdictSignal[];
  beat_quality: BeatQualityItem[];

  updated_at: string;

  // From companies
  company_id: number;
  symbol: string;
  company: string;
  sector: string | null;
  market_cap: string | null;

  // From earnings_analyses (nullable — may not exist yet)
  bull_case: string | null;
  bear_case: string | null;
  key_takeaways: unknown;
  guidance: unknown;
  mgmt_tone: string | null;
  mgmt_confidence: number | null;
  sentiment_score: number | null;
  sentiment_label: string | null;
  investment_signal: string | null;
  signal_rationale: string | null;
  risks: unknown;
  green_flags: unknown;
  red_flags: unknown;
  key_numbers: unknown;
  margin_analysis: unknown;
  revenue_analysis: unknown;
  analysis_summary: string | null;
  tone_evidence: unknown;
  dodged_questions: unknown;
  next_quarter_watchlist: unknown;
  transcript_url: string | null;
  recording_url: string | null;
  ppt_url: string | null;

  // Rich report fields (Phase 2A+) — null/empty for legacy rows
  report_highlights?: ReportHighlight[] | null;
  annual_context?: AnnualContext | null;
  segments?: SegmentRow[] | null;
  segment_narratives?: SegmentNarrative[] | null;
  key_quotes?: KeyQuote[] | null;
  sector_echo?: SectorEchoItem[] | null;
  trade_idea?: TradeIdea | null;
  recent_announcements?: Announcement[] | null;
  long_form_intro?: string | null;
  bottom_line?: BottomLineItem[] | null;
  distribution_copy?: DistributionCopy | null;
  strategic_threads?: StrategicThread[] | null;
  concall_qa?: ConcallQAItem[] | null;

  // Snapshot card fields (v1 institutional system)
  headline_verdict_basis?: HeadlineVerdictBasis | null;
  guidance_verdict?: GuidanceVerdict | null;
  estimate_revision_direction?: EstimateDirection | null;
  estimate_revision_magnitude?: EstimateMagnitude | null;
  estimate_revision_metric?: string | null;
  stock_reaction_pct?: number | null;
  stock_reaction_vs_index_pct?: number | null;
  stock_reaction_index_name?: string | null;
  three_things_that_mattered?: string[] | null;
  position_bias?: PositionBias | null;
  conviction?: ConvictionLevel | null;
  next_catalyst_date?: string | null;
  next_catalyst_event?: string | null;
  rollup_verdict?: LayerVerdict | null;
  rollup_verdict_oneliner?: string | null;
  layer1_verdict?: LayerVerdict | null;
  layer2_verdict?: LayerVerdict | null;
  layer3_verdict?: LayerVerdict | null;
  layer4_verdict?: LayerVerdict | null;
  layer5_verdict?: LayerVerdict | null;
}

// ───── Rich report types (Phase 2A+) ─────

export type HighlightKind = "worked" | "broke" | "disclosure" | "capital";

export interface ReportHighlight {
  kind: HighlightKind;
  text: string;
}

export interface AnnualContextMetric {
  label: string;
  value: string;
  yoy_pct?: number;
}

export interface AnnualContext {
  fiscal_year: string;
  label?: string;
  metrics: AnnualContextMetric[];
  caveat?: string;
}

export type SegmentColor = "green" | "red" | "amber" | "gray";

export interface SegmentRow {
  name: string;
  ebitda: string;
  yoy_pct?: number;
  color: SegmentColor;
  note?: string;
}

export interface SegmentKeyStat {
  label: string;
  value: string;
  sub?: string;        // e.g. '+36 Mn YoY'
  positive?: boolean;  // colors the sub-line
}

export interface SegmentNarrative {
  segment: string;
  label?: string;
  key_stats?: SegmentKeyStat[]; // 3-up giant stat blocks above the prose
  body_md: string;
}

export interface KeyQuote {
  speaker: string;
  title?: string;
  quote: string;
  interpretation?: string;
}

export interface SectorEchoItem {
  ticker: string;
  name?: string;
  color: "green" | "red" | "amber";
  note: string;
}

export interface TradeIdeaTarget {
  price: string;
  upside_pct?: number;
  catalyst?: string;
}

export interface TradeIdea {
  setup: string;
  entry: string;
  stop_loss: string;
  targets: TradeIdeaTarget[];
  risk_reward?: string;
  sizing?: string;
  hedge?: string;
  view_horizon?: string;
  verify_levels?: boolean;
}

export interface Announcement {
  date: string;
  text: string;
}

export interface BottomLineItem {
  emoji: string;
  text: string;
}

export interface DistributionCopy {
  twitter?: string[];   // array of tweets in thread order
  linkedin?: string;    // single long-form post (markdown allowed)
  whatsapp?: string;    // single broadcast snippet
}

// ───── Strategic threads (causal chains) ─────

export type ThreadCategory =
  | "capital"
  | "product"
  | "m&a"
  | "pricing"
  | "capex"
  | "regulatory"
  | "partnership"
  | "other";

export type ImpactHorizon = "0-3m" | "3-6m" | "6-12m" | "12-24m" | "24m+";

export type Confidence = "high" | "medium" | "low";

export interface StrategicThread {
  title: string;
  category: ThreadCategory;
  the_move: string;
  evidence: string;
  evidence_speaker?: string;
  forward_read: string;
  impact_horizon: ImpactHorizon;
  segments_affected: string[];
  hindrances: string[];
  next_q_check: string;
  confidence: Confidence;
}

// ───── Structured concall Q&A ─────

export type TonalRead =
  | "defensive"
  | "promotional"
  | "measured"
  | "evasive"
  | "confident";

export interface ConcallQAItem {
  analyst_name?: string;
  brokerage?: string;
  question_theme: string;        // paraphrased question
  question_full?: string;
  mgmt_speaker: string;
  mgmt_answer: string;            // paraphrased answer
  deflection_flag?: string;       // what they avoided
  tonal_read?: TonalRead;
  ec_interpretation: string;      // our analyst read
  what_they_didnt_say?: string;
}

// ───── Snapshot Card system (v1 institutional 90-second view) ─────

export type HeadlineVerdict = "BEAT" | "IN LINE" | "MISS" | "AWAITED";
export type HeadlineVerdictBasis = "OPERATIONAL" | "REPORTED";
export type GuidanceVerdict =
  | "RAISED"
  | "MAINTAINED"
  | "CUT"
  | "WITHDRAWN"
  | "NOT_GIVEN";
export type EstimateDirection = "UP" | "FLAT" | "DOWN";
export type EstimateMagnitude = "LT_2" | "2_TO_5" | "GT_5";
export type PositionBias =
  | "BUY"
  | "ADD"
  | "HOLD"
  | "REDUCE"
  | "SELL"
  | "UNDER_REVIEW";
export type ConvictionLevel = "HIGH" | "MEDIUM" | "LOW";
export type LayerVerdict = "POSITIVE" | "MIXED" | "NEGATIVE" | "NEUTRAL";

export interface SnapshotData {
  // identity (from companies + earnings_season)
  symbol: string;
  company: string;
  sector: string | null;
  market_cap: string | null;
  quarter: string;
  result_date: string | null;

  // core verdicts
  headline_verdict: HeadlineVerdict; // sourced from earnings_season.result_status
  headline_verdict_basis: HeadlineVerdictBasis | null;
  guidance_verdict: GuidanceVerdict | null;

  // estimate revision (post-results)
  estimate_revision_direction: EstimateDirection | null;
  estimate_revision_magnitude: EstimateMagnitude | null;
  estimate_revision_metric: string | null;

  // T+1 stock reaction
  stock_reaction_pct: number | null;
  stock_reaction_vs_index_pct: number | null;
  stock_reaction_index_name: string | null;

  // top-3 takeaways
  three_things_that_mattered: string[] | null;

  // actionable position
  position_bias: PositionBias | null;
  conviction: ConvictionLevel | null;

  // next catalyst
  next_catalyst_date: string | null;
  next_catalyst_event: string | null;

  // rollup
  rollup_verdict: LayerVerdict | null;
  rollup_verdict_oneliner: string | null;

  // layer verdicts (for future cascading)
  layer1_verdict?: LayerVerdict | null;
  layer2_verdict?: LayerVerdict | null;
  layer3_verdict?: LayerVerdict | null;
  layer4_verdict?: LayerVerdict | null;
  layer5_verdict?: LayerVerdict | null;
}

// Tailwind class config per verdict tone (using our zinc/emerald scheme)
export const LAYER_VERDICT_CONFIG: Record<
  LayerVerdict,
  {
    emoji: string;
    label: string;
    bg: string;
    text: string;
    border: string;
    dot: string;
  }
> = {
  POSITIVE: {
    emoji: "🟢",
    label: "Positive",
    bg: "bg-emerald-400/10",
    text: "text-emerald-400",
    border: "border-emerald-400/30",
    dot: "bg-emerald-400",
  },
  MIXED: {
    emoji: "🟡",
    label: "Mixed",
    bg: "bg-amber-400/10",
    text: "text-amber-400",
    border: "border-amber-400/30",
    dot: "bg-amber-400",
  },
  NEGATIVE: {
    emoji: "🔴",
    label: "Negative",
    bg: "bg-red-400/10",
    text: "text-red-400",
    border: "border-red-400/30",
    dot: "bg-red-400",
  },
  NEUTRAL: {
    emoji: "⚪",
    label: "Neutral",
    bg: "bg-zinc-500/10",
    text: "text-zinc-300",
    border: "border-zinc-500/30",
    dot: "bg-zinc-500",
  },
};

export interface SeasonSummary {
  quarter: string;
  total_companies: number;
  beats: number;
  misses: number;
  in_line: number;
  awaited: number;
  avg_pat_surprise_pct: number | null;
}
