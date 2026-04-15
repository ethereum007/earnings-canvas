-- Backfill earnings_season from existing earnings_analyses data.
-- Focuses on the last 3 quarters (Q1/Q2/Q3 FY2026) for immediate value.
-- Status is derived from investment_signal + sentiment_score since
-- we don't have historical estimate vs actual data.

-- Step 1: Normalize inconsistent quarter strings
update public.earnings_analyses
set quarter = 'Q3 FY2026'
where quarter = 'Q3FY26';

-- Step 2: Backfill earnings_season for the last 3 full quarters.
-- Status derivation:
--   BEAT   if investment_signal ~ 'BUY' or sentiment_score >= 7.5
--   MISS   if investment_signal ~ 'SELL' or sentiment_score < 4
--   IN LINE otherwise
insert into public.earnings_season (
  company_id,
  quarter,
  result_status,
  result_date,
  verdict_score,
  verdict_summary
)
select
  ea.company_id,
  ea.quarter,
  case
    when upper(coalesce(ea.investment_signal, '')) like '%BUY%'
         or coalesce(ea.sentiment_score, 0) >= 7.5 then 'BEAT'
    when upper(coalesce(ea.investment_signal, '')) like '%SELL%'
         or coalesce(ea.sentiment_score, 0) < 4 then 'MISS'
    else 'IN LINE'
  end as result_status,
  ea.transcript_date,
  ea.sentiment_score,  -- use sentiment_score as verdict_score stand-in
  ea.summary
from public.earnings_analyses ea
where ea.quarter in ('Q1 FY2026', 'Q2 FY2026', 'Q3 FY2026')
  and ea.company_id is not null
on conflict (company_id, quarter) do update set
  verdict_score = excluded.verdict_score,
  verdict_summary = excluded.verdict_summary,
  updated_at = now();

-- Helpful: view to list available quarters sorted by recency + row count
create or replace view public.earnings_quarters_available as
select
  quarter,
  count(*) as company_count,
  count(*) filter (where result_status = 'BEAT') as beats,
  count(*) filter (where result_status = 'MISS') as misses,
  count(*) filter (where result_status = 'IN LINE') as in_line,
  count(*) filter (where result_status = 'AWAITED') as awaited
from public.earnings_season
group by quarter
order by quarter desc;

comment on view public.earnings_quarters_available is 'Quarters that currently have rows in earnings_season, ordered newest first.';
