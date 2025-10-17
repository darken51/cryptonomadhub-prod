-- Migration: Add AI country analysis with crypto and nomad scores
-- Date: 2025-10-17
-- Description: Store AI-generated country analyses with detailed scoring breakdowns
--              for crypto ecosystem (not just trading) and digital nomad lifestyle

BEGIN;

-- Create country_analyses table
CREATE TABLE IF NOT EXISTS country_analyses (
    id SERIAL PRIMARY KEY,
    country_code VARCHAR(2) NOT NULL REFERENCES regulations(country_code) ON DELETE CASCADE,

    -- Overall Scores (0-100)
    crypto_score INT NOT NULL CHECK (crypto_score >= 0 AND crypto_score <= 100),
    nomad_score INT NOT NULL CHECK (nomad_score >= 0 AND nomad_score <= 100),
    overall_score INT GENERATED ALWAYS AS ((crypto_score + nomad_score) / 2) STORED,

    -- Detailed Analyses (AI-generated text)
    crypto_analysis TEXT NOT NULL,  -- 200-300 words explaining crypto ecosystem
    nomad_analysis TEXT NOT NULL,   -- 200-300 words explaining nomad lifestyle appeal

    -- Key Points (arrays)
    key_advantages TEXT[],          -- ['0% CGT long-term', 'Digital nomad visa available']
    key_disadvantages TEXT[],       -- ['High cost of living', 'Complex tax residency rules']
    best_for TEXT[],                -- ['Long-term crypto holders', 'High-net-worth individuals', 'DeFi enthusiasts']

    -- Score Breakdowns (JSONB for flexibility)
    crypto_score_breakdown JSONB NOT NULL DEFAULT '{
        "tax_favorability": 0,
        "legal_clarity": 0,
        "crypto_adoption": 0,
        "innovation_ecosystem": 0
    }'::jsonb,
    nomad_score_breakdown JSONB NOT NULL DEFAULT '{
        "cost_of_living": 0,
        "visa_accessibility": 0,
        "infrastructure": 0,
        "expat_community": 0
    }'::jsonb,

    -- Generation Metadata
    generated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL DEFAULT NOW() + INTERVAL '30 days',
    model_used VARCHAR(50) NOT NULL DEFAULT 'claude-3-5-sonnet-20241022',
    generation_duration_ms INT,
    confidence DECIMAL(3,2) NOT NULL DEFAULT 0.80 CHECK (confidence >= 0 AND confidence <= 1),

    -- Audit Trail
    last_refreshed_by INT REFERENCES users(id),
    auto_generated BOOLEAN NOT NULL DEFAULT true,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT country_analyses_country_unique UNIQUE (country_code)
);

-- Indexes for performance
CREATE INDEX idx_country_analyses_country ON country_analyses(country_code);
CREATE INDEX idx_country_analyses_scores ON country_analyses(crypto_score DESC, nomad_score DESC, overall_score DESC);
CREATE INDEX idx_country_analyses_expires ON country_analyses(expires_at);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_country_analyses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_country_analyses_updated_at
    BEFORE UPDATE ON country_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_country_analyses_updated_at();

-- Comments for documentation
COMMENT ON TABLE country_analyses IS 'AI-generated country analyses with crypto ecosystem and digital nomad scores';
COMMENT ON COLUMN country_analyses.crypto_score IS 'Overall crypto-friendliness (0-100): taxes, legal, adoption, innovation';
COMMENT ON COLUMN country_analyses.nomad_score IS 'Digital nomad appeal (0-100): cost, visa, infrastructure, community';
COMMENT ON COLUMN country_analyses.crypto_analysis IS 'AI-generated analysis of crypto ecosystem (200-300 words)';
COMMENT ON COLUMN country_analyses.nomad_analysis IS 'AI-generated analysis of nomad lifestyle (200-300 words)';
COMMENT ON COLUMN country_analyses.expires_at IS 'Analysis auto-refreshes after this date (default 30 days)';
COMMENT ON COLUMN country_analyses.confidence IS 'AI confidence score (0-1) based on data quality and freshness';

COMMIT;

-- Verification query
SELECT
    COUNT(*) as table_created,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'country_analyses') as table_exists
FROM information_schema.tables
WHERE table_name = 'country_analyses';
