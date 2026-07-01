# AEGIS API Reference

Base URL: `/api`  
OpenAPI spec: `lib/api-spec/openapi.yaml`  
All responses are `application/json`.

---

## Health

### `GET /api/healthz`
Returns server health status.

```json
{ "status": "ok", "timestamp": "2026-06-30T18:00:00.000Z" }
```

---

## Overview

### `GET /api/overview/summary`
Returns current system state, global risk score, SPR cover days, and module summaries with sparklines.

**Response fields:**
| Field | Type | Description |
|-------|------|-------------|
| `systemState` | `"NOMINAL" \| "ELEVATED" \| "CRITICAL"` | Derived from average corridor risk score |
| `riskScore` | `number` | Average risk across all corridors (0–100) |
| `reserveDays` | `number` | Strategic Petroleum Reserve days of cover |
| `moduleSummaries` | `ModuleSummary[]` | Per-module headline metric + 8-point sparkline |
| `lastUpdated` | `string` | ISO-8601 timestamp |

### `POST /api/overview/run-simulation`
Triggers a full disruption simulation across all modules.

**Request body:**
```json
{ "scenarioId": "hormuz_closure", "severity": 8 }
```

**`severity`**: integer 1–10

---

## Risk Intelligence

### `GET /api/risk/scores`
Current disruption probability scores per shipping corridor.

### `GET /api/risk/signals`
Live intelligence signals (news, satellite, diplomatic).

### `GET /api/risk/suppliers`
Supplier vulnerability matrix — risk level, route, import share.

### `POST /api/risk/refresh`
Triggers a live refresh of all risk scores and signals.

---

## Scenarios

### `GET /api/scenarios`
List of available disruption scenarios (Hormuz, OPEC+, Red Sea, etc.).

### `POST /api/scenarios/simulate`
Run a scenario simulation and return before/after impact analysis.

**Request body:**
```json
{ "scenarioId": "HORMUZ_CLOSURE", "severity": 7 }
```

**Response includes:** `impacts[]`, `beforeAfter.refineryRunRate[]`, `beforeAfter.fuelPriceDelta[]`

---

## Procurement

### `GET /api/procurement/recommendations`
AI-ranked alternative sourcing recommendations with reasoning.

### `GET /api/procurement/sources`
All global crude sources with current spot prices and typical volumes.

### `POST /api/procurement/orchestrate`
Re-run the procurement orchestrator for a given scenario.

---

## Reserve Optimizer

### `GET /api/reserve/status`
Current SPR status: days of cover, fill %, drawdown rate, recommended action.

### `GET /api/reserve/drawdown-schedule`
Projected inventory schedule as a time series.

### `POST /api/reserve/optimize`
Re-optimize drawdown schedule for a given release rate.

**Request body:**
```json
{ "scenarioId": "MANUAL", "drawdownRateMbpd": 2.5 }
```

---

## Digital Twin

### `GET /api/digital-twin/nodes`
All supply chain nodes (straits, refineries, terminals) with coordinates and risk levels.

### `GET /api/digital-twin/corridors`
All shipping corridors with waypoints, volume, and risk assessment.

### `POST /api/digital-twin/what-if`
Run a what-if simulation on a specific node or corridor.

**Request body:**
```json
{ "targetId": "hormuz", "targetType": "node", "disruptionType": "CLOSURE" }
```

---

## Data Models

### `RiskScore`
```typescript
{
  id: number;
  corridor: string;       // e.g. "Strait of Hormuz"
  score: number;          // 0–100
  level: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  trend: "stable" | "increasing" | "decreasing";
  lastUpdated: string;
}
```

### `SupplierRisk`
```typescript
{
  id: number;
  supplier: string;
  country: string;
  share: number;          // % of India's crude imports
  primaryRoute: string;
  riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
}
```

### `ProcurementRecommendation`
```typescript
{
  id: number;
  rank: number;
  supplier: string;
  country: string;
  route: string;
  overallScore: number;   // 0–100
  status: "RECOMMENDED" | "VIABLE" | "MARGINAL" | "AVOID";
  spotPrice: number;
  tankerAvailability: number;
  portCongestion: number;
  gradeCompatibility: number;
  reasoning: string;      // AI agent justification text
}
```
