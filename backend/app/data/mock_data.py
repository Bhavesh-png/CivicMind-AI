import random
from datetime import datetime, timedelta
import math

# Seed for reproducibility
random.seed(42)

# Location definitions in a mock city layout (e.g., central latitude 18.97, longitude 72.82 - Mumbai/Pune region)
LAT_CENTER = 18.975
LON_CENTER = 72.825

ZONES = {
    "Zone 1": {"name": "Downtown Core", "lat": 18.978, "lon": 72.822, "type": "Commercial"},
    "Zone 2": {"name": "Metro North", "lat": 19.012, "lon": 72.835, "type": "Residential"},
    "Zone 3": {"name": "Industrial East", "lat": 18.962, "lon": 72.868, "type": "Industrial"},
    "Zone 4": {"name": "Western Suburbs", "lat": 18.950, "lon": 72.801, "type": "Residential"},
    "Zone 5": {"name": "Harbor View", "lat": 18.932, "lon": 72.830, "type": "Mixed-Use"}
}

STREETS = [
    {"name": "Main Street", "coords": [[18.980, 72.810], [18.980, 72.840]], "zone": "Zone 1"},
    {"name": "Link Road", "coords": [[18.950, 72.800], [19.010, 72.800]], "zone": "Zone 4"},
    {"name": "East Express Highway", "coords": [[18.940, 72.860], [19.020, 72.870]], "zone": "Zone 3"},
    {"name": "Marine Drive", "coords": [[18.930, 72.810], [18.960, 72.815]], "zone": "Zone 5"},
    {"name": "Hill Road", "coords": [[19.000, 72.820], [19.015, 72.840]], "zone": "Zone 2"}
]

DISEASES = ["Dengue", "Gastroenteritis", "Influenza", "Malaria"]

# Pre-populated citizen feedback complaints
MOCK_FEEDBACK_TEMPLATES = [
    {
        "title": "Severe water logging near Market",
        "description": "After yesterday's rain, the road near the local market is heavily flooded. Water has entered some shops. Drain pipes appear to be choked.",
        "category": "Utilities",
        "zone": "Zone 1",
        "sentiment": "Negative",
        "priority": "High"
    },
    {
        "title": "Garbage dump pile overflow",
        "description": "The public trash container has not been cleared for 4 days. It is overflowing onto the main sidewalk, emitting a terrible smell and attracting stray animals.",
        "category": "Public Services",
        "zone": "Zone 2",
        "sentiment": "Negative",
        "priority": "Medium"
    },
    {
        "title": "Traffic signal malfunctioning at Sector 5 crossroad",
        "description": "The traffic light is stuck on red for the last 2 hours. It's causing heavy congestion and gridlock. Vehicles are forcing their way through.",
        "category": "Traffic",
        "zone": "Zone 4",
        "sentiment": "Negative",
        "priority": "High"
    },
    {
        "title": "Cleanliness and prompt park maintenance",
        "description": "Highly appreciate the municipal workers who cleaned the central park this morning. The newly planted flowers look beautiful.",
        "category": "Public Services",
        "zone": "Zone 5",
        "sentiment": "Positive",
        "priority": "Low"
    },
    {
        "title": "Unreported chemical smell from factory chimneys",
        "description": "Every evening after 8 PM, there is a strong chemical/plastic burning smell coming from the industrial estate. It causes breathing irritation.",
        "category": "Environment",
        "zone": "Zone 3",
        "sentiment": "Negative",
        "priority": "High"
    },
    {
        "title": "Streetlight failure in lane 3",
        "description": "All streetlights in this lane are off since last Monday. It is completely dark and unsafe for women and children walking home at night.",
        "category": "Utilities",
        "zone": "Zone 2",
        "sentiment": "Negative",
        "priority": "Medium"
    },
    {
        "title": "Primary school vaccination drive feedback",
        "description": "The medical staff at the clinic were very cooperative and organized during the polio drive. Very helpful and smooth process.",
        "category": "Healthcare",
        "zone": "Zone 4",
        "sentiment": "Positive",
        "priority": "Low"
    },
    {
        "title": "Pothole hazard on Highway exit",
        "description": "There is a massive and deep pothole right at the exit of the expressway. Motorcyclists are losing control trying to avoid it.",
        "category": "Traffic",
        "zone": "Zone 3",
        "sentiment": "Negative",
        "priority": "High"
    }
]

