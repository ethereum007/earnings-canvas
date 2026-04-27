# EarningsCanvas — Project Context

> Read this first when resuming work. Last updated: 2026-04-15.

## What this project is

India earnings intelligence platform — Goldman-grade earnings analysis for the retail + institutional audience. Dark editorial design (Bloomberg Terminal × FT dark mode).

Domain: **earningscanvas.in**
Repo: **github.com/ethereum007/earnings-canvas**
Supabase: **pnmioozueiudekegjbql**

## Current architecture — HYBRID

Two apps coexist in this repo while migrating:

```
repo/
├── src/            ← OLD Vite SPA (Lovable-generated, still serves production)
├── next-app/       ← NEW Next.js 14 app (season tracker lives here)
└── supabase/migrations/
```

Two Vercel projects, one repo:
- `earnings-canvas` — Vite SPA (root dir)
- `earnings-canvas-next` — Next.js 14 (root dir: `next-app`)

## Why Next.js for `/earnings`

- SSR for SEO ("TCS Q3 FY26 results" → ranks)
- ISR 5min caching (cheap, fast)
- Edge OG image route for LinkedIn share cards
- Old SPA kept alive so no regression while we migrate one route at a time

## Database

### Existing tables (from Vite era)
- `companies` — symbol, name, sector, screener_slug, market_cap
- `earnings_analyses` — rich deep-dive per (company, quarter): bull_case, bear_case,
  key_takeaways, guidance, mgmt_tone, mgmt_confidence, sentiment_score,
  investment_signal, signal_rationale, risks, green_flags, red_flags, key_numbers,
  margin_analysis, revenue_analysis, summary, tone_evidence, etc.
  - **Scale gotcha:** `sentiment_score` and `mgmt_confidence` are **0-1**, not 0-10.
    Display code auto-rescales.
- `latest_analyses`, `sentiment_rankings` — views

### New tables/views (Phase 2 migrations)
- `earnings_season` — per-company-per-quarter season tracker
  - Holds consensus estimates (revenue_est, pat_est, etc.) + actuals + derived status
  - Sector KPIs as jsonb
  - One row per (company_id, quarter) unique constraint
- `earnings_season_with_analysis` — view joining season + companies + analyses
  (single query powers the 4-tab drawer)
- `earnings_season_summary` — header stats per quarter
- `earnings_quarters_available` — drives the dynamic quarter selector

### Data state as of last session
- 85 rows in `earnings_season` across Q1/Q2/Q3 FY2026 (backfilled from `earnings_analyses`)
- Q4 FY2026 has 2 rows in `earnings_analyses`, none yet in `earnings_season`
- Quarter format normalized to `"Q1 FY2026"` (space, full year). Any `"Q3FY26"` outliers
  were fixed in migration 20260415000100.

## Next.js app file map (`next-app/src/`)

```
app/
  layout.tsx              Navbar, Inter font, dark theme
  page.tsx                Landing (placeholder, port from Vite Dashboard.tsx later)
  policy/page.tsx         Placeholder (port from Vite PolicyAlpha.tsx later)
  earnings/page.tsx       SSR, ISR 5min, reads searchParams.q for quarter
  api/og/earnings/        Edge runtime OG image generator
components/
  Navbar.tsx
  earnings/
    SeasonStatsBar.tsx    Header stats grid
    QuarterSelector.tsx   Tab pills (Q3, Q2, Q1)
    EarningsGrid.tsx      "Reported" and "Awaited" sections (client component)
    EarningsCard.tsx      Hoverable card, opens drawer
    EarningsDetailDrawer.tsx  Right-side slide-in with 4 tabs
    tabs/
      TabPrint.tsx        P&L scorecard (Revenue/PAT/EBITDA/Margin est vs act)
      TabKPI.tsx           Sector KPIs grid (renders sector_kpis jsonb)
      TabMgmt.tsx          Mgmt tone + key_takeaways + guidance (defensive JSON parse)
      TabVerdict.tsx       Score gauge + signal + bull/bear + flags + risks
lib/
  utils.ts                cn, calcPctSurprise, formatCr, color helpers
  supabase/
    server.ts             SSR cookie-aware client (for server components)
    admin.ts              Service-role client (server-only, bypasses RLS)
    client.ts             Browser client (for client components)
types/
  earnings.ts             EarningsSeasonRow, SeasonSummary, SectorKPI, etc.
```

