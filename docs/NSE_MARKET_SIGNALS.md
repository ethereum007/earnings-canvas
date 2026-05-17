# NSE Market Signals Automation

This adds a daily NSE corporate-announcement intelligence layer to EarningsCanvas.

## What was added

- Supabase migration: `supabase/migrations/20260517001000_nse_market_signals.sql`
- Daily runner: `scripts/run_nse_market_signals.py`
- Public page: `/market-signals`

## Apply the database migration

Apply the migration through the Supabase dashboard SQL editor or your Supabase CLI:

```bash
supabase db push
```

The migration creates:

- `corporate_announcements`
- `announcement_signals`
- `daily_market_briefs`

Public users can read these tables. Only the service role can write to them.

## Run locally

Dry run:

```bash
python scripts/run_nse_market_signals.py --from-date 15-05-2026 --to-date 17-05-2026 --dry-run
```

Publish to Supabase:

```bash
set SUPABASE_URL=...
set SUPABASE_SERVICE_ROLE_KEY=...
python scripts/run_nse_market_signals.py --days 1
```

## Cron schedule

Recommended IST schedule:

```cron
30 8 * * 1-5 cd /app/earnings-canvas && python scripts/run_nse_market_signals.py --days 1
0 12 * * 1-5 cd /app/earnings-canvas && python scripts/run_nse_market_signals.py --days 1
45 15 * * 1-5 cd /app/earnings-canvas && python scripts/run_nse_market_signals.py --days 1
30 20 * * 1-5 cd /app/earnings-canvas && python scripts/run_nse_market_signals.py --days 1
```

Use a VPS, GitHub Actions schedule, or another backend worker. A backend worker is better than a
browser/Vercel function because NSE session handling and PDF extraction can be heavier than a normal
frontend request.

## Website

The page is available at:

```text
/market-signals
```

It reads from `announcement_signals` and shows event filters, scores, materiality, disclosed order
values, and source links.
