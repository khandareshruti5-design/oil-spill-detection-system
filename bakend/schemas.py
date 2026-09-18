from pydantic import BaseModel
from typing import List, Tuple, Optional

class EvidenceFactor(BaseModel):
    factor_name: str
    weight: float
    description: str

class CandidateVessel(BaseModel):
    mmsi: str
    vessel_name: str
    vessel_type: str
    score: float
    distance_km: float
    evidence_breakdown: Optional[List[EvidenceFactor]] = None

class SpillDetectionResult(BaseModel):
    spill_center: Tuple[float, float]
    area_sq_km: float
    bdtoe_origin: Tuple[float, float]

class TrajectoryPoint(BaseModel):
    lat: float
    lon: float
    timestamp_offset: int

class CoastalRiskResult(BaseModel):
    risk_score: float
    risk_level: str
    high_risk_zone: str

class PipelineResponse(BaseModel):
    status: str
    spill_detection: SpillDetectionResult
    candidate_vessels: List[CandidateVessel]
    drift_trajectory: List[TrajectoryPoint]
    risk_assessment: CoastalRiskResult