## Commit history on `main`

1. `b3d9dc8` — Initial Next.js 14 scaffold + 2 migrations (schema + backfill)
2. `6e061be` — Fix score/confidence 0-1 scale rendering + status derivation

## Known bugs / rough edges

- **Archived quarters** show "—" for Revenue/PAT/Margin surprise (no estimate data
  existed pre-Q4 FY26). Acceptable — that P&L scorecard lights up for Q4 onwards.
- **Sector KPIs tab empty for archived data** — not in `earnings_analyses`.
- **Status on archived rows is derived** from `investment_signal` or sentiment_score:
  BUY→BEAT, SELL→MISS, HOLD→IN LINE, else fallback to sentiment thresholds
  (>=0.75 BEAT, <0.4 MISS). Not a real beat-vs-consensus comparison.

## Running locally

```bash
cd next-app
npm install
npm run dev -- -p 3001    # port 3000 is taken by another local project
# http://localhost:3001/earnings
```

`.env.local` is committed to `.gitignore` but exists locally with all 4 keys.

## Deploys

Auto on `git push origin main` → both Vercel projects redeploy. Next.js project
takes ~1 min. No action needed post-push unless build fails.

## Roadmap (pick up from here)

Priority order:

### Phase 2A — `/company/[symbol]/[quarter]` routes (RECOMMENDED NEXT)
- Full-page version of the drawer at a stable URL
- Best SEO win (ranks for "TCS Q3 FY26 results")
- Better LinkedIn share target
- `generateStaticParams` over all 85 existing (company, quarter) pairs
- Reuse existing drawer tab components as page sections

### Phase 2B — `/admin/earnings` data entry
- Password-protected (NEXT_PUBLIC_ADMIN_PASSWORD or Supabase auth)
- Form fields per `earnings_season` column
- Upsert on (company_id, quarter)
- Separate form section for sector KPIs (dynamic jsonb array)
- Needed before Q4 FY26 results start dropping

### Phase 2C — Actuals → surprise auto-compute
- When user enters revenue_act + pat_act, frontend shows derived surprise %
- Auto-flip result_status BEAT/MISS/IN LINE based on thresholds (e.g., >2% surprise = BEAT)

### Phase 2D — Custom renderers for JSON fields
- Current TabMgmt.tsx does generic parsing; custom shapes for `key_takeaways`,
  `guidance`, `green_flags`, `red_flags` depending on how the AI populates them

### Phase 3 — Port remaining Vite pages to Next.js
Order by SEO value:
1. `/company/:symbol` → `/company/[symbol]` (CompanyDetail.tsx) ← already implied by 2A
2. `/` (Dashboard.tsx) — landing page
3. `/policy` (PolicyAlpha.tsx)
4. `/sentiment`, `/conferences`, `/investors`, `/brokers` — batch port

### Phase 4 — Kill Vite
- Delete `src/`, `vite.config.ts`, `index.html`, Vite configs
- Move `next-app/*` → repo root
- Delete old `earnings-canvas` Vercel project
- Update DNS so earningscanvas.in → Next.js project
- Remove Lovable references from README/package.json

## Outstanding user tasks

1. Add payment card to Vercel (trial was expiring ~2026-04-17)
2. DNS setup:
   - `earningscanvas.in` → Vercel (still 307-redirecting last we checked)
   - `earnings.earningscanvas.in` → CNAME `cname.vercel-dns.com`
