"""
Chat Models - Conversation persistence
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class ChatConversation(Base):
    """
    Chat conversation session

    Tracks individual chat sessions for users
    """
    __tablename__ = "chat_conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Conversation metadata
    title = Column(String(200), default="New Conversation")  # Auto-generated from first message

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User")
    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="ChatMessage.created_at")

    def __repr__(self):
        return f"<ChatConversation {self.id}: {self.title}>"


class ChatMessage(Base):
    """
    Individual chat message

    Stores each user/assistant message in a conversation
    """
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("chat_conversations.id"), nullable=False, index=True)

    # Message content
    role = Column(String(20), nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)

    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    conversation = relationship("ChatConversation", back_populates="messages")

    # Index for faster queries
    __table_args__ = (
        Index('ix_chat_messages_conversation_created', 'conversation_id', 'created_at'),
    )

    def __repr__(self):
        return f"<ChatMessage {self.id}: {self.role}>"
