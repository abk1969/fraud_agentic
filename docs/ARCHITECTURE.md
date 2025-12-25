# Architecture Technique - FraudShield AI Platform
## Architecture Full Stack Agentic AI sur Google Cloud Platform

**Version:** 1.0
**Date:** Décembre 2025
**Statut:** Draft

---

## 1. Vue d'Ensemble

### 1.1 Principes Architecturaux

| Principe | Description |
|----------|-------------|
| **Cloud-Native** | Architecture conteneurisée, serverless-first |
| **Event-Driven** | Communication asynchrone par événements |
| **Agentic AI** | Agents autonomes orchestrés |
| **Cost-Sensitive** | Optimisation métier intégrée dans le modèle |
| **Zero-Trust** | Sécurité à chaque couche |
| **Observable** | Monitoring et traçabilité complets |

### 1.2 Stack Technologique Google AI

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          GOOGLE CLOUD PLATFORM                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         AI / ML LAYER                                │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  Vertex AI          │  Gemini Flash   │  Document AI            │   │
│  │  • Model Training   │  • Multimodal LLM   │  • OCR                  │   │
│  │  • Feature Store    │  • Embeddings       │  • Form Parser          │   │
│  │  • Model Registry   │  • Function Calling │  • Entity Extraction    │   │
│  │  • Pipelines        │  • Grounding        │  • Classification       │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  Cloud Vision AI    │  Agent Builder      │  Vertex AI Search       │   │
│  │  • Image Analysis   │  • Agent SDK        │  • RAG                  │   │
│  │  • Document AI      │  • Orchestration    │  • Semantic Search      │   │
│  │  • Fraud Detection  │  • Tool Use         │  • Grounding            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       COMPUTE LAYER                                  │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  Cloud Run          │  GKE Autopilot      │  Cloud Functions        │   │
│  │  • API Services     │  • RL Agents        │  • Event Handlers       │   │
│  │  • Stateless        │  • GPU Workloads    │  • Webhooks             │   │
│  │  • Auto-scaling     │  • Long-running     │  • Integrations         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        DATA LAYER                                    │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  BigQuery           │  Cloud Spanner      │  Firestore              │   │
│  │  • Analytics        │  • Transactional    │  • Real-time            │   │
│  │  • ML Features      │  • Global Scale     │  • Sessions             │   │
│  │  • Data Warehouse   │  • Strong ACID      │  • User State           │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  Cloud Storage      │  Memorystore        │  AlloyDB                │   │
│  │  • Documents        │  • Redis Cache      │  • PostgreSQL           │   │
│  │  • Models           │  • Session Store    │  • Vector DB (pgvector) │   │
│  │  • Embeddings       │  • Rate Limiting    │  • Operational Data     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      MESSAGING LAYER                                 │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  Pub/Sub            │  Cloud Tasks        │  Eventarc               │   │
│  │  • Event Streaming  │  • Task Queues      │  • Event Routing        │   │
│  │  • Async Messaging  │  • Retry Logic      │  • Triggers             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Architecture Globale

### 2.1 Diagramme C4 - Niveau Contexte

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CONTEXT DIAGRAM                                 │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │  Gestionnaire │
                    │  Prestations  │
                    └──────┬───────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Analyste   │  │   Manager    │  │  Compliance  │
