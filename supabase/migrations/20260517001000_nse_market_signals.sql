create table if not exists public.corporate_announcements (
  id uuid default gen_random_uuid() primary key,
  uid text not null unique,
  provider text not null default 'nse',
  symbol text not null,
  company_name text,
  subject text,
  details text,
  broadcast_at timestamptz,
  attachment_url text,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.announcement_signals (
  id uuid default gen_random_uuid() primary key,
  announcement_uid text not null references public.corporate_announcements(uid) on delete cascade,
  symbol text not null,
  company_name text,
  event_type text not null default 'general',
  headline text not null,
  event_date timestamptz,
  order_value_text text,
  order_value_inr_cr numeric,
  counterparty text,
  materiality text not null default 'unknown'
    check (materiality in ('high','medium','low','unknown')),
  why_it_matters text,
  signal_score int not null default 0,
  confidence text not null default 'medium'
    check (confidence in ('high','medium','low')),
  source_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(announcement_uid, event_type)
);

create table if not exists public.daily_market_briefs (
  id uuid default gen_random_uuid() primary key,
  brief_date date not null unique,
  title text not null,
  summary text,
  top_signal_uids text[] not null default '{}'::text[],
  stats jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists corporate_announcements_symbol_date_idx
  on public.corporate_announcements(symbol, broadcast_at desc);
create index if not exists announcement_signals_score_idx
  on public.announcement_signals(signal_score desc, event_date desc);
create index if not exists announcement_signals_type_idx
  on public.announcement_signals(event_type, event_date desc);

alter table public.corporate_announcements enable row level security;
alter table public.announcement_signals enable row level security;
alter table public.daily_market_briefs enable row level security;

create policy "Public can read corporate announcements"
  on public.corporate_announcements for select using (true);
create policy "Public can read announcement signals"
  on public.announcement_signals for select using (true);
create policy "Public can read daily market briefs"
  on public.daily_market_briefs for select using (true);

create policy "Service role can manage corporate announcements"
  on public.corporate_announcements for all using (auth.role() = 'service_role');
create policy "Service role can manage announcement signals"
  on public.announcement_signals for all using (auth.role() = 'service_role');
create policy "Service role can manage daily market briefs"
  on public.daily_market_briefs for all using (auth.role() = 'service_role');

comment on table public.announcement_signals is
  'Daily NSE-derived market signals for EarningsCanvas public market intelligence pages.';
