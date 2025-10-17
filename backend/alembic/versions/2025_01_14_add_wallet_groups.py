"""Add wallet groups tables

Revision ID: 2025_01_14_wallet_groups
Revises: 2025_01_14_cost_basis
Create Date: 2025-01-14

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '2025_01_14_wallet_groups'
down_revision = '2025_01_14_cost_basis'
branch_labels = None
depends_on = None


def upgrade():
    # Create wallet_groups table
    op.create_table(
        'wallet_groups',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_default', sa.Boolean(), server_default='false'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE')
    )
    op.create_index('ix_wallet_groups_user_id', 'wallet_groups', ['user_id'])

    # Create wallet_group_members table
    op.create_table(
        'wallet_group_members',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('group_id', sa.Integer(), nullable=False),
        sa.Column('wallet_address', sa.String(length=255), nullable=False),
        sa.Column('chain', sa.String(length=50), nullable=False),
        sa.Column('label', sa.String(length=100), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('added_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['group_id'], ['wallet_groups.id'], ondelete='CASCADE')
    )
    op.create_index('ix_wallet_group_members_group_id', 'wallet_group_members', ['group_id'])
    op.create_index('ix_wallet_group_members_wallet_address', 'wallet_group_members', ['wallet_address'])

    # Create inter_wallet_transfers table
    op.create_table(
        'inter_wallet_transfers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('group_id', sa.Integer(), nullable=False),
        sa.Column('from_wallet_address', sa.String(length=255), nullable=False),
        sa.Column('from_chain', sa.String(length=50), nullable=False),
        sa.Column('from_tx_hash', sa.String(length=255), nullable=False),
        sa.Column('to_wallet_address', sa.String(length=255), nullable=False),
        sa.Column('to_chain', sa.String(length=50), nullable=False),
        sa.Column('to_tx_hash', sa.String(length=255), nullable=True),
        sa.Column('token', sa.String(length=50), nullable=False),
        sa.Column('token_address', sa.String(length=255), nullable=True),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('transfer_type', sa.String(length=20), nullable=False, server_default='internal'),
        sa.Column('is_confirmed', sa.Boolean(), server_default='false'),
        sa.Column('confidence_score', sa.Float(), server_default='1.0'),
        sa.Column('is_taxable', sa.Boolean(), server_default='false'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['group_id'], ['wallet_groups.id'], ondelete='CASCADE')
    )
    op.create_index('ix_inter_wallet_transfers_group_id', 'inter_wallet_transfers', ['group_id'])
    op.create_index('ix_inter_wallet_transfers_from_wallet', 'inter_wallet_transfers', ['from_wallet_address'])
    op.create_index('ix_inter_wallet_transfers_to_wallet', 'inter_wallet_transfers', ['to_wallet_address'])
    op.create_index('ix_inter_wallet_transfers_from_tx', 'inter_wallet_transfers', ['from_tx_hash'])
    op.create_index('ix_inter_wallet_transfers_to_tx', 'inter_wallet_transfers', ['to_tx_hash'])
    op.create_index('ix_inter_wallet_transfers_timestamp', 'inter_wallet_transfers', ['timestamp'])

    # Create consolidated_balances table
    op.create_table(
        'consolidated_balances',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('group_id', sa.Integer(), nullable=False),
        sa.Column('token', sa.String(length=50), nullable=False),
        sa.Column('token_address', sa.String(length=255), nullable=True),
        sa.Column('chain', sa.String(length=50), nullable=False),
        sa.Column('total_amount', sa.Float(), nullable=False),
        sa.Column('total_value_usd', sa.Float(), nullable=False),
        sa.Column('avg_cost_basis', sa.Float(), nullable=True),
        sa.Column('unrealized_gain_loss', sa.Float(), nullable=True),
        sa.Column('unrealized_gain_loss_percent', sa.Float(), nullable=True),
        sa.Column('snapshot_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['group_id'], ['wallet_groups.id'], ondelete='CASCADE')
    )
    op.create_index('ix_consolidated_balances_group_id', 'consolidated_balances', ['group_id'])
    op.create_index('ix_consolidated_balances_token', 'consolidated_balances', ['token'])
    op.create_index('ix_consolidated_balances_snapshot_at', 'consolidated_balances', ['snapshot_at'])


def downgrade():
    op.drop_table('consolidated_balances')
    op.drop_table('inter_wallet_transfers')
    op.drop_table('wallet_group_members')
    op.drop_table('wallet_groups')
