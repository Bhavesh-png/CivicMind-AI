from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
from app.data import mock_data

router = APIRouter(prefix="/notifications", tags=["Alerts & Workflows"])

# Keep a mutable list of active workflow tasks in memory
WORKFLOW_TASKS = [
    {
        "id": "task-201",
        "title": "Dispatch Sanitation Squad for Dengue Prevention",
        "description": "Correlating rising mosquito complaints in Western Suburbs (Zone 4) with 10-day rainfall predictions. Automated task assigned to Public Health Office.",
        "assigned_to": "Public Health Team B",
        "priority": "High",
        "status": "In Progress",
        "created_at": (datetime.now() - timedelta(hours=4)).isoformat(),
        "related_to": "healthcare-alert-zone4"
    },
    {
        "id": "task-202",
        "title": "Reset Traffic Signal Controller at Sector 5 Crossroad",
        "description": "Signal is reported frozen in Zone 4. Hardware engineer task generated to inspect optical fiber connection.",
        "assigned_to": "Traffic Signals Dept",
        "priority": "High",
        "status": "Pending",
        "created_at": (datetime.now() - timedelta(minutes=45)).isoformat(),
        "related_to": "complaint-1002"
    },
    {
        "id": "task-203",
        "title": "Send Inspection Notice to Sector 12 Chemical Plant",
        "description": "Notice triggered following repeated night-time chemical burning smell complaints. Inspections authorized under AQI Act.",
        "assigned_to": "Environmental Protection Division",
        "priority": "Medium",
        "status": "Completed",
        "created_at": (datetime.now() - timedelta(days=1)).isoformat(),
        "related_to": "complaint-1004"
    }
]

class TaskResolve(BaseModel):
    status: str = "Completed"

@router.get("/alerts")
async def get_alerts():
    """
    Returns active emergency alerts (flood warnings, traffic blocks).
    """
    return mock_data.get_active_alerts()

@router.get("/tasks")
async def get_tasks():
    """
    Returns workflow tasks generated automatically based on citizen feedback and telemetry thresholds.
    """
    return WORKFLOW_TASKS

@router.post("/tasks/{task_id}/status")
async def update_task_status(task_id: str, payload: TaskResolve):
    """
    Updates status of a workflow task (e.g. resolve or set to In Progress).
    """
    for task in WORKFLOW_TASKS:
        if task["id"] == task_id:
            task["status"] = payload.status
            return {"message": f"Task {task_id} updated successfully", "task": task}
            
    raise HTTPException(status_code=404, detail="Workflow task not found")
