-- Fix derived result_status: sentiment_score is on 0-1 scale, not 0-10.
-- Also prefer investment_signal when available (cleaner semantics).

update public.earnings_season es
set result_status = case
  when upper(coalesce(ea.investment_signal, '')) like '%BUY%' then 'BEAT'
  when upper(coalesce(ea.investment_signal, '')) like '%SELL%' then 'MISS'
  when upper(coalesce(ea.investment_signal, '')) like '%HOLD%' then 'IN LINE'
  when coalesce(ea.sentiment_score, 0) >= 0.75 then 'BEAT'
  when coalesce(ea.sentiment_score, 0) > 0
       and coalesce(ea.sentiment_score, 1) < 0.4 then 'MISS'
  else 'IN LINE'
end
from public.earnings_analyses ea
where es.company_id = ea.company_id
  and es.quarter = ea.quarter
  and es.quarter in ('Q1 FY2026', 'Q2 FY2026', 'Q3 FY2026');
