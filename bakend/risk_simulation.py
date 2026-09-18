from typing import Tuple, Dict, Any

def simulate_coastal_risk(spill_center: Tuple[float, float], area_sq_km: float) -> Dict[str, Any]:
    risk_score = min(98.5, round(area_sq_km * 5.2 + 25.0, 1))
    
    return {
        "risk_score": risk_score,
        "risk_level": "CRITICAL" if risk_score > 75 else "HIGH",
        "high_risk_zone": "Alibaug Marine Protected Sanctuary (Zone A)"
    }