import sys
import os

# Add the parent folder and app folder to system paths to resolve imports cleanly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "app"))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_endpoints():
    print("--------------------------------------------------")
    print("CivicMind AI Backend Endpoints Verification")
    print("--------------------------------------------------")
    
    # 1. Test root health-check
    print("1. Querying Health-Check Root ('/')...")
    res = client.get("/")
    assert res.status_code == 200, f"Failed health check: {res.text}"
    print("   [SUCCESS] Status: 200. Response:")
    print(f"             {res.json()}\n")

    # 2. Test metrics loading
    print("2. Querying Telemetry Cards Metrics ('/api/v1/data/metrics')...")
    res = client.get("/api/v1/data/metrics")
    assert res.status_code == 200, f"Failed loading metrics: {res.text}"
    print("   [SUCCESS] Status: 200. Congestion level:")
    print(f"             {res.json()['traffic']['congestion_pct']}%\n")

    # 3. Test active emergency alerts
    print("3. Querying Active Emergency Alert Registers ('/api/v1/notifications/alerts')...")
    res = client.get("/api/v1/notifications/alerts")
    assert res.status_code == 200, f"Failed loading alerts: {res.text}"
    print("   [SUCCESS] Status: 200. Total Alerts registered:")
    print(f"             {len(res.json())}\n")

    # 4. Test automated task workflows
    print("4. Querying Automated Workflow Tasks ('/api/v1/notifications/tasks')...")
    res = client.get("/api/v1/notifications/tasks")
    assert res.status_code == 200, f"Failed loading tasks: {res.text}"
    print("   [SUCCESS] Status: 200. Open Task count:")
    print(f"             {len(res.json())}\n")

    # 5. Test mock chatbot querying
    print("5. Posting to Conversational Agent API ('/api/v1/chatbot/chat')...")
    payload = {
        "message": "Which area has the highest pollution today?",
        "history": []
    }
    res = client.post("/api/v1/chatbot/chat", json=payload)
    assert res.status_code == 200, f"Chat API failed: {res.text}"
    print("   [SUCCESS] Status: 200. Gemini reply preview:")
    print(f"             {res.json()['response'][:120]}...\n")

    print("--------------------------------------------------")
    print("[ALL OK] CivicMind AI Backend is fully verified and stable!")
    print("--------------------------------------------------")

if __name__ == "__main__":
    try:
        test_endpoints()
    except Exception as e:
        print(f"\n[FAIL] Verification script encountered errors: {e}")
        sys.exit(1)
