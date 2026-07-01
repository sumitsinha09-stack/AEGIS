import random
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from sqlalchemy import asc
from ..database import get_db
from ..models import RiskScore, ReserveStatus, ProcurementRecommendation

router = APIRouter()

@router.get("/overview/summary")
def get_overview_summary(db: Session = Depends(get_db)):
    risk_scores = db.query(RiskScore).all()
    reserve = db.query(ReserveStatus).limit(1).all()
    procurement = db.query(ProcurementRecommendation).order_by(asc(ProcurementRecommendation.rank)).limit(3).all()

    avg_risk = sum(r.score for r in risk_scores) / len(risk_scores) if risk_scores else 45.0
    reserve_data = reserve[0] if reserve else None
    reserve_days = reserve_data.current_days if reserve_data else 9.5
    system_state = "CRITICAL" if avg_risk >= 75 else ("ELEVATED" if avg_risk >= 50 else "NOMINAL")

    hormuz_score = 68.0
    for r in risk_scores:
        if r.corridor == "Strait of Hormuz":
            hormuz_score = r.score
            break

    top_procurement_score = procurement[0].overall_score if procurement else 87.0
    corridors_at_risk = len([r for r in risk_scores if r.score >= 50.0])

    # Generate sparklines matching Express logic
    module_summaries = [
        {
            "module": "Risk Intelligence",
            "headline": "Hormuz Risk Score",
            "value": hormuz_score,
            "unit": "/100",
            "trend": "increasing",
            "sparkline": [45 + i * 4 + random.random() * 5 for i in range(8)]
        },
        {
            "module": "Scenario Modeller",
            "headline": "Active Scenario Impact",
            "value": 2.3,
            "unit": "% GDP",
            "trend": "stable",
            "sparkline": [1.5 + random.random() * 2 for _ in range(8)]
        },
        {
            "module": "Procurement",
            "headline": "Top Source Score",
            "value": top_procurement_score,
            "unit": "/100",
            "trend": "up",
            "sparkline": [70 + i * 2 + random.random() * 5 for i in range(8)]
        },
        {
            "module": "Reserve Optimizer",
            "headline": "SPR Cover",
            "value": reserve_days,
            "unit": " days",
            "trend": "decreasing",
            "sparkline": [reserve_days + (7 - i) * 0.3 - random.random() for i in range(8)]
        },
        {
            "module": "Digital Twin",
            "headline": "Corridors At Risk",
            "value": corridors_at_risk,
            "unit": " corridors",
            "trend": "increasing",
            "sparkline": [float(i // 2) for i in range(8)]
        }
    ]

    iso_now = datetime.now().isoformat()
    if iso_now.endswith("+00:00"):
        iso_now = iso_now[:-6] + "Z"
    else:
        iso_now += "Z"

    return {
        "systemState": system_state,
        "riskScore": round(avg_risk, 1),
        "reserveDays": reserve_days,
        "activeScenario": None,
        "moduleSummaries": module_summaries,
        "lastUpdated": iso_now,
    }

@router.post("/overview/run-simulation")
def run_simulation(
    db: Session = Depends(get_db),
    scenario_id: str = Body(None, alias="scenarioId"),
    severity: float = Body(75.0)
):
    risk_scores = db.query(RiskScore).all()
    procurement = db.query(ProcurementRecommendation).order_by(asc(ProcurementRecommendation.rank)).limit(5).all()

    multiplier = severity / 100.0
    updated_scores = []
    
    for r in risk_scores:
        new_score = min(100.0, r.score * (1.0 + multiplier * 0.4))
        
        if new_score >= 75.0:
            new_level = "CRITICAL"
        elif new_score >= 50.0:
            new_level = "HIGH"
        else:
            new_level = "MODERATE"
            
        iso_last_updated = r.last_updated.isoformat() if r.last_updated else datetime.now().isoformat()
        if iso_last_updated.endswith("+00:00"):
            iso_last_updated = iso_last_updated[:-6] + "Z"
            
        updated_scores.append({
            "id": r.id,
            "corridor": r.corridor,
            "score": new_score,
            "level": new_level,
            "trend": "increasing",
            "lastUpdated": iso_last_updated,
        })

    avg_score = sum(s["score"] for s in updated_scores) / len(updated_scores) if updated_scores else 45.0
    system_state = "CRITICAL" if avg_score >= 75.0 else ("ELEVATED" if avg_score >= 50.0 else "NOMINAL")

    scenario_labels = {
        "hormuz_closure": "Strait of Hormuz Partial Closure",
        "opec_cut": "OPEC+ Emergency Production Cut",
        "red_sea_suspension": "Red Sea Route Suspension",
        "pipeline_sabotage": "Gulf Pipeline Sabotage",
        "sanctions_escalation": "Iran Sanctions Escalation",
    }

    if severity >= 75.0:
        reserve_action = "IMMEDIATE: Activate SPR drawdown at 0.5 MBPD. Alert refineries for blend substitution."
    else:
        reserve_action = "MONITOR: Pre-position tanker capacity. Increase spot market coverage by 15%."

    scenario_name = scenario_labels.get(scenario_id, scenario_id or "Generic Disruption")
    critical_count = len([s for s in updated_scores if s["level"] == "CRITICAL"])
    
    impact_summary = (
        f"Simulation: {scenario_name} at {severity}% severity. "
        f"System state elevated to {system_state}. "
        f"{critical_count} corridors critical."
    )

    # Serialize procurement plan to match camelCase fields
    procurement_plan = []
    for p in procurement:
        procurement_plan.append({
            "id": p.id,
            "rank": p.rank,
            "supplier": p.supplier,
            "country": p.country,
            "route": p.route,
            "spotPrice": p.spot_price,
            "tankerAvailability": p.tanker_availability,
            "portCongestion": p.port_congestion,
            "gradeCompatibility": p.grade_compatibility,
            "overallScore": p.overall_score,
            "reasoning": p.reasoning,
            "status": p.status,
        })

    return {
        "systemState": system_state,
        "riskScores": updated_scores,
        "procurementPlan": procurement_plan,
        "reserveAction": reserve_action,
        "impactSummary": impact_summary,
    }