# Generate mock data lists
feedback_db = []
for i, template in enumerate(MOCK_FEEDBACK_TEMPLATES):
    date = datetime.now() - timedelta(days=random.randint(0, 10), hours=random.randint(0, 23))
    feedback_db.append({
        "id": f"complaint-{1000 + i}",
        "title": template["title"],
        "description": template["description"],
        "category": template["category"],
        "zone": template["zone"],
        "lat": ZONES[template["zone"]]["lat"] + random.uniform(-0.005, 0.005),
        "lon": ZONES[template["zone"]]["lon"] + random.uniform(-0.005, 0.005),
        "timestamp": date.isoformat(),
        "reporter": f"User_{random.randint(100, 999)}",
        "status": random.choice(["Pending", "In Progress", "Resolved"]) if template["priority"] != "High" else "In Progress",
        "priority": template["priority"],
        "sentiment": template["sentiment"],
        "ai_summary": f"Citizen reports issue regarding {template['title'].lower()}. Priority detected as {template['priority']} due to safety concerns."
    })

# Add a function to create a new complaint
def add_complaint(title: str, description: str, category: str, zone: str):
    complaint_id = f"complaint-{1000 + len(feedback_db)}"
    zone_data = ZONES.get(zone, ZONES["Zone 1"])
    
    # Analyze sentiment & priority in a basic rule-based way for immediate response
    desc_lower = description.lower()
    priority = "Low"
    if any(word in desc_lower for word in ["severe", "flooded", "danger", "hazard", "broken", "malfunction", "accident", "choked", "unsafe"]):
        priority = "High"
    elif any(word in desc_lower for word in ["pothole", "broken", "dirty", "smell", "dark", "delay"]):
        priority = "Medium"
        
    sentiment = "Negative"
    if any(word in desc_lower for word in ["good", "great", "thank", "appreciate", "clean", "happy", "cooperative"]):
        sentiment = "Positive"
    elif any(word in desc_lower for word in ["average", "neutral", "okay", "feedback"]):
        sentiment = "Neutral"

    new_c = {
        "id": complaint_id,
        "title": title,
        "description": description,
        "category": category,
        "zone": zone,
        "lat": zone_data["lat"] + random.uniform(-0.003, 0.003),
        "lon": zone_data["lon"] + random.uniform(-0.003, 0.003),
        "timestamp": datetime.now().isoformat(),
        "reporter": "Citizen_Portal",
        "status": "Pending",
        "priority": priority,
        "sentiment": sentiment,
        "ai_summary": f"AI Analysed: Issue with {category} categorized as {priority} priority. Action required at {zone}."
    }
    feedback_db.insert(0, new_c) # insert at start
    return new_c

# Time series generator utilities
def get_traffic_history(days: int = 7):
    history = []
    base_time = datetime.now() - timedelta(days=days)
    for hour_offset in range(days * 24):
        time = base_time + timedelta(hours=hour_offset)
        # Peak traffic hours are 9 AM and 6 PM
        hour = time.hour
        base_val = 30 + 10 * math.sin((hour - 4) * math.pi / 12)  # cycle
        # Add peak boosts
        if 8 <= hour <= 10:
            base_val += random.uniform(25, 45)
        elif 17 <= hour <= 19:
            base_val += random.uniform(30, 50)
        else:
            base_val += random.uniform(-5, 10)
            
        history.append({
            "timestamp": time.isoformat(),
            "congestion": round(min(max(base_val, 10), 98), 1),
            "speed": round(min(max(80 - (base_val * 0.7), 12), 75), 1)
        })
    return history

