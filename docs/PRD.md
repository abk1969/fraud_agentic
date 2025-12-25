# PRD - FraudShield AI Platform
## Plateforme Agentic AI de Détection de Fraude pour Groupes de Protection Sociale

**Version:** 1.0
**Date:** Décembre 2025
**Statut:** Draft
**Destinataires:** Direction Métier, DSI, Équipes Conformité

---

## 1. Vision Produit

### 1.1 Contexte Métier

Les groupes de protection sociale français (retraite complémentaire, prévoyance, santé) font face à des pertes annuelles significatives dues à la fraude :
- **Fraude aux prestations** : fausses déclarations de sinistres, usurpation d'identité
- **Fraude documentaire** : falsification de justificatifs, certificats médicaux frauduleux
- **Fraude aux cotisations** : sous-déclaration, travail dissimulé
- **Fraude interne** : détournements, manipulations de dossiers

Le taux de fraude dans le secteur est estimé entre **0.1% et 0.5%** des flux traités, avec un **coût asymétrique** : un faux négatif (fraude manquée) coûte 10 à 50 fois plus qu'un faux positif (fausse alerte).

### 1.2 Vision

**FraudShield AI** est une plateforme autonome de détection de fraude qui combine :
- **Intelligence sémantique** : compréhension profonde des dossiers (textes, documents, images)
- **Apprentissage adaptatif** : ajustement continu aux nouvelles tactiques frauduleuses
- **Optimisation métier** : alignement direct avec les coûts opérationnels réels
- **Architecture agentique** : orchestration autonome de tâches complexes multi-étapes

### 1.3 Proposition de Valeur

| Pour | Bénéfice |
|------|----------|
| **Gestionnaires de prestations** | Alertes contextualisées avec explication, priorisation automatique |
| **Équipes fraude** | Détection proactive, réduction du temps d'investigation de 60% |
| **Direction financière** | Réduction des pertes de 40%, ROI mesurable |
| **Conformité/RGPD** | Traçabilité complète, explicabilité des décisions |

---

## 2. Objectifs et KPIs

### 2.1 Objectifs Stratégiques

| Objectif | Cible | Horizon |
|----------|-------|---------|
| Taux de détection (Recall) | > 95% | 12 mois |
| Précision des alertes | > 85% | 12 mois |
| Réduction des pertes fraude | -40% | 18 mois |
| Temps moyen de traitement dossier suspect | -60% | 12 mois |
| Couverture des typologies de fraude | 100% | 18 mois |

### 2.2 KPIs Opérationnels

**Détection**
- F1-Score global : > 0.90
- AUPRC (Area Under Precision-Recall Curve) : > 0.85
- Taux de faux négatifs : < 5%
- Taux de faux positifs : < 15%

**Performance**
- Latence temps réel : < 500ms par transaction
- Throughput : > 10,000 dossiers/heure
- Disponibilité : 99.9%

**Adoption**
- Taux d'utilisation gestionnaires : > 80%
- Score NPS utilisateurs : > 40
- Taux d'escalade manuelle : < 10%

---

## 3. Périmètre Fonctionnel

### 3.1 Typologies de Fraude Couvertes

#### 3.1.1 Fraude aux Prestations Santé
- Surfacturation d'actes médicaux
- Prestations fictives
- Cumul abusif de remboursements
- Falsification d'ordonnances

#### 3.1.2 Fraude Retraite/Prévoyance
- Déclaration de décès tardive (maintien indu de pension)
- Faux certificats de vie
- Usurpation d'identité de bénéficiaires
- Fraude à la réversion

#### 3.1.3 Fraude Documentaire
- Documents falsifiés (RIB, justificatifs de domicile)
- Certificats médicaux de complaisance
- Manipulation de dates/montants

#### 3.1.4 Fraude aux Cotisations
- Sous-déclaration de masse salariale
- Optimisation abusive de la DSN
- Travail dissimulé

