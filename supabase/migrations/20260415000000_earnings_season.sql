-- Earnings Season tracker table
-- Season-agnostic design — works for Q4 FY26, Q1 FY27, and every season after.
-- Companion to earnings_analyses (which holds the deep analysis).

create table if not exists public.earnings_season (
  id uuid default gen_random_uuid() primary key,
  company_id bigint references public.companies(id) on delete cascade,
  quarter text not null,  -- e.g. 'Q4 FY26'

  -- Scheduling
  result_date date,
  result_status text default 'AWAITED'
    check (result_status in ('BEAT','MISS','IN LINE','AWAITED')),

  -- Consensus estimates (pre-result)
  revenue_est numeric,
  pat_est numeric,
  ebitda_est numeric,
  ebit_margin_est numeric,

  -- Actuals (post-result)
  revenue_act numeric,
  pat_act numeric,
  ebitda_act numeric,
  ebit_margin_act numeric,

  -- YoY
  revenue_yoy_pct numeric,
  pat_yoy_pct numeric,

  -- Sector-specific KPIs (shape differs per sector)
  -- e.g. [{"label":"NIM","value":"8.2%","delta":"+30 bps","negative":false}, ...]
  sector_kpis jsonb default '[]'::jsonb,

  -- Quick verdict (deep narrative lives in earnings_analyses)
  verdict_score numeric check (verdict_score >= 0 and verdict_score <= 10),
  verdict_summary text,
  verdict_signals jsonb default '[]'::jsonb,
  beat_quality jsonb default '[]'::jsonb,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(company_id, quarter)
);

-- Indexes
create index if not exists earnings_season_quarter_idx on public.earnings_season(quarter);
create index if not exists earnings_season_status_idx on public.earnings_season(result_status);
create index if not exists earnings_season_date_idx on public.earnings_season(result_date);

-- updated_at trigger
create or replace function public.earnings_season_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists earnings_season_updated_at on public.earnings_season;
create trigger earnings_season_updated_at
  before update on public.earnings_season
  for each row execute function public.earnings_season_set_updated_at();

-- RLS: public read, service role write
alter table public.earnings_season enable row level security;

drop policy if exists "Public can read earnings_season" on public.earnings_season;
create policy "Public can read earnings_season"
  on public.earnings_season for select using (true);

drop policy if exists "Service role can write earnings_season" on public.earnings_season;
create policy "Service role can write earnings_season"
  on public.earnings_season for all using (auth.role() = 'service_role');

-- View: joins season row with deep analysis for /earnings drawer
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
  ea.bull_case,
  ea.bear_case,
  ea.key_takeaways,
  ea.guidance,
  ea.mgmt_tone,
  ea.mgmt_confidence,
  ea.sentiment_score,
  ea.sentiment_label,
  ea.investment_signal,
  ea.signal_rationale,
  ea.risks,
  ea.green_flags,
  ea.red_flags,
  ea.key_numbers,
  ea.margin_analysis,
  ea.revenue_analysis,
  ea.summary as analysis_summary,
  ea.tone_evidence,
  ea.dodged_questions,
  ea.next_quarter_watchlist,
  ea.transcript_url,
  ea.recording_url,
  ea.ppt_url
from public.earnings_season es
join public.companies c on c.id = es.company_id
left join public.earnings_analyses ea
  on ea.company_id = es.company_id and ea.quarter = es.quarter;

-- View: header stats per quarter
create or replace view public.earnings_season_summary as
select
  quarter,
  count(*) as total_companies,
  count(*) filter (where result_status = 'BEAT') as beats,
  count(*) filter (where result_status = 'MISS') as misses,
  count(*) filter (where result_status = 'IN LINE') as in_line,
  count(*) filter (where result_status = 'AWAITED') as awaited,
  round(
    avg(
      case
        when pat_act is not null and pat_est is not null and pat_est <> 0
        then ((pat_act - pat_est) / pat_est) * 100
      end
    ), 1
  ) as avg_pat_surprise_pct
from public.earnings_season
group by quarter;

comment on table public.earnings_season is 'Season tracker: consensus estimates + actuals + quick verdict per company per quarter. Deep narrative lives in earnings_analyses.';
