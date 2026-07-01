import random
from datetime import datetime, timedelta
from typing import List, Dict, Any
from fastapi import APIRouter, Body

router = APIRouter()

SCENARIOS = [
    {
        "id": "hormuz_closure",
        "name": "Strait of Hormuz Closure",
        "description": "Partial or full closure of the Strait of Hormuz due to military escalation, blocking 40% of India's crude supply.",
        "icon": "anchor",
        "defaultSeverity": 80,
        "category": "Maritime",
    },
    {
        "id": "opec_cut",
        "name": "OPEC+ Emergency Cut",
        "description": "OPEC+ announces an emergency production cut of 2-4 MBPD, causing a sharp spike in spot prices.",
        "icon": "trending-down",
        "defaultSeverity": 60,
        "category": "Supply",
    },
    {
        "id": "red_sea_suspension",
        "name": "Red Sea Route Suspension",
        "description": "Houthi attacks force suspension of Red Sea transit, rerouting tankers around the Cape of Good Hope (+12 days).",
        "icon": "ship",
        "defaultSeverity": 70,
        "category": "Maritime",
    },
    {
        "id": "pipeline_sabotage",
        "name": "Gulf Pipeline Sabotage",
        "description": "Critical Gulf pipeline infrastructure attacked, reducing spare capacity for export rerouting.",
        "icon": "zap",
        "defaultSeverity": 65,
        "category": "Infrastructure",
    },
    {
        "id": "sanctions_escalation",
        "name": "Iran Sanctions Escalation",
        "description": "Expanded US/EU sanctions on Iranian crude, blocking all Iranian supply lines into Indian refineries.",
        "icon": "shield-alert",
        "defaultSeverity": 55,
        "category": "Geopolitical",
    },
    {
        "id": "uae_dispute",
        "name": "UAE-India Diplomatic Rift",
        "description": "Diplomatic tension disrupts preferential access to UAE crude, impacting 8% of India's import volume.",
        "icon": "flag",
        "defaultSeverity": 40,
        "category": "Geopolitical",
    },
]

def generate_time_series(base_value: float, length: int, severity: float, direction: str = "down") -> List[Dict[str, Any]]:
    points = []
    today = datetime.now()
    
    for i in range(length):
        date_val = today + timedelta(days=i * 7)
        if direction == "down":
            multiplier = 1.0 - (severity / 100.0) * 0.4 * (i / length)
        else:
            multiplier = 1.0 + (severity / 100.0) * 0.3 * (i / length)
            
        noise = (random.random() * base_value * 0.05) - (base_value * 0.025)
        value = base_value * multiplier + noise
        
        points.append({
            "date": date_val.strftime("%Y-%m-%d"),
            "value": round(value, 2)
        })
        
    return points

@router.get("/scenarios")
def get_scenarios():
    return SCENARIOS

@router.post("/scenarios/simulate")
def simulate_scenario(
    scenario_id: str = Body("hormuz_closure", alias="scenarioId"),
    severity: float = Body(70.0)
):
    scenario = next((s for s in SCENARIOS if s["id"] == scenario_id), SCENARIOS[0])
    sev = max(0.0, min(100.0, severity))

    fuel_impact = sev * 0.35
    gdp_impact = sev * 0.028
    power_stress = sev * 0.6
    refinery_run_rate = 85.0 - sev * 0.25

    impacts = [
        {
            "metric": "Refinery Run Rate",
            "before": 85.0,
            "after": round(refinery_run_rate, 1),
            "unit": "%",
            "delta": round(refinery_run_rate - 85.0, 1),
            "direction": "down"
        },
        {
            "metric": "Domestic Fuel Price",
            "before": 95.5,
            "after": round(95.5 + fuel_impact * 0.5, 2),
            "unit": "₹/L",
            "delta": round(fuel_impact * 0.5, 2),
            "direction": "up"
        },
        {
            "metric": "Power Sector Stress Index",
            "before": 35.0,
            "after": round(35.0 + power_stress * 0.4, 1),
            "unit": "/100",
            "delta": round(power_stress * 0.4, 1),
            "direction": "up"
        },
        {
            "metric": "GDP Trajectory Impact",
            "before": 0.0,
            "after": round(-gdp_impact, 2),
            "unit": "% pts",
            "delta": round(-gdp_impact, 2),
            "direction": "down"
        }
    ]

    before_after = {
        "refineryRunRate": (
            generate_time_series(85.0, 6, 0.0) +
            generate_time_series(refinery_run_rate, 6, sev, "down")
        ),
        "fuelPriceDelta": (
            generate_time_series(95.5, 6, 0.0) +
            generate_time_series(95.5 + fuel_impact * 0.5, 6, sev, "up")
        ),
        "powerStressIndex": (
            generate_time_series(35.0, 6, 0.0) +
            generate_time_series(35.0 + power_stress * 0.4, 6, sev, "up")
        ),
        "gdpImpact": (
            generate_time_series(0.0, 6, 0.0) +
            generate_time_series(-gdp_impact, 6, sev, "down")
        )
    }

    return {
        "scenarioId": scenario["id"],
        "severity": sev,
        "impacts": impacts,
        "beforeAfter": before_after
    }
