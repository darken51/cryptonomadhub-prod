-- Migration: Fix broken source URLs with working alternatives
-- Date: 2025-10-17
-- Description: Replace 404/broken URLs with working government or reliable sources
--              Priority: Government sites > PwC/KPMG > Crypto tax guides

BEGIN;

-- MAJOR COUNTRIES - Priority fixes

-- France (FR) - Government site
UPDATE regulations SET
    source_url = 'https://www.impots.gouv.fr/particulier/questions/je-possede-des-actifs-numeriques-bitcoin-comment-dois-je-les-declarer'
WHERE country_code = 'FR';

-- Austria (AT) - Government site
UPDATE regulations SET
    source_url = 'https://www.bmf.gv.at/themen/steuern/sparen-veranlagen/kryptowaehrungen.html'
WHERE country_code = 'AT';

-- Finland (FI) - Government site
UPDATE regulations SET
    source_url = 'https://www.vero.fi/en/detailed-guidance/guidance/48411/taxation-of-virtual-currencies3/'
WHERE country_code = 'FI';

-- Poland (PL) - Government + PWC
UPDATE regulations SET
    source_url = 'https://taxsummaries.pwc.com/poland'
WHERE country_code = 'PL';

-- Belgium (BE) - Government site
UPDATE regulations SET
    source_url = 'https://finances.belgium.be/fr/particuliers/declaration_impot/revenus-imposables/plus-values'
WHERE country_code = 'BE';

-- Lithuania (LT) - Government site
UPDATE regulations SET
    source_url = 'https://www.vmi.lt/evmi/en/cryptocurrency-taxation'
WHERE country_code = 'LT';

-- Latvia (LV) - PWC
UPDATE regulations SET
    source_url = 'https://taxsummaries.pwc.com/latvia'
WHERE country_code = 'LV';

-- India (IN) - Government site
UPDATE regulations SET
    source_url = 'https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1'
WHERE country_code = 'IN';

-- Israel (IL) - Tax Authority
UPDATE regulations SET
    source_url = 'https://www.gov.il/en/departments/israel_tax_authority'
WHERE country_code = 'IL';

-- Mexico (MX) - Government site
UPDATE regulations SET
    source_url = 'https://www.sat.gob.mx/consulta/09408/conoce-el-tratamiento-fiscal-de-las-criptomonedas'
WHERE country_code = 'MX';

-- Romania (RO) - Government site
UPDATE regulations SET
    source_url = 'https://www.anaf.ro/'
WHERE country_code = 'RO';

-- Croatia (HR) - Tax Administration
UPDATE regulations SET
    source_url = 'https://www.porezna-uprava.hr/en/'
WHERE country_code = 'HR';

-- Greece (GR) - PWC
UPDATE regulations SET
    source_url = 'https://taxsummaries.pwc.com/greece'
WHERE country_code = 'GR';

-- Iceland (IS) - Tax Authority
UPDATE regulations SET
    source_url = 'https://www.rsk.is/english/'
WHERE country_code = 'IS';

-- Cyprus (CY) - Tax Department
UPDATE regulations SET
    source_url = 'https://www.mof.gov.cy/mof/tax/taxdep.nsf/index_en/index_en'
WHERE country_code = 'CY';

-- Bulgaria (BG) - PWC
UPDATE regulations SET
    source_url = 'https://taxsummaries.pwc.com/bulgaria'
WHERE country_code = 'BG';

-- TAX HAVENS & OFFSHORE

-- Malta (MT) - Malta Financial Services Authority
UPDATE regulations SET
    source_url = 'https://www.mfsa.mt/our-work/innovation-hub/distributed-ledger-technology/'
WHERE country_code = 'MT';

-- Luxembourg (LU) - Administration des Contributions Directes
UPDATE regulations SET
    source_url = 'https://impotsdirects.public.lu/fr.html'
WHERE country_code = 'LU';

-- Cayman Islands (KY) - Government portal
UPDATE regulations SET
    source_url = 'https://www.gov.ky/government'
WHERE country_code = 'KY';

-- Bermuda (BM) - Government portal
UPDATE regulations SET
    source_url = 'https://www.gov.bm/digital-asset-business'
WHERE country_code = 'BM';

-- Liechtenstein (LI) - Tax Administration
UPDATE regulations SET
    source_url = 'https://www.llv.li/en/authorities/tax-administration'
WHERE country_code = 'LI';

-- Isle of Man (IM) - Government site
UPDATE regulations SET
    source_url = 'https://www.gov.im/categories/tax-vat-and-your-money/'
WHERE country_code = 'IM';

-- Jersey (JE) - Tax authority
UPDATE regulations SET
    source_url = 'https://www.gov.je/taxesmoney/incometax/pages/index.aspx'
WHERE country_code = 'JE';

