"""
FraudShield AI - Configuration Settings
Environment and application configuration management
"""

import os
from dataclasses import dataclass, field
from typing import Optional, Dict, Any
from functools import lru_cache


@dataclass
class Settings:
    """Application settings loaded from environment variables"""

    # Google Cloud Configuration
    project_id: str = field(default_factory=lambda: os.getenv("GCP_PROJECT_ID", "fraudshield-prod"))
    region: str = field(default_factory=lambda: os.getenv("GCP_REGION", "europe-west1"))

    # Gemini Model Configuration
    gemini_model: str = field(default_factory=lambda: os.getenv("GEMINI_MODEL", "gemini-flash-latest"))
    gemini_pro_model: str = field(default_factory=lambda: os.getenv("GEMINI_PRO_MODEL", "gemini-flash-latest"))
    gemini_vision_model: str = field(default_factory=lambda: os.getenv("GEMINI_VISION_MODEL", "gemini-flash-latest"))
    embedding_model: str = field(default_factory=lambda: os.getenv("EMBEDDING_MODEL", "text-embedding-004"))

    # API Keys
    google_api_key: Optional[str] = field(default_factory=lambda: os.getenv("GOOGLE_API_KEY"))
    use_vertex_ai: bool = field(default_factory=lambda: os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "TRUE").upper() == "TRUE")

    # Database Configuration
    alloydb_connection: str = field(default_factory=lambda: os.getenv("ALLOYDB_CONNECTION", ""))
    bigquery_dataset: str = field(default_factory=lambda: os.getenv("BIGQUERY_DATASET", "fraud_detection"))
    neo4j_uri: str = field(default_factory=lambda: os.getenv("NEO4J_URI", ""))
    neo4j_user: str = field(default_factory=lambda: os.getenv("NEO4J_USER", "neo4j"))
    neo4j_password: str = field(default_factory=lambda: os.getenv("NEO4J_PASSWORD", ""))
    redis_host: str = field(default_factory=lambda: os.getenv("REDIS_HOST", "localhost"))
    redis_port: int = field(default_factory=lambda: int(os.getenv("REDIS_PORT", "6379")))

    # MCP Server Configuration
    mcp_database_url: str = field(default_factory=lambda: os.getenv("MCP_DATABASE_URL", "http://localhost:8001"))
    mcp_documents_url: str = field(default_factory=lambda: os.getenv("MCP_DOCUMENTS_URL", "http://localhost:8002"))
    mcp_external_apis_url: str = field(default_factory=lambda: os.getenv("MCP_EXTERNAL_APIS_URL", "http://localhost:8003"))
    mcp_ml_models_url: str = field(default_factory=lambda: os.getenv("MCP_ML_MODELS_URL", "http://localhost:8004"))

    # A2A Configuration
    a2a_server_port: int = field(default_factory=lambda: int(os.getenv("A2A_SERVER_PORT", "8080")))
    a2a_base_url: str = field(default_factory=lambda: os.getenv("A2A_BASE_URL", "http://localhost:8080"))

    # Fraud Detection Thresholds
    high_risk_threshold: float = field(default_factory=lambda: float(os.getenv("HIGH_RISK_THRESHOLD", "0.7")))
    medium_risk_threshold: float = field(default_factory=lambda: float(os.getenv("MEDIUM_RISK_THRESHOLD", "0.3")))
    auto_approve_threshold: float = field(default_factory=lambda: float(os.getenv("AUTO_APPROVE_THRESHOLD", "0.1")))

    # Cost-Sensitive Learning Parameters
    false_negative_cost: float = field(default_factory=lambda: float(os.getenv("FN_COST", "-50")))
    false_positive_cost: float = field(default_factory=lambda: float(os.getenv("FP_COST", "-5")))
    true_positive_reward: float = field(default_factory=lambda: float(os.getenv("TP_REWARD", "10")))
    true_negative_reward: float = field(default_factory=lambda: float(os.getenv("TN_REWARD", "1")))

    # External APIs
    rnipp_api_url: str = field(default_factory=lambda: os.getenv("RNIPP_API_URL", ""))
    insee_api_url: str = field(default_factory=lambda: os.getenv("INSEE_API_URL", ""))

    # Feature Store
    feature_store_id: str = field(default_factory=lambda: os.getenv("FEATURE_STORE_ID", "fraud_detection_features"))

    # Logging
    log_level: str = field(default_factory=lambda: os.getenv("LOG_LEVEL", "INFO"))

    # RL Configuration
    EMBEDDING_DIM: int = field(default_factory=lambda: int(os.getenv("EMBEDDING_DIM", "768")))
    RL_LEARNING_RATE: float = field(default_factory=lambda: float(os.getenv("RL_LEARNING_RATE", "0.0001")))
    RL_GAMMA: float = field(default_factory=lambda: float(os.getenv("RL_GAMMA", "0.99")))
    RL_ENTROPY_COEF: float = field(default_factory=lambda: float(os.getenv("RL_ENTROPY_COEF", "0.01")))

    def to_dict(self) -> Dict[str, Any]:
        """Convert settings to dictionary (excluding sensitive values)"""
        return {
            "project_id": self.project_id,
            "region": self.region,
            "gemini_model": self.gemini_model,
            "use_vertex_ai": self.use_vertex_ai,
            "high_risk_threshold": self.high_risk_threshold,
            "medium_risk_threshold": self.medium_risk_threshold,
            "log_level": self.log_level,
        }


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
