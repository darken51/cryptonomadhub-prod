#!/usr/bin/env python3
"""
Create oauth_connections table for Google OAuth integration
"""

from app.database import SessionLocal, engine
from sqlalchemy import inspect, text

def upgrade():
    """Create oauth_connections table"""
    print("🔄 Creating oauth_connections table...")

    # Check if table already exists
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()

    if "oauth_connections" in existing_tables:
        print("⚠️  oauth_connections table already exists, skipping...")
        return

    # Create table using raw SQL for more control
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE oauth_connections (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                provider VARCHAR(50) NOT NULL,
                provider_user_id VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                access_token TEXT,
                refresh_token TEXT,
                token_expires_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
            )
        """))
        print("✅ oauth_connections table created")

        # Create indexes
        conn.execute(text("""
            CREATE INDEX ix_oauth_connections_user_id
            ON oauth_connections(user_id)
        """))
        print("✅ Index ix_oauth_connections_user_id created")

        conn.execute(text("""
            CREATE INDEX ix_oauth_connections_provider
            ON oauth_connections(provider)
        """))
        print("✅ Index ix_oauth_connections_provider created")

        # Create unique constraints
        conn.execute(text("""
            ALTER TABLE oauth_connections
            ADD CONSTRAINT uq_oauth_user_provider
            UNIQUE (user_id, provider)
        """))
        print("✅ Unique constraint uq_oauth_user_provider created")

        conn.execute(text("""
            ALTER TABLE oauth_connections
            ADD CONSTRAINT uq_oauth_provider_user
            UNIQUE (provider, provider_user_id)
        """))
        print("✅ Unique constraint uq_oauth_provider_user created")

        conn.commit()

    print("✅ Migration completed!")

def downgrade():
    """Drop oauth_connections table"""
    print("🔄 Dropping oauth_connections table...")

    with engine.connect() as conn:
        conn.execute(text("DROP TABLE IF EXISTS oauth_connections CASCADE"))
        conn.commit()
        print("✅ oauth_connections table dropped")

    print("✅ Rollback completed!")

if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "downgrade":
        downgrade()
    else:
        upgrade()