def get_pollution_history(days: int = 7):
    history = []
    base_time = datetime.now() - timedelta(days=days)
    for hour_offset in range(days * 24):
        time = base_time + timedelta(hours=hour_offset)
        # Pollution peaks around morning traffic (8-11 AM) and evening traffic (6-9 PM)
        hour = time.hour
        base_aqi = 65 + 15 * math.sin((hour - 3) * math.pi / 12)
        if 8 <= hour <= 11:
            base_aqi += random.uniform(20, 45)
        elif 18 <= hour <= 21:
            base_aqi += random.uniform(15, 35)
        else:
            base_aqi += random.uniform(-10, 10)
            
        # Add industrial zone constant bias
        base_aqi = min(max(base_aqi, 20), 280)
        
        pm2_5 = base_aqi * 0.45 + random.uniform(0, 5)
        pm10 = base_aqi * 0.75 + random.uniform(0, 10)
        
        history.append({
            "timestamp": time.isoformat(),
            "aqi": round(base_aqi, 0),
            "pm2_5": round(pm2_5, 1),
            "pm10": round(pm10, 1)
        })
    return history

def get_energy_history(days: int = 7):
    history = []
    base_time = datetime.now() - timedelta(days=days)
    for hour_offset in range(days * 24):
        time = base_time + timedelta(hours=hour_offset)
        hour = time.hour
        # Peak energy usage in afternoon (12 PM - 4 PM) due to cooling, and evening (7 PM - 10 PM) due to lighting
        base_mw = 420 + 80 * math.sin((hour - 6) * math.pi / 12)
        if 12 <= hour <= 16:
            base_mw += random.uniform(50, 120)
        elif 19 <= hour <= 22:
            base_mw += random.uniform(40, 90)
        else:
            base_mw += random.uniform(-30, 30)
            
        history.append({
            "timestamp": time.isoformat(),
            "electricity_mw": round(base_mw, 1),
            "water_kl": round(base_mw * 2.2 + random.uniform(-20, 50), 1)
        })
    return history

def get_disease_history(weeks: int = 12):
    history = []
    base_time = datetime.now() - timedelta(weeks=weeks)
    for week_offset in range(weeks):
        time = base_time + timedelta(weeks=week_offset)
        # Seasonal dengue peaks in monsoon (June to September - our current simulated date is June 30)
        dengue = 12 + 8 * math.sin(week_offset * math.pi / 6) + random.randint(0, 5)
        gastro = 28 + random.randint(-6, 12)
        flu = 45 + 15 * math.sin((week_offset + 3) * math.pi / 6) + random.randint(-10, 15)
        
        history.append({
            "week": time.strftime("%Y-W%W"),
            "timestamp": time.isoformat(),
            "Dengue": max(int(dengue), 0),
            "Gastroenteritis": max(int(gastro), 0),
            "Influenza": max(int(flu), 0),
            "total_active": max(int(dengue + gastro + flu), 0)
        })
    return history

# Current dashboard static parameters
def get_current_metrics():
    # Traffic
    traffic_status = "Moderate"
    congestion_pct = 36
    congestion_trend = "up"
    
    # AQI
    aqi_val = 42
    aqi_status = "Good"
    
    # Healthcare
    active_alerts = 5
    icu_occupancy = 78
    
    # Feedback
    feedback_total = len(feedback_db)
    new_today = 3
    
    # Resource consumption
    current_power = 482.5 # MW
    current_water = 1120 # KL/hr
    
    # Weather
    temp = 28.5
    condition = "Overcast"
    humidity = 82
    rain_chance = 65
    
    return {
        "traffic": {
            "congestion_pct": congestion_pct,
            "status": traffic_status,
            "avg_speed_kmh": 42.5,
            "trend": congestion_trend,
            "trend_text": "+3% vs last hour"
        },
        "aqi": {
            "value": aqi_val,
            "status": aqi_status,
            "primary_pollutant": "PM2.5",
            "pm2_5_val": 18,
            "trend": "down",
            "trend_text": "Good Air Quality"
        },
        "healthcare": {
            "active_alerts": active_alerts,
            "total_admissions": 142,
            "bed_occupancy_pct": 74.2,
            "status": "Stable"
        },
        "complaints": {
            "total": feedback_total,
            "pending": len([f for f in feedback_db if f["status"] == "Pending"]),
            "in_progress": len([f for f in feedback_db if f["status"] == "In Progress"]),
            "resolved": len([f for f in feedback_db if f["status"] == "Resolved"]),
            "new_today": new_today
        },
        "utilities": {
            "electricity_mw": current_power,
            "water_kl_hr": current_water,
            "power_status": "Normal",
            "water_status": "Normal"
        },
        "weather": {
            "temp": temp,
            "condition": condition,
            "humidity": humidity,
            "rain_chance": rain_chance,
            "wind_speed_kmh": 14
        }
    }

