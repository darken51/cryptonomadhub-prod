"""add wallet portfolio tracking

Revision ID: add_wallet_portfolio_tracking
Revises: add_multi_currency_support
Create Date: 2025-10-19 00:30:00

Creates tables for wallet portfolio tracking:
- wallet_snapshots: Daily snapshots of wallet values
- wallet_value_history: High-frequency value tracking for alerts
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = 'add_wallet_portfolio_tracking'
down_revision = 'add_multi_currency_support'
branch_labels = None
depends_on = None


def upgrade():
    # Create wallet_snapshots table
    op.create_table(
        'wallet_snapshots',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('wallet_id', sa.Integer(), nullable=True),

        # Snapshot metadata
        sa.Column('snapshot_date', sa.DateTime(), nullable=False),

        # USD values
        sa.Column('total_value_usd', sa.Numeric(precision=20, scale=8), nullable=False, server_default='0'),
        sa.Column('total_cost_basis', sa.Numeric(precision=20, scale=8), nullable=False, server_default='0'),
        sa.Column('total_unrealized_gain_loss', sa.Numeric(precision=20, scale=8), nullable=False, server_default='0'),
        sa.Column('unrealized_gain_loss_percent', sa.Numeric(precision=10, scale=4), nullable=False, server_default='0'),

        # Local currency values
        sa.Column('total_value_local', sa.Numeric(precision=20, scale=8), nullable=True),
        sa.Column('total_cost_basis_local', sa.Numeric(precision=20, scale=8), nullable=True),
        sa.Column('total_unrealized_gain_loss_local', sa.Numeric(precision=20, scale=8), nullable=True),
        sa.Column('local_currency', sa.String(length=3), nullable=True),
        sa.Column('currency_symbol', sa.String(length=5), nullable=True),
        sa.Column('exchange_rate', sa.Numeric(precision=20, scale=8), nullable=True),

        # Detailed positions (JSON)
        sa.Column('positions', postgresql.JSON(astext_type=sa.Text()), nullable=True),

        # Stats
        sa.Column('total_tokens', sa.Integer(), server_default='0'),
        sa.Column('total_chains', sa.Integer(), server_default='0'),

        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),

        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['wallet_id'], ['user_wallets.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes for wallet_snapshots
    op.create_index('ix_wallet_snapshots_user_id', 'wallet_snapshots', ['user_id'])
    op.create_index('ix_wallet_snapshots_wallet_id', 'wallet_snapshots', ['wallet_id'])
    op.create_index('ix_wallet_snapshots_snapshot_date', 'wallet_snapshots', ['snapshot_date'])
    op.create_index('idx_wallet_snapshot_date', 'wallet_snapshots', ['wallet_id', 'snapshot_date'])
    op.create_index('idx_user_snapshot_date', 'wallet_snapshots', ['user_id', 'snapshot_date'])

    # Create wallet_value_history table
    op.create_table(
        'wallet_value_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('wallet_id', sa.Integer(), nullable=True),

        # Timestamp
        sa.Column('timestamp', sa.DateTime(), nullable=False, server_default=sa.text('now()')),

        # USD values
        sa.Column('total_value_usd', sa.Numeric(precision=20, scale=8), nullable=False, server_default='0'),

        # Changes
        sa.Column('change_1h_usd', sa.Numeric(precision=20, scale=8), nullable=True),
        sa.Column('change_1h_percent', sa.Numeric(precision=10, scale=4), nullable=True),
        sa.Column('change_24h_usd', sa.Numeric(precision=20, scale=8), nullable=True),
        sa.Column('change_24h_percent', sa.Numeric(precision=10, scale=4), nullable=True),

        # Local currency
        sa.Column('total_value_local', sa.Numeric(precision=20, scale=8), nullable=True),
        sa.Column('change_24h_local', sa.Numeric(precision=20, scale=8), nullable=True),
        sa.Column('local_currency', sa.String(length=3), nullable=True),
        sa.Column('currency_symbol', sa.String(length=5), nullable=True),

        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['wallet_id'], ['user_wallets.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes for wallet_value_history
    op.create_index('ix_wallet_value_history_user_id', 'wallet_value_history', ['user_id'])
    op.create_index('ix_wallet_value_history_wallet_id', 'wallet_value_history', ['wallet_id'])
    op.create_index('ix_wallet_value_history_timestamp', 'wallet_value_history', ['timestamp'])
    op.create_index('idx_wallet_value_time', 'wallet_value_history', ['wallet_id', 'timestamp'])
    op.create_index('idx_user_value_time', 'wallet_value_history', ['user_id', 'timestamp'])


def downgrade():
    # Drop wallet_value_history
    op.drop_index('idx_user_value_time', table_name='wallet_value_history')
    op.drop_index('idx_wallet_value_time', table_name='wallet_value_history')
    op.drop_index('ix_wallet_value_history_timestamp', table_name='wallet_value_history')
    op.drop_index('ix_wallet_value_history_wallet_id', table_name='wallet_value_history')
    op.drop_index('ix_wallet_value_history_user_id', table_name='wallet_value_history')
    op.drop_table('wallet_value_history')

    # Drop wallet_snapshots
    op.drop_index('idx_user_snapshot_date', table_name='wallet_snapshots')
    op.drop_index('idx_wallet_snapshot_date', table_name='wallet_snapshots')
    op.drop_index('ix_wallet_snapshots_snapshot_date', table_name='wallet_snapshots')
    op.drop_index('ix_wallet_snapshots_wallet_id', table_name='wallet_snapshots')
    op.drop_index('ix_wallet_snapshots_user_id', table_name='wallet_snapshots')
    op.drop_table('wallet_snapshots')
