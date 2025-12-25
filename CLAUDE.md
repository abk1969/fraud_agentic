# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**FraudShield AI Platform** - Full stack agentic AI application for fraud detection in French social protection groups (retraite complémentaire, prévoyance, santé). Implements a hybrid LLM + Reinforcement Learning fraud detection system using Google ADK, A2A/A2UI protocols, and MCP servers.

## Commands

```bash
# Install all dependencies
make install

# Start development (backend + frontend)
make dev

# Start backend only (FastAPI with hot-reload on port 8000)
make dev-backend

# Start frontend only (Next.js on port 3000)
make dev-frontend

# Run all tests
make test

# Run backend tests only
make test-backend

# Run single test file
pytest tests/path/to/test.py -v

# Linting
make lint

# Format code
make format

# Docker
make docker-build
make docker-up
make docker-down
```

## Architecture

### Three-Tier Structure

```
fraudLLM/
├── fraudshield/     # Core AI/ML package (agents, RL, MCP)
├── backend/         # FastAPI REST API
└── frontend/        # Next.js 14 web UI
```

### Agent Orchestration Flow

The `FraudOrchestratorAgent` (`fraudshield/agents/orchestrator.py`) coordinates 6 specialized sub-agents using the ADK hierarchical pattern:

1. **DocumentAnalystAgent** - OCR, tampering detection, document classification
2. **TransactionAnalystAgent** - LLM+RL scoring, anomaly detection
3. **IdentityVerifierAgent** - RNIPP validation, sanctions checks
4. **PatternDetectorAgent** - Known fraud pattern matching
5. **NetworkAnalyzerAgent** - Graph-based fraud ring detection
6. **ExplanationGeneratorAgent** - XAI explanations in French

---

## Logique Métier End-to-End

### Flux de Traitement d'une Transaction

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   INTAKE    │───▶│   ANALYZE   │───▶│   DECIDE    │───▶│   EXPLAIN   │
│             │    │  (parallel) │    │             │    │             │
│ Validation  │    │ 5 agents    │    │ Aggregation │    │ XAI + Audit │
│ Enrichment  │    │ simultanés  │    │ RL Policy   │    │ French      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Phase 1: INTAKE (`_intake_phase`)
- Validation du schéma de la transaction
- Enrichissement via APIs externes (RNIPP, INSEE)
- Extraction de l'historique du bénéficiaire

### Phase 2: ANALYZE (`_analyze_phase`)
Exécution **parallèle** des agents spécialisés:
- `DocumentAnalystAgent.analyze()` → score d'authenticité
- `TransactionAnalystAgent.analyze()` → scoring LLM+RL
- `PatternDetectorAgent.detect()` → patterns connus
- `IdentityVerifierAgent.verify()` → validation identité
- `NetworkAnalyzerAgent.analyze()` → analyse graphe

### Phase 3: DECIDE (`_decide_phase`)
Agrégation pondérée des scores (`orchestrator.py:318-324`):
```python
weights = {
    "transaction": 0.30,  # Score LLM+RL
    "document": 0.20,     # Authenticité documents
    "pattern": 0.25,      # Patterns de fraude
    "identity": 0.15,     # Vérification identité
    "network": 0.10,      # Analyse réseau
}
```

### Phase 4: EXPLAIN (`_explain_phase`)
- Génération d'explication en français (RGPD Art. 22)
- Construction de l'audit trail complet
- Recommandations d'actions

---

## Architecture LLM + RL (Hybrid)

### Pourquoi Hybride ?

Le problème de la détection de fraude nécessite:
1. **Compréhension sémantique** → LLM (contexte, relations)
2. **Optimisation coût métier** → RL (récompenses asymétriques)
3. **Adaptation continue** → RL (feedback loop)

