import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import health, overview, risk, digital_twin, procurement, reserve, scenarios

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("api-server")

app = FastAPI(title="AEGIS API Server", version="1.0.0")

# Configure CORS (default Express-like wildcard allowance)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers under /api
app.include_router(health.router, prefix="/api")
app.include_router(overview.router, prefix="/api")
app.include_router(risk.router, prefix="/api")
app.include_router(digital_twin.router, prefix="/api")
app.include_router(procurement.router, prefix="/api")
app.include_router(reserve.router, prefix="/api")
app.include_router(scenarios.router, prefix="/api")

@app.on_event("startup")
def startup_event():
    logger.info("AEGIS Python API server starting up...")
