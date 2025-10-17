-- Migration: Add crypto_legal_status column and update banned countries
-- Date: 2025-10-17
-- Description: Add legal status field to track crypto legality per country
--              and update countries where crypto is banned/restricted

BEGIN;

-- Add crypto_legal_status column
ALTER TABLE regulations
ADD COLUMN IF NOT EXISTS crypto_legal_status VARCHAR(20);

-- Add comment for documentation
COMMENT ON COLUMN regulations.crypto_legal_status IS 'Legal status of cryptocurrency: legal, banned, restricted, unclear';

-- Create index for filtering
CREATE INDEX IF NOT EXISTS idx_regulations_crypto_legal_status ON regulations(crypto_legal_status);

-- Update banned countries (cgt_short_rate = -1)
-- Afghanistan
UPDATE regulations SET
    crypto_legal_status = 'banned'
WHERE country_code = 'AF';

-- Burundi
UPDATE regulations SET
    crypto_legal_status = 'banned'
WHERE country_code = 'BI';

-- Iraq
UPDATE regulations SET
    crypto_legal_status = 'banned'
WHERE country_code = 'IQ';

-- Somalia
UPDATE regulations SET
    crypto_legal_status = 'banned'
WHERE country_code = 'SO';

-- Turkmenistan
UPDATE regulations SET
    crypto_legal_status = 'banned'
WHERE country_code = 'TM';

-- Tunisia
UPDATE regulations SET
    crypto_legal_status = 'banned'
WHERE country_code = 'TN';

-- Zambia
UPDATE regulations SET
    crypto_legal_status = 'banned'
WHERE country_code = 'ZM';

-- China (trading banned but not possession)
UPDATE regulations SET
    crypto_legal_status = 'banned'
WHERE country_code = 'CN';

-- Countries with restrictions (mining prohibited but trading allowed)
UPDATE regulations SET
    crypto_legal_status = 'restricted'
WHERE country_code IN ('LA');  -- Laos: mining prohibited

-- Set all countries with crypto data as 'legal' (default)
UPDATE regulations SET
    crypto_legal_status = 'legal'
WHERE crypto_short_rate IS NOT NULL
    AND crypto_short_rate >= 0
    AND crypto_legal_status IS NULL;

-- Set countries with general CGT but no crypto-specific data as 'legal' (assumed)
UPDATE regulations SET
    crypto_legal_status = 'legal'
WHERE cgt_short_rate >= 0
    AND crypto_legal_status IS NULL;

COMMIT;

-- Verification queries
SELECT
    crypto_legal_status,
    COUNT(*) as count
FROM regulations
GROUP BY crypto_legal_status
ORDER BY count DESC;

SELECT
    country_code,
    country_name,
    crypto_legal_status,
    cgt_short_rate,
    crypto_short_rate
FROM regulations
WHERE crypto_legal_status = 'banned'
ORDER BY country_code;