│   Fraude     │  │   Équipe     │  │   Officer    │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │                               │
         │      FRAUDSHIELD AI           │
         │         PLATFORM              │
         │                               │
         │   • Détection temps réel      │
         │   • Investigation assistée    │
         │   • Reporting & Analytics     │
         │   • Apprentissage continu     │
         │                               │
         └───────────────┬───────────────┘
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ SI Gestion  │  │  SI DSN     │  │  APIs       │
│ Prestations │  │  DPAE       │  │  Externes   │
└─────────────┘  └─────────────┘  └─────────────┘
```

### 2.2 Diagramme C4 - Niveau Container

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CONTAINER DIAGRAM                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                                FRONTEND                                      │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │   Web Application   │  │   Mobile App        │  │   Admin Portal      │  │
│  │   (Next.js/React)   │  │   (Flutter)         │  │   (React Admin)     │  │
│  │   Cloud Run         │  │   Firebase Hosting  │  │   Cloud Run         │  │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘  │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │ HTTPS/WSS
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        Cloud Endpoints / Apigee                      │   │
│  │   • Authentication (Firebase Auth / IAP)                             │   │
│  │   • Rate Limiting                                                    │   │
│  │   • API Versioning                                                   │   │
│  │   • Request Validation                                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND SERVICES                                   │
│                                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │  INTAKE     │ │  SCORING    │ │  DECISION   │ │  ORCHESTRATOR       │   │
│  │  SERVICE    │ │  SERVICE    │ │  SERVICE    │ │  SERVICE            │   │
│  │             │ │             │ │             │ │                     │   │
│  │ Cloud Run   │ │ Cloud Run   │ │ GKE (GPU)   │ │ Cloud Run           │   │
│  │ Python/     │ │ Python/     │ │ Python/     │ │ Python/             │   │
│  │ FastAPI     │ │ FastAPI     │ │ PyTorch     │ │ Agent Builder SDK   │   │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────────┬──────────┘   │
│         │               │               │                   │              │
│  ┌──────┴──────┐ ┌──────┴──────┐ ┌──────┴──────┐ ┌──────────┴──────────┐   │
│  │  EXPLAIN    │ │  LEARN      │ │  DOCUMENT   │ │  NOTIFICATION       │   │
│  │  SERVICE    │ │  SERVICE    │ │  SERVICE    │ │  SERVICE            │   │
│  │             │ │             │ │             │ │                     │   │
│  │ Cloud Run   │ │ Vertex AI   │ │ Cloud Run   │ │ Cloud Functions     │   │
│  │ Gemini Flash│ │ Pipelines   │ │ Document AI │ │ Pub/Sub             │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATA STORES                                       │
│                                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │  BigQuery   │ │  AlloyDB    │ │  Firestore  │ │  Cloud Storage      │   │
│  │             │ │  (pgvector) │ │             │ │                     │   │
│  │ Analytics   │ │ Operational │ │ Real-time   │ │ Documents           │   │
│  │ ML Features │ │ Vectors     │ │ State       │ │ Models              │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘   │
│                                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────────────────┐   │
│  │ Memorystore │ │  Pub/Sub    │ │  Vertex AI Feature Store            │   │
│  │  (Redis)    │ │             │ │                                     │   │
│  │ Cache       │ │ Events      │ │ ML Features                         │   │
│  │ Sessions    │ │ Queues      │ │ Online/Offline Serving              │   │
│  └─────────────┘ └─────────────┘ └─────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Architecture des Agents AI

### 3.1 Google Agent Builder Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AGENTIC AI ARCHITECTURE                               │
│                     (Google Vertex AI Agent Builder)                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           ORCHESTRATOR AGENT                                 │
│                        (Main Coordinator Agent)                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │   Model: Gemini Flash Latest                                               │  │
│  │   Role: Coordination, Planning, Delegation                            │  │
│  │                                                                       │  │
│  │   Capabilities:                                                       │  │
│  │   • Analyze incoming fraud investigation requests                     │  │
│  │   • Decompose complex tasks into sub-tasks                            │  │
│  │   • Delegate to specialized agents                                    │  │
│  │   • Aggregate results and make final decisions                        │  │
│  │   • Handle escalations to human reviewers                             │  │
│  │                                                                       │  │
│  │   Tools:                                                              │  │
│  │   • agent_delegate(agent_name, task, context)                         │  │
│  │   • aggregate_results(results[])                                      │  │
│  │   • escalate_to_human(case_id, reason)                                │  │
│  │   • get_case_context(case_id)                                         │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
          ▼                         ▼                         ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  DOCUMENT ANALYST   │  │ TRANSACTION ANALYST │  │  IDENTITY VERIFIER  │
│       AGENT         │  │       AGENT         │  │       AGENT         │
├─────────────────────┤  ├─────────────────────┤  ├─────────────────────┤
│                     │  │                     │  │                     │
│ Model: Gemini Flash │  │ Model: Gemini Flash │  │ Model: Gemini Flash │
│        Pro Vision   │  │        Pro          │  │        Pro          │
│                     │  │                     │  │                     │
│ Tools:              │  │ Tools:              │  │ Tools:              │
│ • analyze_document  │  │ • score_transaction │  │ • verify_identity   │
│ • extract_entities  │  │ • detect_anomalies  │  │ • check_rnipp       │
│ • detect_tampering  │  │ • get_history       │  │ • validate_rib      │
│ • ocr_extract       │  │ • compute_embedding │  │ • cross_reference   │
│                     │  │                     │  │                     │
│ MCP Servers:        │  │ MCP Servers:        │  │ MCP Servers:        │
│ • mcp-document-ai   │  │ • mcp-bigquery      │  │ • mcp-external-apis │
│ • mcp-storage       │  │ • mcp-vertex-ai     │  │ • mcp-database      │
│                     │  │                     │  │                     │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
          │                         │                         │
          ▼                         ▼                         ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│   PATTERN DETECTOR  │  │   NETWORK ANALYZER  │  │ EXPLANATION GENERATOR│
│       AGENT         │  │       AGENT         │  │       AGENT         │
├─────────────────────┤  ├─────────────────────┤  ├─────────────────────┤
│                     │  │                     │  │                     │
│ Model: Fine-tuned   │  │ Model: Gemini Flash │  │ Model: Gemini Flash │
│        DistilBERT   │  │        Pro          │  │        Pro          │
│                     │  │                     │  │                     │
│ Tools:              │  │ Tools:              │  │ Tools:              │
│ • detect_patterns   │  │ • analyze_network   │  │ • generate_explain  │
│ • match_scenarios   │  │ • find_communities  │  │ • create_report     │
│ • temporal_analysis │  │ • score_influence   │  │ • summarize_case    │
│ • sequence_detect   │  │ • detect_rings      │  │ • get_attention_wts │
│                     │  │                     │  │                     │
│ MCP Servers:        │  │ MCP Servers:        │  │ MCP Servers:        │
│ • mcp-ml-models     │  │ • mcp-neo4j         │  │ • mcp-templates     │
│ • mcp-vertex-ai     │  │ • mcp-bigquery      │  │ • mcp-rag           │
│                     │  │                     │  │                     │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

### 3.2 MCP (Model Context Protocol) Servers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MCP SERVER ARCHITECTURE                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              MCP REGISTRY                                    │
│                         (Cloud Run + Firestore)                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Service Discovery  │  Health Checks  │  Load Balancing  │  Metrics   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
         ▼                         ▼                         ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  MCP-DATABASE       │  │  MCP-DOCUMENT-AI    │  │  MCP-EXTERNAL-APIS  │
│  Server             │  │  Server             │  │  Server             │
├─────────────────────┤  ├─────────────────────┤  ├─────────────────────┤
│                     │  │                     │  │                     │
│ Resources:          │  │ Resources:          │  │ Resources:          │
│ • cases://          │  │ • documents://      │  │ • rnipp://          │
│ • transactions://   │  │ • forms://          │  │ • insee://          │
│ • beneficiaries://  │  │ • images://         │  │ • banque://         │
│                     │  │                     │  │                     │
│ Tools:              │  │ Tools:              │  │ Tools:              │
│ • query_cases       │  │ • extract_text      │  │ • verify_person     │
│ • get_transaction   │  │ • parse_form        │  │ • check_company     │
│ • search_similar    │  │ • detect_fraud_doc  │  │ • validate_iban     │
│ • update_status     │  │ • classify_doc      │  │ • check_sanctions   │
│                     │  │                     │  │                     │
│ Backend:            │  │ Backend:            │  │ Backend:            │
│ AlloyDB + BigQuery  │  │ Document AI         │  │ Cloud Functions     │
│                     │  │ Cloud Vision        │  │ Secret Manager      │
│                     │  │                     │  │                     │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  MCP-VERTEX-AI      │  │  MCP-NEO4J          │  │  MCP-NOTIFICATIONS  │
│  Server             │  │  Server             │  │  Server             │
├─────────────────────┤  ├─────────────────────┤  ├─────────────────────┤
│                     │  │                     │  │                     │
│ Resources:          │  │ Resources:          │  │ Resources:          │
│ • models://         │  │ • graphs://         │  │ • alerts://         │
│ • embeddings://     │  │ • nodes://          │  │ • notifications://  │
│ • predictions://    │  │ • relationships://  │  │ • channels://       │
│                     │  │                     │  │                     │
│ Tools:              │  │ Tools:              │  │ Tools:              │
│ • get_embedding     │  │ • query_graph       │  │ • send_alert        │
│ • predict_fraud     │  │ • find_path         │  │ • notify_user       │
│ • batch_score       │  │ • community_detect  │  │ • schedule_reminder │
│ • explain_pred      │  │ • influence_score   │  │ • broadcast_update  │
│                     │  │                     │  │                     │
│ Backend:            │  │ Backend:            │  │ Backend:            │
│ Vertex AI           │  │ Neo4j Aura          │  │ Pub/Sub             │
│ Feature Store       │  │ (Managed)           │  │ Firebase Messaging  │
│                     │  │                     │  │                     │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

### 3.3 Agent SDK Implementation

```python
# Architecture des Agents avec Google Agent Builder SDK