### 3.2 Modules Fonctionnels

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRAUDSHIELD AI PLATFORM                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   INTAKE     │  │   ANALYZE    │  │      DECIDE          │  │
│  │   MODULE     │  │   MODULE     │  │      MODULE          │  │
│  ├──────────────┤  ├──────────────┤  ├──────────────────────┤  │
│  │ • Ingestion  │  │ • Scoring    │  │ • Classification     │  │
│  │ • Validation │  │ • Embedding  │  │ • Routing            │  │
│  │ • Enrichment │  │ • Patterns   │  │ • Recommendation     │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   EXPLAIN    │  │   LEARN      │  │      ORCHESTRATE     │  │
│  │   MODULE     │  │   MODULE     │  │      MODULE          │  │
│  ├──────────────┤  ├──────────────┤  ├──────────────────────┤  │
│  │ • XAI        │  │ • Feedback   │  │ • Agent Coordinator  │  │
│  │ • Reporting  │  │ • Retrain    │  │ • Workflow Engine    │  │
│  │ • Audit      │  │ • Drift Det. │  │ • MCP Servers        │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Spécifications Fonctionnelles Détaillées

### 4.1 Module INTAKE - Ingestion Multi-Sources

**Capacités :**
- Connexion aux SI métier (Gestion Prestations, DSN, GED)
- Ingestion temps réel via API et batch
- Support multimodal : JSON, XML, PDF, images, audio

**Fonctionnalités :**

| ID | Fonctionnalité | Description | Priorité |
|----|----------------|-------------|----------|
| INT-01 | Connecteur DSN | Import automatique des déclarations sociales | P0 |
| INT-02 | Connecteur Prestations | Flux temps réel des demandes de remboursement | P0 |
| INT-03 | OCR Intelligent | Extraction de données depuis documents scannés | P0 |
| INT-04 | Validation Schéma | Contrôle de conformité des données entrantes | P1 |
| INT-05 | Enrichissement Externe | Appel APIs externes (RNIPP, INSEE, etc.) | P1 |

### 4.2 Module ANALYZE - Analyse Sémantique et Scoring

**Capacités :**
- Transformation des données hétérogènes en embeddings unifiés
- Scoring de risque multi-facteurs
- Détection d'anomalies comportementales

**Fonctionnalités :**

| ID | Fonctionnalité | Description | Priorité |
|----|----------------|-------------|----------|
| ANA-01 | Sérialisation Sémantique | Template-based transformation texte → embedding | P0 |
| ANA-02 | Scoring Temps Réel | Calcul du score de risque < 500ms | P0 |
| ANA-03 | Détection Patterns | Identification de schémas frauduleux connus | P0 |
| ANA-04 | Analyse Réseau | Graphe de relations entre entités | P1 |
| ANA-05 | Analyse Documents | Vision AI pour détection falsification | P1 |

### 4.3 Module DECIDE - Classification et Routage

**Capacités :**
- Classification binaire (fraude/non-fraude) optimisée coût métier
- Routing intelligent vers les bonnes équipes
- Recommandations d'actions

**Fonction de Récompense Métier :**

```
R(action, réalité) =
  +10  si action=FLAG   et réalité=FRAUDE     (True Positive)
  +1   si action=PASS   et réalité=LÉGITIME   (True Negative)
  -5   si action=FLAG   et réalité=LÉGITIME   (False Positive)
  -50  si action=PASS   et réalité=FRAUDE     (False Negative)
```

**Fonctionnalités :**

| ID | Fonctionnalité | Description | Priorité |
|----|----------------|-------------|----------|
| DEC-01 | Classification RL | Agent A2C optimisé coûts asymétriques | P0 |
| DEC-02 | Seuils Dynamiques | Ajustement automatique des seuils de décision | P0 |
| DEC-03 | Routing Intelligent | Affectation automatique aux équipes compétentes | P1 |
| DEC-04 | Recommandations | Suggestions d'actions aux gestionnaires | P1 |

### 4.4 Module EXPLAIN - Explicabilité et Audit

**Capacités :**
- Explication des décisions en langage naturel
- Visualisation des facteurs de risque
- Traçabilité complète pour audit

**Fonctionnalités :**

| ID | Fonctionnalité | Description | Priorité |
|----|----------------|-------------|----------|
| EXP-01 | XAI Temps Réel | Explication automatique de chaque décision | P0 |
| EXP-02 | Attention Weights | Visualisation des éléments déterminants | P1 |
| EXP-03 | Rapport Investigation | Génération automatique de rapports | P1 |
| EXP-04 | Audit Trail | Journalisation complète RGPD-compliant | P0 |

### 4.5 Module LEARN - Apprentissage Continu

**Capacités :**
- Intégration du feedback des analystes
- Détection de concept drift
- Réentraînement automatique

