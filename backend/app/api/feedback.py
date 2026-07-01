from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.data import mock_data
from app.services import gemini_service

router = APIRouter(prefix="/feedback", tags=["Citizen Feedback"])

class ComplaintSubmit(BaseModel):
    title: str
    description: str
    category: str
    zone: str

@router.get("/list")
async def list_complaints():
    """
    Returns all submitted complaints, sorted with newest first.
    """
    return mock_data.feedback_db

@router.post("/submit")
async def submit_complaint(complaint: ComplaintSubmit):
    """
    Accepts new citizen feedback, uses Gemini to analyze sentiment/priority/summary,
    and commits to memory database.
    """
    if not complaint.title or not complaint.description:
        raise HTTPException(status_code=400, detail="Title and description cannot be empty")
        
    try:
        # 1. Run AI analysis
        analysis = await gemini_service.analyze_complaint_ai(
            title=complaint.title,
            description=complaint.description
        )
        
        # 2. Add complaint to list
        new_complaint = mock_data.add_complaint(
            title=complaint.title,
            description=complaint.description,
            category=complaint.category,
            zone=complaint.zone
        )
        
        # 3. Enrich mock details with Gemini's analysis
        new_complaint["priority"] = analysis.get("priority", new_complaint["priority"])
        new_complaint["sentiment"] = analysis.get("sentiment", new_complaint["sentiment"])
        new_complaint["category"] = analysis.get("category", new_complaint["category"])
        new_complaint["ai_summary"] = analysis.get("ai_summary", new_complaint["ai_summary"])
        
        return {
            "message": "Complaint submitted and AI processed successfully",
            "complaint": new_complaint
        }
    except Exception as e:
        # Fail safe - write local raw values if analysis fails
        new_complaint = mock_data.add_complaint(
            title=complaint.title,
            description=complaint.description,
            category=complaint.category,
            zone=complaint.zone
        )
        return {
            "message": "Complaint submitted with local heuristics (AI service offline)",
            "complaint": new_complaint
        }
