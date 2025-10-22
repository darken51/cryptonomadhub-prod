"""Add dashboard activities table

Revision ID: 2025_10_18_dashboard_activities
Revises: 2025_10_18_source_audit_id
Create Date: 2025-10-18

Adds dashboard_activities table to track user activities for the dashboard timeline view.
Used to display recent actions like audits, simulations, chat messages, etc.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '2025_10_18_dashboard_activities'
down_revision = '2025_10_18_source_audit_id'
branch_labels = None
depends_on = None


def upgrade():
    """Create dashboard_activities table"""

    # Create dashboard_activities table
    op.create_table(
        'dashboard_activities',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('activity_type', sa.String(length=50), nullable=False),
        sa.Column('activity_id', sa.String(length=100), nullable=True),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('subtitle', sa.String(length=500), nullable=True),
        sa.Column('activity_metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE')
    )

    # Create indexes for efficient queries
    op.create_index('ix_dashboard_activities_id', 'dashboard_activities', ['id'])
    op.create_index('ix_dashboard_activities_user_id', 'dashboard_activities', ['user_id'])
    op.create_index('ix_dashboard_activities_activity_type', 'dashboard_activities', ['activity_type'])
    op.create_index('ix_dashboard_activities_created_at', 'dashboard_activities', ['created_at'])

    # Composite indexes for efficient dashboard queries
    op.create_index(
        'ix_dashboard_activities_user_created',
        'dashboard_activities',
        ['user_id', 'created_at']
    )
    op.create_index(
        'ix_dashboard_activities_user_type',
        'dashboard_activities',
        ['user_id', 'activity_type']
    )


def downgrade():
    """Drop dashboard_activities table"""

    # Drop indexes first
    op.drop_index('ix_dashboard_activities_user_type', 'dashboard_activities')
    op.drop_index('ix_dashboard_activities_user_created', 'dashboard_activities')
    op.drop_index('ix_dashboard_activities_created_at', 'dashboard_activities')
    op.drop_index('ix_dashboard_activities_activity_type', 'dashboard_activities')
    op.drop_index('ix_dashboard_activities_user_id', 'dashboard_activities')
    op.drop_index('ix_dashboard_activities_id', 'dashboard_activities')

    # Drop table
    op.drop_table('dashboard_activities')
