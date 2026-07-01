import random
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from ..database import get_db
from ..models import RiskScore, NewsSignal, SupplierRisk
from ..schemas import RiskScoreResponse, NewsSignalResponse, SupplierRiskResponse

router = APIRouter()

@router.get("/risk/scores", response_model=List[RiskScoreResponse])
def get_risk_scores(db: Session = Depends(get_db)):
    scores = db.query(RiskScore).order_by(desc(RiskScore.score)).all()
    return scores

@router.post("/risk/scores/refresh", response_model=List[RiskScoreResponse])
def refresh_risk_scores(db: Session = Depends(get_db)):
    scores = db.query(RiskScore).all()
    updated_scores = []
    
    for s in scores:
        delta = (random.random() - 0.4) * 8
        new_score = max(0.0, min(100.0, s.score + delta))
        
        # Calculate level
        if new_score >= 75:
            new_level = "CRITICAL"
        elif new_score >= 50:
            new_level = "HIGH"
        elif new_score >= 25:
            new_level = "MODERATE"
        else:
            new_level = "LOW"
            
        # Calculate trend
        if delta > 1:
            new_trend = "increasing"
        elif delta < -1:
            new_trend = "decreasing"
        else:
            new_trend = "stable"
            
        s.score = new_score
        s.level = new_level
        s.trend = new_trend
        s.last_updated = datetime.now()
        updated_scores.append(s)
        
    db.commit()
    
    # Return scores sorted by score descending to match Express router
    updated_scores.sort(key=lambda x: x.score, reverse=True)
    return updated_scores

@router.get("/risk/signals", response_model=List[NewsSignalResponse])
def get_news_signals(db: Session = Depends(get_db)):
    signals = db.query(NewsSignal).order_by(desc(NewsSignal.timestamp)).limit(50).all()
    return signals

@router.get("/risk/suppliers", response_model=List[SupplierRiskResponse])
def get_supplier_risks(db: Session = Depends(get_db)):
    suppliers = db.query(SupplierRisk).order_by(desc(SupplierRisk.risk_score)).all()
    return suppliers
