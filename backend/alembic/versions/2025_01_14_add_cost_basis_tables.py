"""Add cost basis tracking tables

Revision ID: 2025_01_14_cost_basis
Revises: previous_migration
Create Date: 2025-01-14

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '2025_01_14_cost_basis'
down_revision = None  # Update this to your latest migration
branch_labels = None
depends_on = None


def upgrade():
    # Create cost_basis_lots table
    op.create_table(
        'cost_basis_lots',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('token', sa.String(length=50), nullable=False),
        sa.Column('token_address', sa.String(length=255), nullable=True),
        sa.Column('chain', sa.String(length=50), nullable=False),
        sa.Column('acquisition_date', sa.DateTime(), nullable=False),
        sa.Column('acquisition_method', sa.String(length=20), nullable=False),
        sa.Column('acquisition_price_usd', sa.Float(), nullable=False),
        sa.Column('source_tx_hash', sa.String(length=255), nullable=True),
        sa.Column('original_amount', sa.Float(), nullable=False),
        sa.Column('remaining_amount', sa.Float(), nullable=False),
        sa.Column('disposed_amount', sa.Float(), server_default='0.0'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('manually_added', sa.Boolean(), server_default='false'),
        sa.Column('verified', sa.Boolean(), server_default='false'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE')
    )
    op.create_index('ix_cost_basis_lots_user_id', 'cost_basis_lots', ['user_id'])
    op.create_index('ix_cost_basis_lots_token', 'cost_basis_lots', ['token'])
    op.create_index('ix_cost_basis_lots_acquisition_date', 'cost_basis_lots', ['acquisition_date'])
    op.create_index('ix_cost_basis_lots_source_tx_hash', 'cost_basis_lots', ['source_tx_hash'])

    # Create cost_basis_disposals table
    op.create_table(
        'cost_basis_disposals',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('lot_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('disposal_date', sa.DateTime(), nullable=False),
        sa.Column('disposal_price_usd', sa.Float(), nullable=False),
        sa.Column('amount_disposed', sa.Float(), nullable=False),
        sa.Column('disposal_tx_hash', sa.String(length=255), nullable=True),
        sa.Column('cost_basis_per_unit', sa.Float(), nullable=False),
        sa.Column('total_cost_basis', sa.Float(), nullable=False),
        sa.Column('total_proceeds', sa.Float(), nullable=False),
        sa.Column('gain_loss', sa.Float(), nullable=False),
        sa.Column('holding_period_days', sa.Integer(), nullable=False),
        sa.Column('is_short_term', sa.Boolean(), nullable=False),
        sa.Column('is_long_term', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['lot_id'], ['cost_basis_lots.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE')
    )
    op.create_index('ix_cost_basis_disposals_lot_id', 'cost_basis_disposals', ['lot_id'])
    op.create_index('ix_cost_basis_disposals_user_id', 'cost_basis_disposals', ['user_id'])
    op.create_index('ix_cost_basis_disposals_disposal_date', 'cost_basis_disposals', ['disposal_date'])

    # Create user_cost_basis_settings table
    op.create_table(
        'user_cost_basis_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('default_method', sa.String(length=20), server_default='fifo'),
        sa.Column('tax_jurisdiction', sa.String(length=10), server_default='US'),
        sa.Column('tax_year_start', sa.Integer(), server_default='1'),
        sa.Column('apply_wash_sale_rule', sa.Boolean(), server_default='true'),
        sa.Column('wash_sale_days', sa.Integer(), server_default='30'),
        sa.Column('track_inter_wallet_transfers', sa.Boolean(), server_default='false'),
        sa.Column('auto_import_enabled', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('user_id')
    )

    # Create wash_sale_violations table
    op.create_table(
        'wash_sale_violations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('loss_disposal_id', sa.Integer(), nullable=False),
        sa.Column('loss_amount', sa.Float(), nullable=False),
        sa.Column('repurchase_lot_id', sa.Integer(), nullable=False),
        sa.Column('repurchase_date', sa.DateTime(), nullable=False),
        sa.Column('days_between', sa.Integer(), nullable=False),
        sa.Column('disallowed_loss', sa.Float(), nullable=False),
        sa.Column('adjusted_cost_basis', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['loss_disposal_id'], ['cost_basis_disposals.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['repurchase_lot_id'], ['cost_basis_lots.id'], ondelete='CASCADE')
    )

    # Create cached_prices table
    op.create_table(
        'cached_prices',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('token', sa.String(length=50), nullable=False),
        sa.Column('token_address', sa.String(length=255), nullable=True),
        sa.Column('chain', sa.String(length=50), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('price_usd', sa.Float(), nullable=False),
        sa.Column('source', sa.String(length=50), nullable=False),
        sa.Column('source_confidence', sa.Float(), server_default='1.0'),
        sa.Column('volume_24h_usd', sa.Float(), nullable=True),
        sa.Column('market_cap_usd', sa.Float(), nullable=True),
        sa.Column('cached_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.Column('expires_at', sa.DateTime(), nullable=True),
        sa.Column('cache_hits', sa.Integer(), server_default='0'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('token', 'chain', 'timestamp', 'source', name='_token_chain_time_source_uc')
    )
    op.create_index('ix_cached_prices_token', 'cached_prices', ['token'])
    op.create_index('ix_cached_prices_chain', 'cached_prices', ['chain'])
    op.create_index('ix_cached_prices_timestamp', 'cached_prices', ['timestamp'])
    op.create_index('idx_price_lookup', 'cached_prices', ['token', 'chain', 'timestamp'])
    op.create_index('idx_price_recent', 'cached_prices', ['cached_at'])

    # Create price_sources table
    op.create_table(
        'price_sources',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.Column('api_url', sa.String(length=255), nullable=False),
        sa.Column('requires_api_key', sa.Integer(), server_default='0'),
        sa.Column('is_active', sa.Integer(), server_default='1'),
        sa.Column('last_success', sa.DateTime(), nullable=True),
        sa.Column('last_failure', sa.DateTime(), nullable=True),
        sa.Column('failure_count', sa.Integer(), server_default='0'),
        sa.Column('calls_per_minute', sa.Integer(), server_default='50'),
        sa.Column('calls_per_day', sa.Integer(), nullable=True),
        sa.Column('current_minute_calls', sa.Integer(), server_default='0'),
        sa.Column('current_day_calls', sa.Integer(), server_default='0'),
        sa.Column('last_call_reset', sa.DateTime(), server_default=sa.text('now()')),
        sa.Column('priority', sa.Integer(), server_default='10'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )


def downgrade():
    op.drop_table('price_sources')
    op.drop_table('cached_prices')
    op.drop_table('wash_sale_violations')
    op.drop_table('user_cost_basis_settings')
    op.drop_table('cost_basis_disposals')
    op.drop_table('cost_basis_lots')
