# AEGIS — Deployment Guide

## Local Development

### Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL 15+

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env
# Edit .env and set DATABASE_URL and SESSION_SECRET

# 3. Push database schema
pnpm --filter @workspace/db run push

# 4. Run API server (port 8080)
pnpm --filter @workspace/api-server run dev

# 5. Run frontend (port 23935, separate terminal)
pnpm --filter @workspace/aegis run dev
```

Open `http://localhost:23935` in your browser.

---

## Production Build

```bash
# Typecheck + build all packages
pnpm run build

# The API server bundle is output to artifacts/api-server/dist/
# Start production API server:
NODE_ENV=production node artifacts/api-server/dist/index.js
```

The Vite frontend is a static build. Serve `artifacts/aegis/dist/` from any static host (Nginx, Caddy, S3+CloudFront).

---

## Replit (one-click)

The project is preconfigured for Replit deployment:

1. Import the repository into Replit
2. Set `DATABASE_URL` and `SESSION_SECRET` in **Secrets**
3. Click **Run** — Replit starts both workflows automatically
4. Click **Deploy** to publish on a `.replit.app` domain

The shared reverse proxy routes `/api/*` to the API server and `/` to the frontend automatically via `artifact.toml`.

---

## Docker (optional)

```dockerfile
# Example Dockerfile for the API server
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install -g pnpm && pnpm install --frozen-lockfile
RUN pnpm run build
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "artifacts/api-server/dist/index.js"]
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SESSION_SECRET` | ✅ | Secret for session signing |
| `PORT` | — | API server port (default: 8080) |
| `NODE_ENV` | — | `development` or `production` |

---

## Database Migrations

AEGIS uses Drizzle ORM with push-based schema sync:

```bash
# Development — push schema changes immediately
pnpm --filter @workspace/db run push

# Generate a migration file (for production)
pnpm --filter @workspace/db run generate

# Apply migration
pnpm --filter @workspace/db run migrate
```

After any change to `lib/db/src/schema/*.ts`, run push before starting the API server.

---

## Regenerate API Client

After changing `lib/api-spec/openapi.yaml`:

```bash
pnpm --filter @workspace/api-spec run codegen
```

This regenerates React Query hooks in `lib/api-client-react/` and Zod schemas in `lib/api-zod/`.
