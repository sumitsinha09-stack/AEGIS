from typing import List, Dict
from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from sqlalchemy import asc
from ..database import get_db
from ..models import ProcurementRecommendation
from ..schemas import ProcurementRecommendationResponse

router = APIRouter()

CRUDE_SOURCES = [
    {"id": 1, "supplier": "Iraq State Oil", "country": "Iraq", "gradeType": "Basra Heavy", "typicalVolume": 1.2, "currentPrice": 78.4},
    {"id": 2, "supplier": "Saudi Aramco", "country": "Saudi Arabia", "gradeType": "Arab Light", "typicalVolume": 0.9, "currentPrice": 81.2},
    {"id": 3, "supplier": "Rosneft", "country": "Russia", "gradeType": "Urals", "typicalVolume": 0.8, "currentPrice": 62.5},
    {"id": 4, "supplier": "ADNOC", "country": "UAE", "gradeType": "Murban", "typicalVolume": 0.5, "currentPrice": 84.1},
    {"id": 5, "supplier": "NNPC", "country": "Nigeria", "gradeType": "Bonny Light", "typicalVolume": 0.3, "currentPrice": 87.3},
    {"id": 6, "supplier": "Chevron", "country": "United States", "gradeType": "WTI Midland", "typicalVolume": 0.25, "currentPrice": 79.8},
    {"id": 7, "supplier": "Kuwait Petroleum", "country": "Kuwait", "gradeType": "Kuwait Export", "typicalVolume": 0.35, "currentPrice": 79.1},
]

SCENARIO_REASONINGS: Dict[str, List[str]] = {
    "hormuz_closure": [
        "Hormuz closure eliminates direct Gulf access. Basra supply fully disrupted — switch to Cape of Good Hope routing via non-Gulf sources. US WTI and West African Bonny Light prioritized for grade compatibility with Jamnagar complex.",
        "Saudi Aramco Red Sea terminal (Yanbu) partially viable. Routing via Suez adds 4 days transit but maintains refinery grade. Pre-position 2 VLCCs at Fujairah anchorage for immediate dispatch post-clearance.",
        "ADNOC's Fujairah export terminal unaffected. Murban grade compatible with Vadinar and Paradip. Recommend 30% volume increase on ADNOC contract for next 90 days.",
        "Russian Urals available via Black Sea → Suez. Discounted pricing partially offsets rerouting costs. Grade adjustment required at Barauni and Mathura refineries.",
        "Kuwait routing blocked. Deferring to Q2 — no viable alternative route identified within cost parameters.",
    ],
    "opec_cut": [
        "OPEC+ cut increases spot price 22%. Accelerate US WTI spot procurement before further tightening. Lock in 60-day forward contracts at today's price.",
        "Russian Urals offers 28% discount to Brent. Volume increase viable — initiate diplomatic channel for payment settlement in INR.",
        "Saudi volumes reduced but not eliminated. Maintain relationship purchasing at reduced volume; renegotiate contract floor price.",
        "Nigerian Bonny Light unaffected by OPEC+ cut. Increase allocation; vessel availability confirmed via Paradip port authority.",
        "UAE Murban allocation unchanged. Minor pricing adjustment expected. Continue at current volume.",
    ],
}

@router.get("/procurement/recommendations", response_model=List[ProcurementRecommendationResponse])
def get_recommendations(db: Session = Depends(get_db)):
    recs = db.query(ProcurementRecommendation).order_by(asc(ProcurementRecommendation.rank)).all()
    return recs

@router.post("/procurement/run")
def run_procurement(
    scenario_id: str = Body("hormuz_closure", alias="scenarioId", embed=True)
):
    reasonings = SCENARIO_REASONINGS.get(scenario_id, SCENARIO_REASONINGS["hormuz_closure"])

    sources = [
        {"supplier": "ADNOC", "country": "UAE", "route": "Fujairah → Cape Guardafui → Lakshadweep → Paradip", "spotPrice": 84.1, "tankerAvail": 0.92, "portCong": 0.82, "gradeComp": 0.95},
        {"supplier": "Saudi Aramco", "country": "Saudi Arabia", "route": "Yanbu → Suez → Red Sea → Jamnagar", "spotPrice": 81.2, "tankerAvail": 0.85, "portCong": 0.78, "gradeComp": 0.90},
        {"supplier": "Chevron", "country": "United States", "route": "Houston → Atlantic → Cape of Good Hope → Paradip", "spotPrice": 79.8, "tankerAvail": 0.88, "portCong": 0.91, "gradeComp": 0.88},
        {"supplier": "Rosneft", "country": "Russia", "route": "Novorossiysk → Suez → Arabian Sea → Vadinar", "spotPrice": 62.5, "tankerAvail": 0.72, "portCong": 0.65, "gradeComp": 0.75},
        {"supplier": "NNPC", "country": "Nigeria", "route": "Bonny → Cape of Good Hope → Paradip", "spotPrice": 87.3, "tankerAvail": 0.80, "portCong": 0.88, "gradeComp": 0.85},
    ]

    scored = []
    for i, s in enumerate(sources):
        price_score = (1 - (s["spotPrice"] - 60) / 40) * 100
        overall_score = round(
            price_score * 0.30 + s["tankerAvail"] * 100 * 0.25 + s["portCong"] * 100 * 0.20 + s["gradeComp"] * 100 * 0.25,
            1
        )
        
        if overall_score >= 82:
            status = "RECOMMENDED"
        elif overall_score >= 70:
            status = "VIABLE"
        elif overall_score >= 55:
            status = "MARGINAL"
        else:
            status = "AVOID"
            
        reasoning = reasonings[i] if i < len(reasonings) else f"Standard procurement analysis for {s['supplier']}. Score based on multi-factor assessment."
        
        scored.append({
            "id": i + 1,
            "rank": i + 1,
            "supplier": s["supplier"],
            "country": s["country"],
            "route": s["route"],
            "spotPrice": s["spotPrice"],
            "tankerAvailability": s["tankerAvail"] * 100,  # Frontend displays as %, backend DB values are 0-100 or percentages? Wait.
            # In the DB seed, we set: tankerAvailability: 0.92, portCongestion: 0.82, gradeCompatibility: 0.95
            # Ah, wait! The scored object fields: in Express it did `s.tankerAvail`, which was 0.92, but wait!
            # In Express: `tankerAvailability: s.tankerAvail, portCongestion: s.portCong, gradeCompatibility: s.gradeComp`
            # Yes, they are 0.92, 0.82, 0.95! So let's keep them as decimal (0.92) rather than multiplying by 100!
            "tankerAvailability": s["tankerAvail"],
            "portCongestion": s["portCong"],
            "gradeCompatibility": s["gradeComp"],
            "overallScore": overall_score,
            "reasoning": reasoning,
            "status": status,
        })

    # Sort descending by overallScore and re-rank
    scored.sort(key=lambda x: x["overallScore"], reverse=True)
    for i, s in enumerate(scored):
        s["rank"] = i + 1

    return scored

@router.get("/procurement/sources")
def get_sources():
    return CRUDE_SOURCES
