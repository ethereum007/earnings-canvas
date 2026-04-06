
DROP VIEW IF EXISTS public.latest_analyses;
DROP VIEW IF EXISTS public.sentiment_rankings;

CREATE VIEW public.latest_analyses
WITH (security_invoker = true)
AS
SELECT DISTINCT ON (ea.company_id)
  c.symbol, c.name, c.sector, c.market_cap,
  ea.id, ea.company_id, ea.quarter, ea.transcript_date, ea.summary,
  ea.investment_signal, ea.signal_rationale, ea.key_numbers, ea.key_takeaways,
  ea.revenue_analysis, ea.margin_analysis, ea.guidance, ea.risks,
  ea.green_flags, ea.red_flags, ea.sentiment_score, ea.sentiment_label,
  ea.sentiment_components, ea.bull_case, ea.bear_case, ea.mgmt_tone,
  ea.mgmt_confidence, ea.tone_evidence, ea.dodged_questions,
  ea.next_quarter_watchlist, ea.transcript_url, ea.ppt_url,
  ea.recording_url, ea.raw_transcript, ea.screener_summary,
  ea.analysis_model, ea.analysis_cost_usd, ea.analyzed_at
FROM public.earnings_analyses ea
JOIN public.companies c ON c.id = ea.company_id
ORDER BY ea.company_id, ea.analyzed_at DESC;

CREATE VIEW public.sentiment_rankings
WITH (security_invoker = true)
AS
SELECT c.name, c.symbol, c.sector,
  ea.quarter, ea.sentiment_score, ea.sentiment_label,
  ea.investment_signal, ea.mgmt_tone, ea.summary
FROM public.earnings_analyses ea
JOIN public.companies c ON c.id = ea.company_id
ORDER BY ea.sentiment_score DESC NULLS LAST;
