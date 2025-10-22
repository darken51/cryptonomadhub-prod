"""Add multi-currency support

Revision ID: 2025_10_19_multi_currency
Revises: 2025_10_18_dashboard_activities
Create Date: 2025-10-19

Adds multi-currency support to enable tax calculations in local currencies.
- Adds currency metadata to regulations table
- Adds local currency tracking to cost_basis_lots and cost_basis_disposals
- Adds reporting currency preferences to user_cost_basis_settings
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '2025_10_19_multi_currency'
down_revision = '2025_10_18_dashboard_activities'
branch_labels = None
depends_on = None


def upgrade():
    """Add multi-currency support columns"""

    # 1. Add currency columns to regulations table
    op.add_column('regulations', sa.Column('currency_code', sa.String(3), nullable=True))
    op.add_column('regulations', sa.Column('currency_name', sa.String(50), nullable=True))
    op.add_column('regulations', sa.Column('currency_symbol', sa.String(5), nullable=True))
    op.add_column('regulations', sa.Column('currency_tier', sa.Integer(), nullable=True))
    op.add_column('regulations', sa.Column('uses_usd_directly', sa.Boolean(), default=False, nullable=True))
    op.add_column('regulations', sa.Column('recommended_exchange_source', sa.String(50), nullable=True))

    # 2. Add multi-currency columns to cost_basis_lots
    op.add_column('cost_basis_lots', sa.Column('acquisition_price_local', sa.Numeric(20, 10), nullable=True))
    op.add_column('cost_basis_lots', sa.Column('local_currency', sa.String(3), nullable=True))
    op.add_column('cost_basis_lots', sa.Column('exchange_rate', sa.Numeric(20, 10), nullable=True))
    op.add_column('cost_basis_lots', sa.Column('exchange_rate_source', sa.String(50), nullable=True))
    op.add_column('cost_basis_lots', sa.Column('exchange_rate_date', sa.DateTime(), nullable=True))

    # 3. Add multi-currency columns to cost_basis_disposals
    op.add_column('cost_basis_disposals', sa.Column('disposal_price_local', sa.Numeric(20, 10), nullable=True))
    op.add_column('cost_basis_disposals', sa.Column('local_currency', sa.String(3), nullable=True))
    op.add_column('cost_basis_disposals', sa.Column('exchange_rate', sa.Numeric(20, 10), nullable=True))
    op.add_column('cost_basis_disposals', sa.Column('exchange_rate_source', sa.String(50), nullable=True))
    op.add_column('cost_basis_disposals', sa.Column('total_cost_basis_local', sa.Numeric(20, 10), nullable=True))
    op.add_column('cost_basis_disposals', sa.Column('total_proceeds_local', sa.Numeric(20, 10), nullable=True))
    op.add_column('cost_basis_disposals', sa.Column('gain_loss_local', sa.Numeric(20, 10), nullable=True))

    # 4. Add currency preferences to user_cost_basis_settings
    op.add_column('user_cost_basis_settings', sa.Column('reporting_currency', sa.String(3), nullable=True))
    op.add_column('user_cost_basis_settings', sa.Column('preferred_exchange_source', sa.String(50), nullable=True))
    op.add_column('user_cost_basis_settings', sa.Column('show_dual_currency', sa.Boolean(), default=True, nullable=True))

    # Create indexes for better query performance
    op.create_index('ix_regulations_currency_code', 'regulations', ['currency_code'])
    op.create_index('ix_cost_basis_lots_local_currency', 'cost_basis_lots', ['local_currency'])
    op.create_index('ix_cost_basis_disposals_local_currency', 'cost_basis_disposals', ['local_currency'])


def downgrade():
    """Remove multi-currency support columns"""

    # Drop indexes first
    op.drop_index('ix_cost_basis_disposals_local_currency', 'cost_basis_disposals')
    op.drop_index('ix_cost_basis_lots_local_currency', 'cost_basis_lots')
    op.drop_index('ix_regulations_currency_code', 'regulations')

    # Drop columns from user_cost_basis_settings
    op.drop_column('user_cost_basis_settings', 'show_dual_currency')
    op.drop_column('user_cost_basis_settings', 'preferred_exchange_source')
    op.drop_column('user_cost_basis_settings', 'reporting_currency')

    # Drop columns from cost_basis_disposals
    op.drop_column('cost_basis_disposals', 'gain_loss_local')
    op.drop_column('cost_basis_disposals', 'total_proceeds_local')
    op.drop_column('cost_basis_disposals', 'total_cost_basis_local')
    op.drop_column('cost_basis_disposals', 'exchange_rate_source')
    op.drop_column('cost_basis_disposals', 'exchange_rate')
    op.drop_column('cost_basis_disposals', 'local_currency')
    op.drop_column('cost_basis_disposals', 'disposal_price_local')

    # Drop columns from cost_basis_lots
    op.drop_column('cost_basis_lots', 'exchange_rate_date')
    op.drop_column('cost_basis_lots', 'exchange_rate_source')
    op.drop_column('cost_basis_lots', 'exchange_rate')
    op.drop_column('cost_basis_lots', 'local_currency')
    op.drop_column('cost_basis_lots', 'acquisition_price_local')

    # Drop columns from regulations
    op.drop_column('regulations', 'recommended_exchange_source')
    op.drop_column('regulations', 'uses_usd_directly')
    op.drop_column('regulations', 'currency_tier')
    op.drop_column('regulations', 'currency_symbol')
    op.drop_column('regulations', 'currency_name')
    op.drop_column('regulations', 'currency_code')
