"""
FraudShield AI - Model Configuration
Configuration for LLM and ML models used in fraud detection
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any


@dataclass
class ModelConfig:
    """Configuration for AI models"""

    # Primary LLM for orchestration
    orchestrator_model: str = "gemini-flash-latest"

    # Vision-capable model for document analysis
    vision_model: str = "gemini-flash-latest"

    # Fast model for simple tasks
    fast_model: str = "gemini-flash-latest"

    # Embedding model for semantic encoding
    embedding_model: str = "text-embedding-004"
    embedding_dimension: int = 768

    # Temperature settings per agent type
    temperatures: Dict[str, float] = field(default_factory=lambda: {
        "orchestrator": 0.1,  # Low temp for consistent routing
        "analyzer": 0.2,       # Slightly higher for analysis
        "explainer": 0.4,      # Higher for natural explanations
        "detector": 0.0,       # Zero for deterministic scoring
    })

    # Max tokens per agent type
    max_tokens: Dict[str, int] = field(default_factory=lambda: {
        "orchestrator": 2048,
        "analyzer": 4096,
        "explainer": 8192,
        "detector": 512,
    })

    # Safety settings
    safety_settings: Dict[str, str] = field(default_factory=lambda: {
        "HARM_CATEGORY_HARASSMENT": "BLOCK_NONE",
        "HARM_CATEGORY_HATE_SPEECH": "BLOCK_NONE",
        "HARM_CATEGORY_SEXUALLY_EXPLICIT": "BLOCK_NONE",
        "HARM_CATEGORY_DANGEROUS_CONTENT": "BLOCK_NONE",
    })


@dataclass
class FeatureConfig:
    """Configuration for feature engineering"""

    # Structured features to extract
    structured_features: List[str] = field(default_factory=lambda: [
        "amount_normalized",
        "hour_of_day",
        "day_of_week",
        "days_since_last_claim",
        "claim_frequency_30d",
        "avg_claim_amount",
        "type_encoded",
        "provider_risk_score",
        "beneficiary_tenure_months",
        "documents_count",
    ])

    # Graph features from network analysis
    graph_features: List[str] = field(default_factory=lambda: [
        "shared_providers_count",
        "network_centrality",
        "community_risk_score",
        "unusual_connections_count",
    ])

    # Document features from vision analysis
    document_features: List[str] = field(default_factory=lambda: [
        "document_authenticity_score",
        "ocr_confidence",
        "entity_consistency_score",
        "metadata_anomaly_score",
    ])

    # Total state dimension (embedding + structured + graph + document)
    @property
    def total_state_dim(self) -> int:
        return (
            768 +  # LLM embedding dimension
            len(self.structured_features) +
            len(self.graph_features) +
            len(self.document_features)
        )


# Transaction serialization template for LLM encoding
TRANSACTION_TEMPLATE = """
Demande de {type} soumise le {date} à {time}.
Bénéficiaire: {beneficiary_name} (ID: {beneficiary_id}), inscrit depuis {tenure_months} mois.
Montant demandé: {amount}€
Prestataire: {provider_name} (ID: {provider_id})
Score de risque prestataire: {provider_risk_score:.2f}
Description: {description}
Nombre de documents joints: {documents_count}
Historique 30 jours: {claims_30d} demandes pour un total de {total_30d}€
Dernière demande il y a {days_since_last} jours
"""

# Fraud type taxonomy for French social protection
FRAUD_TYPES = {
    "prestations_sante": {
        "name": "Fraude aux prestations santé",
        "subtypes": [
            "surfacturation_actes",
            "prestations_fictives",
            "cumul_abusif",
            "falsification_ordonnances",
            "entente_frauduleuse_ps",
        ]
    },
    "retraite_prevoyance": {
        "name": "Fraude retraite et prévoyance",
        "subtypes": [
            "declaration_deces_tardive",
            "faux_certificat_vie",
            "usurpation_identite",
            "fraude_reversion",
            "fausse_invalidite",
        ]
    },
    "documentaire": {
        "name": "Fraude documentaire",
        "subtypes": [
            "falsification_rib",
            "faux_justificatifs",
            "certificats_complaisance",
            "manipulation_dates",
            "documents_contrefaits",
        ]
    },
    "cotisations": {
        "name": "Fraude aux cotisations",
        "subtypes": [
            "sous_declaration_masse_salariale",
            "optimisation_dsn_abusive",
            "travail_dissimule",
            "faux_statut_independant",
        ]
    }
}


# Known fraud patterns for pattern detection
FRAUD_PATTERNS = [
    {
        "id": "PATTERN_001",
        "name": "Cascade de remboursements",
        "description": "Multiples demandes de petits montants sur une courte période",
        "indicators": ["claim_frequency_30d > 10", "avg_claim_amount < 100"],
        "risk_weight": 0.7
    },
    {
        "id": "PATTERN_002",
        "name": "Nouveau prestataire à risque",
        "description": "Demande importante vers un nouveau prestataire non vérifié",
        "indicators": ["provider_tenure < 30", "amount > 1000", "provider_risk_score > 0.5"],
        "risk_weight": 0.8
    },
    {
        "id": "PATTERN_003",
        "name": "Pic inhabituel de dépenses",
        "description": "Montant significativement supérieur à l'historique",
        "indicators": ["amount > avg_claim_amount * 5"],
        "risk_weight": 0.6
    },
    {
        "id": "PATTERN_004",
        "name": "Réseau suspect",
        "description": "Bénéficiaire lié à d'autres cas de fraude confirmés",
        "indicators": ["community_risk_score > 0.7", "shared_providers_count > 3"],
        "risk_weight": 0.9
    },
    {
        "id": "PATTERN_005",
        "name": "Documents suspects",
        "description": "Anomalies détectées dans les documents soumis",
        "indicators": ["document_authenticity_score < 0.7", "metadata_anomaly_score > 0.5"],
        "risk_weight": 0.85
    },
]
