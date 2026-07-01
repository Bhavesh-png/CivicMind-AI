import os
import json
import logging
from app.core.config import settings
from app.data import mock_data

logger = logging.getLogger(__name__)

# Initialize client conditionally
client = None
if not settings.MOCK_GCP:
    try:
        from google import genai
        # Initialize Google Gen AI client
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        logger.info("Successfully initialized google-genai Client")
    except Exception as e:
        logger.error(f"Failed to initialize google-genai: {e}. Falling back to mock mode.")
        settings.MOCK_GCP = True

async def chat_with_gemini(history: list[dict], user_message: str) -> str:
    """
    Sends chat prompt to Gemini. Uses mock reasoning if MOCK_GCP is True.
    history format: [{'role': 'user'|'model', 'text': '...'}]
    """
    if settings.MOCK_GCP or not client:
        return simulate_gemini_chat(user_message)
    
    try:
        # Build contents from history and current message
        contents = []
        for msg in history:
            role = "user" if msg["role"] == "user" else "model"
            contents.append(client.types.Content(
                role=role,
                parts=[client.types.Part.from_text(text=msg["text"])]
            ))
        
        # Add system instruction
        system_instruction = (
            "You are CivicMind AI, an expert Decision Intelligence Assistant for city administrators and citizens. "
            "Use the following real-time city data to answer questions briefly and professionally:\n"
            f"Current City Metrics: {json.dumps(mock_data.get_current_metrics())}\n"
            f"Active Alerts: {json.dumps(mock_data.get_active_alerts())}\n"
            f"Current Policy Recommendations: {json.dumps(mock_data.get_recommendations())}\n"
            "Format responses beautifully using Markdown. Suggest action items where appropriate."
        )
        
        config = client.types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.7,
            max_output_tokens=800,
        )
        
        # Call model
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=contents + [user_message],
            config=config
        )
        return response.text
    except Exception as e:
        logger.error(f"Error calling Gemini API: {e}. Falling back to simulation.")
        return simulate_gemini_chat(user_message)

async def analyze_complaint_ai(title: str, description: str) -> dict:
    """
    Classifies complaint category, priority, sentiment and generates summary.
    """
    if settings.MOCK_GCP or not client:
        return simulate_complaint_analysis(title, description)
        
    try:
        prompt = (
            "Analyze this citizen complaint. Respond ONLY with a JSON object containing these keys: "
            "category (Traffic, Environment, Utilities, Healthcare, or Public Services), "
            "priority (High, Medium, Low), "
            "sentiment (Negative, Neutral, Positive), "
            "ai_summary (one-sentence clear summary).\n\n"
            f"Title: {title}\nDescription: {description}"
        )
        
        config = client.types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.1
        )
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=config
        )
        
        return json.loads(response.text)
    except Exception as e:
        logger.error(f"Error calling Gemini for complaint analysis: {e}")
        return simulate_complaint_analysis(title, description)

async def generate_policy_suggestions(report_type: str, time_frame: str) -> str:
    """
    Generates strategic planning advice using Gemini based on current city data.
    """
    metrics = mock_data.get_current_metrics()
    recommendations = mock_data.get_recommendations()
    
    if settings.MOCK_GCP or not client:
        return simulate_policy_suggestions(report_type, time_frame)
        
    try:
        prompt = (
            f"Generate a professional {report_type} policy summary for city council administrators based on this data:\n"
            f"City Metrics: {json.dumps(metrics)}\n"
            f"Action Recommendations: {json.dumps(recommendations)}\n"
            "Format the output as clean Markdown. Include:\n"
            "1. Executive Summary\n"
            "2. Identified City Bottlenecks\n"
            "3. Gemini AI Policy Suggestions & Infrastructure Actions"
        )
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        return response.text
    except Exception as e:
        logger.error(f"Error generating suggestions with Gemini: {e}")
        return simulate_policy_suggestions(report_type, time_frame)

# --- Fallback Simulators for Standalone/Local Run ---

