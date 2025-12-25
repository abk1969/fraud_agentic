-- FraudShield AI - Database Schema
-- PostgreSQL/AlloyDB with pgvector extension

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Beneficiaires (clients/assures)
CREATE TABLE IF NOT EXISTS beneficiaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    beneficiary_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE,
    nir VARCHAR(15), -- Numero INSEE
    email VARCHAR(255),
    phone VARCHAR(20),
    address JSONB,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active', -- active, suspended, terminated
    risk_score DECIMAL(5,4) DEFAULT 0,
    risk_level VARCHAR(20) DEFAULT 'low', -- low, medium, high, critical
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_beneficiaries_id ON beneficiaries(beneficiary_id);
CREATE INDEX idx_beneficiaries_risk ON beneficiaries(risk_score DESC);
CREATE INDEX idx_beneficiaries_status ON beneficiaries(status);

-- Prestataires (fournisseurs de services)
CREATE TABLE IF NOT EXISTS providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- hospital, clinic, pharmacy, laboratory, etc.
    siret VARCHAR(14),
    address JSONB,
    contact JSONB,
    specialty VARCHAR(100),
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active',
    risk_score DECIMAL(5,4) DEFAULT 0,
    risk_level VARCHAR(20) DEFAULT 'low',
    total_transactions INTEGER DEFAULT 0,
    flagged_transactions INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_providers_id ON providers(provider_id);
CREATE INDEX idx_providers_risk ON providers(risk_score DESC);
CREATE INDEX idx_providers_type ON providers(type);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    beneficiary_id UUID REFERENCES beneficiaries(id),
    provider_id UUID REFERENCES providers(id),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    transaction_type VARCHAR(50) NOT NULL, -- remboursement_sante, allocation, indemnite, etc.
    description TEXT,
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processing_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(30) DEFAULT 'pending', -- pending, approved, rejected, review, investigating
    risk_score DECIMAL(5,4),
    risk_level VARCHAR(20), -- low, medium, high, critical
    decision VARCHAR(20), -- pass, flag, block
    decision_reason TEXT,
    confidence DECIMAL(5,4),
    processing_time_ms INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_id ON transactions(transaction_id);
CREATE INDEX idx_transactions_beneficiary ON transactions(beneficiary_id);
CREATE INDEX idx_transactions_provider ON transactions(provider_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_risk ON transactions(risk_score DESC);
CREATE INDEX idx_transactions_date ON transactions(submission_date DESC);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);

