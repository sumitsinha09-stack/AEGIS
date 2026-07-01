# AEGIS
### AI Energy Geopolitical Intelligence System

A full-stack, production-ready mission-control dashboard for monitoring, simulating, and responding to disruptions in India's crude oil supply chain.

![AEGIS Dashboard](docs/aegis-overview.png)

---

## Features

| Module | Description |
|--------|-------------|
| **Overview** | System state (NOMINAL/ELEVATED/CRITICAL), module summary cards with sparklines, global disruption simulation |
| **Risk Intelligence** | Corridor risk gauge dials, live intel feed, supplier vulnerability matrix |
| **Scenario Modeller** | Geopolitical shock simulation, before/after impact analysis, 4-phase animation video |
| **Procurement Orchestrator** | AI-ranked alternative sourcing with structured reasoning |
| **Reserve Optimizer** | SPR radial gauge, drawdown modeller, projected inventory timeline |
| **Digital Twin** | Interactive SVG world map, node/corridor intelligence, what-if simulation |

### Platform Capabilities
- 🔴 **Crimson design system** — premium dark UI, Outfit/Plus Jakarta Sans/JetBrains Mono typography, glass morphism panels
- ⚡ **Auto-refresh every 5 minutes** — plus manual Refresh All button with last-sync timestamp
- 🎬 **Video generation** — Canvas-API animated visualization of disruption scenarios
- 📊 **Recharts data visualizations** — area charts, radial gauges, line charts, sparklines
- 🗺️ **SVG Digital Twin map** — equirectangular projection, animated flow particles, click targets on all elements
- 🤖 **AI Procurement Orchestrator** — LLM-style structured reasoning stored as text in the DB
- 🏗️ **Contract-first API** — OpenAPI → Orval codegen → React Query hooks + Zod schemas

---

## Quick Start

```bash
# Prerequisites: Node.js 20+, pnpm 9+, PostgreSQL 15+

git clone <repo-url>
cd aegis
pnpm install
cp .env.example .env          # Fill in DATABASE_URL and SESSION_SECRET
pnpm --filter @workspace/db run push

# Seed the database with realistic default data:
DATABASE_URL=postgresql://user:password@localhost:5432/aegis npx tsx lib/db/src/seed.ts

pnpm --filter @workspace/api-server run dev &   # port 8080
pnpm --filter @workspace/aegis run dev          # port 23935
```

Open **http://localhost:23935**

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7, Tailwind CSS 4, Framer Motion, Recharts |
| Routing | Wouter |
| State / Data | TanStack React Query v5 |
| API | Express 5 |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod v4, drizzle-zod |
| API Codegen | Orval (OpenAPI → TypeScript) |
| Build | esbuild (server), Vite (client) |
| Types | TypeScript 5.9 strict mode |
| Package manager | pnpm workspaces (monorepo) |

---

## Project Structure

```
aegis/
├── artifacts/
│   ├── aegis/              # React + Vite frontend
│   │   └── src/
│   │       ├── pages/      # 6 dashboard pages
│   │       ├── components/ # Layout, scenario-video, ui/
│   │       └── hooks/      # use-refresh, use-toast
│   └── api-server/         # Express 5 API server
│       └── src/routes/     # overview, risk, scenarios, procurement, reserve, digitalTwin
├── lib/
│   ├── api-spec/           # openapi.yaml (source of truth)
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas
│   └── db/                 # Drizzle ORM schema + client
├── docs/
│   ├── API.md              # Full API reference
│   ├── DEPLOYMENT.md       # Deployment instructions
│   └── demo_script.md      # 2.5-minute screen recording script
├── .env.example
└── pnpm-workspace.yaml
```

---

## Development Commands

```bash
pnpm run typecheck              # Full typecheck across all packages
pnpm run build                  # Typecheck + build all packages
pnpm --filter @workspace/api-spec run codegen   # Regenerate API hooks from OpenAPI spec
pnpm --filter @workspace/db run push            # Push DB schema changes (dev only)
pnpm --filter @workspace/db run generate        # Generate migration files
```

---

## Documentation

- [API Reference](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Demo Script](docs/demo_script.md)

---

## Architecture Decisions

**Contract-first:** The OpenAPI spec (`lib/api-spec/openapi.yaml`) is the single source of truth. Codegen produces React Query hooks and Zod schemas — all frontend data fetching goes through these generated hooks.

**Thin routes:** Backend route handlers are intentionally thin — validate input → query DB → respond. No business logic outside the route files.

**SVG map:** The Digital Twin uses pure SVG with an equirectangular projection. No external mapping libraries are required, keeping the bundle lean and the rendering fully customizable.

**Push schema:** Drizzle ORM uses `push` in development for fast iteration. For production deployments, generated migration files are used instead.

---

## License

MIT