def simulate_gemini_chat(message: str) -> str:
    msg_lower = message.lower()
    if "pollution" in msg_lower or "aqi" in msg_lower:
        return (
            "### Air Quality Analysis (Zone 3 - Industrial East)\n"
            "- **Current Status:** Warning issued. AQI reached **152 (Poor)**.\n"
            "- **Primary Pollutant:** PM2.5 at 68 µg/m³.\n"
            "- **Action Recommended:** Environmental inspectors have been dispatched to Sector 12 factories to audit smoke filter units. "
            "Citizens in Zone 3 should wear masks and avoid heavy outdoor exercises today."
        )
    elif "traffic" in msg_lower or "congestion" in msg_lower:
        return (
            "### Traffic Congestion Update\n"
            "- **East Express Highway (Zone 3):** **Critical Congestion** (Speed: 12 km/h) due to a truck breakdown. Traffic police is diverting vehicles near Exit 4.\n"
            "- **Main Street (Zone 1):** Moderate congestion (36%). Signal timing optimizations are planned to balance traffic flow.\n"
            "- **Tip:** If traveling to the industrial area, please use Metro Route 2 or take the Western Ring Road."
        )
    elif "report" in msg_lower or "generate" in msg_lower:
        return (
            "### Report Automation Activated\n"
            "I can generate comprehensive reports for you. "
            "Please go to the **Reports** page where you can choose a template (Weekly, Monthly, or Disaster response) "
            "and download a professionally formatted PDF complete with data highlights, maps, and policy outlines."
        )
    elif "dengue" in msg_lower or "disease" in msg_lower or "healthcare" in msg_lower:
        return (
            "### Healthcare Analytics & Predictive Health\n"
            "- **Dengue Trend:** Case tracking predicts a **20% rise** in Western Suburbs (Zone 4) over the next 10 days due to monsoon water accumulation.\n"
            "- **Bed Occupancy:** General bed availability stands at 26%, which is stable, but ICU beds are tight at 78% occupancy.\n"
            "- **Precautionary Measures:** City sanitation teams have been tasked with fogging and larvicide spraying starting tomorrow morning."
        )
    else:
        return (
            "Hello! I am **CivicMind AI**, your Decision Intelligence Agent. I analyze municipal streams from BigQuery "
            "and Vertex AI to assist with operations.\n\n"
            "Here are some questions you can ask me:\n"
            "1. *'Which area has the highest pollution today?'*\n"
            "2. *'Show tomorrow's traffic prediction.'*\n"
            "3. *'What are the active disease trends in the city?'*\n\n"
            "How can I help you improve community living today?"
        )

def simulate_complaint_analysis(title: str, description: str) -> dict:
    desc_lower = (title + " " + description).lower()
    
    category = "Public Services"
    if any(k in desc_lower for k in ["traffic", "road", "signal", "jam", "speed", "pothole"]):
        category = "Traffic"
    elif any(k in desc_lower for k in ["pollution", "aqi", "smell", "air", "chemical", "smoke"]):
        category = "Environment"
    elif any(k in desc_lower for k in ["water", "leak", "electricity", "pipe", "power", "grid", "outage", "light"]):
        category = "Utilities"
    elif any(k in desc_lower for k in ["disease", "dengue", "hospital", "clinic", "health", "vaccine", "flu"]):
        category = "Healthcare"
        
    priority = "Low"
    if any(k in desc_lower for k in ["severe", "danger", "critical", "flooded", "unsafe", "accident", "emergency", "stuck"]):
        priority = "High"
    elif any(k in desc_lower for k in ["broken", "dark", "foul", "garbage", "leakage", "weeks"]):
        priority = "Medium"
        
    sentiment = "Negative"
    if any(k in desc_lower for k in ["thank", "appreciate", "helpful", "good", "excellent"]):
        sentiment = "Positive"
    elif any(k in desc_lower for k in ["inquire", "status", "check", "question"]):
        sentiment = "Neutral"
        
    return {
        "category": category,
        "priority": priority,
        "sentiment": sentiment,
        "ai_summary": f"Citizen reported a {category.lower()} issue: '{title}'. AI classified priority as {priority}."
    }

def simulate_policy_suggestions(report_type: str, time_frame: str) -> str:
    return (
        f"# CivicMind AI - {report_type} Executive Policy Suggestions\n"
        f"**Prepared on:** June 30, 2026 | **Focus Period:** {time_frame}\n\n"
        "## 1. Executive Summary\n"
        "This decision framework integrates real-time telemetry across municipal silos. "
        "The primary focus points for this period are addressing utility leakages, managing seasonal dengue spikes, and relieving express traffic corridors.\n\n"
        "## 2. Identified City Bottlenecks\n"
        "- **Critical Congestion Corridor:** East Express Highway (Zone 3) traffic bottleneck due to high commercial vehicle density.\n"
        "- **Air Quality Degradation:** AQI index in Zone 3 exceeds safety parameters during late evening hours, pointing to industrial filter bypasses.\n"
        "- **Health Risk Vector:** Rise in standing water complaints in Western Suburbs (Zone 4) correlates directly with early-stage mosquito larvae growth reports.\n\n"
        "## 3. Recommended Infrastructure Policies\n"
        "1. **Adaptive Signal Coordination:** Authorize the immediate rollout of IoT-linked smart signal sensors along Main Street and Link Road.\n"
        "2. **Larvicide Campaign:** Deploy public health units to conduct larvicide spraying across residential compounds in Zone 4 within the next 48 hours.\n"
        "3. **Industrial Emission Curfews:** Impose strict nighttime AQI monitoring and heavy penal enforcement on Sector 12 industrial plants."
    )
