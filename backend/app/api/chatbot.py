from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services import gemini_service

router = APIRouter(prefix="/chatbot", tags=["AI Chatbot"])

class ChatMessage(BaseModel):
    role: str # "user" or "model"
    text: str

class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []

class ChatResponse(BaseModel):
    response: str

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat endpoint communicating with Gemini. Supports context history.
    """
    try:
        # Convert history format
        formatted_history = [
            {"role": item.role, "text": item.text}
            for item in request.history
        ]
        
        reply = await gemini_service.chat_with_gemini(
            history=formatted_history,
            user_message=request.message
        )
        return {"response": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini service error: {str(e)}")