-- Gibraltar (GI) - Tax office
UPDATE regulations SET
    source_url = 'https://www.gibraltar.gov.gi/finance'
WHERE country_code = 'GI';

-- EUROPEAN COUNTRIES

-- Estonia (EE) - Tax and Customs Board
UPDATE regulations SET
    source_url = 'https://www.emta.ee/en'
WHERE country_code = 'EE';

-- ASIA & MIDDLE EAST

-- Pakistan (PK) - Federal Board of Revenue
UPDATE regulations SET
    source_url = 'https://www.fbr.gov.pk/'
WHERE country_code = 'PK';

-- Jordan (JO) - Income Tax Department
UPDATE regulations SET
    source_url = 'https://www.istd.gov.jo/En'
WHERE country_code = 'JO';

-- Kosovo (XK) - Tax Administration
UPDATE regulations SET
    source_url = 'https://atk-ks.org/en/'
WHERE country_code = 'XK';

-- Kyrgyzstan (KG) - Tax Service
UPDATE regulations SET
    source_url = 'https://www.sti.gov.kg/en'
WHERE country_code = 'KG';

-- AMERICAS

-- Dominican Republic (DO) - DGII
UPDATE regulations SET
    source_url = 'https://www.dgii.gov.do/'
WHERE country_code = 'DO';

-- Bolivia (BO) - Tax authority
UPDATE regulations SET
    source_url = 'https://www.impuestos.gob.bo/'
WHERE country_code = 'BO';

-- Venezuela (VE) - SENIAT
UPDATE regulations SET
    source_url = 'https://www.seniat.gob.ve/'
WHERE country_code = 'VE';

-- AFRICA

-- Tunisia (TN) - Ministry of Finance
UPDATE regulations SET
    source_url = 'https://www.finances.gov.tn/'
WHERE country_code = 'TN';

-- Zambia (ZM) - Zambia Revenue Authority
UPDATE regulations SET
    source_url = 'https://www.zra.org.zm/'
WHERE country_code = 'ZM';

-- Burundi (BI) - Revenue Authority
UPDATE regulations SET
    source_url = 'https://www.obr.bi/'
WHERE country_code = 'BI';

-- Afghanistan (AF) - Ministry of Finance
UPDATE regulations SET
    source_url = 'https://mof.gov.af/en'
WHERE country_code = 'AF';

-- Iraq (IQ) - Ministry of Finance
UPDATE regulations SET
    source_url = 'https://mof.gov.iq/en'
WHERE country_code = 'IQ';

-- Somalia (SO) - Ministry of Finance
UPDATE regulations SET
    source_url = 'https://mof.gov.so/'
WHERE country_code = 'SO';

-- Turkmenistan (TM) - State Tax Service
UPDATE regulations SET
    source_url = 'https://www.sts.gov.tm/'
WHERE country_code = 'TM';

-- OTHER COUNTRIES WITH BROKEN LINKS

-- Brunei (BN) - Ministry of Finance
UPDATE regulations SET
    source_url = 'https://www.mof.gov.bn/SitePages/Home.aspx'
WHERE country_code = 'BN';

-- New Caledonia (NC) - French Tax
UPDATE regulations SET
    source_url = 'https://www.impots.gouv.fr/international'
WHERE country_code = 'NC';

-- Tajikistan (TJ) - Tax Committee
UPDATE regulations SET
    source_url = 'https://www.andoz.tj/'
WHERE country_code = 'TJ';

-- Saudi Arabia (SA) - Zakat, Tax and Customs Authority
UPDATE regulations SET
    source_url = 'https://zatca.gov.sa/en/Pages/default.aspx'
WHERE country_code = 'SA';

-- Montenegro (ME) - Tax Administration
UPDATE regulations SET
    source_url = 'https://www.poreskauprava.gov.me/en'
WHERE country_code = 'ME';

-- Eswatini (SZ) - Revenue Authority
UPDATE regulations SET
    source_url = 'https://www.sra.org.sz/'
WHERE country_code = 'SZ';

-- Laos (LA) - Ministry of Finance
UPDATE regulations SET
    source_url = 'https://www.mof.gov.la/'
WHERE country_code = 'LA';

-- Nepal (NP) - Inland Revenue Department
UPDATE regulations SET
    source_url = 'https://ird.gov.np/'
WHERE country_code = 'NP';

-- Ukraine (UA) - State Tax Service
UPDATE regulations SET
    source_url = 'https://tax.gov.ua/en/'
WHERE country_code = 'UA';

-- Niger (NE) - Ministry of Finance
UPDATE regulations SET
    source_url = 'https://www.finances.gouv.ne/'
WHERE country_code = 'NE';

-- Cambodia (KH) - General Department of Taxation
UPDATE regulations SET
    source_url = 'https://www.tax.gov.kh/'
WHERE country_code = 'KH';

