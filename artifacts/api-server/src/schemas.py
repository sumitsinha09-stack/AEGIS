from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, field_serializer
from pydantic.alias_generators import to_camel

class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True
    )

    # Automatically serialize all datetime objects to ISO-8601 format
    @field_serializer('*', mode='plain', check_fields=False)
    def serialize_datetime(self, value):
        if isinstance(value, datetime):
            # Convert +00:00 to Z for javascript compatibility
            iso = value.isoformat()
            if iso.endswith("+00:00"):
                return iso[:-6] + "Z"
            return iso
        return value

class HealthCheckResponse(CamelModel):
    status: str

class RiskScoreResponse(CamelModel):
    id: int
    corridor: str
    score: float
    level: str
    trend: str
    last_updated: datetime

class NewsSignalResponse(CamelModel):
    id: int
    timestamp: datetime
    headline: str
    source: str
    corridor: str
    severity: str
    extracted_risk: str

class SupplierRiskResponse(CamelModel):
    id: int
    supplier: str
    country: str
    share: float
    risk_score: float
    risk_level: str
    primary_route: str
    notes: str

class ProcurementRecommendationResponse(CamelModel):
    id: int
    rank: int
    supplier: str
    country: str
    route: str
    spot_price: float
    tanker_availability: float
    port_congestion: float
    grade_compatibility: float
    overall_score: float
    reasoning: str
    status: str

class ReserveStatusResponse(CamelModel):
    current_days: float
    capacity_days: float
    fill_percent: float
    drawdown_rate: float
    recommended_action: str
    risk_of_depletion: str
    replenishment_window: str

class DigitalTwinNodeResponse(CamelModel):
    id: str
    name: str
    type: str
    lat: float
    lon: float
    risk_level: str
    details: str

class ShippingCorridorResponse(CamelModel):
    id: str
    name: str
    from_: str  # maps to from in database
    to: str
    risk_level: str
    risk_score: float
    volume_mbpd: float
    status: str
    waypoints: List[List[float]]

    # custom validator/property mapping for "from" alias
    @classmethod
    def from_orm(cls, obj):
        data = {
            "id": obj.id,
            "name": obj.name,
            "from_": obj.from_,
            "to": obj.to,
            "risk_level": obj.risk_level,
            "risk_score": obj.risk_score,
            "volume_mbpd": obj.volume_mbpd,
            "status": obj.status,
            "waypoints": obj.waypoints,
        }
        return cls(**data)
