-- Snapshot Card v1: institutional 90-second-view system.
-- 14 new fields on earnings_analyses + view update.

alter table public.earnings_analyses
  -- Headline qualifier (Beat/Miss already on earnings_season.result_status)
  add column if not exists headline_verdict_basis text
    check (headline_verdict_basis in ('OPERATIONAL', 'REPORTED')),

  -- Guidance read
  add column if not exists guidance_verdict text
    check (guidance_verdict in ('RAISED', 'MAINTAINED', 'CUT', 'WITHDRAWN', 'NOT_GIVEN')),

  -- Sell-side estimate revision direction post-results
  add column if not exists estimate_revision_direction text
    check (estimate_revision_direction in ('UP', 'FLAT', 'DOWN')),
  add column if not exists estimate_revision_magnitude text
    check (estimate_revision_magnitude in ('LT_2', '2_TO_5', 'GT_5')),
  add column if not exists estimate_revision_metric text default 'FY+1 EPS',

  -- T+1 stock reaction
  add column if not exists stock_reaction_pct numeric(6,2),
  add column if not exists stock_reaction_vs_index_pct numeric(6,2),
  add column if not exists stock_reaction_index_name text,

  -- Top-3 takeaways (max 3 items, each <= 12 words for snapshot density)
  add column if not exists three_things_that_mattered jsonb,

  -- Actionable position view
  add column if not exists position_bias text
    check (position_bias in ('BUY', 'ADD', 'HOLD', 'REDUCE', 'SELL', 'UNDER_REVIEW')),
  add column if not exists conviction text
    check (conviction in ('HIGH', 'MEDIUM', 'LOW')),

  -- Next catalyst pointer
  add column if not exists next_catalyst_date date,
  add column if not exists next_catalyst_event text,

  -- Rollup verdict (top-of-card)
  add column if not exists rollup_verdict text
    check (rollup_verdict in ('POSITIVE', 'MIXED', 'NEGATIVE', 'NEUTRAL')),
  add column if not exists rollup_verdict_oneliner text,

  -- Per-layer verdicts (cascaded from layer modules — to be wired in later sprints)
  add column if not exists layer1_verdict text
    check (layer1_verdict in ('POSITIVE', 'MIXED', 'NEGATIVE', 'NEUTRAL')),
  add column if not exists layer2_verdict text
    check (layer2_verdict in ('POSITIVE', 'MIXED', 'NEGATIVE', 'NEUTRAL')),
  add column if not exists layer3_verdict text
    check (layer3_verdict in ('POSITIVE', 'MIXED', 'NEGATIVE', 'NEUTRAL')),
  add column if not exists layer4_verdict text
    check (layer4_verdict in ('POSITIVE', 'MIXED', 'NEGATIVE', 'NEUTRAL')),
  add column if not exists layer5_verdict text
    check (layer5_verdict in ('POSITIVE', 'MIXED', 'NEGATIVE', 'NEUTRAL'));

comment on column public.earnings_analyses.headline_verdict_basis is 'OPERATIONAL = Adj/Underlying basis; REPORTED = headline GAAP';
comment on column public.earnings_analyses.three_things_that_mattered is 'Snapshot top-3 takeaways. Array of <=3 strings, each <=12 words.';
comment on column public.earnings_analyses.position_bias is 'Actionable view: BUY|ADD|HOLD|REDUCE|SELL|UNDER_REVIEW';
comment on column public.earnings_analyses.conviction is 'Strength of position_bias: HIGH|MEDIUM|LOW';
comment on column public.earnings_analyses.rollup_verdict is 'Snapshot rollup tone: POSITIVE|MIXED|NEGATIVE|NEUTRAL';

-- Update join view to expose all snapshot fields
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
  -- Snapshot card fields
  ea.headline_verdict_basis,
  ea.guidance_verdict,
  ea.estimate_revision_direction,
  ea.estimate_revision_magnitude,
  ea.estimate_revision_metric,
  ea.stock_reaction_pct,
  ea.stock_reaction_vs_index_pct,
  ea.stock_reaction_index_name,
  ea.three_things_that_mattered,
  ea.position_bias,
  ea.conviction,
  ea.next_catalyst_date,
  ea.next_catalyst_event,
  ea.rollup_verdict,
  ea.rollup_verdict_oneliner,
  ea.layer1_verdict,
  ea.layer2_verdict,
  ea.layer3_verdict,
  ea.layer4_verdict,
  ea.layer5_verdict
from public.earnings_season es
join public.companies c on c.id = es.company_id
left join public.earnings_analyses ea
  on ea.company_id = es.company_id and ea.quarter = es.quarter;
