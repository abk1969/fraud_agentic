"""
FraudShield AI - Fraud Detection Tools
Core tools for transaction analysis and fraud scoring

These tools implement the LLM+RL hybrid approach:
1. Serialize transaction to natural language
2. Generate semantic embedding via LLM
3. Combine with structured features
4. Score using the trained RL policy
"""

import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from dataclasses import dataclass

from ..config.models import TRANSACTION_TEMPLATE, FRAUD_PATTERNS
from ..config.rewards import classify_risk, RiskLevel, should_flag


@dataclass
class TransactionData:
    """Structured transaction data"""
    transaction_id: str
    type: str
    amount: float
    date: str
    time: str
    beneficiary_id: str
    beneficiary_name: str
    provider_id: str
    provider_name: str
    description: str
    documents_count: int
    tenure_months: int
    provider_risk_score: float
    claims_30d: int
    total_30d: float
    days_since_last: int


def serialize_transaction(transaction: Dict[str, Any]) -> Dict[str, Any]:
    """
    Serialize transaction data into natural language for LLM encoding.

    This is the key innovation from the LLM+RL approach:
    Template-based serialization preserves semantic context for numerical values.

    Example: "250.00" becomes "Montant demandé: 250.00€" which allows the LLM
    to understand the relationship between amount and context.

    Args:
        transaction: Raw transaction dictionary

    Returns:
        Dictionary with serialized text and metadata
    """
    # Extract fields with defaults
    tx = {
        "type": transaction.get("type", "REMBOURSEMENT"),
        "date": transaction.get("date", datetime.now().strftime("%Y-%m-%d")),
        "time": transaction.get("time", datetime.now().strftime("%H:%M")),
        "beneficiary_name": transaction.get("beneficiary_name", "N/A"),
        "beneficiary_id": transaction.get("beneficiary_id", "N/A"),
        "amount": transaction.get("amount", 0.0),
        "provider_name": transaction.get("provider_name", "N/A"),
        "provider_id": transaction.get("provider_id", "N/A"),
        "provider_risk_score": transaction.get("provider_risk_score", 0.0),
        "description": transaction.get("description", ""),
        "documents_count": transaction.get("documents_count", 0),
        "tenure_months": transaction.get("tenure_months", 0),
        "claims_30d": transaction.get("claims_30d", 0),
        "total_30d": transaction.get("total_30d", 0.0),
        "days_since_last": transaction.get("days_since_last", 0),
    }

    # Generate serialized text using template
    serialized_text = TRANSACTION_TEMPLATE.format(**tx)

    return {
        "status": "success",
        "serialized_text": serialized_text.strip(),
        "transaction_id": transaction.get("transaction_id", ""),
        "metadata": {
            "type": tx["type"],
            "amount": tx["amount"],
            "beneficiary_id": tx["beneficiary_id"],
            "provider_id": tx["provider_id"],
        }
    }


def compute_embedding(text: str, model: str = "text-embedding-004") -> Dict[str, Any]:
    """
    Compute semantic embedding for serialized transaction text.

    In production, this calls the Gemini Embedding API.
    The embedding captures semantic meaning that helps the RL agent
    distinguish fraud patterns that appear similar numerically.

    Args:
        text: Serialized transaction text
        model: Embedding model to use

    Returns:
        Dictionary with embedding vector and metadata
    """
    # Placeholder - in production, calls Vertex AI / Gemini API
    # Example: vertexai.language_models.TextEmbeddingModel.get_embeddings()

    return {
        "status": "success",
        "embedding_model": model,
        "embedding_dimension": 768,
        "embedding": [0.0] * 768,  # Placeholder
        "text_length": len(text),
        "note": "Production implementation calls Gemini Embedding API"
    }


