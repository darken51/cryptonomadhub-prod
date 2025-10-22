"""Add unique constraints to wallet tables

Revision ID: 2025_10_18_wallet_constraints
Revises: 2025_10_18_convert_float_to_numeric
Create Date: 2025-10-18

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '2025_10_18_wallet_constraints'
down_revision = '2025_10_18_convert_float_to_numeric'
branch_labels = None
depends_on = None


def upgrade():
    # Remove duplicate rows before adding constraint
    op.execute("""
        DELETE FROM user_wallets a USING user_wallets b
        WHERE a.id > b.id
        AND a.user_id = b.user_id
        AND a.wallet_address = b.wallet_address
        AND a.chain = b.chain
    """)

    # Add unique constraint to user_wallets
    op.create_unique_constraint(
        'uq_user_wallet_chain',
        'user_wallets',
        ['user_id', 'wallet_address', 'chain']
    )

    # Remove duplicate rows from wallet_group_members
    op.execute("""
        DELETE FROM wallet_group_members a USING wallet_group_members b
        WHERE a.id > b.id
        AND a.group_id = b.group_id
        AND a.wallet_address = b.wallet_address
        AND a.chain = b.chain
    """)

    # Add unique constraint to wallet_group_members
    op.create_unique_constraint(
        'uq_group_wallet_chain',
        'wallet_group_members',
        ['group_id', 'wallet_address', 'chain']
    )


def downgrade():
    op.drop_constraint('uq_group_wallet_chain', 'wallet_group_members', type_='unique')
    op.drop_constraint('uq_user_wallet_chain', 'user_wallets', type_='unique')
