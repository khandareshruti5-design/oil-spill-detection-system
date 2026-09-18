import math
from typing import List, Tuple
from schemas import CandidateVessel, EvidenceFactor

def match_ais_vessels(bdtoe_origin: Tuple[float, float], elapsed_hours: float) -> Tuple[List[CandidateVessel], List[dict]]:
    lat, lon = bdtoe_origin
    
    # Mock candidate vessels near origin
    candidates = [
        CandidateVessel(
            mmsi="211345000",
            vessel_name="Ocean Titan",
            vessel_type="Tanker",
            score=91.5,
            distance_km=0.8,
            evidence_breakdown=[
                EvidenceFactor(factor_name="Trajectory Match", weight=0.45, description="High correlation with BDTOE drift line"),
                EvidenceFactor(factor_name="Speed Anomaly", weight=0.30, description="Sudden drop from 14 knots to 3 knots")
            ]
        ),
        CandidateVessel(
            mmsi="314892000",
            vessel_name="Sea Explorer",
            vessel_type="Cargo",
            score=42.0,
            distance_km=4.2,
            evidence_breakdown=[
                EvidenceFactor(factor_name="Trajectory Match", weight=0.20, description="Passed 4.2 km south of calculated origin"),
                EvidenceFactor(factor_name="Speed Anomaly", weight=0.10, description="Maintained constant cruise speed")
            ]
        )
    ]

    # Generate predicted drift trajectory line for visualization
    trajectory = []
    for step in range(5):
        t_offset = step * (elapsed_hours / 4)
        pred_lat = lat + (step * 0.01)
        pred_lon = lon + (step * 0.015)
        trajectory.append({
            "lat": pred_lat,
            "lon": pred_lon,
            "timestamp_offset": int(t_offset)
        })

    return candidates, trajectory