-- Layer 1: P&L vs Consensus.
-- Stores per-metric estimate vs actual + driver + caveats as a structured jsonb.

alter table public.earnings_analyses
  add column if not exists pnl_layer jsonb;

comment on column public.earnings_analyses.pnl_layer is
  'Layer 1 P&L vs Consensus: {metrics:[{metric,estimate,actual,surprise_pct,yoy_pct,qoq_pct,verdict,driver}], caveats:[string], verdict_oneliner:string}';

-- Update view to expose the new field
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
  ea.strategic_threads, ea.concall_qa,
  ea.headline_verdict_basis, ea.guidance_verdict,
  ea.estimate_revision_direction, ea.estimate_revision_magnitude,
  ea.estimate_revision_metric,
  ea.stock_reaction_pct, ea.stock_reaction_vs_index_pct, ea.stock_reaction_index_name,
  ea.three_things_that_mattered,
  ea.position_bias, ea.conviction,
  ea.next_catalyst_date, ea.next_catalyst_event,
  ea.rollup_verdict, ea.rollup_verdict_oneliner,
  ea.layer1_verdict, ea.layer2_verdict, ea.layer3_verdict, ea.layer4_verdict, ea.layer5_verdict,
  ea.pnl_layer
from public.earnings_season es
join public.companies c on c.id = es.company_id
left join public.earnings_analyses ea
  on ea.company_id = es.company_id and ea.quarter = es.quarter;