-- Antigua and Barbuda (AG) - Inland Revenue
UPDATE regulations SET
    source_url = 'https://ird.gov.ag/'
WHERE country_code = 'AG';

-- North Macedonia (MK) - Public Revenue Office
UPDATE regulations SET
    source_url = 'https://ujp.gov.mk/en/home'
WHERE country_code = 'MK';

-- Sri Lanka (LK) - Inland Revenue Department
UPDATE regulations SET
    source_url = 'https://www.ird.gov.lk/'
WHERE country_code = 'LK';

-- Mozambique (MZ) - Tax Authority
UPDATE regulations SET
    source_url = 'https://www.at.gov.mz/'
WHERE country_code = 'MZ';

-- Lesotho (LS) - Revenue Service
UPDATE regulations SET
    source_url = 'https://www.lra.org.ls/'
WHERE country_code = 'LS';

-- Zimbabwe (ZW) - Revenue Authority
UPDATE regulations SET
    source_url = 'https://www.zimra.co.zw/'
WHERE country_code = 'ZW';

-- Suriname (SR) - Tax office
UPDATE regulations SET
    source_url = 'https://www.belastingdienst.sr/'
WHERE country_code = 'SR';

-- Benin (BJ) - Tax authority
UPDATE regulations SET
    source_url = 'https://impots.finances.bj/'
WHERE country_code = 'BJ';

-- Bosnia and Herzegovina (BA) - Tax Administration
UPDATE regulations SET
    source_url = 'https://www.pufbih.ba/v1/'
WHERE country_code = 'BA';

-- Grenada (GD) - Inland Revenue
UPDATE regulations SET
    source_url = 'https://www.ird.gd/'
WHERE country_code = 'GD';

-- Cote d'Ivoire (CI) - Tax authority
UPDATE regulations SET
    source_url = 'https://www.dgi.gouv.ci/'
WHERE country_code = 'CI';

-- Cabo Verde (CV) - Tax authority
UPDATE regulations SET
    source_url = 'https://www.dnre.gov.cv/'
WHERE country_code = 'CV';

-- Sudan (SD) - Ministry of Finance
UPDATE regulations SET
    source_url = 'https://www.mof.gov.sd/'
WHERE country_code = 'SD';

-- CONNECTION ERRORS - Use alternative reliable sources

-- Panama (PA) - Use PWC instead
UPDATE regulations SET
    source_url = 'https://taxsummaries.pwc.com/panama'
WHERE country_code = 'PA';

-- Colombia (CO) - DIAN alternative
UPDATE regulations SET
    source_url = 'https://taxsummaries.pwc.com/colombia'
WHERE country_code = 'CO';

-- Russia (RU) - Use PWC
UPDATE regulations SET
    source_url = 'https://taxsummaries.pwc.com/russia'
WHERE country_code = 'RU';

-- New Zealand (NZ) - IRD
UPDATE regulations SET
    source_url = 'https://www.ird.govt.nz/cryptoassets'
WHERE country_code = 'NZ';

-- Belarus (BY) - Ministry of Taxes
UPDATE regulations SET
    source_url = 'https://www.nalog.gov.by/en/'
WHERE country_code = 'BY';

-- SSL ERRORS - Use alternative

-- Qatar (QA) - Use PWC
UPDATE regulations SET
    source_url = 'https://taxsummaries.pwc.com/qatar'
WHERE country_code = 'QA';

-- Egypt (EG) - Use PWC
UPDATE regulations SET
    source_url = 'https://taxsummaries.pwc.com/egypt'
WHERE country_code = 'EG';

COMMIT;

-- Verification
SELECT
    COUNT(*) as total_updated,
    COUNT(CASE WHEN source_url LIKE 'https://www.gov%' OR source_url LIKE 'https://%.gov%' THEN 1 END) as government_urls,
    COUNT(CASE WHEN source_url LIKE '%pwc.com%' THEN 1 END) as pwc_urls
FROM regulations
WHERE country_code IN (
    'FR', 'AT', 'FI', 'PL', 'BE', 'LT', 'LV', 'IN', 'IL', 'MX', 'RO', 'HR', 'GR', 'IS', 'CY', 'BG',
    'MT', 'LU', 'KY', 'BM', 'LI', 'IM', 'JE', 'GI', 'EE', 'PK', 'JO', 'XK', 'KG', 'DO', 'BO', 'VE',
    'TN', 'ZM', 'BI', 'AF', 'IQ', 'SO', 'TM', 'BN', 'NC', 'TJ', 'SA', 'ME', 'SZ', 'LA', 'NP', 'UA',
    'NE', 'KH', 'AG', 'MK', 'LK', 'MZ', 'LS', 'ZW', 'SR', 'BJ', 'BA', 'GD', 'CI', 'CV', 'SD',
    'PA', 'CO', 'RU', 'NZ', 'BY', 'QA', 'EG'
);
