-- Strategic threads (causal "connect-the-dots" chains) + structured concall Q&A.
-- This is the institutional-grade synthesis layer that distinguishes
-- EarningsCanvas from data dashboards.

alter table public.earnings_analyses
  add column if not exists strategic_threads jsonb default '[]'::jsonb,
  add column if not exists concall_qa        jsonb default '[]'::jsonb;

comment on column public.earnings_analyses.strategic_threads is
  'Causal chains: [{title, category, the_move, evidence, evidence_speaker, forward_read, impact_horizon, segments_affected, hindrances, next_q_check, confidence}]';
comment on column public.earnings_analyses.concall_qa is
  'Structured concall Q&A with deflection/tonal flags + EC interpretation: [{analyst_name, brokerage, question_theme, question_full, mgmt_speaker, mgmt_answer, deflection_flag, tonal_read, ec_interpretation, what_they_didnt_say}]';

-- Update view to expose them
create or replace view public.earnings_season_with_analysis as
select
  es.id, es.quarter, es.result_date, es.result_status,
  es.revenue_est, es.pat_est, es.ebitda_est, es.ebit_margin_est,
  es.revenue_act, es.pat_act, es.ebitda_act, es.ebit_margin_act,
  es.revenue_yoy_pct, es.pat_yoy_pct,
  es.sector_kpis,
  es.verdict_score, es.verdict_summary, es.verdict_signals, es.beat_quality,
  es.updated_at,
  c.id as company_id, c.symbol, c.name as company, c.sector, c.market_cap,
  ea.bull_case, ea.bear_case, ea.key_takeaways, ea.guidance,
  ea.mgmt_tone, ea.mgmt_confidence, ea.sentiment_score, ea.sentiment_label,
  ea.investment_signal, ea.signal_rationale,
  ea.risks, ea.green_flags, ea.red_flags,
  ea.key_numbers, ea.margin_analysis, ea.revenue_analysis,
  ea.summary as analysis_summary,
  ea.tone_evidence, ea.dodged_questions, ea.next_quarter_watchlist,
  ea.transcript_url, ea.recording_url, ea.ppt_url,
  ea.report_highlights, ea.annual_context, ea.segments,
  ea.segment_narratives, ea.key_quotes, ea.sector_echo,
  ea.trade_idea, ea.recent_announcements, ea.long_form_intro,
  ea.bottom_line, ea.distribution_copy,
  ea.strategic_threads, ea.concall_qa
from public.earnings_season es
join public.companies c on c.id = es.company_id
left join public.earnings_analyses ea
  on ea.company_id = es.company_id and ea.quarter = es.quarter;
