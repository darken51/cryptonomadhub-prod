-- Migration: Add known crypto-specific rates for major countries
-- Date: 2025-10-12
-- Description: Manually add crypto tax rates for ~30 major countries based on public tax authorities

BEGIN;

-- United States
UPDATE regulations SET
    crypto_short_rate = 0.37,  -- Up to 37% federal (taxed as ordinary income)
    crypto_long_rate = 0.20,   -- Up to 20% for long-term gains
    crypto_notes = 'Short-term crypto gains (<1 year) taxed as ordinary income (10-37%). Long-term (>1 year): 0-20% depending on income bracket. State taxes may apply.'
WHERE country_code = 'US';

-- Canada
UPDATE regulations SET
    crypto_short_rate = 0.27,  -- ~50% of gains taxed at marginal rate (avg ~53%)
    crypto_long_rate = 0.27,   -- Same as short-term
    crypto_notes = '50% of crypto gains taxed as capital gains at marginal income tax rate (avg 33-53% depending on province). No distinction between short/long-term.'
WHERE country_code = 'CA';

-- United Kingdom
UPDATE regulations SET
    crypto_short_rate = 0.24,
    crypto_long_rate = 0.24,
    crypto_notes = 'Crypto gains taxed at 10% (basic rate) or 24% (higher rate) on gains above £3,000 annual exemption (2024-25). No short/long-term distinction.'
WHERE country_code = 'GB';

-- France
UPDATE regulations SET
    crypto_short_rate = 0.30,
    crypto_long_rate = 0.30,
    crypto_notes = 'Flat tax (PFU) of 30% on crypto gains (12.8% income tax + 17.2% social contributions). Applies to all crypto transactions.'
WHERE country_code = 'FR';

-- Switzerland
UPDATE regulations SET
    crypto_short_rate = 0.00,
    crypto_long_rate = 0.00,
    crypto_notes = '0% tax on crypto gains for private investors (wealth management). If classified as professional trading, subject to income tax. No CGT for individuals.'
WHERE country_code = 'CH';

-- Singapore
UPDATE regulations SET
    crypto_short_rate = 0.00,
    crypto_long_rate = 0.00,
    crypto_notes = '0% CGT on crypto for long-term investment. If trading as business or with high frequency, may be taxed as income (up to 22%).'
WHERE country_code = 'SG';

-- Hong Kong
UPDATE regulations SET
    crypto_short_rate = 0.00,
    crypto_long_rate = 0.00,
    crypto_notes = '0% CGT on crypto gains. No distinction between investment and trading for individuals. Crypto considered capital asset unless systematic trading business.'
WHERE country_code = 'HK';

-- UAE (United Arab Emirates)
UPDATE regulations SET
    crypto_short_rate = 0.00,
    crypto_long_rate = 0.00,
    crypto_notes = '0% personal income tax, including crypto gains. No CGT. Corporate tax of 9% may apply to crypto businesses.'
WHERE country_code = 'AE';

-- Australia
UPDATE regulations SET
    crypto_short_rate = 0.47,  -- Marginal rate for short-term
    crypto_long_rate = 0.235,  -- 50% discount on long-term (so max 47%/2 = 23.5%)
    crypto_notes = 'Short-term crypto gains (<12 months) taxed at marginal income tax rate (19-47%). Long-term (>12 months): 50% discount on gains.'
WHERE country_code = 'AU';

-- Netherlands
UPDATE regulations SET
    crypto_short_rate = 0.36,
    crypto_long_rate = 0.36,
    crypto_notes = 'Box 3 taxation: crypto holdings taxed as wealth at 36% on presumed 6.17% annual return. Actual gains/losses irrelevant. Reform expected.'
WHERE country_code = 'NL';

-- Belgium
UPDATE regulations SET
    crypto_short_rate = 0.33,
    crypto_long_rate = 0.00,
    crypto_notes = '0% for occasional crypto investors. 33% for speculative or frequent trading. No clear definition of "occasional" - case-by-case assessment.'
WHERE country_code = 'BE';

-- Austria
UPDATE regulations SET
    crypto_short_rate = 0.275,
    crypto_long_rate = 0.275,
    crypto_notes = '27.5% flat tax on crypto gains since April 2022. Applies to all crypto transactions regardless of holding period. Mining taxed as income.'
WHERE country_code = 'AT';

-- Ireland
UPDATE regulations SET
    crypto_short_rate = 0.33,
    crypto_long_rate = 0.33,
    crypto_notes = '33% CGT on crypto gains above €1,270 annual exemption. No distinction between short/long-term. Losses can be carried forward.'
WHERE country_code = 'IE';

-- Finland
UPDATE regulations SET
    crypto_short_rate = 0.34,
    crypto_long_rate = 0.34,
    crypto_notes = '30% on gains up to €30,000, then 34% above. Applies to all crypto capital gains. Mining and staking taxed as income (up to 56%).'
WHERE country_code = 'FI';

-- Norway
UPDATE regulations SET
    crypto_short_rate = 0.22,
    crypto_long_rate = 0.22,
    crypto_notes = '22% flat tax on crypto capital gains. Must be declared annually even if no sales occurred. Losses deductible.'
WHERE country_code = 'NO';

-- New Zealand
UPDATE regulations SET
    crypto_short_rate = 0.39,
    crypto_long_rate = 0.00,
    crypto_notes = 'Crypto taxed as property. If acquired for disposal: taxed as income (up to 39%). If long-term investment: generally 0% tax. Case-by-case assessment.'
