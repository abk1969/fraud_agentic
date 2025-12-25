"""
FraudShield AI - Fraud Detection MCP Server
Exposes core fraud detection tools via MCP protocol

Provides:
- Transaction scoring
- Pattern matching
- Anomaly detection
- Risk classification
"""

from typing import Dict, Any, List, Optional
from datetime import datetime

from ..tools.fraud_tools import (
    serialize_transaction,
    compute_embedding,
    detect_anomalies,
    match_fraud_patterns,
    score_transaction,
    classify_risk_level,
)


class FraudMCPServer:
    """
    MCP Server for fraud detection operations.

    Exposes the core LLM+RL fraud detection capabilities:
    - Transaction serialization for LLM encoding
    - Embedding computation
    - Pattern matching
    - Anomaly detection
    - Risk scoring
    """

    def __init__(self):
        """Initialize fraud detection server."""
        self.server_name = "fraudshield-fraud"
        self.version = "1.0.0"

    def get_tools_manifest(self) -> Dict[str, Any]:
        """Return MCP tools manifest."""
        return {
            "name": self.server_name,
            "version": self.version,
            "tools": [
                {
                    "name": "serialize_transaction",
                    "description": "Serialize transaction to natural language for LLM encoding",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "transaction": {
                                "type": "object",
                                "description": "Transaction data to serialize"
                            }
                        },
                        "required": ["transaction"]
                    }
                },
                {
                    "name": "compute_embedding",
                    "description": "Compute semantic embedding for transaction text",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "text": {"type": "string"},
                            "model": {"type": "string", "default": "text-embedding-004"}
                        },
                        "required": ["text"]
                    }
                },
                {
                    "name": "detect_anomalies",
                    "description": "Detect statistical anomalies in transaction",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "transaction": {"type": "object"},
                            "historical_stats": {"type": "object"}
                        },
                        "required": ["transaction"]
                    }
                },
                {
                    "name": "match_patterns",
                    "description": "Match transaction against known fraud patterns",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "transaction": {"type": "object"}
                        },
                        "required": ["transaction"]
                    }
                },
                {
                    "name": "score_transaction",
                    "description": "Compute fraud probability score for transaction",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "transaction": {"type": "object"},
                            "embedding": {"type": "array", "items": {"type": "number"}},
                            "structured_features": {"type": "object"}
                        },
                        "required": ["transaction"]
                    }
                },
                {
                    "name": "classify_risk",
                    "description": "Classify risk level from fraud score",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "score": {"type": "number"}
                        },
                        "required": ["score"]
                    }
                },
                {
                    "name": "batch_score",
                    "description": "Score multiple transactions in batch",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "transactions": {
                                "type": "array",
                                "items": {"type": "object"}
                            }
                        },
                        "required": ["transactions"]
                    }
                },
                {
                    "name": "get_model_info",
                    "description": "Get information about the fraud detection model",
                    "inputSchema": {
                        "type": "object",
                        "properties": {}
                    }
                }
            ]
        }

    async def handle_tool_call(
        self,
        tool_name: str,
        arguments: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle incoming MCP tool call."""
        handlers = {
            "serialize_transaction": self._serialize_transaction,
            "compute_embedding": self._compute_embedding,
            "detect_anomalies": self._detect_anomalies,
            "match_patterns": self._match_patterns,
            "score_transaction": self._score_transaction,
            "classify_risk": self._classify_risk,
            "batch_score": self._batch_score,
            "get_model_info": self._get_model_info,
        }

        handler = handlers.get(tool_name)
        if not handler:
            return {"error": f"Unknown tool: {tool_name}"}

        return await handler(**arguments)

    async def _serialize_transaction(
        self,
        transaction: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Serialize transaction to natural language."""
        return serialize_transaction(transaction)

    async def _compute_embedding(
        self,
        text: str,
        model: str = "text-embedding-004"
    ) -> Dict[str, Any]:
        """Compute semantic embedding."""
        return compute_embedding(text, model)

    async def _detect_anomalies(
        self,
        transaction: Dict[str, Any],
        historical_stats: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Detect anomalies in transaction."""
        return detect_anomalies(transaction, historical_stats)

    async def _match_patterns(
        self,
        transaction: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Match against fraud patterns."""
        return match_fraud_patterns(transaction)

    async def _score_transaction(
        self,
        transaction: Dict[str, Any],
        embedding: Optional[List[float]] = None,
        structured_features: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """Score transaction for fraud probability."""
        return score_transaction(transaction, embedding, structured_features)

    async def _classify_risk(
        self,
        score: float
    ) -> Dict[str, Any]:
        """Classify risk level."""
        return classify_risk_level(score)

    async def _batch_score(
        self,
        transactions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Score multiple transactions."""
        results = []
        for tx in transactions:
            result = score_transaction(tx)
            results.append({
                "transaction_id": tx.get("transaction_id", ""),
                "fraud_probability": result.get("fraud_probability"),
                "risk_level": result.get("risk_level"),
                "recommended_action": result.get("recommended_action")
            })

        # Summary statistics
        flagged = sum(1 for r in results if r["recommended_action"] == "FLAG")

        return {
            "status": "success",
            "transactions_scored": len(results),
            "flagged_count": flagged,
            "pass_count": len(results) - flagged,
            "results": results,
            "batch_timestamp": datetime.now().isoformat()
        }

    async def _get_model_info(self) -> Dict[str, Any]:
        """Get model information."""
        return {
            "status": "success",
            "model": {
                "name": "FraudShield A2C",
                "version": "1.0.0",
                "type": "LLM+RL Hybrid",
                "embedding_model": "text-embedding-004",
                "embedding_dimension": 768,
                "rl_algorithm": "A2C",
                "reward_function": "cost_sensitive_asymmetric",
                "thresholds": {
                    "flag_threshold": 0.30,
                    "critical_threshold": 0.60,
                    "high_threshold": 0.40,
                    "medium_threshold": 0.20
                },
                "cost_matrix": {
                    "true_positive": 10.0,
                    "true_negative": 1.0,
                    "false_positive": -5.0,
                    "false_negative": -50.0
                },
                "training_date": "2025-01-01",
                "performance_metrics": {
                    "recall": 0.952,
                    "precision": 0.867,
                    "f1_score": 0.907,
                    "auc_roc": 0.943
                }
            }
        }


def create_mcp_server() -> FraudMCPServer:
    """Factory function to create MCP server instance."""
    return FraudMCPServer()
