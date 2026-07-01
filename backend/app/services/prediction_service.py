import math
import random
from datetime import datetime, timedelta

def forecast_traffic(now: datetime, horizon_hours: int) -> list[dict]:
    forecast_data = []
    for i in range(1, horizon_hours + 1):
        time = now + timedelta(hours=i)
        hour = time.hour
        pred_congestion = 32 + 12 * math.sin((hour - 4) * math.pi / 12)
        if 8 <= hour <= 10:
            pred_congestion += random.uniform(20, 35)
        elif 17 <= hour <= 19:
            pred_congestion += random.uniform(25, 40)
        else:
            pred_congestion += random.uniform(-3, 6)
            
        forecast_data.append({
            "timestamp": time.isoformat(),
            "congestion_predicted": round(min(max(pred_congestion, 10), 95), 1),
            "confidence_lower": round(max(pred_congestion - 12, 5), 1),
            "confidence_upper": round(min(pred_congestion + 12, 100), 1),
        })
    return forecast_data

def forecast_pollution(now: datetime, horizon_hours: int) -> list[dict]:
    forecast_data = []
    for i in range(1, horizon_hours + 1):
        time = now + timedelta(hours=i)
        hour = time.hour
        pred_aqi = 75 + 20 * math.sin((hour - 3) * math.pi / 12) + random.uniform(-8, 8)
        if 7 <= hour <= 10:
            pred_aqi += random.uniform(15, 30)
            
        forecast_data.append({
            "timestamp": time.isoformat(),
            "aqi_predicted": round(min(max(pred_aqi, 30), 250), 0),
            "confidence_lower": round(max(pred_aqi - 18, 15), 0),
            "confidence_upper": round(min(pred_aqi + 18, 300), 0),
        })
    return forecast_data

def forecast_healthcare(now: datetime) -> list[dict]:
    forecast_data = []
    for i in range(1, 6): # 5 days forecast
        time = now + timedelta(days=i)
        dengue_cases = 15 + math.sin(i * 0.5) * 4 + random.randint(-2, 3)
        flu_cases = 35 + random.randint(-5, 8)
        gastro_cases = 24 + random.randint(-4, 4)
        
        forecast_data.append({
            "date": time.strftime("%Y-%m-%d"),
            "Dengue_predicted": max(int(dengue_cases), 0),
            "Influenza_predicted": max(int(flu_cases), 0),
            "Gastroenteritis_predicted": max(int(gastro_cases), 0),
        })
    return forecast_data
