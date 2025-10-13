-- Migration: Add crypto-specific fields to regulations table
-- Date: 2025-10-12
-- Description: Add crypto_short_rate, crypto_long_rate, crypto_notes to support
--              crypto-specific taxation rules that differ from general CGT

BEGIN;

-- Add crypto-specific tax rate columns
ALTER TABLE regulations
ADD COLUMN IF NOT EXISTS crypto_short_rate NUMERIC(5, 4),
ADD COLUMN IF NOT EXISTS crypto_long_rate NUMERIC(5, 4),
ADD COLUMN IF NOT EXISTS crypto_notes TEXT;

-- Add comments for documentation
COMMENT ON COLUMN regulations.crypto_short_rate IS 'Short-term crypto gains tax rate (<1 year), may differ from general CGT';
COMMENT ON COLUMN regulations.crypto_long_rate IS 'Long-term crypto gains tax rate (>1 year), may differ from general CGT';
COMMENT ON COLUMN regulations.crypto_notes IS 'Crypto-specific rules and conditions (e.g., Germany: 0% if held >1 year)';

-- Create admin_notifications table
CREATE TABLE IF NOT EXISTS admin_notifications (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    country_code VARCHAR(3),
    meta_data TEXT,
    read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS ix_admin_notifications_type ON admin_notifications(type);
CREATE INDEX IF NOT EXISTS ix_admin_notifications_country_code ON admin_notifications(country_code);
CREATE INDEX IF NOT EXISTS ix_admin_notifications_read ON admin_notifications(read);
CREATE INDEX IF NOT EXISTS ix_admin_notifications_created_at ON admin_notifications(created_at DESC);

-- Add comments
COMMENT ON TABLE admin_notifications IS 'Admin notifications for tax data updates and system events';
COMMENT ON COLUMN admin_notifications.meta_data IS 'JSON metadata (NOT metadata - reserved keyword in SQLAlchemy)';

COMMIT;

-- Verification queries
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'regulations'
    AND column_name IN ('crypto_short_rate', 'crypto_long_rate', 'crypto_notes')
ORDER BY ordinal_position;

SELECT
    COUNT(*) as notification_table_exists
FROM information_schema.tables
WHERE table_name = 'admin_notifications';