from google.cloud import aiplatform
from google.adk import Agent, Tool, AgentOrchestrator
from google.adk.tools import FunctionTool
from google.adk.mcp import MCPClient

# ============================================================================
# ORCHESTRATOR AGENT
# ============================================================================

class FraudOrchestrator(Agent):
    """
    Agent principal qui coordonne l'investigation de fraude.
    Délègue aux agents spécialisés et agrège les résultats.
    """

    def __init__(self):
        super().__init__(
            model="gemini-flash-latest",
            name="fraud-orchestrator",
            instructions="""
            Tu es le coordinateur principal de détection de fraude pour un
            groupe de protection sociale français.

            Ta mission:
            1. Analyser les demandes d'investigation
            2. Déléguer aux agents spécialisés appropriés
            3. Agréger les résultats
            4. Prendre une décision finale ou escalader

            Contexte métier:
            - Un faux négatif coûte 10x plus qu'un faux positif
            - Privilégier le recall (ne pas manquer de fraude)
            - Toujours fournir une explication
            """,
            tools=[
                self.delegate_to_agent,
                self.aggregate_results,
                self.escalate_to_human,
                self.get_case_context,
                self.make_final_decision
            ]
        )

        # Connexion aux agents spécialisés
        self.document_agent = DocumentAnalystAgent()
        self.transaction_agent = TransactionAnalystAgent()
        self.identity_agent = IdentityVerifierAgent()
        self.pattern_agent = PatternDetectorAgent()
        self.network_agent = NetworkAnalyzerAgent()
        self.explanation_agent = ExplanationGeneratorAgent()

    @FunctionTool
    def delegate_to_agent(
        self,
        agent_name: str,
        task: str,
        context: dict
    ) -> dict:
        """Délègue une tâche à un agent spécialisé."""
        agents = {
            "document": self.document_agent,
            "transaction": self.transaction_agent,
            "identity": self.identity_agent,
            "pattern": self.pattern_agent,
            "network": self.network_agent,
            "explanation": self.explanation_agent
        }
        agent = agents.get(agent_name)
        return agent.execute(task, context)

    @FunctionTool
    def make_final_decision(
        self,
        case_id: str,
        agent_results: list,
        risk_score: float
    ) -> dict:
        """
        Prend la décision finale basée sur les résultats des agents.
        Implémente la logique cost-sensitive.
        """
        # Agrégation des scores
        weighted_score = self._compute_weighted_score(agent_results)

        # Seuils cost-sensitive (favorise le recall)
        if weighted_score > 0.3:  # Seuil bas pour ne pas manquer de fraude
            decision = "FLAG"
            action = "investigation_required"
        else:
            decision = "PASS"
            action = "auto_approve"

        return {
            "case_id": case_id,
            "decision": decision,
            "action": action,
            "confidence": weighted_score,
            "explanation_pending": True
        }


# ============================================================================
# SPECIALIZED AGENTS
# ============================================================================

class DocumentAnalystAgent(Agent):
    """Agent spécialisé dans l'analyse de documents."""

    def __init__(self):
        super().__init__(
            model="gemini-flash-latest",
            name="document-analyst",
            instructions="""
            Tu es un expert en analyse documentaire pour la détection de fraude.

            Capacités:
            - OCR et extraction de texte
            - Détection de falsification (manipulation d'images)
            - Extraction d'entités (dates, montants, noms)
            - Classification de documents

            Indicateurs de fraude documentaire:
            - Incohérence de polices/styles
            - Métadonnées suspectes
            - Montants inhabituels
            - Dates incohérentes
            """,
            tools=[
                self.analyze_document,
                self.extract_entities,
                self.detect_tampering,
                self.classify_document
            ]
        )

        # MCP Client pour Document AI
        self.mcp_client = MCPClient("mcp-document-ai")

    @FunctionTool
    def analyze_document(self, document_uri: str) -> dict:
        """Analyse complète d'un document."""
        # Appel au MCP Server Document AI
        return self.mcp_client.call_tool(
            "extract_text",
            {"uri": document_uri, "include_confidence": True}
        )

    @FunctionTool
    def detect_tampering(self, document_uri: str) -> dict:
        """Détecte les signes de falsification."""
        return self.mcp_client.call_tool(
            "detect_fraud_doc",
            {"uri": document_uri}
        )