**Fonctionnalités :**

| ID | Fonctionnalité | Description | Priorité |
|----|----------------|-------------|----------|
| LRN-01 | Feedback Loop | Capture des décisions finales des analystes | P0 |
| LRN-02 | Drift Detection | Monitoring de la dérive des performances | P0 |
| LRN-03 | Auto-Retrain | Réentraînement automatique planifié | P1 |
| LRN-04 | A/B Testing | Comparaison de modèles en production | P2 |

### 4.6 Module ORCHESTRATE - Orchestration Agentique

**Capacités :**
- Coordination d'agents AI spécialisés
- Exécution de workflows complexes multi-étapes
- Intégration MCP (Model Context Protocol)

**Fonctionnalités :**

| ID | Fonctionnalité | Description | Priorité |
|----|----------------|-------------|----------|
| ORC-01 | Agent Coordinator | Orchestration des agents spécialisés | P0 |
| ORC-02 | MCP Integration | Serveurs MCP pour outils externes | P0 |
| ORC-03 | Workflow Engine | Moteur de workflows configurables | P1 |
| ORC-04 | Human-in-Loop | Escalade et validation humaine | P0 |

---

## 5. Agents AI Spécialisés

### 5.1 Architecture Agentique

```
                    ┌─────────────────────┐
                    │   ORCHESTRATOR      │
                    │   (Main Agent)      │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  DOCUMENT     │    │  TRANSACTION  │    │  IDENTITY     │
│  ANALYST      │    │  ANALYST      │    │  VERIFIER     │
│  AGENT        │    │  AGENT        │    │  AGENT        │
└───────────────┘    └───────────────┘    └───────────────┘
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  PATTERN      │    │  NETWORK      │    │  EXPLANATION  │
│  DETECTOR     │    │  ANALYZER     │    │  GENERATOR    │
│  AGENT        │    │  AGENT        │    │  AGENT        │
└───────────────┘    └───────────────┘    └───────────────┘
```

### 5.2 Spécification des Agents

#### Agent 1: Document Analyst
- **Rôle** : Analyse multimodale des documents (PDF, images)
- **Capacités** : OCR, détection de falsification, extraction d'entités
- **Outils** : Gemini Flash (multimodal), Document AI, Cloud Vision API

#### Agent 2: Transaction Analyst
- **Rôle** : Analyse des flux financiers et patterns transactionnels
- **Capacités** : Scoring, détection d'anomalies, sérialisation sémantique
- **Outils** : Gemini Flash, BigQuery ML, Vertex AI

#### Agent 3: Identity Verifier
- **Rôle** : Vérification d'identité et détection d'usurpation
- **Capacités** : Cross-référencement, vérification biométrique
- **Outils** : APIs externes (RNIPP, INSEE), Face Match

#### Agent 4: Pattern Detector
- **Rôle** : Détection de schémas frauduleux complexes
- **Capacités** : Analyse séquentielle, détection de réseaux
- **Outils** : Graph Neural Networks, Temporal Analysis

#### Agent 5: Network Analyzer
- **Rôle** : Analyse des relations entre entités
- **Capacités** : Community detection, influence scoring
- **Outils** : Neo4j, Graph Analytics

#### Agent 6: Explanation Generator
- **Rôle** : Génération d'explications en langage naturel
- **Capacités** : XAI, rapport automatique, synthèse
- **Outils** : Gemini Flash, RAG, Template Engine

---

## 6. Parcours Utilisateurs

### 6.1 Gestionnaire de Prestations

