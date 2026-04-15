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
