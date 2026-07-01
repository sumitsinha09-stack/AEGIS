from fastapi import APIRouter
from ..schemas import HealthCheckResponse

router = APIRouter()

@router.get("/healthz", response_model=HealthCheckResponse)
def health_check():
    return {"status": "ok"}
