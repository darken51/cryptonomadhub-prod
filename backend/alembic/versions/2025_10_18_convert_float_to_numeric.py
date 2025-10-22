"""Convert Float to Numeric for cost basis tables

Revision ID: 2025_10_18_float_to_numeric
Revises: 2025_10_14_add_regulation_sources
Create Date: 2025-10-18

Changes all Float columns to Numeric(20, 10) for precise financial calculations.
This fixes precision issues with capital gains/loss calculations.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import Numeric

# revision identifiers
revision = '2025_10_18_float_to_numeric'
down_revision = '2025_10_14_add_regulation_sources'
branch_labels = None
depends_on = None


def upgrade():
    """Convert Float columns to Numeric(20, 10)"""

    # cost_basis_lots table
    with op.batch_alter_table('cost_basis_lots', schema=None) as batch_op:
        batch_op.alter_column('acquisition_price_usd',
                             existing_type=sa.Float(),
                             type_=Numeric(20, 10),
                             existing_nullable=False)
        batch_op.alter_column('original_amount',
                             existing_type=sa.Float(),
                             type_=Numeric(20, 10),
                             existing_nullable=False)
        batch_op.alter_column('remaining_amount',
                             existing_type=sa.Float(),
                             type_=Numeric(20, 10),
                             existing_nullable=False)
        batch_op.alter_column('disposed_amount',
                             existing_type=sa.Float(),
                             type_=Numeric(20, 10),
                             existing_nullable=True)

    # cost_basis_disposals table
    with op.batch_alter_table('cost_basis_disposals', schema=None) as batch_op:
        batch_op.alter_column('disposal_price_usd',
                             existing_type=sa.Float(),
                             type_=Numeric(20, 10),
                             existing_nullable=False)
        batch_op.alter_column('amount_disposed',
                             existing_type=sa.Float(),
                             type_=Numeric(20, 10),
                             existing_nullable=False)
        batch_op.alter_column('cost_basis_per_unit',
                             existing_type=sa.Float(),
                             type_=Numeric(20, 10),
                             existing_nullable=False)
        batch_op.alter_column('total_cost_basis',
                             existing_type=sa.Float(),
                             type_=Numeric(20, 10),
                             existing_nullable=False)
        batch_op.alter_column('total_proceeds',
                             existing_type=sa.Float(),
                             type_=Numeric(20, 10),
                             existing_nullable=False)
        batch_op.alter_column('gain_loss',
                             existing_type=sa.Float(),
                             type_=Numeric(20, 10),
                             existing_nullable=False)

    # wash_sale_violations table
    with op.batch_alter_table('wash_sale_violations', schema=None) as batch_op:
        batch_op.alter_column('loss_amount',
                             existing_type=sa.Float(),
                             type_=Numeric(20, 10),
                             existing_nullable=False)
        batch_op.alter_column('disallowed_loss',
                             existing_type=sa.Float(),
                             type_=Numeric(20, 10),
                             existing_nullable=False)
        batch_op.alter_column('adjusted_cost_basis',
                             existing_type=sa.Float(),
                             type_=Numeric(20, 10),
                             existing_nullable=False)


def downgrade():
    """Revert Numeric columns back to Float"""

    # cost_basis_lots table
    with op.batch_alter_table('cost_basis_lots', schema=None) as batch_op:
        batch_op.alter_column('acquisition_price_usd',
                             existing_type=Numeric(20, 10),
                             type_=sa.Float(),
                             existing_nullable=False)
        batch_op.alter_column('original_amount',
                             existing_type=Numeric(20, 10),
                             type_=sa.Float(),
                             existing_nullable=False)
        batch_op.alter_column('remaining_amount',
                             existing_type=Numeric(20, 10),
                             type_=sa.Float(),
                             existing_nullable=False)
        batch_op.alter_column('disposed_amount',
                             existing_type=Numeric(20, 10),
                             type_=sa.Float(),
                             existing_nullable=True)

    # cost_basis_disposals table
    with op.batch_alter_table('cost_basis_disposals', schema=None) as batch_op:
        batch_op.alter_column('disposal_price_usd',
                             existing_type=Numeric(20, 10),
                             type_=sa.Float(),
                             existing_nullable=False)
        batch_op.alter_column('amount_disposed',
                             existing_type=Numeric(20, 10),
                             type_=sa.Float(),
                             existing_nullable=False)
        batch_op.alter_column('cost_basis_per_unit',
                             existing_type=Numeric(20, 10),
                             type_=sa.Float(),
                             existing_nullable=False)
        batch_op.alter_column('total_cost_basis',
                             existing_type=Numeric(20, 10),
                             type_=sa.Float(),
                             existing_nullable=False)
        batch_op.alter_column('total_proceeds',
                             existing_type=Numeric(20, 10),
                             type_=sa.Float(),
                             existing_nullable=False)
        batch_op.alter_column('gain_loss',
                             existing_type=Numeric(20, 10),
                             type_=sa.Float(),
                             existing_nullable=False)

    # wash_sale_violations table
    with op.batch_alter_table('wash_sale_violations', schema=None) as batch_op:
        batch_op.alter_column('loss_amount',
                             existing_type=Numeric(20, 10),
                             type_=sa.Float(),
                             existing_nullable=False)
        batch_op.alter_column('disallowed_loss',
                             existing_type=Numeric(20, 10),
                             type_=sa.Float(),
                             existing_nullable=False)
        batch_op.alter_column('adjusted_cost_basis',
                             existing_type=Numeric(20, 10),
                             type_=sa.Float(),
                             existing_nullable=False)
