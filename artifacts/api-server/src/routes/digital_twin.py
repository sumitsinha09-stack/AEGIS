from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import DigitalTwinNode, ShippingCorridor
from ..schemas import DigitalTwinNodeResponse, ShippingCorridorResponse

router = APIRouter()

@router.get("/digital-twin/nodes", response_model=List[DigitalTwinNodeResponse])
def get_nodes(db: Session = Depends(get_db)):
    nodes = db.query(DigitalTwinNode).all()
    return nodes

@router.get("/digital-twin/corridors", response_model=List[ShippingCorridorResponse])
def get_corridors(db: Session = Depends(get_db)):
    corridors = db.query(ShippingCorridor).all()
    # Pydantic ShippingCorridorResponse requires mapping `from_` to `from`
    return [ShippingCorridorResponse.from_orm(c) for c in corridors]

@router.post("/digital-twin/whatif")
def execute_what_if(
    target_id: str = Body(..., alias="targetId"),
    target_type: str = Body(..., alias="targetType"),
    disruption_type: str = Body("closure", alias="disruptionType")
):
    CORRIDOR_IMPACTS: Dict[str, Dict[str, Any]] = {
        "hormuz": {
            "volumeMbpd": 2.1,
            "alternatives": [
                "Cape of Good Hope routing via ADNOC Fujairah terminal",
                "Red Sea via Yanbu (Saudi Arabia)",
                "ESPO pipeline via Vladivostok"
            ]
        },
        "red_sea": {
            "volumeMbpd": 0.9,
            "alternatives": [
                "Cape of Good Hope rerouting (+12 days)",
                "Suez Canal northern approach",
                "Bab-el-Mandeb alternate routing"
            ]
        },
        "malacca": {
            "volumeMbpd": 0.3,
            "alternatives": [
                "Lombok Strait (Indonesia)",
                "Sunda Strait (Indonesia)",
                "Makassar Strait"
            ]
        },
        "cape_good_hope": {
            "volumeMbpd": 0.4,
            "alternatives": [
                "Suez Canal (primary)",
                "Panama Canal (Pacific reroute)"
            ]
        },
        "persian_gulf": {
            "volumeMbpd": 1.8,
            "alternatives": [
                "East African coast routing",
                "ESPO pipeline",
                "Atlantic Basin sourcing"
            ]
        },
    }

    impact = CORRIDOR_IMPACTS.get(target_id, {
        "volumeMbpd": 0.5,
        "alternatives": ["Alternative routing analysis required"]
    })

    NODE_IMPACTS: Dict[str, str] = {
        "jamnagar": "Reliance Jamnagar offline. Route 650,000 BPD to Vadinar and Paradip. Activate alternative crude grade procurement.",
        "paradip": "IOCL Paradip offline. Divert Eastern India supply to Haldia and Vizag refineries. 45-day crude inventory buffer available.",
        "vadinar": "Nayara Vadinar offline. Critical — processes 20% of India's crude. Emergency SPR drawdown authorized.",
        "mangalore": "MRPL Mangalore offline. Karnataka supply impacted. Redirect pipeline flows from Paradip.",
    }

    if target_type == "corridor":
        status_label = "Full closure" if disruption_type == "closure" else "Partial restriction"
        impact_summary = (
            f"{status_label} of {target_id} corridor. Estimated supply disruption: "
            f"{impact['volumeMbpd']:.1f} MBPD ({round(impact['volumeMbpd'] / 5.2 * 100)}% of India's daily imports). "
            f"Immediate rerouting required."
        )
    else:
        impact_summary = NODE_IMPACTS.get(
            target_id,
            f"{target_id} node disrupted. Impact assessment underway. Activating contingency protocols."
        )

    return {
        "targetId": target_id,
        "impactSummary": impact_summary,
        "affectedVolumeMbpd": impact["volumeMbpd"],
        "alternativeRoutes": impact["alternatives"],
        "recommendedAction": "Initiate emergency procurement from alternative sources. Brief Ministry of Petroleum within 4 hours. Pre-position SPR drawdown authorization.",
    }
