from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.services.chat_assistant import ChatAssistant
from app.middleware import limiter, get_rate_limit
from pydantic import BaseModel
from typing import List, Dict

router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: List[ChatMessage] = []


class ChatResponse(BaseModel):
    message: str
    suggestions: List[str] = []
    can_simulate: bool = False
    simulation_params: Dict = {}


@router.post("/message", response_model=ChatResponse)
@limiter.limit(get_rate_limit("chat"))
async def send_chat_message(
    request: Request,
    response: Response,
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a message to the AI tax assistant

    The assistant can:
    - Answer questions about crypto taxes
    - Explain regulations for different countries
    - Guide users through simulations
    - Provide personalized advice (NOT financial advice)
    """

    assistant = ChatAssistant(db)

    try:
        response = await assistant.process_message(
            user_id=current_user.id,
            message=chat_request.message,
            conversation_history=[msg.dict() for msg in chat_request.conversation_history]
        )

        return ChatResponse(
            message=response["message"],
            suggestions=response.get("suggestions", []),
            can_simulate=response.get("can_simulate", False),
            simulation_params=response.get("simulation_params", {})
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@router.get("/countries")
# @limiter.limit(get_rate_limit("countries"))  # Temporarily disabled
async def get_available_countries(

    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of countries for chat suggestions"""
    from app.models.regulation import Regulation

    countries = db.query(Regulation).all()

    return {
        "countries": [
            {
                "code": c.country_code,
                "name": c.country_name,
                "cgt_short": c.cgt_short_rate,
                "cgt_long": c.cgt_long_rate
            }
            for c in countries
        ]
    }