```
┌─────────────────────────────────────────────────────────────────┐
│  PARCOURS : Traitement d'une demande de remboursement           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Réception demande ──► 2. Scoring automatique               │
│         │                        │                              │
│         │                        ▼                              │
│         │                 ┌─────────────┐                       │
│         │                 │ Score Risque │                      │
│         │                 │   = 0.87     │                      │
│         │                 └──────┬──────┘                       │
│         │                        │                              │
│         │         ┌──────────────┼──────────────┐               │
│         │         ▼              ▼              ▼               │
│         │    [VERT]         [ORANGE]        [ROUGE]             │
│         │    Auto-OK        Revue rapide    Investigation       │
│         │                        │              │               │
│         │                        ▼              ▼               │
│         │                 3. Affichage      4. Dossier          │
│         │                    alerte         enrichi             │
│         │                        │              │               │
│         │                        ▼              ▼               │
│         │                 5. Décision      6. Escalade          │
│         │                    gestionnaire      équipe fraude    │
│         │                        │              │               │
│         │                        ▼              ▼               │
│         └────────────────► 7. Feedback dans système             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Analyste Fraude

```
┌─────────────────────────────────────────────────────────────────┐
│  PARCOURS : Investigation d'un dossier suspect                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Dashboard alertes ──► 2. Sélection dossier prioritaire     │
│                                   │                             │
│                                   ▼                             │
│                          ┌───────────────┐                      │
│                          │ Vue 360° du   │                      │
│                          │ dossier       │                      │
│                          └───────┬───────┘                      │
│                                  │                              │
│         ┌────────────────────────┼────────────────────────┐     │
│         ▼                        ▼                        ▼     │
│  ┌─────────────┐         ┌─────────────┐         ┌───────────┐ │
│  │ Historique  │         │ Documents   │         │ Réseau    │ │
│  │ transactions│         │ associés    │         │ relations │ │
│  └─────────────┘         └─────────────┘         └───────────┘ │
│         │                        │                        │     │
│         └────────────────────────┼────────────────────────┘     │
│                                  ▼                              │
│                          3. Explication IA                      │
│                          "Facteurs de risque identifiés..."     │
│                                  │                              │
│                                  ▼                              │
│                          4. Actions assistées                   │
│                          • Demander justificatifs               │
│                          • Bloquer paiement                     │
│                          • Transférer juridique                 │
│                                  │                              │
│                                  ▼                              │
│                          5. Décision + Feedback                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Exigences Non-Fonctionnelles

### 7.1 Performance

| Métrique | Exigence | Justification |
|----------|----------|---------------|
| Latence scoring | < 500ms P99 | Expérience utilisateur temps réel |
| Throughput | > 10K dossiers/h | Pics de charge mensuels |
| Disponibilité | 99.9% | Criticité métier |
| RTO | 4h | Continuité d'activité |
| RPO | 1h | Perte de données acceptable |

### 7.2 Sécurité

| Exigence | Description |
|----------|-------------|
| Chiffrement | TLS 1.3 en transit, AES-256 au repos |
| Authentification | SSO avec MFA obligatoire |
| Autorisation | RBAC granulaire par module |
| Audit | Journalisation complète, rétention 5 ans |
| Isolation | Données cloisonnées par entité juridique |

### 7.3 Conformité RGPD

| Exigence | Implémentation |
|----------|----------------|
| Minimisation | Collecte strictement nécessaire |
| Limitation durée | Purge automatique selon politique |
| Droit à l'explication | XAI intégré à chaque décision |
| Portabilité | Export des données sur demande |
| Effacement | Procédure automatisée de suppression |

### 7.4 Scalabilité

- **Horizontale** : Auto-scaling Kubernetes 1-100 pods
- **Verticale** : GPU scaling pour inférence batch
- **Data** : Partitionnement BigQuery par date/entité

---

## 8. Intégrations

### 8.1 Systèmes Internes

| Système | Type | Protocole | Description |
|---------|------|-----------|-------------|
| Gestion Prestations | Bidirectionnel | REST API | Flux demandes + décisions |
| DSN/DPAE | Entrée | SFTP + API | Déclarations sociales |
| GED | Bidirectionnel | API | Documents et métadonnées |
| CRM | Sortie | Webhook | Alertes et notifications |
| Data Warehouse | Sortie | BigQuery | Reporting et analytics |

### 8.2 Services Externes

| Service | Usage | Fréquence |
|---------|-------|-----------|
| RNIPP (INSEE) | Vérification identité | Temps réel |
| Base Entreprises | Validation SIRET | Temps réel |
| Listes sanctions | Compliance | Quotidien |
| APIs bancaires | Vérification RIB | Temps réel |

### 8.3 MCP Servers

| Server | Fonction |
|--------|----------|
| mcp-database | Accès sécurisé aux bases de données |
| mcp-documents | Manipulation de documents |
| mcp-external-apis | Appels APIs tierces |
| mcp-notifications | Envoi d'alertes et notifications |

---

## 9. Roadmap

