# AEGIS — AI Energy Geopolitical Intelligence System

A full-stack mission-control dashboard for monitoring, simulating, and responding to disruptions in India's crude oil supply chain.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/aegis run dev` — run the AEGIS frontend (port 23935)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind + Recharts + Framer Motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/` — Drizzle table definitions (one file per domain)
- `artifacts/api-server/src/routes/` — Express route handlers (overview, risk, scenarios, procurement, reserve, digitalTwin)
- `artifacts/aegis/src/` — React frontend (wouter routing, 6 dashboard pages)

## Architecture decisions

- Contract-first: OpenAPI spec gates codegen → React Query hooks used throughout the frontend
- All seed data is realistic: Iraq/Saudi/UAE/Russia/US suppliers, Hormuz/Red Sea/Cape corridors, Jamnagar/Paradip/Vadinar refineries
- Backend routes are thin — validate → DB → respond. No business logic outside route files
- Digital twin map uses SVG coordinate rendering (no external map libs needed)
- Procurement orchestrator provides LLM-style reasoning stored as structured text in the DB

## Product

AEGIS has 6 dashboards:
1. **Overview** — System state (NOMINAL/ELEVATED/CRITICAL), module summary cards with sparklines, "Run Full Disruption Simulation" button
2. **Risk Intelligence** — Corridor risk gauge dials, auto-scrolling terminal news/signal feed, supplier risk table
3. **Scenario Modeller** — Clickable scenario cards (Hormuz Closure, OPEC+ Cut, Red Sea, etc.), 2×2 impact chart grid with before/after toggle
4. **Procurement Orchestrator** — Ranked glass cards with reasoning, color-coded status badges (RECOMMENDED/VIABLE/MARGINAL/AVOID)
5. **Reserve Optimizer** — Central radial gauge (days of SPR cover), drawdown timeline chart, action banner
6. **Digital Twin** — SVG world map with color-coded shipping corridors, node selection, what-if simulation

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run codegen after changing `lib/api-spec/openapi.yaml`
- `pnpm --filter @workspace/db run push` must run before the API server can start successfully when schema changes
- The `risk.ts` route's `update()` call uses a raw `where` object — ensure Drizzle version compatibility if upgrading

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
