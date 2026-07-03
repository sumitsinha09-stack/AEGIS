# AEGIS
### AI Energy Geopolitical Intelligence System

A full-stack, production-ready mission-control dashboard for monitoring, simulating, and responding to disruptions in India's crude oil supply chain.

---

## 🛠️ Workspaces & Modules

AEGIS is divided into 9 dedicated workspace panels, custom-tailored for different aspects of geopolitical risk and supply chain optimization:

| Module | Description |
|--------|-------------|
| **Mission Control** | Overview landing dashboard with command state (NOMINAL/ELEVATED/CRITICAL), real-time KPI sparklines, and active disruption timelines. |
| **Risk Intelligence** | Operations control panel featuring shipping corridor risk gauge dials, live news feed parsing, and supplier vulnerability matrix. |
| **Scenario Modeller** | What-if simulation builder with configurable severity sliders, 2x2 nominal vs disrupted path charts, and video generation controls. |
| **Procurement Intelligence** | AI-ranked alternative contract allocations with spot pricing, grade compatibility, and LLM reasoning logs. |
| **Reserve Optimizer** | Strategic Petroleum Reserve (SPR) cover indicator, manual drawdown console, and depletion forecast area charts. |
| **Digital Twin** | Full-screen interactive GIS world map supporting click telemetry, weather currents, satellite sweeps, and active vessel overlays. |
| **Analytics & Reports** | Historical timeline tracking, corridor efficiency metrics, supplier radar portfolio charts, and PDF summary reports exporter. |
| **AI Command Center** | Conversational diagnostics console providing natural language answers and live telemetry feed checks. |
| **System Management** | General application preferences, alerts/Slack configuration, connected database schemas, and live diagnostic operations log console. |

---

## ⚡ Platform Capabilities

* **Crimson Design System**: Premium dark UI built with native macOS system-font stack (SF Pro / BlinkMacSystemFont), crimson overlays, and responsive layouts.
* **Collapsible Sidebar**: Dynamic navigation drawer expanding on hover from `72px` to `230px` with animated text labels and warning alerts.
* **Command Palette**: Global search console modal (`⌘K` or `Ctrl+K`) for rapid navigation and synchronization actions.
* **Live Operations Ticker**: Bottom scrolling marquee ribbon looping critical geopolitical alerts and latency updates.
* **Python Database Seeder**: Fully automated Python script utilizing SQLAlchemy to recreate all database tables and seed realistic default records.

---

## 🔧 Quick Start

### Prerequisites
* Python 3.10+
* Node.js 20+
* pnpm 9+
* PostgreSQL 15+

### Installation & Launch

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/sumitsinha09-stack/AEGIS.git
   cd AEGIS
   pnpm install
   ```

2. **Configure Environment**:
   Create a `.env` file at the root of the project:
   ```env
   DATABASE_URL=postgresql://<user>:<password>@localhost:5432/aegis
   SESSION_SECRET=your-random-session-secret
   ```

3. **Recreate & Seed Database**:
   Run the Python database seeder to initialize the tables and populate default values:
   ```bash
   cd artifacts/api-server
   python3 -m pip install -r requirements.txt
   python3 src/seed.py
   cd ../..
   ```

4. **Start Development Servers**:
   Launch both the Python backend API and the React frontend client simultaneously:
   ```bash
   # In terminal 1 (Python Backend - port 8080)
   pnpm --filter @workspace/api-server run dev

   # In terminal 2 (React Frontend - port 23935)
   pnpm --filter @workspace/aegis run dev
   ```

5. **Access Dashboard**:
   Open **[http://localhost:23935](http://localhost:23935)** in your browser.

---

## 📊 Tech Stack

* **Frontend**: React 19, Vite 7, Tailwind CSS 4, Framer Motion, Recharts, Wouter routing, TanStack React Query v5.
* **Backend**: Python 3, FastAPI, Uvicorn, SQLAlchemy ORM.
* **Database**: PostgreSQL.
* **APIs & Types**: OpenAPI Spec → Orval frontend TypeScript hook generation.
* **Package Manager**: pnpm workspaces monorepo.

---

## 📂 Project Structure

```
AEGIS/
├── artifacts/
│   ├── aegis/              # React + Vite frontend workspace
│   │   └── src/
│   │       ├── pages/      # 9 dashboard workspace page components
│   │       ├── components/ # Layout shell, scenario-video, UI components
│   │       └── hooks/      # use-refresh, use-toast hook utilities
│   └── api-server/         # FastAPI backend Python server
│       └── src/
│           ├── routes/     # 8 modular route controllers
│           ├── models.py   # SQLAlchemy database schemas
│           ├── seed.py     # Python database seeder script
│           └── main.py     # Server entry point
├── lib/
│   ├── api-spec/           # openapi.yaml (contract source of truth)
│   ├── api-client-react/   # Codegen React Query hooks
│   └── api-zod/            # Generated Zod validation models
├── docs/
│   ├── API.md              # Full API route reference documentation
│   └── DEPLOYMENT.md       # Production hosting guidelines
├── .env.example
└── pnpm-workspace.yaml
```
