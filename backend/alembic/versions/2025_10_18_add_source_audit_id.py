"""Add source_audit_id to cost_basis_lots

Revision ID: 2025_10_18_source_audit_id
Revises: 2025_10_18_float_to_numeric
Create Date: 2025-10-18

Adds source_audit_id column to track which DeFi audit created each cost basis lot.
This enables audit-scoped tax optimization analysis.
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '2025_10_18_source_audit_id'
down_revision = '2025_10_18_float_to_numeric'
branch_labels = None
depends_on = None


def upgrade():
    """Add source_audit_id column to cost_basis_lots"""

    with op.batch_alter_table('cost_basis_lots', schema=None) as batch_op:
        batch_op.add_column(
            sa.Column('source_audit_id', sa.Integer(), nullable=True)
        )
        batch_op.create_index(
            'ix_cost_basis_lots_source_audit_id',
            ['source_audit_id'],
            unique=False
        )
        batch_op.create_foreign_key(
            'fk_cost_basis_lots_audit_id',
            'defi_audits',
            ['source_audit_id'],
            ['id'],
            ondelete='SET NULL'
        )


def downgrade():
    """Remove source_audit_id column"""

    with op.batch_alter_table('cost_basis_lots', schema=None) as batch_op:
        batch_op.drop_constraint('fk_cost_basis_lots_audit_id', type_='foreignkey')
        batch_op.drop_index('ix_cost_basis_lots_source_audit_id')
        batch_op.drop_column('source_audit_id')
