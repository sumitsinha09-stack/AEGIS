import os
from fpdf import FPDF

class AEGISDocPDF(FPDF):
    def header(self):
        if self.page_no() == 1:
            return  # No header on cover page
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 10, "AEGIS: AI Energy Geopolitical Intelligence System - Technical Documentation", new_x="LMARGIN", new_y="NEXT", align="R")
        self.set_draw_color(180, 20, 20)
        self.line(15, 20, 195, 20)
        self.ln(5)

    def footer(self):
        if self.page_no() == 1:
            return  # No footer on cover page
        self.set_y(-15)
        self.set_draw_color(180, 20, 20)
        self.line(15, self.get_y(), 195, self.get_y())
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")

    def cover_page(self):
        self.add_page()
        # Crimson decorative band
        self.set_fill_color(180, 20, 20)
        self.rect(0, 0, 15, 297, "F")
        
        self.set_left_margin(30)
        self.set_y(60)
        
        # Title
        self.set_font("Helvetica", "B", 36)
        self.set_text_color(30, 30, 30)
        self.cell(0, 15, "AEGIS", new_x="LMARGIN", new_y="NEXT")
        
        # Subtitle
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(180, 20, 20)
        self.cell(0, 10, "AI Energy Geopolitical Intelligence System", new_x="LMARGIN", new_y="NEXT")
        
        self.ln(10)
        self.set_draw_color(180, 20, 20)
        self.line(30, self.get_y(), 180, self.get_y())
        self.ln(15)
        
        # Metadata
        self.set_font("Helvetica", "", 12)
        self.set_text_color(80, 80, 80)
        self.cell(0, 8, "TECHNICAL SPECIFICATION & DOCUMENTATION", new_x="LMARGIN", new_y="NEXT")
        self.cell(0, 8, "Version: 2.0.0 (FastAPI + React Redesign)", new_x="LMARGIN", new_y="NEXT")
        self.cell(0, 8, "Status: Production Ready", new_x="LMARGIN", new_y="NEXT")
        self.cell(0, 8, "Target Environment: Enterprise Local / Cloud", new_x="LMARGIN", new_y="NEXT")
        
        self.set_y(220)
        self.set_font("Helvetica", "I", 10)
        self.cell(0, 6, "Designed for India's Crude Oil Supply Chain Monitoring,", new_x="LMARGIN", new_y="NEXT")
        self.cell(0, 6, "Strategic Petroleum Reserve Optimization, & Geopolitical Shock Modelling.", new_x="LMARGIN", new_y="NEXT")
        
        self.set_left_margin(15) # Reset margin

    def add_section_header(self, num, title):
        self.ln(8)
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(180, 20, 20)
        self.cell(0, 10, f"{num}. {title}", new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def add_subsection_header(self, title):
        self.ln(4)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(60, 60, 60)
        self.cell(0, 8, title, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def add_paragraph(self, text):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(40, 40, 40)
        self.multi_cell(0, 5.5, text)
        self.ln(3)

    def add_bullet(self, title, text):
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(60, 60, 60)
        self.write(5.5, f" - {title}: ")
        self.set_font("Helvetica", "", 10)
        self.set_text_color(40, 40, 40)
        self.write(5.5, f"{text}\n")
        self.ln(1.5)

    def draw_table(self, headers, rows, col_widths):
        self.ln(2)
        # Header
        self.set_font("Helvetica", "B", 9)
        self.set_fill_color(240, 240, 240)
        self.set_text_color(30, 30, 30)
        for i, header in enumerate(headers):
            self.cell(col_widths[i], 8, header, 1, new_x="RIGHT", new_y="TOP", fill=True)
        self.ln()
        # Rows
        self.set_font("Helvetica", "", 9)
        self.set_text_color(50, 50, 50)
        for row in rows:
            for i, val in enumerate(row):
                self.cell(col_widths[i], 7, str(val), 1, new_x="RIGHT", new_y="TOP")
            self.ln()
        self.ln(4)

def generate_pdf():
    pdf = AEGISDocPDF()
    pdf.cover_page()
    
    # - SECTION 1: PROJECT OVERVIEW -
    pdf.add_page()
    pdf.add_section_header("1", "Project Overview & Problem Statement")
    pdf.add_paragraph(
        "India imports over 85% of its crude oil requirements, making its energy security highly sensitive to "
        "geopolitical tensions, maritime chokepoint blocks, and regional supply chain bottlenecks. Standard "
        "dashboards offer passive telemetry display, lacking the capabilities to simulate what-if shock scenarios, "
        "re-route supply paths in real-time, or optimize reserve releases dynamically."
    )
    pdf.add_paragraph(
        "AEGIS (AI Energy Geopolitical Intelligence System) solves this critical security gap by providing a "
        "comprehensive, full-stack mission-control console. It integrates real-time telemetry from multiple maritime "
        "corridors, parses geopolitical news signals, runs mathematical simulations for supply chain disruptions, "
        "recommends alternative procurement plans, and schedules Strategic Petroleum Reserve (SPR) drawdowns."
    )

    # - SECTION 2: SYSTEM ARCHITECTURE & WORKFLOW -
    pdf.add_section_header("2", "Overall Architecture & System Workflow")
    pdf.add_paragraph(
        "AEGIS is organized as a contract-first monorepo. The core system architecture consists of a React client "
        "frontend, a FastAPI Python backend server, and a PostgreSQL database. The API schema is defined in an OpenAPI "
        "specification, serving as the single source of truth that drives client code generation and backend routing."
    )
    pdf.add_paragraph(
        "1. Data Ingestion: News feeds and maritime sensors push indicators into the database.\n"
        "2. API Gateway: FastAPI processes request queries, implements validation via Python schemas, and serves ORM data.\n"
        "3. Client UI: The React frontend fetches data using React Query and renders the Crimson Command dashboard."
    )

    # - SECTION 3: END-TO-END FLOW -
    pdf.add_section_header("3", "End-to-End Operation & Telemetry Loop")
    pdf.add_paragraph(
        "Telemetry ingestion starts when geopolitical indicators or port congestions are updated in the database. "
        "The Python backend translates these changes into risk calculations. Upon user request, a background "
        "simulation (e.g. Strait of Hormuz blockage) recalculates supplier shares, updates projected refinery run "
        "rates, and estimates national GDP impact. The results are pushed instantly to the client UI using Vite "
        "Hot Module Replacement (HMR) and React Query buffer cache updates, rendering the complete situation map."
    )

    # - SECTION 4: DETAILED MODULE BREAKDOWN -
    pdf.add_page()
    pdf.add_section_header("4", "Feature-by-Feature Module Breakdown")
    
    pdf.add_subsection_header("Module 1: Mission Control (Overview)")
    pdf.add_paragraph(
        "The Command Overview page provides a high-level briefing. It features a system status banner "
        "(NOMINAL / ELEVATED / CRITICAL), circular gauges representing overall risk score and reserve cover, "
        "and active what-if simulation builder triggers."
    )
    
    pdf.add_subsection_header("Module 2: Risk Intelligence")
    pdf.add_paragraph(
        "Displays real-time threat indices across five primary shipping corridors (Strait of Hormuz, Red Sea, Malacca "
        "Strait, Cape of Good Hope, Persian Gulf). Includes a live news ticker stream and a supplier vulnerability matrix."
    )
    
    pdf.add_subsection_header("Module 3: Scenario Simulation")
    pdf.add_paragraph(
        "Allows operators to model specific disruptions (e.g. regional strikes, corridor closures). "
        "Displays a 2x2 comparison grid tracking Refinery Run Rate, Fuel Price, Power Stress, and GDP impact."
    )

    pdf.add_subsection_header("Module 4: Procurement Intelligence")
    pdf.add_paragraph(
        "Runs an AI optimizer to rank alternative sourcing contracts based on spot price, tanker availability, port "
        "congestion, and grade compatibility. Includes structured reasoning text details."
    )

    pdf.add_subsection_header("Module 5: Reserve Optimizer")
    pdf.add_paragraph(
        "Simulates drawdown lifespans for Strategic Petroleum Reserves. A manual release slider models cost "
        "impacts and outputs a projected inventory depletion area chart."
    )

    pdf.add_subsection_header("Module 6: Digital Twin Map")
    pdf.add_paragraph(
        "Features a full-screen equirectangular SVG projection layering weather wind lines, satellite grid scans, "
        "and active vessels traffic. Click targets trigger node and corridor telemetry feeds."
    )

    pdf.add_subsection_header("Module 7: Analytics & Reports")
    pdf.add_paragraph(
        "Generates historical risk charts, route efficiency bars, supplier radar portfolios, and supports report downloads."
    )

    pdf.add_subsection_header("Module 8: AI Command Center")
    pdf.add_paragraph(
        "Provides a conversational terminal that answers natural language diagnostics questions using mapped database schemas."
    )

    pdf.add_subsection_header("Module 9: Settings & Diagnostics")
    pdf.add_paragraph(
        "Manages general preferences, alerts thresholds, and connected database schemas (with tables records count) "
        "along with a live diagnostic log output."
    )

    # - SECTION 5: FRONTEND & BACKEND ARCHITECTURE -
    pdf.add_page()
    pdf.add_section_header("5", "Frontend & Backend Architecture")
    pdf.add_paragraph(
        "The monorepo structure separating frontend, backend, and schemas is detailed below:"
    )
    
    headers = ["Workspace Area", "Language", "Path / Folder", "Responsibilities"]
    rows = [
        ["aegis-client", "TSX / CSS", "artifacts/aegis/src", "Vite build, layout, UI, wouter routes"],
        ["api-server", "Python", "artifacts/api-server/src", "FastAPI endpoints, SQL Alchemy ORM, seed.py"],
        ["api-spec", "OpenAPI", "lib/api-spec", "OpenAPI yaml contract definition"],
        ["api-zod", "TypeScript", "lib/api-zod", "Autogenerated Zod schema validation files"],
        ["api-client-react", "TypeScript", "lib/api-client-react", "React Query generated data-hooks"],
    ]
    pdf.draw_table(headers, rows, [32, 22, 48, 78])

    # - SECTION 6: AI COMPONENTS -
    pdf.add_section_header("6", "AI Components & Cognitive Integrations")
    pdf.add_paragraph(
        "AI components in AEGIS are integrated directly into the database layers and backend route controllers:\n"
        "1. Natural Language Diagnostics (AI Command): The conversational terminal translates schema variables "
        "into text replies.\n"
        "2. Contract Sourcing Reasoning: The Procurement Optimizer populates a 'reasoning' column in the "
        "recommendations table using LLM-style decision matrices based on compatibility and congestion.\n"
        "3. Disruption Impact Modelling: Scenario routes simulate output fluctuations on refinery runs."
    )

    # - SECTION 7: API REFERENCE -
    pdf.add_page()
    pdf.add_section_header("7", "API Reference & Specifications")
    pdf.add_paragraph(
        "All communications between the React client and the FastAPI backend are mapped via the following endpoints:"
    )
    
    headers_api = ["Method", "Endpoint", "Data Response", "Description"]
    rows_api = [
        ["GET", "/api/overview/summary", "OverviewSummary", "Command health state and core sparklines"],
        ["GET", "/api/risk/scores", "List[RiskScore]", "Corridor risk dial ratings and trends"],
        ["GET", "/api/risk/signals", "List[NewsSignal]", "Geopolitical stream warnings"],
        ["GET", "/api/risk/suppliers", "List[SupplierRisk]", "Supplier contract shares and routes"],
        ["GET", "/api/procurement/recs", "List[ProcurementRec]", "AI-ranked alternative sourcing plans"],
        ["GET", "/api/reserve/status", "ReserveStatus", "SPR inventory cover and recommended actions"],
        ["GET", "/api/digital-twin/nodes", "List[DigitalTwinNode]", "Coordinates and metadata of GIS targets"],
        ["GET", "/api/system/config", "SystemConfigResponse", "Database connections and API health status"],
    ]
    pdf.draw_table(headers_api, rows_api, [18, 52, 45, 65])

    # - SECTION 8: DATABASE SCHEMAS -
    pdf.add_page()
    pdf.add_section_header("8", "Database Schemas & Mappings")
    pdf.add_paragraph(
        "The PostgreSQL database is organized into 7 tables mapped via SQLAlchemy models in src/models.py:"
    )
    
    db_headers = ["Table Name", "Primary Key", "Key Attributes", "Usage"]
    db_rows = [
        ["risk_scores", "id (Integer)", "corridor, score, level, trend", "Risk Intelligence dials"],
        ["news_signals", "id (Integer)", "headline, source, corridor, severity", "Live operations feed"],
        ["supplier_risks", "id (Integer)", "supplier, country, share, risk_level", "Vulnerability matrices"],
        ["procurement_recommendations", "id (Integer)", "rank, spot_price, overall_score, reasoning", "Contract sourcing planner"],
        ["reserve_status", "id (Integer)", "current_days, capacity_days, drawdown_rate", "Reserve Optimization status"],
        ["digital_twin_nodes", "id (String)", "name, type, lat, lon, risk_level", "Coordinates for GIS map"],
        ["shipping_corridors", "id (String)", "from, to, waypoints (JSONB)", "Shipping path polylines"],
    ]
    pdf.draw_table(db_headers, db_rows, [45, 30, 55, 50])

    # - SECTION 9: INGESTION FLOW -
    pdf.add_section_header("9", "Data Ingestion & Flow Map")
    pdf.add_paragraph(
        "1. Geopolitical sensors publish updates -> 2. Python backend calculates corridor threat indices -> "
        "3. Database updates transaction status -> 4. React query invalidates active key cache -> "
        "5. Frontend pulls updated JSON model -> 6. Recharts components redraw layout canvas."
    )

    # - SECTION 10: DEPENDENCIES -
    pdf.add_section_header("10", "System Dependencies & Third-Party Libraries")
    pdf.add_paragraph(
        "1. Python Backend: fastapi, uvicorn, sqlalchemy, psycopg2-binary, pydantic, python-dotenv.\n"
        "2. React Frontend: tailwindcss (v4), framer-motion, recharts, wouter, @tanstack/react-query, lucide-react."
    )

    # - SECTION 11: SECURITY -
    pdf.add_section_header("11", "Security & Compliance Settings")
    pdf.add_paragraph(
        "1. Connection String Safety: Database URLs loaded via dotenv variables.\n"
        "2. CORS Middleware: Standard FastAPI headers restrict unauthorized API calls.\n"
        "3. Secrets Scanning: Removed hardcoded placeholders (e.g. Slack Webhooks) to prevent push blocks."
    )

    # - SECTION 12: DEPLOYMENT -
    pdf.add_section_header("12", "Deployment & Setup Guidelines")
    pdf.add_paragraph(
        "To deploy, run 'python3 -m pip install -r requirements.txt' in the api-server directory. "
        "Recreate database tables using 'python3 src/seed.py', and launch the server using "
        "'python3 -m uvicorn src.main:app --port 8080'."
    )

    # - SECTION 13: FOLDER STRUCTURE -
    pdf.add_page()
    pdf.add_section_header("13", "Codebase Directory Tree Structure")
    pdf.add_paragraph(
        "aegis-production/\n"
        "  +-- artifacts/\n"
        "  |   +-- aegis/              # Frontend workspace\n"
        "  |   |   +-- src/pages/      # Workspaces (overview, risk, settings, etc.)\n"
        "  |   |   +-- src/components/ # layout.tsx, scenario-video.tsx\n"
        "  |   +-- api-server/         # Backend Python workspace\n"
        "  |       +-- src/\n"
        "  |           +-- routes/     # Overview, risk, digital twin, etc.\n"
        "  |           +-- models.py   # SQLAlchemy DB definitions\n"
        "  |           +-- seed.py     # Python DB seeder script\n"
        "  +-- lib/                    # Shared API client and schema libraries"
    )

    # - SECTION 14: TECH STACK JUSTIFICATION -
    pdf.add_section_header("14", "Technology Stack Justifications")
    pdf.add_paragraph(
        "1. Python (FastAPI): High performance, asynchronous request handling, and compatibility with AI models.\n"
        "2. React + Tailwind CSS 4: Premium visual aesthetics, high performance rendering, and rich UI elements.\n"
        "3. PostgreSQL + SQLAlchemy: Secure relational mapping and flexibility for complex data structure queries."
    )

    # - SECTION 15: PERFORMANCE OPTIMIZATIONS -
    pdf.add_section_header("15", "Performance & Scalability Considerations")
    pdf.add_paragraph(
        "1. Database Connection Pooling: Configured engine pool size to 10 and max overflow to 20.\n"
        "2. Ticker Ribbon Render: Implemented a pure CSS keyframe marquee for infinite scroll to prevent CPU spikes.\n"
        "3. React Query caching: Invalidates data triggers only when manual refresh is clicked."
    )

    # - SECTION 16: FUTURE SCOPE -
    pdf.add_section_header("16", "Future Scope & Enhancements")
    pdf.add_paragraph(
        "1. Live Map Integrations: Layering Google Maps GIS coordinates over the SVG digital twin model.\n"
        "2. Machine Learning: Integrating predictive threat scores based on live news stream sentiments."
    )

    output_path = "/Users/sumitsinha/Documents/aegis-production/AEGIS_Documentation.pdf"
    pdf.output(output_path)
    print(f"PDF generated successfully at: {output_path}")

if __name__ == "__main__":
    generate_pdf()