### Pipeline LLM+RL Détaillé

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PIPELINE LLM+RL                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. SÉRIALISATION SÉMANTIQUE (fraud_tools.py:42-90)                    │
│     ┌─────────────────────────────────────────────────────────────┐    │
│     │ Transaction JSON:                                            │    │
│     │ {"amount": 1500, "type": "REMBOURSEMENT", ...}              │    │
│     │                        ↓                                     │    │
│     │ Template (config/models.py:98-108):                         │    │
│     │ "Demande de REMBOURSEMENT soumise le 2025-12-15 à 14:30.    │    │
│     │  Bénéficiaire: Jean Dupont (ID: BEN-123), inscrit depuis    │    │
│     │  24 mois. Montant demandé: 1500€..."                        │    │
│     └─────────────────────────────────────────────────────────────┘    │
│                        ↓                                                │
│  2. EMBEDDING LLM (fraud_tools.py:93-118)                              │
│     ┌─────────────────────────────────────────────────────────────┐    │
│     │ Gemini text-embedding-004                                    │    │
│     │ Texte sérialisé → Vector[768 dimensions]                    │    │
│     │                                                              │    │
│     │ L'embedding capture le SENS contextuel:                      │    │
│     │ - "1500€ pour un nouveau bénéficiaire" vs                   │    │
│     │ - "1500€ pour un bénéficiaire de 10 ans"                    │    │
│     │ → Embeddings différents malgré même montant                 │    │
│     └─────────────────────────────────────────────────────────────┘    │
│                        ↓                                                │
│  3. FUSION DE FEATURES (policy.py:281-292)                             │
│     ┌─────────────────────────────────────────────────────────────┐    │
│     │ state = concat(                                              │    │
│     │     llm_embedding,           # 768 dims (sémantique)        │    │
│     │     structured_features      # 10 dims (numériques)         │    │
│     │ )                            # Total: 778 dims              │    │
│     │                                                              │    │
│     │ Structured features:                                         │    │
│     │ - amount_normalized, frequency_score, provider_risk         │    │
│     │ - tenure_score, document_score, identity_score              │    │
│     │ - network_score, pattern_score, time_score, historical      │    │
│     └─────────────────────────────────────────────────────────────┘    │
│                        ↓                                                │
│  4. POLICY NETWORK A2C (policy.py:26-156)                              │
│     ┌─────────────────────────────────────────────────────────────┐    │
│     │ Architecture:                                                │    │
│     │   Input(778) → Dense(256) → ReLU → Dropout(0.2)             │    │
│     │             → Dense(128) → ReLU → Dropout(0.2)              │    │
│     │             → Dense(2) → Softmax                             │    │
│     │                                                              │    │
│     │ Output: π(action|state) = {PASS: 0.2, FLAG: 0.8}           │    │
│     └─────────────────────────────────────────────────────────────┘    │
│                        ↓                                                │
│  5. DÉCISION COST-SENSITIVE (rewards.py:137-151)                       │
│     ┌─────────────────────────────────────────────────────────────┐    │
│     │ Seuil de décision: 0.3 (bas pour maximiser recall)          │    │
│     │                                                              │    │
│     │ if fraud_probability >= 0.3: action = FLAG                  │    │
│     │ else: action = PASS                                          │    │
│     │                                                              │    │
│     │ Routing selon risque:                                        │    │
│     │ - CRITICAL (≥0.7): block_immediate, SLA 2h                  │    │
│     │ - HIGH (≥0.4): flag_review, SLA 24h                         │    │
│     │ - MEDIUM (≥0.2): manual_review, SLA 72h                     │    │
│     │ - LOW (<0.2): auto_approve                                   │    │
│     └─────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Fonction de Récompense Cost-Sensitive

Définie dans `rewards.py:29-88`:

```
              │ Réalité: FRAUDE  │ Réalité: LÉGITIME │
──────────────┼──────────────────┼───────────────────┤
Action: FLAG  │ TP = +10         │ FP = -5           │
              │ (fraude captée)  │ (fausse alerte)   │
──────────────┼──────────────────┼───────────────────┤
Action: PASS  │ FN = -50         │ TN = +1           │
              │ (fraude manquée!)│ (correct)         │
──────────────┴──────────────────┴───────────────────┘

Ratio de coût FN/FP = 50/5 = 10x
→ Manquer une fraude coûte 10x plus qu'une fausse alerte
→ Le modèle apprend à prioriser le RECALL
```

### Calcul de la Récompense Attendue

Implémenté dans `transaction_analyst.py:188-213`:

```python
# Si on FLAG avec probabilité fraude = 0.6:
E[reward|FLAG] = 0.6 * (+10) + 0.4 * (-5) = +4.0

# Si on PASS avec probabilité fraude = 0.6:
E[reward|PASS] = 0.6 * (-50) + 0.4 * (+1) = -29.6

# → FLAG est optimal dès que p(fraude) > 0.33
```

---

## Cas Concrets d'Utilisation

### Cas 1: Remboursement Santé Suspect

**Input Transaction:**
```json
{
  "transaction_id": "TX-2025-001",
  "type": "REMBOURSEMENT_SANTE",
  "amount": 2500.00,
  "beneficiary_id": "BEN-12345",
  "beneficiary_name": "Jean Dupont",
  "tenure_months": 2,
  "provider_id": "PRO-789",
  "provider_name": "Cabinet Médical XYZ",
  "provider_risk_score": 0.65,
  "claims_30d": 12,
  "description": "Soins dentaires multiples"
}
```

**Sérialisation (étape 1):**
```
"Demande de REMBOURSEMENT_SANTE soumise le 2025-12-15 à 14:30.
Bénéficiaire: Jean Dupont (ID: BEN-12345), inscrit depuis 2 mois.
Montant demandé: 2500€
Prestataire: Cabinet Médical XYZ (ID: PRO-789)
Score de risque prestataire: 0.65
Description: Soins dentaires multiples
Historique 30 jours: 12 demandes..."
```

**Anomalies Détectées:**
- `amount_spike`: 2500€ >> moyenne historique
- `high_frequency`: 12 demandes en 30 jours
- `risky_provider`: score prestataire 0.65 > 0.5
- `new_beneficiary_high_amount`: 2 mois + 2500€