def detect_anomalies(
    transaction: Dict[str, Any],
    historical_stats: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Detect statistical anomalies in transaction data.

    Compares transaction against historical patterns to identify deviations.

    Args:
        transaction: Current transaction data
        historical_stats: Historical statistics for comparison

    Returns:
        Dictionary with anomaly indicators
    """
    anomalies = []
    risk_factors = []

    amount = transaction.get("amount", 0)
    avg_amount = historical_stats.get("avg_amount", 100) if historical_stats else 100
    claim_frequency = transaction.get("claims_30d", 0)

    # Amount anomaly
    if amount > avg_amount * 5:
        anomalies.append({
            "type": "amount_spike",
            "description": f"Montant {amount}€ est {amount/avg_amount:.1f}x supérieur à la moyenne",
            "severity": "high"
        })
        risk_factors.append("amount_anomaly")

    # Frequency anomaly
    if claim_frequency > 10:
        anomalies.append({
            "type": "high_frequency",
            "description": f"{claim_frequency} demandes en 30 jours",
            "severity": "medium"
        })
        risk_factors.append("frequency_anomaly")

    # Provider risk
    provider_risk = transaction.get("provider_risk_score", 0)
    if provider_risk > 0.5:
        anomalies.append({
            "type": "risky_provider",
            "description": f"Score de risque prestataire élevé: {provider_risk:.2f}",
            "severity": "high"
        })
        risk_factors.append("provider_risk")

    # New beneficiary with high amount
    tenure = transaction.get("tenure_months", 0)
    if tenure < 3 and amount > 500:
        anomalies.append({
            "type": "new_beneficiary_high_amount",
            "description": f"Bénéficiaire récent ({tenure} mois) avec demande de {amount}€",
            "severity": "medium"
        })
        risk_factors.append("new_beneficiary")

    return {
        "status": "success",
        "anomaly_count": len(anomalies),
        "anomalies": anomalies,
        "risk_factors": risk_factors,
        "overall_anomaly_score": min(len(anomalies) * 0.2, 1.0)
    }


def get_transaction_history(
    beneficiary_id: str,
    days: int = 90
) -> Dict[str, Any]:
    """
    Retrieve transaction history for a beneficiary.

    Args:
        beneficiary_id: Unique beneficiary identifier
        days: Number of days of history to retrieve

    Returns:
        Dictionary with transaction history and statistics
    """
    # Placeholder - in production, queries AlloyDB/BigQuery
    return {
        "status": "success",
        "beneficiary_id": beneficiary_id,
        "period_days": days,
        "transaction_count": 0,
        "total_amount": 0.0,
        "avg_amount": 0.0,
        "providers_used": [],
        "fraud_flags": 0,
        "note": "Production implementation queries database"
    }


def match_fraud_patterns(transaction: Dict[str, Any]) -> Dict[str, Any]:
    """
    Match transaction against known fraud patterns.

    Uses the predefined pattern library to identify suspicious characteristics.

    Args:
        transaction: Transaction data

    Returns:
        Dictionary with matched patterns and scores
    """
    matched_patterns = []
    total_weight = 0.0

    for pattern in FRAUD_PATTERNS:
        # Simple indicator matching (production uses more sophisticated logic)
        indicators_matched = 0
        total_indicators = len(pattern["indicators"])

        for indicator in pattern["indicators"]:
            # Parse indicator (simplified)
            if "claim_frequency_30d" in indicator and transaction.get("claims_30d", 0) > 10:
                indicators_matched += 1
            elif "amount" in indicator and transaction.get("amount", 0) > 1000:
                indicators_matched += 1
            elif "provider_risk_score" in indicator and transaction.get("provider_risk_score", 0) > 0.5:
                indicators_matched += 1

        if indicators_matched > 0:
            match_strength = indicators_matched / total_indicators
            if match_strength >= 0.5:  # At least 50% indicators match
                matched_patterns.append({
                    "pattern_id": pattern["id"],
                    "pattern_name": pattern["name"],
                    "description": pattern["description"],
                    "match_strength": match_strength,
                    "risk_weight": pattern["risk_weight"]
                })
                total_weight += pattern["risk_weight"] * match_strength

    return {
        "status": "success",
        "patterns_checked": len(FRAUD_PATTERNS),
        "patterns_matched": len(matched_patterns),
        "matched_patterns": matched_patterns,
        "combined_pattern_score": min(total_weight, 1.0)
    }


def score_transaction(
    transaction: Dict[str, Any],
    embedding: Optional[List[float]] = None,
    structured_features: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """
    Score a transaction for fraud probability.

    Combines:
    1. LLM embedding (semantic understanding)
    2. Structured features (numerical indicators)
    3. Pattern matching (known fraud scenarios)
    4. Anomaly detection (statistical deviations)

    The final score determines the action via cost-sensitive thresholds.

    Args:
        transaction: Transaction data
        embedding: Pre-computed LLM embedding (optional)
        structured_features: Pre-computed features (optional)

    Returns:
        Dictionary with fraud score and decision recommendation
    """
    # Step 1: Serialize and embed if not provided
    if embedding is None:
        serialized = serialize_transaction(transaction)
        embedding_result = compute_embedding(serialized["serialized_text"])
        embedding = embedding_result.get("embedding", [])

    # Step 2: Detect anomalies
    anomaly_result = detect_anomalies(transaction)
    anomaly_score = anomaly_result.get("overall_anomaly_score", 0)

    # Step 3: Match patterns
    pattern_result = match_fraud_patterns(transaction)
    pattern_score = pattern_result.get("combined_pattern_score", 0)

    # Step 4: Combine scores (weighted average)
    # In production, this would be the RL agent's policy output
    weights = {
        "anomaly": 0.3,
        "pattern": 0.4,
        "amount_factor": 0.2,
        "provider_risk": 0.1
    }

    amount = transaction.get("amount", 0)
    amount_factor = min(amount / 5000, 1.0)  # Normalize to 0-1
    provider_risk = transaction.get("provider_risk_score", 0)

    combined_score = (
        weights["anomaly"] * anomaly_score +
        weights["pattern"] * pattern_score +
        weights["amount_factor"] * amount_factor * 0.5 +
        weights["provider_risk"] * provider_risk
    )

    # Normalize to 0-1
    fraud_probability = min(max(combined_score, 0), 1)

    # Step 5: Classify and recommend action
    risk_level = classify_risk(fraud_probability)
    should_flag_tx = should_flag(fraud_probability)

    return {
        "status": "success",
        "transaction_id": transaction.get("transaction_id", ""),
        "fraud_probability": round(fraud_probability, 4),
        "risk_level": risk_level.value,
        "recommended_action": "FLAG" if should_flag_tx else "PASS",
        "confidence": round(1 - abs(fraud_probability - 0.5) * 2, 4),
        "components": {
            "anomaly_score": round(anomaly_score, 4),
            "pattern_score": round(pattern_score, 4),
            "amount_factor": round(amount_factor, 4),
            "provider_risk": round(provider_risk, 4),
        },
        "anomalies": anomaly_result.get("anomalies", []),
        "matched_patterns": pattern_result.get("matched_patterns", []),
        "explanation_pending": True
    }


def classify_risk_level(score: float) -> Dict[str, Any]:
    """
    Classify risk level from fraud probability score.

    Args:
        score: Fraud probability between 0 and 1

    Returns:
        Dictionary with risk classification and routing
    """
    from ..config.rewards import ROUTING_RULES

    risk_level = classify_risk(score)
    routing = ROUTING_RULES.get(risk_level, {})

    return {
        "status": "success",
        "score": score,
        "risk_level": risk_level.value,
        "action": routing.get("action", "manual_review"),
        "queue": routing.get("queue"),
        "sla_hours": routing.get("sla_hours"),
        "auto_escalate": routing.get("auto_escalate", False)
    }
