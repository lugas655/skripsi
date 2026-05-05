from pydantic import BaseModel
from typing import Dict

class PredictionResponse(BaseModel):
    label: str
    confidence: float
    all_probs: Dict[str, float]
    process_time_ms: float

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
