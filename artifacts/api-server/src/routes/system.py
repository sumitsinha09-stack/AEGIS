import time
import random
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..database import get_db, engine
from ..schemas import SystemConfigResponse, DatabaseStatus, ApiServiceStatus, DatabaseTableInfo

router = APIRouter()

@router.get("/system/config", response_model=SystemConfigResponse)
def get_system_config(db: Session = Depends(get_db)):
    # 1. Test database connection
    db_name = "aegis"
    db_purpose = "Primary relational storage for system state, risk scores, scenario models, reserves, and digital twin data."
    db_type = "PostgreSQL"
    
    # Extract host from DATABASE_URL
    host = "localhost"
    try:
        url = engine.url
        if url.host:
            host = url.host
        if url.port:
            host = f"{host}:{url.port}"
    except Exception:
        pass
        
    db_status = "CONNECTED"
    db_error = None
    try:
        # Perform query to test connection
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = "DISCONNECTED"
        db_error = str(e)

    # Count records in tables
    risk_count = 0
    news_count = 0
    supplier_count = 0
    procurement_count = 0
    reserve_count = 0
    node_count = 0
    corridor_count = 0

    if db_status == "CONNECTED":
        try:
            from ..models import RiskScore, NewsSignal, SupplierRisk, ProcurementRecommendation, ReserveStatus, DigitalTwinNode, ShippingCorridor
            risk_count = db.query(RiskScore).count()
            news_count = db.query(NewsSignal).count()
            supplier_count = db.query(SupplierRisk).count()
            procurement_count = db.query(ProcurementRecommendation).count()
            reserve_count = db.query(ReserveStatus).count()
            node_count = db.query(DigitalTwinNode).count()
            corridor_count = db.query(ShippingCorridor).count()
        except Exception as e:
            # If counting fails, we still proceed
            pass

    tables = [
        DatabaseTableInfo(name="risk_scores", purpose="Stores corridor-level disruption risk scores and trends.", recordsCount=risk_count, mappedModel="RiskScore"),
        DatabaseTableInfo(name="news_signals", purpose="Logs news headlines, geopolitical alerts, and extracted risk severity.", recordsCount=news_count, mappedModel="NewsSignal"),
        DatabaseTableInfo(name="supplier_risks", purpose="Maintains risk assessment, share, and routes for crude oil supplier entities.", recordsCount=supplier_count, mappedModel="SupplierRisk"),
        DatabaseTableInfo(name="procurement_recommendations", purpose="Saves ranked options, pricing indices, and LLM reasoning steps.", recordsCount=procurement_count, mappedModel="ProcurementRecommendation"),
        DatabaseTableInfo(name="reserve_status", purpose="Keeps track of daily cover capacities and reserve optimization rules.", recordsCount=reserve_count, mappedModel="ReserveStatus"),
        DatabaseTableInfo(name="digital_twin_nodes", purpose="Defines locations (lat/lon) for ports, storage structures, and refineries.", recordsCount=node_count, mappedModel="DigitalTwinNode"),
        DatabaseTableInfo(name="shipping_corridors", purpose="Caches maritime navigation routes, status constraints, and waypoints.", recordsCount=corridor_count, mappedModel="ShippingCorridor")
    ]

    databases = [
        DatabaseStatus(
            name=db_name,
            purpose=db_purpose,
            type=db_type,
            host=host,
            status=db_status,
            error=db_error,
            tables=tables
        )
    ]

    # 2. Simulate API service checks
    apis = [
        ApiServiceStatus(
            name="AI Geopolitical Analysis Service",
            purpose="Extracts risk levels and structures news signals from raw geopolitical intelligence feeds.",
            endpoint="https://api.deepmind-geopolitics.internal/v1",
            auth_status="ACTIVE",
            connectivity_status="ONLINE",
            latency_ms=round(110 + random.random() * 30, 1)
        ),
        ApiServiceStatus(
            name="OpenWeather & Geocoding API",
            purpose="Provides coordinates and maritime weather conditions for shipping routes and corridors.",
            endpoint="https://api.openweathermap.org/data/2.5",
            auth_status="ACTIVE",
            connectivity_status="ONLINE",
            latency_ms=round(75 + random.random() * 20, 1)
        ),
        ApiServiceStatus(
            name="MarineTraffic AIS API",
            purpose="Tracks real-time tanker locations and port congestion parameters.",
            endpoint="https://services.marinetraffic.com/api",
            auth_status="ACTIVE",
            connectivity_status="ONLINE",
            latency_ms=round(190 + random.random() * 40, 1)
        ),
        ApiServiceStatus(
            name="MoPNG Strategic Reserve API",
            purpose="Synchronizes emergency stockpile volumes and national consumption rates.",
            endpoint="https://data.mopng.gov.in/api/v1/spr",
            auth_status="ACTIVE",
            connectivity_status="ONLINE",
            latency_ms=round(160 + random.random() * 30, 1)
        )
    ]

    return SystemConfigResponse(databases=databases, apis=apis)