### Phase 1 - MVP (M1-M6)
- Module INTAKE : connecteurs DSN + Prestations
- Module ANALYZE : scoring temps réel
- Module DECIDE : classification RL basique
- Module EXPLAIN : XAI minimal
- 1 typologie de fraude (prestations santé)

### Phase 2 - Core (M7-M12)
- Module LEARN : feedback loop + drift detection
- Module ORCHESTRATE : agent coordinator
- Agents : Document + Transaction + Explanation
- 3 typologies de fraude
- Dashboard complet

### Phase 3 - Advanced (M13-M18)
- Tous les agents spécialisés
- Analyse réseau (graphes)
- 100% des typologies
- Auto-retrain
- Multi-entités juridiques

### Phase 4 - Scale (M19-M24)
- Optimisation performance
- Internationalisation
- API partenaires
- Marketplace de modèles

---

## 10. Risques et Mitigations

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Qualité données insuffisante | Élevé | Moyenne | Data quality pipeline, enrichissement |
| Résistance utilisateurs | Moyen | Moyenne | Change management, UX soignée |
| Dérive modèle (concept drift) | Élevé | Haute | Monitoring continu, auto-retrain |
| Non-conformité RGPD | Critique | Faible | Privacy by design, DPO impliqué |
| Attaques adversariales | Élevé | Faible | Robustness testing, monitoring |

---

## 11. Équipe et Gouvernance

### 11.1 Équipe Projet

| Rôle | Responsabilité |
|------|----------------|
| Product Owner | Vision produit, priorisation |
| Tech Lead AI | Architecture ML/RL |
| Data Engineers (3) | Pipelines, infrastructure |
| ML Engineers (3) | Modèles, entraînement |
| Backend Developers (3) | APIs, services |
| Frontend Developer (2) | Interface utilisateur |
| DevOps/MLOps (2) | Infrastructure, CI/CD |
| Data Analyst (1) | Métriques, reporting |

### 11.2 Gouvernance

- **Comité Projet** : Hebdomadaire
- **Comité de Pilotage** : Mensuel
- **Revue Éthique IA** : Trimestrielle
- **Audit Sécurité** : Semestriel

---

## 12. Budget Estimatif

### 12.1 Coûts Initiaux (Année 1)

| Poste | Montant (K€) |
|-------|--------------|
| Équipe (12 ETP) | 1,200 |
| Infrastructure Cloud | 300 |
| Licences (Vertex AI, etc.) | 200 |
| Formation | 50 |
| Consulting sécurité/conformité | 100 |
| **Total** | **1,850** |

### 12.2 Coûts Récurrents (Année 2+)

| Poste | Montant (K€/an) |
|-------|-----------------|
| Équipe maintenance (6 ETP) | 600 |
| Infrastructure Cloud | 400 |
| Licences | 200 |
| Support et évolutions | 200 |
| **Total** | **1,400** |

### 12.3 ROI Estimé

- **Pertes fraude évitées** : 2-4 M€/an
- **Gains productivité** : 500 K€/an
- **ROI Année 2** : 150-200%

---

## 13. Critères de Succès

### 13.1 Go/No-Go Phase 1

| Critère | Seuil |
|---------|-------|
| Recall sur fraudes connues | > 90% |
| Précision | > 75% |
| Latence P99 | < 1s |
| Adoption pilote | > 50% utilisateurs actifs |
| Zéro incident sécurité | 0 |

### 13.2 Succès Global (18 mois)

| Critère | Cible |
|---------|-------|
| Réduction pertes fraude | -40% |
| NPS utilisateurs | > 40 |
| Couverture typologies | 100% |
| Temps investigation | -60% |

---

## Annexes

### A. Glossaire

| Terme | Définition |
|-------|------------|
| DSN | Déclaration Sociale Nominative |
| XAI | Explainable AI - Intelligence Artificielle Explicable |
| MCP | Model Context Protocol |
| RL | Reinforcement Learning |
| A2C | Advantage Actor-Critic (algorithme RL) |
| Concept Drift | Dérive des patterns de fraude dans le temps |

### B. Références Réglementaires

- RGPD (Règlement UE 2016/679)
- Directive Solvabilité II
- Code de la Sécurité Sociale
- Recommandations CNIL sur l'IA

---

**Document rédigé par** : FraudShield AI Product Team
**Dernière mise à jour** : Décembre 2025
**Prochaine revue** : Janvier 2026