-- Documents associes aux transactions
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id VARCHAR(50) UNIQUE NOT NULL,
    transaction_id UUID REFERENCES transactions(id),
    document_type VARCHAR(50) NOT NULL, -- facture, ordonnance, certificat, rib, etc.
    file_uri VARCHAR(500),
    file_name VARCHAR(255),
    mime_type VARCHAR(100),
    file_size INTEGER,
    authenticity_score DECIMAL(5,4),
    is_authentic BOOLEAN,
    tampering_detected BOOLEAN DEFAULT FALSE,
    extracted_data JSONB DEFAULT '{}',
    analysis_result JSONB DEFAULT '{}',
    issues TEXT[],
    analyzed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_documents_transaction ON documents(transaction_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_authentic ON documents(is_authentic);

-- ============================================================================
-- FRAUD DETECTION TABLES
-- ============================================================================

-- Alertes de fraude
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL, -- info, warning, high, critical
    status VARCHAR(30) DEFAULT 'new', -- new, acknowledged, investigating, resolved, dismissed
    type VARCHAR(50) NOT NULL, -- anomaly, threshold, pattern, ml_detection, rule_based
    source VARCHAR(50), -- agent name or system
    entity_type VARCHAR(30), -- transaction, beneficiary, provider, document, network
    entity_id UUID,
    risk_score DECIMAL(5,4),
    related_transactions UUID[],
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by VARCHAR(100),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR(100),
    resolution_notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_alerts_id ON alerts(alert_id);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_entity ON alerts(entity_type, entity_id);
CREATE INDEX idx_alerts_created ON alerts(created_at DESC);

-- Actions sur les alertes
CREATE TABLE IF NOT EXISTS alert_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE,
    action_type VARCHAR(30) NOT NULL, -- acknowledge, investigate, escalate, resolve, dismiss, comment
    description TEXT,
    performed_by VARCHAR(100) NOT NULL,
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_alert_actions_alert ON alert_actions(alert_id);

-- Investigations
CREATE TABLE IF NOT EXISTS investigations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investigation_id VARCHAR(50) UNIQUE NOT NULL,
    transaction_id UUID REFERENCES transactions(id),
    alert_id UUID REFERENCES alerts(id),
    status VARCHAR(30) DEFAULT 'open', -- open, in_progress, pending_info, closed_fraud, closed_legitimate
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    assigned_to VARCHAR(100),
    reason TEXT,
    findings JSONB DEFAULT '[]',
    conclusion TEXT,
    fraud_confirmed BOOLEAN,
    amount_at_risk DECIMAL(15,2),
    amount_recovered DECIMAL(15,2),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_investigations_id ON investigations(investigation_id);
CREATE INDEX idx_investigations_status ON investigations(status);
CREATE INDEX idx_investigations_transaction ON investigations(transaction_id);
CREATE INDEX idx_investigations_priority ON investigations(priority);

-- Timeline des investigations
CREATE TABLE IF NOT EXISTS investigation_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investigation_id UUID REFERENCES investigations(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    agent VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_investigation_events_inv ON investigation_events(investigation_id);

-- Patterns de fraude connus
CREATE TABLE IF NOT EXISTS fraud_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pattern_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- surfacturation, prestations_fictives, usurpation_identite, etc.
    severity VARCHAR(20) DEFAULT 'high',
    detection_rules JSONB NOT NULL,
    indicators TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    detection_count INTEGER DEFAULT 0,
    last_detected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_fraud_patterns_category ON fraud_patterns(category);
CREATE INDEX idx_fraud_patterns_active ON fraud_patterns(is_active);

-- Resultats de detection de patterns
CREATE TABLE IF NOT EXISTS pattern_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pattern_id UUID REFERENCES fraud_patterns(id),
    transaction_id UUID REFERENCES transactions(id),
    match_score DECIMAL(5,4) NOT NULL,
    matched_indicators TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pattern_matches_pattern ON pattern_matches(pattern_id);
CREATE INDEX idx_pattern_matches_transaction ON pattern_matches(transaction_id);
CREATE INDEX idx_pattern_matches_score ON pattern_matches(match_score DESC);

-- ============================================================================
-- ML/RL TABLES
-- ============================================================================

-- Embeddings vectoriels (pgvector)
CREATE TABLE IF NOT EXISTS transaction_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    embedding vector(768), -- Gemini embedding dimension
    embedding_model VARCHAR(50) DEFAULT 'text-embedding-004',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_embeddings_transaction ON transaction_embeddings(transaction_id);
-- Vector similarity index (IVFFlat for large datasets)
CREATE INDEX idx_embeddings_vector ON transaction_embeddings USING ivfflat (embedding vector_cosine_ops);

-- Experience buffer pour RL (Prioritized Experience Replay)
CREATE TABLE IF NOT EXISTS rl_experience_buffer (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id),
    state vector(778), -- 768 embedding + 10 structured features
    action INTEGER NOT NULL, -- 0: PASS, 1: FLAG
    reward DECIMAL(10,2) NOT NULL,
    next_state vector(778),
    done BOOLEAN DEFAULT FALSE,
    priority DECIMAL(10,4) DEFAULT 1.0,
    sampled_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rl_buffer_priority ON rl_experience_buffer(priority DESC);
CREATE INDEX idx_rl_buffer_created ON rl_experience_buffer(created_at DESC);

-- Historique d'entrainement du modele
CREATE TABLE IF NOT EXISTS model_training_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_version VARCHAR(20) NOT NULL,
    training_started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    training_completed_at TIMESTAMP WITH TIME ZONE,
    epochs_completed INTEGER,
    final_loss DECIMAL(10,6),
    metrics JSONB, -- precision, recall, f1, auc_roc, etc.
    hyperparameters JSONB,
    experience_samples_used INTEGER,
    status VARCHAR(20) DEFAULT 'in_progress', -- in_progress, completed, failed
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_training_history_version ON model_training_history(model_version);
CREATE INDEX idx_training_history_status ON model_training_history(status);

-- Predictions et feedback
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id),
    model_version VARCHAR(20),
    prediction VARCHAR(20) NOT NULL, -- pass, flag, block
    fraud_probability DECIMAL(5,4) NOT NULL,
    confidence DECIMAL(5,4),
    expected_reward_pass DECIMAL(10,2),
    expected_reward_flag DECIMAL(10,2),
    features_used JSONB,
    explanation TEXT,
    actual_outcome VARCHAR(20), -- fraud, legitimate, unknown
    feedback_received_at TIMESTAMP WITH TIME ZONE,
    reward_received DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_predictions_transaction ON predictions(transaction_id);
CREATE INDEX idx_predictions_model ON predictions(model_version);
CREATE INDEX idx_predictions_outcome ON predictions(actual_outcome);

-- ============================================================================
-- ANALYTICS & REPORTING TABLES
-- ============================================================================

-- Statistiques journalieres agregees
CREATE TABLE IF NOT EXISTS daily_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE UNIQUE NOT NULL,
    total_transactions INTEGER DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    flagged_transactions INTEGER DEFAULT 0,
    flagged_amount DECIMAL(15,2) DEFAULT 0,
    confirmed_fraud INTEGER DEFAULT 0,
    confirmed_fraud_amount DECIMAL(15,2) DEFAULT 0,
    false_positives INTEGER DEFAULT 0,
    pending_review INTEGER DEFAULT 0,
    true_positives INTEGER DEFAULT 0,
    true_negatives INTEGER DEFAULT 0,
    false_negatives INTEGER DEFAULT 0,
    precision_score DECIMAL(5,4),
    recall_score DECIMAL(5,4),
    f1_score DECIMAL(5,4),
    average_processing_time_ms INTEGER,
    fraud_by_type JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_daily_stats_date ON daily_statistics(date DESC);

-- Distribution des types de fraude
CREATE TABLE IF NOT EXISTS fraud_type_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    fraud_type VARCHAR(50) NOT NULL,
    count INTEGER DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    average_amount DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date, fraud_type)
);

