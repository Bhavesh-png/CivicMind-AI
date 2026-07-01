from fastapi import APIRouter
from app.data import mock_data
from app.core.config import settings

router = APIRouter(prefix="/data", tags=["City Data"])

# Initialize Google BigQuery Client conditionally
bq_client = None
if not settings.MOCK_GCP:
    try:
        from google.cloud import bigquery
        bq_client = bigquery.Client(project=settings.GCP_PROJECT_ID)
        print("Successfully created Google BigQuery client connection adapter.")
    except Exception as e:
        print(f"BigQuery client creation skipped or deferred: {e}")

@router.get("/metrics")
async def get_metrics():
    """
    Returns current telemetry metrics for all city cards.
    """
    if bq_client:
        try:
            # Query the latest telemetry payload from GCP BigQuery
            query = f"SELECT * FROM `{settings.GCP_PROJECT_ID}.city_telemetry.realtime_metrics` ORDER BY timestamp DESC LIMIT 1"
            query_job = bq_client.query(query)
            rows = list(query_job.result())
            if rows:
                r = rows[0]
                return {
                    "traffic": {
                        "congestion_pct": r.get("traffic_congestion_pct", 36),
                        "status": r.get("traffic_status", "Moderate"),
                        "avg_speed_kmh": r.get("traffic_avg_speed", 42.5),
                        "trend": r.get("traffic_trend", "up"),
                        "trend_text": r.get("traffic_trend_text", "+3% vs last hour")
                    },
                    "aqi": {
                        "value": r.get("aqi_val", 42),
                        "status": r.get("aqi_status", "Good"),
                        "primary_pollutant": r.get("aqi_pollutant", "PM2.5"),
                        "pm2_5_val": r.get("aqi_pm2_5", 18),
                        "trend": r.get("aqi_trend", "down"),
                        "trend_text": r.get("aqi_trend_text", "Good Air Quality")
                    },
                    "healthcare": {
                        "active_alerts": r.get("health_alerts", 5),
                        "total_admissions": r.get("health_admissions", 142),
                        "bed_occupancy_pct": r.get("health_occupancy", 74.2),
                        "status": r.get("health_status", "Stable")
                    },
                    "complaints": {
                        "total": r.get("complaints_total", len(mock_data.feedback_db)),
                        "pending": r.get("complaints_pending", len([f for f in mock_data.feedback_db if f["status"] == "Pending"])),
                        "in_progress": r.get("complaints_progress", len([f for f in mock_data.feedback_db if f["status"] == "In Progress"])),
                        "resolved": r.get("complaints_resolved", len([f for f in mock_data.feedback_db if f["status"] == "Resolved"])),
                        "new_today": r.get("complaints_today", 3)
                    },
                    "utilities": {
                        "electricity_mw": r.get("power_mw", 482.5),
                        "water_kl_hr": r.get("water_kl", 1120.0),
                        "power_status": r.get("power_status", "Normal"),
                        "water_status": r.get("water_status", "Normal")
                    },
                    "weather": {
                        "temp": r.get("weather_temp", 28.5),
                        "condition": r.get("weather_condition", "Overcast"),
                        "humidity": r.get("weather_humidity", 82),
                        "rain_chance": r.get("weather_rain", 65),
                        "wind_speed_kmh": r.get("weather_wind", 14)
                    }
                }
        except Exception as qe:
            print(f"Failed to query BigQuery metrics: {qe}. Falling back to simulated database.")
            
    return mock_data.get_current_metrics()

@router.get("/traffic-history")
async def get_traffic_history(days: int = 7):
    """
    Returns time-series traffic congestion logs.
    """
    return mock_data.get_traffic_history(days)

@router.get("/pollution-history")
async def get_pollution_history(days: int = 7):
    """
    Returns PM2.5 and PM10 AQI history.
    """
    return mock_data.get_pollution_history(days)

@router.get("/energy-history")
async def get_energy_history(days: int = 7):
    """
    Returns grid power load and water metrics.
    """
    return mock_data.get_energy_history(days)

@router.get("/disease-history")
async def get_disease_history(weeks: int = 12):
    """
    Returns weekly case tracking for Dengue, Influenza, and Gastroenteritis.
    """
    return mock_data.get_disease_history(weeks)

@router.get("/recommendations")
async def get_recommendations():
    """
    Returns actionable policy recommendations.
    """
    return mock_data.get_recommendations()

@router.get("/zones")
async def get_zones():
    """
    Returns mock city zone definitions.
    """
    return mock_data.ZONES

@router.get("/streets")
async def get_streets():
    """
    Returns coordinate list for mapping street lines.
    """
    return mock_data.STREETS
