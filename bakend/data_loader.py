import pandas as pd
import numpy as np

# Synthetic AIS Dataset along a busy shipping corridor (e.g., Arabian Sea / Indian Ocean off Western Coast)
MOCK_AIS_DATA = [
    {
        "vessel_id": "VESSEL-101",
        "vessel_name": "MV Ocean Voyager",
        "mmsi": 419000111,
        "vessel_type": "Crude Oil Tanker",
        "lat": 18.9200,
        "lon": 72.7800,
        "speed_knots": 14.2,
        "heading_deg": 220.0,
        "ais_gap_detected": False,
        "historical_speeds": [14.0, 14.2, 14.1, 14.3]
    },
    {
        "vessel_id": "VESSEL-102",
        "vessel_name": "MT Pacific Star",
        "mmsi": 419000222,
        "vessel_type": "Chemical Tanker",
        "lat": 18.9550,
        "lon": 72.8150,
        "speed_knots": 6.1,  # Speed anomaly detected (drastically slowed down)
        "heading_deg": 215.0,
        "ais_gap_detected": True, # Signal turned off briefly
        "historical_speeds": [15.5, 14.8, 6.1, 7.0]
    },
    {
        "vessel_id": "VESSEL-103",
        "vessel_name": "Global Cargo I",
        "mmsi": 419000333,
        "vessel_type": "Container Ship",
        "lat": 19.0500,
        "lon": 72.9000,
        "speed_knots": 18.0,
        "heading_deg": 180.0,
        "ais_gap_detected": False,
        "historical_speeds": [18.0, 18.1, 17.9, 18.0]
    },
    {
        "vessel_id": "VESSEL-104",
        "vessel_name": "Sea Pioneer",
        "mmsi": 419000444,
        "vessel_type": "Bulk Carrier",
        "lat": 18.7500,
        "lon": 72.6500,
        "speed_knots": 11.0,
        "heading_deg": 310.0,
        "ais_gap_detected": False,
        "historical_speeds": [11.1, 11.0, 11.2, 11.0]
    }
]

# Sensitive Environmental Marine Zones
SENSITIVE_ZONES = [
    {"name": "Marine National Park & Coral Reef Reserve", "lat": 18.9800, "lon": 72.8500, "sensitivity": 0.95},
    {"name": "Coastal Mangrove & Fishery Sanctuary", "lat": 18.8900, "lon": 72.8200, "sensitivity": 0.85},
    {"name": "Deep Sea Commercial Fishing Corridor", "lat": 18.7000, "lon": 72.5000, "sensitivity": 0.50}
]

def get_ais_vessels():
    return MOCK_AIS_DATA

def get_sensitive_zones():
    return SENSITIVE_ZONES