CREATE INDEX idx_fraud_type_stats_date ON fraud_type_statistics(date DESC);
CREATE INDEX idx_fraud_type_stats_type ON fraud_type_statistics(fraud_type);

-- Rapports generes
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id VARCHAR(50) UNIQUE NOT NULL,
    report_type VARCHAR(30) NOT NULL, -- summary, detailed, compliance
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    format VARCHAR(10) NOT NULL, -- pdf, csv, xlsx
    status VARCHAR(20) DEFAULT 'pending', -- pending, generating, ready, failed
    file_uri VARCHAR(500),
    file_size INTEGER,
    generated_by VARCHAR(100),
    generated_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reports_id ON reports(report_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_type ON reports(report_type);

-- ============================================================================
-- NETWORK ANALYSIS TABLES
-- ============================================================================

-- Noeuds du graphe (entites)
CREATE TABLE IF NOT EXISTS network_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(30) NOT NULL, -- beneficiary, provider, transaction, address, phone, rib
    entity_id UUID NOT NULL,
    label VARCHAR(255),
    risk_score DECIMAL(5,4) DEFAULT 0,
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(entity_type, entity_id)
);

CREATE INDEX idx_network_nodes_entity ON network_nodes(entity_type, entity_id);
CREATE INDEX idx_network_nodes_risk ON network_nodes(risk_score DESC);

-- Aretes du graphe (relations)
CREATE TABLE IF NOT EXISTS network_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_node_id UUID REFERENCES network_nodes(id) ON DELETE CASCADE,
    target_node_id UUID REFERENCES network_nodes(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL, -- transaction, same_address, same_phone, same_rib, referral
    weight DECIMAL(5,4) DEFAULT 1.0,
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(source_node_id, target_node_id, relationship_type)
);