class TransactionAnalystAgent(Agent):
    """Agent spécialisé dans l'analyse transactionnelle."""

    def __init__(self):
        super().__init__(
            model="gemini-flash-latest",
            name="transaction-analyst",
            instructions="""
            Tu analyses les transactions financières pour détecter la fraude.

            Méthodes:
            - Scoring de risque par embedding LLM
            - Détection d'anomalies statistiques
            - Analyse de séquences temporelles
            - Comparaison avec l'historique

            Indicateurs de fraude transactionnelle:
            - Montants inhabituels
            - Fréquence anormale
            - Nouveaux bénéficiaires
            - Patterns connus de fraude
            """,
            tools=[
                self.score_transaction,
                self.detect_anomalies,
                self.get_transaction_history,
                self.compute_embedding
            ]
        )

        self.mcp_vertex = MCPClient("mcp-vertex-ai")
        self.mcp_bigquery = MCPClient("mcp-bigquery")

    @FunctionTool
    def score_transaction(self, transaction: dict) -> dict:
        """Score une transaction via le modèle RL."""
        # Sérialisation sémantique de la transaction
        serialized = self._serialize_transaction(transaction)

        # Obtenir l'embedding LLM
        embedding = self.mcp_vertex.call_tool(
            "get_embedding",
            {"text": serialized, "model": "textembedding-gecko"}
        )

        # Score via le modèle RL déployé
        prediction = self.mcp_vertex.call_tool(
            "predict_fraud",
            {"embedding": embedding, "features": transaction}
        )

        return prediction

    def _serialize_transaction(self, tx: dict) -> str:
        """
        Template-based serialization pour contextualiser
        les valeurs numériques.
        """
        return f"""
        Transaction de type [{tx['type']}] initiée le [{tx['date']}]
        pour un montant de [{tx['amount']}€].
        Bénéficiaire: [{tx['beneficiary_name']}].
        Origine: [{tx['origin']}].
        Historique bénéficiaire: [{tx.get('history_summary', 'N/A')}].
        """


class IdentityVerifierAgent(Agent):
    """Agent de vérification d'identité."""

    def __init__(self):
        super().__init__(
            model="gemini-flash-latest",
            name="identity-verifier",
            tools=[
                self.verify_identity,
                self.check_rnipp,
                self.validate_rib,
                self.cross_reference
            ]
        )
        self.mcp_external = MCPClient("mcp-external-apis")


class PatternDetectorAgent(Agent):
    """Agent de détection de patterns frauduleux."""

    def __init__(self):
        super().__init__(
            model="gemini-flash-latest",
            name="pattern-detector",
            tools=[
                self.detect_known_patterns,
                self.temporal_analysis,
                self.sequence_detection
            ]
        )


class NetworkAnalyzerAgent(Agent):
    """Agent d'analyse de réseaux de fraude."""

    def __init__(self):
        super().__init__(
            model="gemini-flash-latest",
            name="network-analyzer",
            tools=[
                self.analyze_network,
                self.find_communities,
                self.detect_fraud_rings
            ]
        )
        self.mcp_neo4j = MCPClient("mcp-neo4j")


class ExplanationGeneratorAgent(Agent):
    """Agent de génération d'explications."""

    def __init__(self):
        super().__init__(
            model="gemini-flash-latest",
            name="explanation-generator",
            instructions="""
            Tu génères des explications claires et compréhensibles
            des décisions de détection de fraude.

            Format attendu:
            1. Résumé de la décision
            2. Facteurs de risque identifiés
            3. Éléments analysés
            4. Niveau de confiance
            5. Actions recommandées

            Ton langage doit être:
            - Professionnel mais accessible
            - Factuel et objectif
            - Conforme aux exigences RGPD d'explicabilité
            """,
            tools=[
                self.generate_explanation,
                self.create_investigation_report,
                self.summarize_case
            ]
        )
