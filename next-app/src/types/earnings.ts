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

export interface SegmentNarrative {
  segment: string;
  label?: string;
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

export interface SeasonSummary {
  quarter: string;
  total_companies: number;
  beats: number;
  misses: number;
  in_line: number;
  awaited: number;
  avg_pat_surprise_pct: number | null;
}