CREATE INDEX idx_network_edges_source ON network_edges(source_node_id);
CREATE INDEX idx_network_edges_target ON network_edges(target_node_id);
CREATE INDEX idx_network_edges_type ON network_edges(relationship_type);

-- Fraud rings detectes
CREATE TABLE IF NOT EXISTS fraud_rings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ring_id VARCHAR(50) UNIQUE NOT NULL,
    member_nodes UUID[],
    total_amount DECIMAL(15,2),
    confidence DECIMAL(5,4),
    detection_method VARCHAR(50),
    status VARCHAR(20) DEFAULT 'detected', -- detected, investigating, confirmed, dismissed
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_fraud_rings_status ON fraud_rings(status);
CREATE INDEX idx_fraud_rings_confidence ON fraud_rings(confidence DESC);

-- ============================================================================
-- AUDIT & COMPLIANCE TABLES
-- ============================================================================

-- Audit trail complet
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(30),
    entity_id UUID,
    action VARCHAR(100) NOT NULL,
    actor VARCHAR(100), -- user or system/agent
    actor_type VARCHAR(20), -- user, agent, system
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_actor ON audit_log(actor);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp DESC);
CREATE INDEX idx_audit_log_event ON audit_log(event_type);

-- ============================================================================
-- VIEWS FOR ANALYTICS
-- ============================================================================

-- Vue des metriques de performance
CREATE OR REPLACE VIEW v_model_performance AS
SELECT
    date,
    total_transactions,
    flagged_transactions,
    confirmed_fraud,
    false_positives,
    CASE WHEN flagged_transactions > 0
        THEN confirmed_fraud::DECIMAL / flagged_transactions
        ELSE 0 END AS precision,
    CASE WHEN (confirmed_fraud + false_negatives) > 0
        THEN confirmed_fraud::DECIMAL / (confirmed_fraud + false_negatives)
        ELSE 0 END AS recall,
    f1_score,
    confirmed_fraud_amount AS amount_saved
FROM daily_statistics
ORDER BY date DESC;

-- Vue du classement des prestataires a risque
CREATE OR REPLACE VIEW v_provider_risk_ranking AS
SELECT
    p.provider_id,
    p.name AS provider_name,
    p.risk_score,
    p.total_transactions,
    p.flagged_transactions,
    SUM(t.amount) AS total_amount,
    CASE WHEN p.total_transactions > 0
        THEN p.flagged_transactions::DECIMAL / p.total_transactions * 100
        ELSE 0 END AS fraud_rate
FROM providers p
LEFT JOIN transactions t ON t.provider_id = p.id
GROUP BY p.id
ORDER BY p.risk_score DESC;

-- Vue du classement des beneficiaires a risque
CREATE OR REPLACE VIEW v_beneficiary_risk_ranking AS
SELECT
    b.beneficiary_id,
    CONCAT(b.first_name, ' ', b.last_name) AS beneficiary_name,
    b.risk_score,
    COUNT(t.id) AS total_transactions,
    COUNT(CASE WHEN t.status IN ('review', 'rejected', 'investigating') THEN 1 END) AS flagged_transactions,
    SUM(t.amount) AS total_amount,
    CASE WHEN COUNT(t.id) > 0
        THEN COUNT(CASE WHEN t.status IN ('review', 'rejected', 'investigating') THEN 1 END)::DECIMAL / COUNT(t.id) * 100
        ELSE 0 END AS fraud_rate
