"""add refresh token fields

Revision ID: add_refresh_token_fields
Revises: add_wallet_portfolio_tracking
Create Date: 2025-10-19 03:00:00

✅ PHASE 1.3: Add refresh token support for improved security
- Reduces JWT expiration from 24h to 1h
- Adds refresh token with 7-day expiration
- Enables secure token rotation
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'add_refresh_token_fields'
down_revision = 'add_wallet_portfolio_tracking'
branch_labels = None
depends_on = None


def upgrade():
    # Add refresh token fields to users table
    op.add_column('users', sa.Column('refresh_token', sa.String(), nullable=True))
    op.add_column('users', sa.Column('refresh_token_expires', sa.DateTime(timezone=True), nullable=True))


def downgrade():
    # Remove refresh token fields from users table
    op.drop_column('users', 'refresh_token_expires')
    op.drop_column('users', 'refresh_token')
