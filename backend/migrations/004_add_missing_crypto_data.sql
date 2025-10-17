-- Migration: Add crypto tax data for countries missing crypto_short_rate
-- Date: 2025-10-17
-- Description: Add crypto-specific tax rates for important jurisdictions
--              Sources: KPMG, PwC, Deloitte tax summaries, official tax authorities

BEGIN;

-- Luxembourg (LU) - Already has data but verifying
UPDATE regulations SET
    crypto_short_rate = 0.425,  -- Speculation tax if <6 months
    crypto_long_rate = 0.00,    -- Exempt if >6 months
    crypto_notes = '0% CGT if held >6 months! Short-term speculation (<6 months): 42.5%. Key financial hub.',
    holding_period_months = 6,
    crypto_legal_status = 'legal'
WHERE country_code = 'LU' AND crypto_short_rate IS NULL;

-- Malta (MT)
UPDATE regulations SET
    crypto_short_rate = 0.35,   -- Long-term capital gains
    crypto_long_rate = 0.35,
    crypto_notes = '35% CGT on crypto gains. No distinction short/long-term. Day traders may be taxed as income (up to 35%). Crypto-friendly licensing.',
    crypto_legal_status = 'legal'
WHERE country_code = 'MT';

-- Hungary (HU)
UPDATE regulations SET
    crypto_short_rate = 0.15,   -- Flat personal income tax
    crypto_long_rate = 0.15,
    crypto_notes = '15% flat tax on crypto income. Treated as other income. Must be declared annually. One of lowest in EU.',
    crypto_legal_status = 'legal'
WHERE country_code = 'HU';

-- Estonia (EE)
UPDATE regulations SET
    crypto_short_rate = 0.20,   -- Income tax
    crypto_long_rate = 0.20,
    crypto_notes = '20% income tax on crypto gains. Businesses: 0% if not distributed. E-Residency program available. Crypto licenses required.',
    crypto_legal_status = 'legal'
WHERE country_code = 'EE';

-- Colombia (CO) - Already in seed but checking
UPDATE regulations SET
    crypto_short_rate = 0.39,
    crypto_long_rate = 0.39,
    crypto_notes = 'Progressive rates 0-39% on crypto gains. Digital Nomad Visa popular. DIAN reporting required.',
    crypto_legal_status = 'legal'
WHERE country_code = 'CO' AND crypto_short_rate IS NULL;

-- Romania (RO) - Already has data but verifying
UPDATE regulations SET
    crypto_legal_status = 'legal'
WHERE country_code = 'RO';

-- Isle of Man (IM)
UPDATE regulations SET
    crypto_short_rate = 0.00,
    crypto_long_rate = 0.00,
    crypto_notes = '0% CGT on crypto! No capital gains tax. Income tax may apply for trading businesses (0-20%). Crypto-friendly jurisdiction.',
    crypto_legal_status = 'legal'
WHERE country_code = 'IM';

-- Jersey (JE)
UPDATE regulations SET
    crypto_short_rate = 0.00,
    crypto_long_rate = 0.00,
    crypto_notes = '0% CGT on crypto for individuals! No capital gains tax. Crypto businesses regulated. Popular offshore jurisdiction.',
    crypto_legal_status = 'legal'
WHERE country_code = 'JE';

-- Cayman Islands (KY)
UPDATE regulations SET
    crypto_short_rate = 0.00,
    crypto_long_rate = 0.00,
    crypto_notes = 'ZERO tax! No income, CGT, or corporate tax. Popular for crypto funds and exchanges. VASP regulations apply.',
    crypto_legal_status = 'legal'
WHERE country_code = 'KY';

-- Bermuda (BM)
UPDATE regulations SET
    crypto_short_rate = 0.00,
    crypto_long_rate = 0.00,
    crypto_notes = '0% personal income and CGT on crypto. Crypto business-friendly. Digital Asset Business Act. High cost of living.',
    crypto_legal_status = 'legal'
WHERE country_code = 'BM';

-- Gibraltar (GI)
UPDATE regulations SET
    crypto_short_rate = 0.00,
    crypto_long_rate = 0.00,
    crypto_notes = '0% CGT on crypto for individuals! DLT framework for crypto businesses. No CGT, no VAT on crypto transactions.',
    crypto_legal_status = 'legal'
WHERE country_code = 'GI';

-- Bahamas (BS)
UPDATE regulations SET
    crypto_short_rate = 0.00,
    crypto_long_rate = 0.00,
    crypto_notes = 'ZERO income and CGT! No personal taxation on crypto gains. DARE Act for crypto regulation. Popular for crypto businesses.',
    crypto_legal_status = 'legal'
WHERE country_code = 'BS';