```

---

## 4. Architecture ML/RL

### 4.1 Pipeline d'Entraînement

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ML/RL TRAINING PIPELINE                              │
│                          (Vertex AI Pipelines)                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│   │    DATA     │───▶│  FEATURE    │───▶│   MODEL     │───▶│   MODEL     │ │
│   │  INGESTION  │    │ ENGINEERING │    │  TRAINING   │    │  REGISTRY   │ │
│   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘ │
│         │                  │                  │                  │         │
│         ▼                  ▼                  ▼                  ▼         │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│   │ Cloud       │    │ Vertex AI   │    │ Custom      │    │ Vertex AI   │ │
│   │ Storage     │    │ Feature     │    │ Training    │    │ Model       │ │
│   │ + BigQuery  │    │ Store       │    │ (GPU)       │    │ Registry    │ │
│   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          TRAINING COMPONENTS                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. LLM ENCODER (Fine-tuned DistilBERT / Gemini Embeddings)                │
│     ┌───────────────────────────────────────────────────────────────────┐   │
│     │  Input: Transaction sérialisée en texte                           │   │
│     │  Output: Embedding 768-dim                                        │   │
│     │  Training: Binary Cross-Entropy sur données labelisées            │   │
│     │  Fine-tuning: Attention-based pooling                             │   │
│     └───────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  2. RL AGENT (A2C - Advantage Actor-Critic)                                │
│     ┌───────────────────────────────────────────────────────────────────┐   │
│     │  State: concat(LLM_embedding, structured_features)                │   │
│     │  Actions: {PASS=0, FLAG=1}                                        │   │
│     │  Reward Function (Cost-Sensitive):                                │   │
│     │    R = +10 (TP), +1 (TN), -5 (FP), -50 (FN)                       │   │
│     │  Algorithm: A2C with entropy regularization                       │   │
│     │  Framework: Stable-Baselines3 on Vertex AI                        │   │
│     └───────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  3. CONTINUOUS LEARNING                                                     │
│     ┌───────────────────────────────────────────────────────────────────┐   │
│     │  • Feedback loop: Analyst decisions → Training data               │   │
│     │  • Drift detection: Statistical monitoring of predictions         │   │
│     │  • Auto-retrain: Scheduled + triggered pipelines                  │   │
│     │  • A/B testing: Champion/Challenger model comparison              │   │
│     └───────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Feature Engineering

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FEATURE ENGINEERING                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                       RAW TRANSACTION DATA                                   │
│                                                                             │
│  {                                                                          │
│    "transaction_id": "TXN-2025-001",                                        │
│    "type": "REMBOURSEMENT_SANTE",                                           │
│    "amount": 1250.00,                                                       │
│    "date": "2025-12-15T14:30:00",                                          │
│    "beneficiary_id": "BEN-12345",                                           │
│    "beneficiary_name": "Jean Dupont",                                       │
│    "provider_id": "PRO-789",                                                │
│    "provider_name": "Cabinet Médical XYZ",                                  │
│    "documents": ["doc1.pdf", "ordonnance.jpg"],                            │
│    "claim_description": "Consultation + analyses"                           │
│  }                                                                          │
│                                                                             │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     FEATURE TRANSFORMATION                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. STRUCTURED FEATURES (Numerical + Categorical)                          │
│     ┌───────────────────────────────────────────────────────────────────┐   │
│     │  • amount_normalized: RobustScaler(amount)                        │   │
│     │  • hour_of_day: extract(hour from date)                           │   │
│     │  • day_of_week: extract(dow from date)                            │   │
│     │  • days_since_last_claim: date_diff(last_claim)                   │   │
│     │  • claim_frequency_30d: count(claims, 30_days)                    │   │
│     │  • avg_claim_amount: avg(amount, beneficiary)                     │   │
│     │  • type_encoded: one_hot(type)                                    │   │
│     │  • provider_risk_score: lookup(provider_scores)                   │   │
│     │  • beneficiary_tenure: months_since_enrollment                    │   │
│     │  • documents_count: len(documents)                                │   │
│     └───────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  2. SEMANTIC FEATURES (LLM Embeddings)                                      │
│     ┌───────────────────────────────────────────────────────────────────┐   │
│     │                                                                   │   │
│     │  Template Serialization:                                          │   │
│     │  ─────────────────────────────────────────────────────────────    │   │
│     │  "Demande de remboursement de type [REMBOURSEMENT_SANTE]          │   │
│     │   pour un montant de [1250.00€], soumise le [15/12/2025           │   │
│     │   à 14h30]. Bénéficiaire: [Jean Dupont], inscrit depuis           │   │
│     │   [24 mois]. Prestataire: [Cabinet Médical XYZ] avec un           │   │
│     │   score de risque de [0.12]. Description: [Consultation +         │   │
│     │   analyses]. Fréquence de réclamation sur 30j: [3]."              │   │
│     │                                                                   │   │
│     │  → Gemini Embedding API → Vector[768]                             │   │
│     │                                                                   │   │
│     └───────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  3. GRAPH FEATURES (Network Analysis)                                       │
│     ┌───────────────────────────────────────────────────────────────────┐   │
│     │  • shared_providers_count: common providers with flagged users    │   │
│     │  • network_centrality: PageRank in transaction graph              │   │
│     │  • community_risk_score: avg fraud rate of community              │   │
│     │  • unusual_connections: new relationships count                   │   │
│     └───────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  4. DOCUMENT FEATURES (Vision AI)                                           │
│     ┌───────────────────────────────────────────────────────────────────┐   │
│     │  • document_authenticity_score: tampering detection               │   │
│     │  • ocr_confidence: extraction confidence                          │   │
│     │  • entity_consistency: cross-reference validation                 │   │
│     │  • metadata_anomaly_score: EXIF/metadata analysis                 │   │
│     └───────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          UNIFIED STATE VECTOR                                │
│                                                                             │
│   state = concat(                                                           │
│       llm_embedding,        # 768 dims                                      │
│       structured_features,  # ~20 dims                                      │
│       graph_features,       # ~10 dims                                      │
│       document_features     # ~5 dims                                       │
│   )  # Total: ~803 dimensions                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Architecture Data

### 5.1 Modèle de Données

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA MODEL                                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         OPERATIONAL DATA (AlloyDB)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐     │
│  │   beneficiaries │      │   transactions  │      │     cases       │     │
│  ├─────────────────┤      ├─────────────────┤      ├─────────────────┤     │
│  │ id (PK)         │◄────┐│ id (PK)         │     │ id (PK)         │     │
│  │ external_id     │     ││ beneficiary_id  │──┐  │ transaction_id  │──┐  │
│  │ first_name      │     ││ provider_id     │  │  │ status          │  │  │
│  │ last_name       │     ││ type            │  │  │ risk_score      │  │  │
│  │ birth_date      │     ││ amount          │  │  │ decision        │  │  │
│  │ enrollment_date │     ││ date            │  │  │ assigned_to     │  │  │
│  │ risk_profile    │     ││ description     │  │  │ created_at      │  │  │
│  │ created_at      │     ││ documents[]     │  │  │ resolved_at     │  │  │
│  │ updated_at      │     ││ embedding (vec) │  │  │ resolution      │  │  │
│  └─────────────────┘     ││ risk_score      │  │  │ feedback        │  │  │
│                          ││ created_at      │  │  └────────┬────────┘  │  │
│  ┌─────────────────┐     │└─────────────────┘  │           │           │  │
│  │    providers    │     │         │           │           │           │  │
│  ├─────────────────┤     │         │           │           ▼           │  │
│  │ id (PK)         │◄────┘         │           │  ┌─────────────────┐  │  │
│  │ name            │               │           │  │  case_events    │  │  │
│  │ type            │               │           │  ├─────────────────┤  │  │
│  │ address         │               │           └─▶│ id (PK)         │  │  │
│  │ risk_score      │               │              │ case_id (FK)    │  │  │
│  │ fraud_history   │               │              │ event_type      │  │  │
│  │ created_at      │               │              │ actor           │  │  │
│  └─────────────────┘               │              │ details (JSON)  │  │  │
│                                    │              │ created_at      │  │  │
│  ┌─────────────────┐               │              └─────────────────┘  │  │
│  │    documents    │               │                                   │  │
│  ├─────────────────┤               │                                   │  │
│  │ id (PK)         │◄──────────────┘                                   │  │
│  │ transaction_id  │────────────────────────────────────────────────────┘  │
│  │ storage_uri     │                                                      │
│  │ type            │                                                      │
│  │ ocr_text        │                                                      │
│  │ entities (JSON) │                                                      │
│  │ authenticity    │                                                      │
│  │ created_at      │                                                      │
│  └─────────────────┘                                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        ANALYTICS DATA (BigQuery)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Dataset: fraud_detection                                                   │
│                                                                             │
│  ├── transactions_raw        # Raw ingested transactions                    │
│  ├── transactions_features   # Computed features for ML                     │
│  ├── predictions_log         # All model predictions with explanations      │
│  ├── feedback_log            # Analyst feedback for retraining              │
│  ├── model_metrics           # Model performance over time                  │
│  ├── drift_monitoring        # Feature and prediction drift stats          │
│  └── aggregated_reports      # Pre-computed dashboards data                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         GRAPH DATA (Neo4j Aura)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Nodes:                                                                     │
│  • (:Beneficiary {id, name, risk_score})                                   │
│  • (:Provider {id, name, type, risk_score})                                │
│  • (:Transaction {id, amount, date, risk_score})                           │
│  • (:Address {id, street, city, postal_code})                              │
│  • (:BankAccount {id, iban, bank_name})                                    │
│                                                                             │
│  Relationships:                                                             │
│  • (Beneficiary)-[:CLAIMS_FROM]->(Provider)                                │
│  • (Beneficiary)-[:HAS_TRANSACTION]->(Transaction)                         │
│  • (Beneficiary)-[:LIVES_AT]->(Address)                                    │
│  • (Beneficiary)-[:HAS_ACCOUNT]->(BankAccount)                             │
│  • (Provider)-[:SERVES]->(Transaction)                                     │
│  • (Beneficiary)-[:SHARES_ADDRESS_WITH]->(Beneficiary)                     │
│  • (Beneficiary)-[:SHARES_ACCOUNT_WITH]->(Beneficiary)                     │
│                                                                             │
│  Use Cases:                                                                 │
│  • Fraud ring detection (community detection)                              │
│  • Suspicious relationship patterns                                         │
│  • Provider network analysis                                                │
│  • Identity linkage                                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW ARCHITECTURE                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   SI Gestion    │     │    SI DSN       │     │   Documents     │
│   Prestations   │     │                 │     │   (GED)         │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │ REST API              │ SFTP/API              │ Events
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          INGESTION LAYER                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │  Cloud Run      │  │  Cloud          │  │  Eventarc                   │  │
│  │  (REST API)     │  │  Functions      │  │  (Event Router)             │  │
│  │                 │  │  (File Trigger) │  │                             │  │
│  └────────┬────────┘  └────────┬────────┘  └─────────────┬───────────────┘  │
│           │                    │                         │                  │
│           └────────────────────┴─────────────────────────┘                  │
│                                │                                            │
│                                ▼                                            │
│                    ┌─────────────────────┐                                  │
│                    │      Pub/Sub        │                                  │
│                    │  (transactions-raw) │                                  │
│                    └──────────┬──────────┘                                  │
│                               │                                             │
└───────────────────────────────┼─────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PROCESSING LAYER                                     │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Dataflow (Apache Beam)                            │   │
│  │                                                                      │   │
│  │   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐     │   │
│  │   │ Validate │───▶│ Enrich   │───▶│ Transform│───▶│ Feature  │     │   │
│  │   │          │    │          │    │          │    │ Extract  │     │   │
│  │   └──────────┘    └──────────┘    └──────────┘    └──────────┘     │   │
│  │        │               │               │               │            │   │
│  │        ▼               ▼               ▼               ▼            │   │
│  │   [Schema       [External        [Normalize     [Compute           │   │
│  │    Validation]   API Calls]       & Clean]       Features]         │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                │                                            │
│                                ▼                                            │
│                    ┌─────────────────────┐                                  │
│                    │      Pub/Sub        │                                  │
│                    │ (transactions-proc) │                                  │
│                    └──────────┬──────────┘                                  │
│                               │                                             │
└───────────────────────────────┼─────────────────────────────────────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          │                     │                     │
          ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    BigQuery     │  │    AlloyDB      │  │  Feature Store  │
│   (Analytics)   │  │  (Operational)  │  │   (Vertex AI)   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
          │                     │                     │
          └─────────────────────┼─────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SCORING LAYER                                       │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     Cloud Run (Scoring Service)                      │   │
│  │                                                                      │   │
│  │   1. Get Features from Feature Store                                 │   │
│  │   2. Generate LLM Embedding (Gemini API)                             │   │
│  │   3. Concatenate State Vector                                        │   │
│  │   4. Invoke RL Model (Vertex AI Endpoint)                            │   │
│  │   5. Return Score + Explanation                                      │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                │                                            │
│                                ▼                                            │
│                    ┌─────────────────────┐                                  │
│                    │      Pub/Sub        │                                  │
│                    │   (scored-events)   │                                  │
│                    └──────────┬──────────┘                                  │
│                               │                                             │
└───────────────────────────────┼─────────────────────────────────────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          │                     │                     │
          ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Case Creation  │  │  Notifications  │  │   Dashboard     │
│   (AlloyDB)     │  │   (FCM/Email)   │  │   Update        │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 6. Architecture Sécurité

### 6.1 Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SECURITY ARCHITECTURE                                │
│                          (Zero Trust Model)                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           IDENTITY LAYER                                     │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    Google Cloud Identity                              │  │
│  │  • SSO with SAML 2.0 / OIDC                                          │  │
│  │  • MFA enforced                                                       │  │
│  │  • Conditional Access Policies                                        │  │
│  │  • Session Management                                                 │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    Identity-Aware Proxy (IAP)                         │  │
│  │  • Context-aware access                                               │  │
│  │  • Device trust validation                                            │  │
│  │  • Geo-restrictions                                                   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          NETWORK LAYER                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        VPC Service Controls                           │  │
│  │                                                                       │  │
│  │   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │  │
│  │   │  Perimeter:     │  │  Perimeter:     │  │  Perimeter:     │      │  │
│  │   │  Production     │  │  Staging        │  │  Development    │      │  │
│  │   │                 │  │                 │  │                 │      │  │
│  │   │  • AlloyDB      │  │  • AlloyDB      │  │  • AlloyDB      │      │  │
│  │   │  • BigQuery     │  │  • BigQuery     │  │  • BigQuery     │      │  │
│  │   │  • GCS          │  │  • GCS          │  │  • GCS          │      │  │
│  │   │  • Vertex AI    │  │  • Vertex AI    │  │  • Vertex AI    │      │  │
│  │   └─────────────────┘  └─────────────────┘  └─────────────────┘      │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    Cloud Armor (WAF)                                  │  │
│  │  • DDoS protection                                                    │  │
│  │  • Rate limiting                                                      │  │
│  │  • Bot management                                                     │  │
│  │  • OWASP rules                                                        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                       Encryption                                      │  │
│  │                                                                       │  │
│  │   At Rest:                          In Transit:                       │  │
│  │   • Cloud KMS (Customer-managed)    • TLS 1.3                        │  │
│  │   • AES-256-GCM                     • mTLS for service-to-service    │  │
│  │   • Automatic key rotation          • Certificate Authority Service   │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    Data Loss Prevention (DLP)                         │  │
│  │  • PII detection and masking                                          │  │
│  │  • Automated classification                                           │  │
│  │  • De-identification for analytics                                    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    Secret Manager                                     │  │
│  │  • API keys                                                           │  │
│  │  • Database credentials                                               │  │
│  │  • Service account keys                                               │  │
│  │  • Automatic rotation                                                 │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER                                    │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    IAM & RBAC                                         │  │
│  │                                                                       │  │
│  │   Roles:                                                              │  │
│  │   • fraud_viewer: Read-only access to cases                          │  │
│  │   • fraud_analyst: Investigate and resolve cases                     │  │
│  │   • fraud_manager: Team management, configuration                    │  │
│  │   • fraud_admin: Full administrative access                          │  │
│  │   • ml_engineer: Model training and deployment                       │  │
│  │                                                                       │  │
│  │   Service Accounts:                                                   │  │
│  │   • sa-intake-service@                                               │  │
│  │   • sa-scoring-service@                                              │  │
│  │   • sa-ml-training@                                                  │  │
│  │   (Workload Identity Federation)                                      │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        OBSERVABILITY LAYER                                   │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    Security Command Center                            │  │
│  │  • Vulnerability scanning                                             │  │
│  │  • Threat detection                                                   │  │
│  │  • Compliance monitoring                                              │  │
│  │  • Security Health Analytics                                          │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    Cloud Audit Logs                                   │  │
│  │  • Admin Activity logs                                                │  │
│  │  • Data Access logs                                                   │  │
│  │  • System Event logs                                                  │  │
│  │  • Retention: 5 years (compliance)                                    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Infrastructure as Code

### 7.1 Terraform Structure

```
fraudshield-infra/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   ├── staging/
│   │   └── ...
│   └── prod/
│       └── ...
├── modules/
│   ├── networking/
│   │   ├── vpc.tf
│   │   ├── subnets.tf
│   │   ├── firewall.tf
│   │   └── outputs.tf
│   ├── compute/
│   │   ├── cloud_run.tf
│   │   ├── gke.tf
│   │   └── cloud_functions.tf
│   ├── data/
│   │   ├── bigquery.tf
│   │   ├── alloydb.tf
│   │   ├── firestore.tf
│   │   └── storage.tf
│   ├── ai/
│   │   ├── vertex_ai.tf
│   │   ├── feature_store.tf
│   │   └── model_registry.tf
│   ├── security/
│   │   ├── iam.tf
│   │   ├── kms.tf
│   │   ├── secret_manager.tf
│   │   └── vpc_sc.tf
│   └── observability/
│       ├── monitoring.tf
│       ├── logging.tf
│       └── alerting.tf
└── shared/
    ├── backend.tf
    └── providers.tf
