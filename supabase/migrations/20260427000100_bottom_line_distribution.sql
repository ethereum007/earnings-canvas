-- Final canonical-structure fields:
--   bottom_line      — 4-emoji recap shown at the end of every page
--   distribution_copy — pre-written Twitter / LinkedIn / WhatsApp text

alter table public.earnings_analyses
  add column if not exists bottom_line       jsonb default '[]'::jsonb,
  add column if not exists distribution_copy jsonb;

comment on column public.earnings_analyses.bottom_line is
  '4 emoji-bullets recap: [{emoji, text}]';
comment on column public.earnings_analyses.distribution_copy is
  'Ready-to-paste social: {twitter: [...tweets], linkedin: "...", whatsapp: "..."}';

-- Update view to expose
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
  ea.bottom_line, ea.distribution_copy
from public.earnings_season es
join public.companies c on c.id = es.company_id
left join public.earnings_analyses ea
  on ea.company_id = es.company_id and ea.quarter = es.quarter;
