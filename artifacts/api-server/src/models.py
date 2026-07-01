from sqlalchemy import Column, Integer, String, Float, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB
from .database import Base

class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    corridor = Column(String, nullable=False)
    score = Column(Float, nullable=False)
    level = Column(String, nullable=False)  # LOW | MODERATE | HIGH | CRITICAL
    trend = Column(String, nullable=False)  # increasing | decreasing | stable
    last_updated = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

class NewsSignal(Base):
    __tablename__ = "news_signals"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    headline = Column(String, nullable=False)
    source = Column(String, nullable=False)
    corridor = Column(String, nullable=False)
    severity = Column(String, nullable=False)  # LOW | MODERATE | HIGH | CRITICAL
    extracted_risk = Column(String, nullable=False)

class SupplierRisk(Base):
    __tablename__ = "supplier_risks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    supplier = Column(String, nullable=False)
    country = Column(String, nullable=False)
    share = Column(Float, nullable=False)
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)
    primary_route = Column(String, nullable=False)
    notes = Column(String, nullable=False)

class ProcurementRecommendation(Base):
    __tablename__ = "procurement_recommendations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    rank = Column(Integer, nullable=False)
    supplier = Column(String, nullable=False)
    country = Column(String, nullable=False)
    route = Column(String, nullable=False)
    spot_price = Column(Float, nullable=False)
    tanker_availability = Column(Float, nullable=False)
    port_congestion = Column(Float, nullable=False)
    grade_compatibility = Column(Float, nullable=False)
    overall_score = Column(Float, nullable=False)
    reasoning = Column(String, nullable=False)
    status = Column(String, nullable=False)  # RECOMMENDED | VIABLE | MARGINAL | AVOID
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

class ReserveStatus(Base):
    __tablename__ = "reserve_status"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    current_days = Column(Float, nullable=False)
    capacity_days = Column(Float, nullable=False)
    fill_percent = Column(Float, nullable=False)
    drawdown_rate = Column(Float, nullable=False)
    recommended_action = Column(String, nullable=False)
    risk_of_depletion = Column(String, nullable=False)
    replenishment_window = Column(String, nullable=False)
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

class DigitalTwinNode(Base):
    __tablename__ = "digital_twin_nodes"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # port | refinery | storage | strait | terminal
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)
    details = Column(String, nullable=False)

class ShippingCorridor(Base):
    __tablename__ = "shipping_corridors"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    from_ = Column("from", String, nullable=False)  # Map "from" column (reserved word in Python)
    to = Column(String, nullable=False)
    risk_level = Column(String, nullable=False)
    risk_score = Column(Float, nullable=False)
    volume_mbpd = Column(Float, nullable=False)
    status = Column(String, nullable=False)  # OPEN | RESTRICTED | CLOSED
    waypoints = Column(JSONB, nullable=False)  # list of [lat, lon]