**Patterns Matchés:**
- PATTERN_001 (Cascade de remboursements): match 80%
- PATTERN_002 (Nouveau prestataire à risque): match 70%

**Score Final:**
```
fraud_probability = 0.72
risk_level = CRITICAL
decision = BLOCK
```

**Output:**
```json
{
  "decision": "BLOCK",
  "fraud_probability": 0.72,
  "risk_level": "critical",
  "confidence": 0.88,
  "key_findings": [
    {"source": "transaction", "type": "amount_spike", "severity": "high"},
    {"source": "pattern", "type": "PATTERN_001", "severity": "high"},
    {"source": "transaction", "type": "risky_provider", "severity": "high"}
  ],
  "explanation": "Transaction bloquée. Indicateurs de fraude multiples:
    bénéficiaire récent (2 mois), fréquence de demandes anormale (12/30j),
    prestataire à risque élevé (0.65), montant significatif (2500€).",
  "recommended_actions": ["Vérification identité", "Audit prestataire"],
  "routing": {"queue": "fraud_investigation_urgent", "sla_hours": 2}
}
```

### Cas 2: Transaction Légitime

**Input Transaction:**
```json
{
  "transaction_id": "TX-2025-002",
  "type": "REMBOURSEMENT_OPTIQUE",
  "amount": 180.00,
  "beneficiary_id": "BEN-99999",
  "tenure_months": 60,
  "provider_risk_score": 0.08,
  "claims_30d": 1,
  "total_30d": 180.00
}
```

**Score Final:**
```
fraud_probability = 0.08
risk_level = LOW
decision = PASS (auto_approve)
```

---

## Entraînement RL (Continuous Learning)

### Feedback Loop (`rl/trainer.py`)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Prédiction  │───▶│ Décision    │───▶│ Feedback    │
│ p(fraud)=0.6│    │ Analyste    │    │ Réel: FRAUD │
│ Action: FLAG│    │             │    │             │
└─────────────┘    └─────────────┘    └──────┬──────┘
                                             │
                   ┌─────────────────────────┘
                   │
                   ▼
         ┌─────────────────┐
         │ Experience      │
         │ (s, a, r, s')   │
         │                 │
         │ reward = +10    │
         │ (True Positive) │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ Experience      │
         │ Buffer          │
         │ (prioritized)   │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ Train Step      │
         │ - Policy loss   │
         │ - Value loss    │
         │ - Entropy reg   │
         └─────────────────┘
```

### Prioritized Experience Replay

Les expériences avec grandes récompenses (|reward| élevé) sont échantillonnées plus souvent:
- FN (-50): forte priorité → apprendre à ne pas manquer
- TP (+10): priorité moyenne → renforcer les bonnes détections
- FP (-5): priorité faible
- TN (+1): priorité faible

---

## Workflow Types

Defined in `WorkflowType` enum (`orchestrator.py:34`):
- **QUICK** - Transaction scoring only, returns `requires_full_analysis` flag
- **STANDARD** - 4-phase: Intake → Analyze (parallel) → Decide → Explain
- **INVESTIGATION** - Standard + detailed investigation report
- **BATCH** - Bulk processing via `batch_analyze()`

## API Endpoints

Backend runs on `http://localhost:8000` with OpenAPI docs at `/docs`:

- `POST /api/v1/transactions/analyze` - Full transaction analysis
- `POST /api/v1/transactions/batch` - Batch processing
- `POST /api/v1/quick-check` - Fast pre-screening
- `POST /api/v1/documents/analyze` - Document analysis
- `POST /api/v1/investigations/start` - Start investigation
- `GET /api/v1/analytics/dashboard` - Dashboard stats
- `WS /ws/{client_id}` - Real-time updates

## Key Files

- `fraudshield/agents/orchestrator.py` - Main orchestrator, workflow logic
- `fraudshield/config/rewards.py` - Cost-sensitive reward matrix, thresholds
- `fraudshield/config/models.py` - Transaction template, fraud patterns
- `fraudshield/tools/fraud_tools.py` - Serialization, scoring, anomaly detection
- `fraudshield/rl/policy.py` - A2C policy network architecture
- `fraudshield/rl/trainer.py` - Training loop, experience replay
- `backend/main.py` - FastAPI app, lifespan, routers
- `backend/services/fraud_service.py` - Service layer for orchestrator

## Development Guidelines

- **Cost-Sensitive**: Prioritize recall (95%+), accept lower precision
- **XAI Required**: All decisions must be explainable (RGPD compliance)
- **French Language**: All user-facing explanations must be in French
- **ADK Patterns**: Use hierarchical agents with `sub_agents` list
- **MCP Tools**: Expose agent tools via MCP servers in `mcp_servers/`

## Environment Variables

Required in `.env` (copy from `.env.example`):
- `GOOGLE_API_KEY` - Gemini API key
- `DATABASE_URL` - PostgreSQL/AlloyDB connection
- `REDIS_URL` - Redis for caching (optional)
