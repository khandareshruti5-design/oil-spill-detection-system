from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil

from schemas import PipelineResponse
from image_processing import process_sar_image
from attribution_engine import match_ais_vessels
from risk_simulation import simulate_coastal_risk

app = FastAPI(
    title="Oil Spill Detection & AIS Attribution Engine",
    version="1.0.0"
)

# Enable CORS for Frontend React integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
def read_root():
    return {"status": "Online", "system": "Oil Spill Detection & AIS Attribution Engine"}

@app.post("/api/analyze", response_model=PipelineResponse)
async def analyze_pipeline(
    file: UploadFile = File(...),
    wind_speed_knots: float = Form(12.0),
    wind_direction_deg: float = Form(142.0),
    elapsed_hours: float = Form(4.0)
):
    try:
        # Save uploaded SAR image
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 1. Process SAR Image & Detect Spill
        spill_data = process_sar_image(file_path, wind_speed_knots, wind_direction_deg, elapsed_hours)

        # 2. Match AIS Candidates (EMVAM)
        candidates, trajectory = match_ais_vessels(spill_data["bdtoe_origin"], elapsed_hours)

        # 3. Simulate Coastal Risk (DESI)
        risk_data = simulate_coastal_risk(spill_data["spill_center"], spill_data["area_sq_km"])

        return {
            "status": "success",
            "spill_detection": spill_data,
            "candidate_vessels": candidates,
            "drift_trajectory": trajectory,
            "risk_assessment": risk_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))