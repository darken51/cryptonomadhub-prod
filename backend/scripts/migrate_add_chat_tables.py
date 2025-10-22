#!/usr/bin/env python3
"""
Create chat_conversations and chat_messages tables
"""

from app.database import SessionLocal, engine
from app.models.chat import ChatConversation, ChatMessage
from sqlalchemy import inspect

def upgrade():
    """Create chat tables"""
    print("🔄 Creating chat tables...")

    # Check if tables already exist
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()

    if "chat_conversations" in existing_tables:
        print("⚠️  chat_conversations table already exists, skipping...")
    else:
        ChatConversation.__table__.create(engine)
        print("✅ chat_conversations table created")

    if "chat_messages" in existing_tables:
        print("⚠️  chat_messages table already exists, skipping...")
    else:
        ChatMessage.__table__.create(engine)
        print("✅ chat_messages table created")

    print("✅ Migration completed!")

def downgrade():
    """Drop chat tables"""
    print("🔄 Dropping chat tables...")

    ChatMessage.__table__.drop(engine, checkfirst=True)
    print("✅ chat_messages table dropped")

    ChatConversation.__table__.drop(engine, checkfirst=True)
    print("✅ chat_conversations table dropped")

    print("✅ Rollback completed!")

if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "downgrade":
        downgrade()
    else:
        upgrade()
