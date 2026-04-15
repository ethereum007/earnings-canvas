# EarningsCanvas — Next.js 14

Server-rendered Next.js 14 app. Lives alongside the Vite SPA while we migrate.

## Dev

```bash
cd next-app
npm install
npm run dev
```

Requires `.env.local` — copy `.env.example` and fill in Supabase credentials.

## Routes

- `/` — landing (placeholder, port from Vite `Dashboard.tsx` in Phase 3)
- `/earnings` — Q4 FY26 season tracker (SSR + ISR 5 min)
- `/policy` — placeholder (port from Vite `PolicyAlpha.tsx` in Phase 3)
- `/api/og/earnings` — edge OG image generator for LinkedIn share cards

## Database

Reads from the shared Supabase project (`pnmioozueiudekegjbql`).

Tables/views used:
- `earnings_season` — per-company-per-quarter season tracker
- `earnings_season_with_analysis` — view joining `earnings_season` + `companies` + `earnings_analyses`
- `earnings_season_summary` — view with quarter-level aggregates

Migration to create these: `supabase/migrations/20260415000000_earnings_season.sql`

## Deploy

Vercel auto-deploys from `main`. Set env vars in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

Set Vercel **Root Directory** to `next-app` if deploying this folder separately.