```

### 7.2 Example Terraform - Vertex AI

```hcl
# modules/ai/vertex_ai.tf

resource "google_vertex_ai_featurestore" "fraud_features" {
  name     = "fraud_detection_features"
  region   = var.region
  project  = var.project_id

  online_serving_config {
    fixed_node_count = 2
  }

  encryption_spec {
    kms_key_name = var.kms_key_id
  }
}

resource "google_vertex_ai_featurestore_entitytype" "transactions" {
  name         = "transactions"
  featurestore = google_vertex_ai_featurestore.fraud_features.id

  monitoring_config {
    snapshot_analysis {
      disabled = false
    }
  }
}

resource "google_vertex_ai_endpoint" "fraud_scoring" {
  name         = "fraud-scoring-endpoint"
  display_name = "Fraud Scoring Model Endpoint"
  location     = var.region
  project      = var.project_id

  encryption_spec {
    kms_key_name = var.kms_key_id
  }

  network = var.vpc_network
}

resource "google_vertex_ai_model" "rl_agent" {
  display_name = "fraud-rl-agent-a2c"
  project      = var.project_id
  location     = var.region

  container_spec {
    image_uri = "${var.artifact_registry}/fraud-rl-agent:latest"

    predict_route = "/predict"
    health_route  = "/health"

    env {
      name  = "MODEL_PATH"
      value = "gs://${var.models_bucket}/rl-agent/latest"
    }
  }

  artifact_uri = "gs://${var.models_bucket}/rl-agent/latest"
}
```

---

## 8. CI/CD Pipeline

```yaml
# .github/workflows/deploy.yaml

