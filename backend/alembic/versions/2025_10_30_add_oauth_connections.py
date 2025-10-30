"""add oauth connections table

Revision ID: add_oauth_connections
Revises: add_refresh_token_fields
Create Date: 2025-10-30 12:00:00

✅ Google OAuth Integration
- Stores OAuth provider connections (Google, GitHub, etc.)
- Links OAuth accounts to existing users
- Supports multiple OAuth providers per user
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = 'add_oauth_connections'
down_revision = 'add_refresh_token_fields'
branch_labels = None
depends_on = None


def upgrade():
    # Create oauth_connections table
    op.create_table(
        'oauth_connections',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('provider', sa.String(length=50), nullable=False),
        sa.Column('provider_user_id', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('access_token', sa.Text(), nullable=True),
        sa.Column('refresh_token', sa.Text(), nullable=True),
        sa.Column('token_expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )

    # Create indexes for faster lookups
    op.create_index('ix_oauth_connections_user_id', 'oauth_connections', ['user_id'])
    op.create_index('ix_oauth_connections_provider', 'oauth_connections', ['provider'])

    # Ensure unique provider per user
    op.create_unique_constraint('uq_oauth_user_provider', 'oauth_connections', ['user_id', 'provider'])

    # Ensure unique provider_user_id per provider
    op.create_unique_constraint('uq_oauth_provider_user', 'oauth_connections', ['provider', 'provider_user_id'])


def downgrade():
    # Drop table and all constraints/indexes
    op.drop_table('oauth_connections')
