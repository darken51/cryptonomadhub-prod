from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.chat import ChatConversation, ChatMessage as ChatMessageModel
from app.routers.auth import get_current_user
from app.services.chat_assistant import ChatAssistant
from app.middleware import limiter, get_rate_limit
from app.dependencies.license_check import require_chat_message
from pydantic import BaseModel
from typing import List, Dict, Optional
from sqlalchemy import desc

router = APIRouter(prefix="/chat", tags=["Chat"])


# ========== Pydantic Models ==========

class ChatMessageSchema(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class ChatConversationResponse(BaseModel):
    id: int
    title: str
    created_at: str
    updated_at: str
    message_count: int
    last_message_preview: Optional[str] = None

    class Config:
        from_attributes = True


class SendMessageRequest(BaseModel):
    conversation_id: Optional[int] = None  # If None, create new conversation
    message: str


class SendMessageResponse(BaseModel):
    conversation_id: int
    message: str
    suggestions: List[str] = []
    can_simulate: bool = False
    simulation_params: Dict = {}


# ========== Routes ==========

@router.get("/conversations", response_model=List[ChatConversationResponse])
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all chat conversations for current user

    Returns conversations ordered by most recent first
    """
    conversations = db.query(ChatConversation).filter(
        ChatConversation.user_id == current_user.id
    ).order_by(desc(ChatConversation.updated_at)).all()

    result = []
    for conv in conversations:
        # Get message count
        message_count = db.query(ChatMessageModel).filter(
            ChatMessageModel.conversation_id == conv.id
        ).count()

        # Get last message for preview
        last_message = db.query(ChatMessageModel).filter(
            ChatMessageModel.conversation_id == conv.id
        ).order_by(desc(ChatMessageModel.created_at)).first()

        last_message_preview = None
        if last_message:
            last_message_preview = last_message.content[:100] + "..." if len(last_message.content) > 100 else last_message.content

        result.append(ChatConversationResponse(
            id=conv.id,
            title=conv.title,
            created_at=conv.created_at.isoformat(),
            updated_at=conv.updated_at.isoformat(),
            message_count=message_count,
            last_message_preview=last_message_preview
        ))

    return result


@router.post("/conversations")
async def create_conversation(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new chat conversation

    Returns the new conversation ID
    """
    conversation = ChatConversation(
        user_id=current_user.id,
        title="New Conversation"
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return {
        "id": conversation.id,
        "title": conversation.title,
        "created_at": conversation.created_at.isoformat()
    }


@router.get("/conversations/{conversation_id}/messages", response_model=List[ChatMessageSchema])
async def get_conversation_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all messages from a conversation

    Returns messages ordered chronologically
    """
    # Verify conversation belongs to user
    conversation = db.query(ChatConversation).filter(
        ChatConversation.id == conversation_id,
        ChatConversation.user_id == current_user.id
    ).first()

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Get messages
    messages = db.query(ChatMessageModel).filter(
        ChatMessageModel.conversation_id == conversation_id
    ).order_by(ChatMessageModel.created_at).all()

    return [
        ChatMessageSchema(
            role=msg.role,
            content=msg.content,
            created_at=msg.created_at.isoformat()
        )
        for msg in messages
    ]


@router.post("/conversations/{conversation_id}/messages", response_model=SendMessageResponse)
@limiter.limit(get_rate_limit("chat"))
async def send_message(
    conversation_id: int,
    request: Request,
    response: Response,
    message_request: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    license_check = Depends(require_chat_message),
    db: Session = Depends(get_db)
):
    """
    Send a message in a conversation

    Saves user message, gets AI response, saves AI response
    """
    # Verify conversation belongs to user
    conversation = db.query(ChatConversation).filter(
        ChatConversation.id == conversation_id,
        ChatConversation.user_id == current_user.id
    ).first()

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Save user message
    user_message = ChatMessageModel(
        conversation_id=conversation_id,
        role="user",
        content=message_request.message
    )
    db.add(user_message)
    db.commit()

    # Get conversation history (last 8 messages for context)
    history_messages = db.query(ChatMessageModel).filter(
        ChatMessageModel.conversation_id == conversation_id
    ).order_by(desc(ChatMessageModel.created_at)).limit(8).all()

    history_messages = list(reversed(history_messages))  # Chronological order

    # Prepare conversation history for AI
    conversation_history = [
        {"role": msg.role, "content": msg.content}
        for msg in history_messages[:-1]  # Exclude the message we just added (it's in message_request.message)
    ]

    # Get AI response
    assistant = ChatAssistant(db)
    try:
        ai_response = await assistant.process_message(
            user_id=current_user.id,
            message=message_request.message,
            conversation_history=conversation_history
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI failed: {str(e)}")

    # Save AI response
    assistant_message = ChatMessageModel(
        conversation_id=conversation_id,
        role="assistant",
        content=ai_response["message"]
    )
    db.add(assistant_message)

    # Update conversation title if first message
    if len(history_messages) == 1:  # Only user's first message
        # Generate title from first user message (first 50 chars)
        title = message_request.message[:50].strip()
        if len(message_request.message) > 50:
            title += "..."
        conversation.title = title

    # Update conversation timestamp
    from datetime import datetime
    conversation.updated_at = datetime.utcnow()

    db.commit()

    return SendMessageResponse(
        conversation_id=conversation_id,
        message=ai_response["message"],
        suggestions=ai_response.get("suggestions", []),
        can_simulate=ai_response.get("can_simulate", False),
        simulation_params=ai_response.get("simulation_params", {})
    )


@router.post("/message", response_model=SendMessageResponse)
@limiter.limit(get_rate_limit("chat"))
async def send_message_auto_create(
    request: Request,
    response: Response,
    message_request: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    license_check = Depends(require_chat_message),
    db: Session = Depends(get_db)
):
    """
    Send a message (auto-creates conversation if needed)

    Legacy endpoint for backwards compatibility
    If conversation_id not provided, creates new conversation
    """
    conversation_id = message_request.conversation_id

    # Create new conversation if not provided
    if not conversation_id:
        conversation = ChatConversation(
            user_id=current_user.id,
            title=message_request.message[:50].strip() + ("..." if len(message_request.message) > 50 else "")
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        conversation_id = conversation.id

    # Delegate to the main endpoint
    return await send_message(
        conversation_id=conversation_id,
        request=request,
        response=response,
        message_request=message_request,
        current_user=current_user,
        db=db
    )


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a conversation and all its messages
    """
    # Verify conversation belongs to user
    conversation = db.query(ChatConversation).filter(
        ChatConversation.id == conversation_id,
        ChatConversation.user_id == current_user.id
    ).first()

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Delete (cascade will delete messages)
    db.delete(conversation)
    db.commit()

    return {"message": "Conversation deleted successfully"}


@router.get("/countries")
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
