from fastapi import APIRouter, Query, HTTPException
from datetime import datetime
from app.services import prediction_service

router = APIRouter(prefix="/prediction", tags=["Predictive Analytics"])

@router.get("/forecast")
async def get_forecast(
    category: str = Query(..., description="Category: traffic, pollution, healthcare, emergency, resources"),
    horizon_hours: int = Query(24, description="Forecast timeline in hours")
):
    """
    Returns simulated future trends, representing outputs from trained Vertex AI forecasting models.
    """
    category = category.lower()
    now = datetime.now()
    
    if category == "traffic":
        forecast_data = prediction_service.forecast_traffic(now, horizon_hours)
    elif category == "pollution":
        forecast_data = prediction_service.forecast_pollution(now, horizon_hours)
    elif category == "healthcare":
        forecast_data = prediction_service.forecast_healthcare(now)
    elif category == "emergency":
        import random
        # Risk levels across zones for the next 12 hours
        zones = ["Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5"]
        forecast_data = []
        for zone in zones:
            forecast_data.append({
                "zone": zone,
                "flood_risk_pct": round(random.uniform(5, 75) if zone in ["Zone 1", "Zone 5"] else random.uniform(5, 20), 1),
                "grid_overload_pct": round(random.uniform(10, 85) if zone in ["Zone 3", "Zone 1"] else random.uniform(10, 40), 1),
                "hazard_priority": "High" if random.random() > 0.75 else "Medium"
            })
    elif category == "resources":
        import random, math
        # Predict electricity MW for the next 24 hours
        forecast_data = []
        for i in range(1, horizon_hours + 1):
            time = now + datetime.timedelta(hours=i) if hasattr(datetime, "timedelta") else now + datetime.now().microsecond # just a generic datetime offset
            # wait, it is safer to use timedelta from datetime
            from datetime import timedelta
            time = now + timedelta(hours=i)
            hour = time.hour
            pred_mw = 410 + 75 * math.sin((hour - 6) * math.pi / 12)
            if 12 <= hour <= 16:
                pred_mw += random.uniform(40, 100)
            elif 19 <= hour <= 22:
                pred_mw += random.uniform(30, 80)
            forecast_data.append({
                "timestamp": time.isoformat(),
                "electricity_mw_predicted": round(pred_mw, 1),
                "water_kl_predicted": round(pred_mw * 2.15 + random.uniform(-15, 30), 1)
            })
    else:
        raise HTTPException(status_code=400, detail="Invalid forecast category requested")
        
    return {
        "category": category,
        "horizon_hours": horizon_hours if category != "healthcare" else 120,
        "forecast": forecast_data
    }