FROM beneficiaries b
LEFT JOIN transactions t ON t.beneficiary_id = b.id
GROUP BY b.id
ORDER BY b.risk_score DESC;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Fonction pour mettre a jour le risk score d'un prestataire
CREATE OR REPLACE FUNCTION update_provider_risk_score()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE providers SET
        total_transactions = total_transactions + 1,
        flagged_transactions = CASE
            WHEN NEW.status IN ('review', 'rejected', 'investigating')
            THEN flagged_transactions + 1
            ELSE flagged_transactions END,
        risk_score = (
            SELECT COALESCE(
                AVG(CASE WHEN status IN ('review', 'rejected', 'investigating') THEN 1.0 ELSE 0.0 END),
                0
            )
            FROM transactions WHERE provider_id = NEW.provider_id
        ),
        updated_at = NOW()
    WHERE id = NEW.provider_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre a jour les stats prestataire
CREATE TRIGGER tr_update_provider_risk
AFTER INSERT OR UPDATE OF status ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_provider_risk_score();

-- Fonction pour agreger les statistiques journalieres
CREATE OR REPLACE FUNCTION aggregate_daily_statistics(target_date DATE)
RETURNS VOID AS $$
BEGIN
    INSERT INTO daily_statistics (
        date,
        total_transactions,
        total_amount,
        flagged_transactions,
        flagged_amount,
        confirmed_fraud,
        pending_review
    )
    SELECT
        target_date,
        COUNT(*),
        COALESCE(SUM(amount), 0),
        COUNT(CASE WHEN status IN ('review', 'rejected', 'investigating') THEN 1 END),
        COALESCE(SUM(CASE WHEN status IN ('review', 'rejected', 'investigating') THEN amount ELSE 0 END), 0),
        COUNT(CASE WHEN status = 'rejected' THEN 1 END),
        COUNT(CASE WHEN status = 'review' THEN 1 END)
    FROM transactions
    WHERE DATE(submission_date) = target_date
    ON CONFLICT (date) DO UPDATE SET
        total_transactions = EXCLUDED.total_transactions,
        total_amount = EXCLUDED.total_amount,
        flagged_transactions = EXCLUDED.flagged_transactions,
        flagged_amount = EXCLUDED.flagged_amount,
        confirmed_fraud = EXCLUDED.confirmed_fraud,
        pending_review = EXCLUDED.pending_review;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SAMPLE DATA FOR DEVELOPMENT
-- ============================================================================

-- Insert sample fraud patterns
INSERT INTO fraud_patterns (pattern_id, name, description, category, severity, detection_rules, indicators) VALUES
('PATTERN-001', 'Cascade de remboursements', 'Multiple remboursements consecutifs du meme beneficiaire', 'surfacturation', 'high', '{"min_transactions": 5, "time_window_days": 30, "min_total_amount": 5000}', ARRAY['frequency_anomaly', 'amount_spike']),
('PATTERN-002', 'Nouveau prestataire a risque', 'Prestataire recent avec volume anormalement eleve', 'prestations_fictives', 'critical', '{"max_provider_age_days": 90, "min_transactions": 20, "min_flagged_rate": 0.15}', ARRAY['new_provider', 'high_volume', 'high_flag_rate']),
('PATTERN-003', 'Usurpation multi-adresses', 'Meme beneficiaire avec plusieurs adresses differentes', 'usurpation_identite', 'high', '{"min_addresses": 3, "time_window_days": 180}', ARRAY['multiple_addresses', 'identity_anomaly']),
('PATTERN-004', 'Document modifie', 'Detection de modifications sur les documents', 'falsification_documents', 'critical', '{"min_tampering_score": 0.7}', ARRAY['document_tampering', 'metadata_inconsistency']),
('PATTERN-005', 'Reseau de collusion', 'Groupe d''entites avec relations anormales', 'collusion', 'critical', '{"min_ring_size": 3, "min_shared_attributes": 2}', ARRAY['network_cluster', 'shared_rib', 'shared_address'])
ON CONFLICT (pattern_id) DO NOTHING;

COMMENT ON TABLE transactions IS 'Table principale des transactions analysees par FraudShield AI';
COMMENT ON TABLE alerts IS 'Alertes de fraude generees par le systeme';
COMMENT ON TABLE predictions IS 'Predictions du modele LLM+RL avec feedback';
COMMENT ON TABLE rl_experience_buffer IS 'Buffer d''experience pour l''entrainement du modele RL (Prioritized Experience Replay)';