name: FraudShield AI - CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  PROJECT_ID: fraudshield-prod
  REGION: europe-west1
  ARTIFACT_REGISTRY: europe-west1-docker.pkg.dev/fraudshield-prod/fraudshield

jobs:
  # ============================================
  # TESTS
  # ============================================
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install -r requirements-test.txt

      - name: Run unit tests
        run: pytest tests/unit --cov=src --cov-report=xml

      - name: Run integration tests
        run: pytest tests/integration

      - name: Upload coverage
        uses: codecov/codecov-action@v4

  # ============================================
  # BUILD
  # ============================================
  build:
    needs: test
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [intake, scoring, decision, explain, orchestrator]

    steps:
      - uses: actions/checkout@v4

      - name: Authenticate to GCP
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Configure Docker
        run: gcloud auth configure-docker ${{ env.REGION }}-docker.pkg.dev

      - name: Build and push
        run: |
          docker build -t ${{ env.ARTIFACT_REGISTRY }}/${{ matrix.service }}:${{ github.sha }} \
            -f services/${{ matrix.service }}/Dockerfile .
          docker push ${{ env.ARTIFACT_REGISTRY }}/${{ matrix.service }}:${{ github.sha }}

  # ============================================
  # DEPLOY STAGING
  # ============================================
  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: staging

    steps:
      - uses: actions/checkout@v4

      - name: Authenticate to GCP
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Deploy to Cloud Run (Staging)
        run: |
          gcloud run deploy intake-service \
            --image=${{ env.ARTIFACT_REGISTRY }}/intake:${{ github.sha }} \
            --region=${{ env.REGION }} \
            --project=fraudshield-staging \
            --set-env-vars="ENV=staging"

  # ============================================
  # DEPLOY PRODUCTION
  # ============================================
  deploy-prod:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production

    steps:
      - uses: actions/checkout@v4

      - name: Authenticate to GCP
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Deploy to Cloud Run (Production)
        run: |
          gcloud run deploy intake-service \
            --image=${{ env.ARTIFACT_REGISTRY }}/intake:${{ github.sha }} \
            --region=${{ env.REGION }} \
            --project=${{ env.PROJECT_ID }} \
            --set-env-vars="ENV=production" \
            --min-instances=2 \
            --max-instances=100

  # ============================================
  # ML MODEL DEPLOYMENT
  # ============================================
  deploy-model:
    needs: deploy-prod
    if: github.ref == 'refs/heads/main' && contains(github.event.head_commit.message, '[deploy-model]')
    runs-on: ubuntu-latest

    steps:
      - name: Deploy Model to Vertex AI
        run: |
          gcloud ai models upload \
            --region=${{ env.REGION }} \
            --display-name=fraud-rl-agent-${{ github.sha }} \
            --container-image-uri=${{ env.ARTIFACT_REGISTRY }}/rl-agent:${{ github.sha }}

          gcloud ai endpoints deploy-model fraud-scoring-endpoint \
            --region=${{ env.REGION }} \
            --model=fraud-rl-agent-${{ github.sha }} \
            --traffic-split=0=100