3. Collect Q4 FY26 company list + consensus estimates from brokers/Bloomberg

## Things NOT to do

- Don't "fix" the Vite app. Port to Next.js instead; Vite code dies.
- Don't edit migrations 20260415000000/100/200 — they've run. Create new ones for changes.
- Don't commit `.env.local` or any file with the service role key.
- Don't auto-run `earnings_season` INSERTs on every earnings_analyses row without
  dedupe logic — unique constraint would fail.

## Supabase credentials (local only — not on GitHub)

Already in `next-app/.env.local`. If lost:
- Project URL: `https://pnmioozueiudekegjbql.supabase.co`
- Anon + service role keys: Supabase dashboard → Settings → API

## Publishing pipeline (markdown → live page)

### Workflow

1. **Author the markdown article** following the canonical structure in
   `G:\2. Earnings Canvas\Reliance\article_template.md` (or use the existing
   Claude Code editorial system in that folder to generate it from PDFs).

2. **Ensure the company exists** in the `companies` Supabase table. If it
   doesn't, INSERT a row with at least `symbol` + `name`.

3. **Run the publisher:**

```bash
cd G:/Earnings\ Canvas/repo
python scripts/publish_from_markdown.py path/to/COMPANY_QXFYY.md
```

For dry run (parse + summarise, no DB write):
```bash
python scripts/publish_from_markdown.py path/to/COMPANY_QXFYY.md --dry-run
```

The page is live at `https://earningscanvas.in/company/{SYMBOL}/{QUARTER-SLUG}`
within seconds of running (Next.js ISR fetches fresh on next request).

### What the publisher parses

The publisher (`scripts/publish_from_markdown.py`) reads each `## Section`
of the markdown and maps it to the rich-report schema:

| Markdown section          | DB field(s)                          |
|---------------------------|--------------------------------------|
| `# Title · Quarter`       | `companies.symbol`, `quarter`        |
| `## TL;DR`                | `verdict_score`, `investment_signal`, `verdict_summary`, `summary` |
| `## The 60-second read`   | `report_highlights`                  |
| `## Headline numbers`     | `key_numbers`, `revenue_act`, `pat_act`, `ebitda_act`, `*_yoy_pct`, `annual_context` |
| `## Segment scorecard`    | `segments`                           |
| `## {Segment} · {label}`  | `segment_narratives` (one entry each)|
| `## Strategic threads`    | `strategic_threads` (each `### Title` block) |
| `## What management said` | `key_quotes`                         |
| `## Concall Q&A`          | `dodged_questions` (watchlist mode)  |
| `## Forward tracker`      | `next_quarter_watchlist`             |
| `## Sector echo`          | `sector_echo`                        |
| `## Trade idea`           | `trade_idea`                         |
| `## NSE corporate announcements` | `recent_announcements`        |
| `## Bottom line`          | `bottom_line`                        |
| `## Distribution copy`    | `distribution_copy`                  |

`result_status` is auto-derived from the verdict column in the headline
numbers table (BEAT/MISS/IN LINE).

### Idempotency

Re-running the publisher on the same file upserts on `(company_id, quarter)`.
Empty/missing sections are filtered out before upsert — so partial markdown
won't wipe fields populated by other means (manual seeds, future LLM passes).

### Adding a new company

```bash
# 1. Insert the company in Supabase via REST
curl -X POST "https://pnmioozueiudekegjbql.supabase.co/rest/v1/companies" \
  -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"TCS","name":"Tata Consultancy Services","sector":"IT Services","screener_slug":"TCS"}'

# 2. Drop the markdown article in the right place + run publisher
python scripts/publish_from_markdown.py outputs/TCS_Q4FY26.md
```

## When resuming

Good first message for next session:
> Read CLAUDE.md. We're at end of Phase 1 (Next.js app live with archived Q1-Q3 FY26
> data). Want to start Phase 2A (`/company/[symbol]/[quarter]` routes). What's the plan?