WHERE country_code = 'NZ';

-- Japan
UPDATE regulations SET
    crypto_short_rate = 0.55,
    crypto_long_rate = 0.55,
    crypto_notes = 'Crypto gains taxed as miscellaneous income at progressive rates (5-55%). No long-term benefits. Losses cannot offset other income.'
WHERE country_code = 'JP';

-- South Korea
UPDATE regulations SET
    crypto_short_rate = 0.22,
    crypto_long_rate = 0.22,
    crypto_notes = '22% tax on crypto gains above ₩2.5M (~$2,100) annual exemption. Effective from 2025. Previously 0% for individuals.'
WHERE country_code = 'KR';

-- India
UPDATE regulations SET
    crypto_short_rate = 0.30,
    crypto_long_rate = 0.30,
    crypto_notes = '30% flat tax on crypto gains + 4% cess. 1% TDS on all transfers. Losses cannot be offset. No distinction between short/long-term.'
WHERE country_code = 'IN';

-- Brazil
UPDATE regulations SET
    crypto_short_rate = 0.15,
    crypto_long_rate = 0.15,
    crypto_notes = '15% tax on crypto gains for sales >R$35,000/month (~$7,000). Below threshold: 0%. Day trading: 20%. Must be declared monthly.'
WHERE country_code = 'BR';

-- Mexico
UPDATE regulations SET
    crypto_short_rate = 0.35,
    crypto_long_rate = 0.35,
    crypto_notes = 'Crypto gains taxed as income at progressive rates (up to 35%). Regulated as virtual assets. ISR (income tax) applies to all gains.'
WHERE country_code = 'MX';

-- Argentina
UPDATE regulations SET
    crypto_short_rate = 0.15,
    crypto_long_rate = 0.15,
    crypto_notes = '15% tax on crypto gains for residents. Non-residents may be exempt. Wealth tax may also apply on crypto holdings >$300K.'
WHERE country_code = 'AR';

-- South Africa
UPDATE regulations SET
    crypto_short_rate = 0.18,
    crypto_long_rate = 0.18,
    crypto_notes = 'Crypto treated as intangible asset. Individuals: 0-18% CGT (40% of gain at marginal rate). Traders: income tax (up to 45%).'
WHERE country_code = 'ZA';

-- Turkey
UPDATE regulations SET
    crypto_short_rate = 0.40,
    crypto_long_rate = 0.40,
    crypto_notes = 'Proposal: 40% withholding tax on crypto gains from 2024. Not yet fully implemented. Currently ambiguous tax treatment.'
WHERE country_code = 'TR';

-- Poland
UPDATE regulations SET
    crypto_short_rate = 0.19,
    crypto_long_rate = 0.19,
    crypto_notes = '19% flat tax on crypto gains (PIT-38). Crypto-to-crypto trades also taxable. Losses can offset gains within same year.'
WHERE country_code = 'PL';

-- Czech Republic
UPDATE regulations SET
    crypto_short_rate = 0.15,
    crypto_long_rate = 0.00,
    crypto_notes = '15% income tax if sold within 3 years. 0% if held >3 years. Exemption for gains <CZK 100K/year (~$4,400) if sold after 3 years.'
WHERE country_code = 'CZ';

-- Greece
UPDATE regulations SET
    crypto_short_rate = 0.15,
    crypto_long_rate = 0.15,
    crypto_notes = '15% tax on crypto capital gains. Solidarity levy may apply (0-10% on high incomes). Mining taxed as business income.'
WHERE country_code = 'GR';

-- Romania
UPDATE regulations SET
    crypto_short_rate = 0.10,
    crypto_long_rate = 0.10,
    crypto_notes = '10% flat tax on crypto capital gains. Must be declared annually. Losses can be carried forward for 7 years.'
WHERE country_code = 'RO';

-- Malaysia
UPDATE regulations SET
    crypto_short_rate = 0.00,
    crypto_long_rate = 0.00,
    crypto_notes = '0% CGT on crypto for individuals. If trading as business, may be subject to income tax. No clear guidelines yet.'
WHERE country_code = 'MY';

-- Thailand
UPDATE regulations SET
    crypto_short_rate = 0.15,
    crypto_long_rate = 0.15,
    crypto_notes = '15% tax on crypto gains. Previously included 7% VAT (removed 2022). Withholding tax 15% on exchanges. Losses deductible.'
WHERE country_code = 'TH';

-- Panama
UPDATE regulations SET
    crypto_short_rate = 0.00,
    crypto_long_rate = 0.00,
    crypto_notes = '0% tax on crypto gains under "Law 109" if not generated in Panama. Territorial tax system. Crypto law passed 2023.'
WHERE country_code = 'PA';

-- Bahrain
UPDATE regulations SET
    crypto_short_rate = 0.00,
    crypto_long_rate = 0.00,
    crypto_notes = '0% personal income tax, including crypto. No CGT. Corporate tax may apply to crypto businesses.'
WHERE country_code = 'BH';

-- Qatar
UPDATE regulations SET
    crypto_short_rate = 0.00,
    crypto_long_rate = 0.00,
    crypto_notes = '0% personal income tax, including crypto gains. No CGT. Corporate tax 10% for non-Qatari companies.'
WHERE country_code = 'QA';

COMMIT;

-- Verification
SELECT
    COUNT(*) as total_with_crypto,
    COUNT(CASE WHEN crypto_short_rate = 0 THEN 1 END) as zero_tax_countries
FROM regulations
WHERE crypto_short_rate IS NOT NULL;