```

---

## 9. Monitoring et Observabilité

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      OBSERVABILITY ARCHITECTURE                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          METRICS (Cloud Monitoring)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Business Metrics:                                                          │
│  • fraud_detection_rate: Fraudes détectées / Total transactions            │
│  • false_positive_rate: Faux positifs / Total alertes                      │
│  • false_negative_rate: Fraudes manquées / Total fraudes                   │
│  • mean_time_to_detection: Temps moyen de détection                        │
│  • mean_time_to_resolution: Temps moyen de résolution                      │
│                                                                             │
│  ML Metrics:                                                                │
│  • model_precision: Précision du modèle (rolling 24h)                      │
│  • model_recall: Recall du modèle (rolling 24h)                            │
│  • model_f1_score: F1-Score (rolling 24h)                                  │
│  • prediction_latency_p99: Latence P99 des prédictions                     │
│  • feature_drift_score: Score de dérive des features                       │
│  • prediction_drift_score: Score de dérive des prédictions                 │
│                                                                             │
│  Infrastructure Metrics:                                                    │
│  • request_count: Nombre de requêtes par service                           │
│  • request_latency: Latence par service                                    │
│  • error_rate: Taux d'erreur par service                                   │
│  • cpu_utilization: Utilisation CPU                                        │
│  • memory_utilization: Utilisation mémoire                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          LOGGING (Cloud Logging)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Log Sinks:                                                                 │
│  • fraudshield-app-logs → BigQuery (analytics)                             │
│  • fraudshield-audit-logs → Cloud Storage (compliance, 5 years)            │
│  • fraudshield-security-logs → Chronicle SIEM                              │
│                                                                             │
│  Structured Log Format:                                                     │
│  {                                                                          │
│    "severity": "INFO",                                                      │
│    "timestamp": "2025-12-24T10:30:00Z",                                    │
│    "service": "scoring-service",                                            │
│    "trace_id": "abc123",                                                    │
│    "span_id": "def456",                                                     │
│    "message": "Transaction scored",                                         │
│    "context": {                                                             │
│      "transaction_id": "TXN-001",                                          │
│      "risk_score": 0.87,                                                    │
│      "decision": "FLAG",                                                    │
│      "latency_ms": 245                                                      │
│    }                                                                        │
│  }                                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          TRACING (Cloud Trace)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Distributed Tracing Flow:                                                  │
│                                                                             │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐  │
│  │ Client  │───▶│ Gateway │───▶│ Intake  │───▶│ Scoring │───▶│ AlloyDB │  │
│  │         │    │         │    │         │    │         │    │         │  │
│  │ span-0  │    │ span-1  │    │ span-2  │    │ span-3  │    │ span-4  │  │
│  └─────────┘    └─────────┘    └─────────┘    └────┬────┘    └─────────┘  │
│                                                    │                       │
│                                               ┌────┴────┐                  │
│                                               │ Vertex  │                  │
│                                               │   AI    │                  │
│                                               │ span-5  │                  │
│                                               └─────────┘                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          ALERTING                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Critical Alerts (PagerDuty):                                               │
│  • Service down > 5 minutes                                                 │
│  • Error rate > 5%                                                          │
│  • Model drift score > 0.3                                                  │
│  • False negative rate > 10%                                                │
│                                                                             │
│  Warning Alerts (Slack):                                                    │
│  • Latency P99 > 1s                                                         │
│  • Feature drift detected                                                   │
│  • Unusual spike in flagged transactions                                    │
│                                                                             │
│  Informational (Email):                                                     │
│  • Daily performance report                                                 │
│  • Weekly model metrics summary                                             │
│  • Monthly compliance audit                                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Coûts Estimés (GCP)

| Service | Configuration | Coût Mensuel Estimé |
|---------|---------------|---------------------|
| Cloud Run | 10 services, avg 5 instances | 2,000€ |
| GKE Autopilot | 3 nodes GPU (T4) | 3,500€ |
| Vertex AI | Training + Endpoints | 4,000€ |
| BigQuery | 10TB storage, 100TB queries | 1,500€ |
| AlloyDB | 2 instances (HA) | 2,000€ |
| Cloud Storage | 5TB | 100€ |
| Networking | Egress, Load Balancing | 500€ |
| Monitoring | Logging, Metrics | 300€ |
| **Total Estimé** | | **~14,000€/mois** |

---

## 11. Prochaines Étapes

1. **Phase 1 (M1-M2)** : Setup infrastructure de base (Terraform)
2. **Phase 2 (M3-M4)** : Développement services core (Intake, Scoring)
3. **Phase 3 (M5-M6)** : Intégration agents AI (Google Agent Builder)
4. **Phase 4 (M7-M8)** : MCP Servers et orchestration
5. **Phase 5 (M9-M10)** : Tests, sécurité, compliance
6. **Phase 6 (M11-M12)** : Déploiement production, formation

---

**Document rédigé par** : FraudShield AI Architecture Team
**Dernière mise à jour** : Décembre 2025
