import math
import random
from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, Body, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import ReserveStatus
from ..schemas import ReserveStatusResponse

router = APIRouter()

@router.get("/reserve/status", response_model=ReserveStatusResponse)
def get_reserve_status(db: Session = Depends(get_db)):
    status = db.query(ReserveStatus).first()
    if not status:
        raise HTTPException(status_code=404, detail="Reserve status not found")
    return status

@router.post("/reserve/optimize")
def optimize_reserve(
    db: Session = Depends(get_db),
    scenario_id: str = Body("hormuz_closure", alias="scenarioId"),
    drawdown_rate_mbpd: float = Body(0.3, alias="drawdownRateMbpd")
):
    current = db.query(ReserveStatus).first()
    current_days = current.current_days if current else 9.5
    daily_consumption = 5.2  # MBPD

    if scenario_id == "hormuz_closure":
        supply_gap_mbpd = 2.1
    elif scenario_id == "opec_cut":
        supply_gap_mbpd = 0.8
    elif scenario_id == "red_sea_suspension":
        supply_gap_mbpd = 1.4
    else:
        supply_gap_mbpd = 0.6

    net_drawdown = max(0.0, drawdown_rate_mbpd)
    
    if net_drawdown > 0:
        days_until_depletion = math.floor((current_days * daily_consumption) / net_drawdown)
    else:
        days_until_depletion = None

    today = datetime.now()
    
    if days_until_depletion is not None:
        depletion_date = (today + timedelta(days=days_until_depletion)).strftime("%Y-%m-%d")
    else:
        depletion_date = None

    replenish_start = (today + timedelta(days=45)).strftime("%Y-%m-%d")
    recommended_rate = min(supply_gap_mbpd * 0.85, 0.6)

    if net_drawdown > 0.5 or scenario_id == "hormuz_closure":
        depletion_str = str(days_until_depletion) if days_until_depletion is not None else "N/A"
        action_banner = (
            f"CRITICAL ACTION: Authorize SPR drawdown at {recommended_rate:.2f} MBPD. "
            f"Notify Mangalore, Padur, and Visakhapatnam SPR facilities. "
            f"Estimated depletion: {depletion_str} days at current rate. "
            f"Begin emergency replenishment procurement immediately."
        )
    elif supply_gap_mbpd > 0.5:
        action_banner = (
            f"ELEVATED ALERT: Pre-position SPR drawdown authorization. "
            f"Recommended rate: {recommended_rate:.2f} MBPD. "
            f"Monitor supply gap — activate within 72 hours if situation deteriorates."
        )
    else:
        action_banner = (
            f"MONITOR: No immediate SPR drawdown required. Maintain current reserve levels. "
            f"Schedule routine replenishment window beginning {replenish_start}."
        )

    return {
        "recommendedDrawdownRate": recommended_rate,
        "depletionDate": depletion_date,
        "repletionDate": None,
        "replenishmentStart": replenish_start,
        "actionBanner": action_banner,
    }

@router.get("/reserve/drawdown-schedule")
def get_drawdown_schedule(db: Session = Depends(get_db)):
    current = db.query(ReserveStatus).first()
    start_days = current.current_days if current else 9.5
    daily_demand = 5.2

    schedule = []
    today = datetime.now()
    reserve_level = start_days * daily_demand

    for i in range(30):
        date_str = (today + timedelta(days=i)).strftime("%Y-%m-%d")
        demand_forecast = daily_demand + (random.random() * 0.4 - 0.2)
        drawdown = 0.35 if i < 15 else 0.0
        supply_gap = 1.8 - i * 0.12 if i < 10 else 0.0
        
        reserve_level = max(0.0, reserve_level - drawdown)

        schedule.append({
            "date": date_str,
            "reserveLevel": round(reserve_level, 2),
            "demandForecast": round(demand_forecast, 2),
            "supplyGap": round(supply_gap, 2),
        })

    return schedule
