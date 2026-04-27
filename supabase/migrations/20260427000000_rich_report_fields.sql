-- Rich report fields for the new long-form analysis page format.
-- All fields are nullable / default empty so existing rows stay valid.

alter table public.earnings_analyses
  add column if not exists report_highlights    jsonb default '[]'::jsonb,
  add column if not exists annual_context       jsonb,
  add column if not exists segments             jsonb default '[]'::jsonb,
  add column if not exists segment_narratives   jsonb default '[]'::jsonb,
  add column if not exists key_quotes           jsonb default '[]'::jsonb,
  add column if not exists sector_echo          jsonb default '[]'::jsonb,
  add column if not exists trade_idea           jsonb,
  add column if not exists recent_announcements jsonb default '[]'::jsonb,
  add column if not exists long_form_intro      text;

comment on column public.earnings_analyses.report_highlights is
  '60-second-read: array of {kind: worked|broke|disclosure|capital, text: string}';
comment on column public.earnings_analyses.annual_context is
  'Full FY context alongside the quarter: {fiscal_year, label, metrics: [...], caveat}';
comment on column public.earnings_analyses.segments is
  'Segment scorecard rows: [{name, ebitda, yoy_pct, color, note}]';
comment on column public.earnings_analyses.segment_narratives is
  'Per-segment deep dives (markdown body): [{segment, label, body_md}]';
comment on column public.earnings_analyses.key_quotes is
  'Mgmt quotes: [{speaker, title, quote, interpretation}]';
comment on column public.earnings_analyses.sector_echo is
  'Read-across stocks: [{ticker, name, color, note}]';
comment on column public.earnings_analyses.trade_idea is
  'Structured trade view: {setup, entry, stop_loss, targets:[...], risk_reward, sizing, hedge, view_horizon, verify_levels}';
comment on column public.earnings_analyses.recent_announcements is
  'NSE timeline: [{date, text}]';
comment on column public.earnings_analyses.long_form_intro is
  'Markdown prose for TL;DR / interpretation paragraphs';

-- Update join view to expose new fields to /company pages.
create or replace view public.earnings_season_with_analysis as
select
  es.id,
  es.quarter,
  es.result_date,
  es.result_status,
  es.revenue_est, es.pat_est, es.ebitda_est, es.ebit_margin_est,
  es.revenue_act, es.pat_act, es.ebitda_act, es.ebit_margin_act,
  es.revenue_yoy_pct, es.pat_yoy_pct,
  es.sector_kpis,
  es.verdict_score, es.verdict_summary, es.verdict_signals, es.beat_quality,
  es.updated_at,
  c.id as company_id,
  c.symbol,
  c.name as company,
  c.sector,
  c.market_cap,
  ea.bull_case, ea.bear_case,
  ea.key_takeaways, ea.guidance,
  ea.mgmt_tone, ea.mgmt_confidence,
  ea.sentiment_score, ea.sentiment_label,
  ea.investment_signal, ea.signal_rationale,
  ea.risks, ea.green_flags, ea.red_flags,
  ea.key_numbers, ea.margin_analysis, ea.revenue_analysis,
  ea.summary as analysis_summary,
  ea.tone_evidence, ea.dodged_questions, ea.next_quarter_watchlist,
  ea.transcript_url, ea.recording_url, ea.ppt_url,
  -- Rich report fields
  ea.report_highlights,
  ea.annual_context,
  ea.segments,
  ea.segment_narratives,
  ea.key_quotes,
  ea.sector_echo,
  ea.trade_idea,
  ea.recent_announcements,
  ea.long_form_intro
from public.earnings_season es
join public.companies c on c.id = es.company_id
left join public.earnings_analyses ea
  on ea.company_id = es.company_id and ea.quarter = es.quarter;
