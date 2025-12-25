# FraudShield AI

Système de détection de fraude intelligent basé sur une architecture LLM+RL hybride pour les organismes de protection sociale français.

## Architecture

- **Backend**: FastAPI avec architecture multi-agents (Google ADK)
- **Frontend**: Next.js 14 avec TailwindCSS
- **Agents IA**: 7 agents spécialisés coordonnés par un orchestrateur
- **ML/RL**: Apprentissage par renforcement avec récompenses asymétriques

## Agents Spécialisés

| Agent | Fonction |
|-------|----------|
| Orchestrateur | Coordination et routage des tâches |
| Analyste Documents | Vérification d'authenticité des documents |
| Analyste Transactions | Scoring de risque des transactions |
| Vérificateur Identité | Validation RNIPP et sanctions |
| Détecteur Patterns | Identification de schémas frauduleux |
| Analyseur Réseau | Détection de réseaux frauduleux |
| Générateur Explications | XAI et rapports |

## Installation

### Prérequis

- Python 3.11+
- Node.js 20+
- Docker & Docker Compose (optionnel)
- Clé API Google (Gemini)

### Installation locale

```bash
# Cloner le repo
git clone <repo-url>
cd fraudLLM

# Créer l'environnement
cp .env.example .env
# Éditer .env avec votre GOOGLE_API_KEY

# Installer les dépendances
make install

# Lancer en développement
make dev
```

### Installation avec Docker

```bash
# Build et lancement
docker-compose up -d

# Logs
docker-compose logs -f
```

## Configuration

Variables d'environnement principales:

| Variable | Description |
|----------|-------------|
| `GOOGLE_API_KEY` | Clé API Google pour Gemini |
| `DATABASE_URL` | URL de connexion base de données |
| `REDIS_URL` | URL Redis pour cache |
| `LOG_LEVEL` | Niveau de log (DEBUG, INFO, etc.) |

### Récompenses RL (Cost-Sensitive)

- Vrai Positif (TP): +10
- Vrai Négatif (TN): +1
- Faux Positif (FP): -5
- Faux Négatif (FN): -50

## API

### Endpoints principaux

- `POST /api/v1/transactions/analyze` - Analyse une transaction
- `POST /api/v1/transactions/batch` - Analyse par lot
- `POST /api/v1/documents/analyze` - Analyse un document
- `POST /api/v1/investigations/start` - Démarre une investigation
- `GET /api/v1/analytics/dashboard` - Statistiques dashboard

### WebSocket

- `ws://localhost:8000/ws` - Notifications temps réel

## Structure du projet

```
fraudLLM/
├── fraudshield/          # Package principal
│   ├── agents/           # Agents IA spécialisés
│   ├── mcp_servers/      # Serveurs MCP
│   ├── a2a/              # Protocole Agent-to-Agent
│   ├── a2ui/             # Protocole Agent-to-UI
│   ├── rl/               # Module RL
│   ├── tools/            # Outils des agents
│   └── config/           # Configuration
├── backend/              # API FastAPI
│   ├── routers/          # Routes API
│   ├── models/           # Modèles Pydantic
│   └── services/         # Services métier
├── frontend/             # Application Next.js
│   └── src/
│       ├── app/          # Pages
│       ├── components/   # Composants React
│       ├── hooks/        # Hooks personnalisés
│       └── lib/          # Utilitaires
└── docs/                 # Documentation
```

## Développement

```bash
# Tests
make test

# Linting
make lint

# Formatage
make format
```

## Licence

Propriétaire - Tous droits réservés
