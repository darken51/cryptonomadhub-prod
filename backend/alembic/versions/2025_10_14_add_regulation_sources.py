"""Add data sources tracking to regulations

Revision ID: 2025_10_14_reg_sources
Revises: 2025_01_14_wallet_groups
Create Date: 2025-10-14

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '2025_10_14_reg_sources'
down_revision = '2025_01_14_wallet_groups'
branch_labels = None
depends_on = None


def upgrade():
    # Add data_sources column (array of source names)
    op.add_column('regulations', sa.Column('data_sources', postgresql.ARRAY(sa.String(length=50)), nullable=True))

    # Add data_quality column (high, medium, low, unknown)
    op.add_column('regulations', sa.Column('data_quality', sa.String(length=20), nullable=True))


def downgrade():
    op.drop_column('regulations', 'data_quality')
    op.drop_column('regulations', 'data_sources')