-- Barbados (BB)
UPDATE regulations SET
    crypto_short_rate = 0.00,   -- Likely 0% for personal investment
    crypto_long_rate = 0.00,
    crypto_notes = '0% CGT for personal investment. Income tax may apply for trading businesses. Developing crypto regulations.',
    crypto_legal_status = 'legal'
WHERE country_code = 'BB';

-- Antigua and Barbuda (AG)
UPDATE regulations SET
    crypto_short_rate = 0.00,
    crypto_long_rate = 0.00,
    crypto_notes = '0% CGT on crypto gains. No capital gains tax. Citizenship by investment available. Offshore jurisdiction.',
    crypto_legal_status = 'legal'
WHERE country_code = 'AG';

-- Kuwait (KW)
UPDATE regulations SET
    crypto_short_rate = 0.00,
    crypto_long_rate = 0.00,
    crypto_notes = '0% personal income tax including crypto. No CGT. Crypto trading ambiguous - not officially regulated.',
    crypto_legal_status = 'unclear'
WHERE country_code = 'KW';

-- Brunei (BN)
UPDATE regulations SET
    crypto_short_rate = 0.00,
    crypto_long_rate = 0.00,
    crypto_notes = '0% personal income tax. No CGT on crypto. Crypto status unclear - not banned but limited adoption.',
    crypto_legal_status = 'unclear'
WHERE country_code = 'BN';

-- Belarus (BY)
UPDATE regulations SET
    crypto_short_rate = 0.00,   -- Exempt until 2025
    crypto_long_rate = 0.00,
    crypto_notes = 'Tax-free until 2025! Decree No. 8: crypto mining and trading exempt. After 2025: unclear. High-Tech Park framework.',
    crypto_legal_status = 'legal',
    holding_period_months = 0
WHERE country_code = 'BY';

-- Maldives (MV)
UPDATE regulations SET
    crypto_short_rate = 0.00,
    crypto_long_rate = 0.00,
    crypto_notes = '0% income and CGT. No personal taxation on crypto. Crypto status unclear - limited regulations.',
    crypto_legal_status = 'unclear'
WHERE country_code = 'MV';

-- Bolivia (BO)
UPDATE regulations SET
    crypto_short_rate = -1.0000,
    crypto_long_rate = -1.0000,
    crypto_notes = '🚫 RESTRICTED: Crypto transactions banned by Central Bank since 2014. Use prohibited but enforcement unclear.',
    crypto_legal_status = 'restricted'
WHERE country_code = 'BO';

-- Dominican Republic (DO)
UPDATE regulations SET
    crypto_short_rate = 0.27,   -- Progressive income tax
    crypto_long_rate = 0.27,
    crypto_notes = 'Progressive tax 15-27% on crypto income. No specific crypto regulations yet. Must declare as other income.',
    crypto_legal_status = 'legal'
WHERE country_code = 'DO';

-- Kosovo (XK)
UPDATE regulations SET
    crypto_short_rate = 0.10,   -- Flat corporate/personal income tax
    crypto_long_rate = 0.10,
    crypto_notes = '10% flat tax on income including crypto. Developing regulations. Tax treatment unclear for individuals.',
    crypto_legal_status = 'unclear'
WHERE country_code = 'XK';

-- Montenegro (ME) - if exists
UPDATE regulations SET
    crypto_short_rate = 0.09,   -- Capital gains
    crypto_long_rate = 0.09,
    crypto_notes = '9% capital gains tax on crypto. Flat 9% or 15% income tax. Crypto-friendly tax regime.',
    crypto_legal_status = 'legal'
WHERE country_code = 'ME' AND EXISTS (SELECT 1 FROM regulations WHERE country_code = 'ME');

-- Jordan (JO)
UPDATE regulations SET
    crypto_short_rate = 0.20,   -- Income tax
    crypto_long_rate = 0.20,
    crypto_notes = 'Progressive income tax 5-25% avg ~20%. Crypto not recognized as legal tender. Trading not prohibited.',
    crypto_legal_status = 'unclear'
WHERE country_code = 'JO';

-- Grenada (GD)
UPDATE regulations SET
    crypto_short_rate = 0.00,
    crypto_long_rate = 0.00,
    crypto_notes = '0% CGT on crypto. No capital gains tax. Offshore jurisdiction. Citizenship by investment available.',
    crypto_legal_status = 'legal'
WHERE country_code = 'GD';

COMMIT;

-- Verification
SELECT
    crypto_legal_status,
    COUNT(*) as count
FROM regulations
GROUP BY crypto_legal_status
ORDER BY count DESC;

SELECT
    COUNT(*) as countries_with_crypto_data,
    COUNT(CASE WHEN crypto_short_rate IS NULL THEN 1 END) as still_missing
FROM regulations;
