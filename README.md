# EarningsCanvas

India earnings intelligence platform — institutional-grade analysis of Indian
listed companies' quarterly results.

**Live:** [earningscanvas.in](https://earningscanvas.in)

## Architecture (hybrid, mid-migration)

```
repo/
├── src/         Vite SPA (legacy, serves production routes)
├── next-app/    Next.js 14 app (new — earnings season tracker)
└── supabase/    Migrations + edge functions
```

Two Vercel projects, one repo:
- `earnings-canvas` — Vite SPA (root)
- `earnings-canvas-next` — Next.js (root: `next-app`)

See [`CLAUDE.md`](./CLAUDE.md) for full project context, schema, file map,
and roadmap.

## Run locally

### Vite app (legacy)
```bash
npm install
npm run dev   # http://localhost:8080
```

### Next.js app (new)
```bash
cd next-app
npm install
npm run dev   # http://localhost:3000 (or 3001)
```

`.env.local` required in `next-app/` — see `next-app/.env.example`.

## Tech

- React 18 + TypeScript
- Tailwind CSS, shadcn/ui (Radix primitives)
- Supabase (Postgres + RLS + Edge Functions)
- Vercel (deployment)
- Vite (legacy app), Next.js 14 App Router (new app)

## Database

Supabase project `pnmioozueiudekegjbql`. Schema details in `CLAUDE.md`.
Migrations in `supabase/migrations/`.