# Mock Recommendations
def get_recommendations():
    return [
        {
            "id": "rec-1",
            "category": "Traffic",
            "title": "Optimize Traffic Signals on Main Street Corridor",
            "description": "Congestion levels on Main Street have increased by 14% over the last 2 hours. Deploying green-wave signal timings will save commuter times by an average of 6 minutes.",
            "impact": "High Impact",
            "confidence": 92,
            "actionable": True,
            "assigned_to": "Transport Department",
            "status": "Recommended"
        },
        {
            "id": "rec-2",
            "category": "Environment",
            "title": "Inspect Chemical Emissions in Industrial East (Zone 3)",
            "description": "Citizen reports indicate periodic strong plastic-burning odors. Correlating with wind directions, the source is likely the southeastern quarter of Sector 12.",
            "impact": "High Impact",
            "confidence": 88,
            "actionable": True,
            "assigned_to": "Environmental Protection",
            "status": "Investigating"
        },
        {
            "id": "rec-3",
            "category": "Healthcare",
            "title": "Pre-position Dengue Medical Kits in Zone 4 (Western Suburbs)",
            "description": "Predictive analytics projects a 20% rise in dengue cases in Zone 4 over the next 10 days due to monsoon water stagnation. Reallocating medical resources now will prevent hospital bed shortages.",
            "impact": "Medium Impact",
            "confidence": 85,
            "actionable": True,
            "assigned_to": "Healthcare Authority",
            "status": "Recommended"
        },
        {
            "id": "rec-4",
            "category": "Utilities",
            "title": "Repair Main Water Conduit in Sector 12",
            "description": "Pressure drop telemetry indicates a possible pipeline leakage. Reports of water flow reduction in nearby residential quarters support this finding.",
            "impact": "High Impact",
            "confidence": 95,
            "actionable": True,
            "assigned_to": "Water Supply Board",
            "status": "Action Assigned"
        }
    ]

# Active Alerts List
def get_active_alerts():
    return [
        {
            "id": "alert-1",
            "title": "Heavy traffic gridlock on East Express Highway",
            "category": "Traffic",
            "severity": "Critical",
            "zone": "Zone 3",
            "timestamp": (datetime.now() - timedelta(minutes=10)).isoformat(),
            "description": "An accident involving a heavy truck has blocked two lanes. Expect delays of up to 45 minutes."
        },
        {
            "id": "alert-2",
            "title": "Air Quality index degraded in Zone 3",
            "category": "Environment",
            "severity": "Warning",
            "zone": "Zone 3",
            "timestamp": (datetime.now() - timedelta(minutes=25)).isoformat(),
            "description": "AQI in the Industrial East zone has crossed 150 (Poor). Citizens with respiratory problems are advised to remain indoors."
        },
        {
            "id": "alert-3",
            "title": "Water logging warning near Main Street Subways",
            "category": "Utilities",
            "severity": "Warning",
            "zone": "Zone 1",
            "timestamp": (datetime.now() - timedelta(minutes=40)).isoformat(),
            "description": "Continuous rainfall has caused 3 inches of water accumulation in Subways. Drivers should take alternate surface routes."
        }
    ]
