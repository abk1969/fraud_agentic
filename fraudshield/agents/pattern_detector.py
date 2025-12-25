"""
FraudShield AI - Pattern Detector Agent
Specialized agent for fraud pattern detection and matching

Uses:
- Rule-based pattern matching
- Statistical anomaly detection
- Behavioral pattern analysis
- Temporal pattern recognition
"""

from typing import Dict, Any, List, Optional
from datetime import datetime

from .base_agent import (
    AgentConfig,
    AgentContext,
    create_agent_instruction,
    GENERATION_CONFIG,
)
from ..tools.fraud_tools import (
    match_fraud_patterns,
    detect_anomalies,
    get_transaction_history,
)
from ..config.models import FRAUD_PATTERNS, FRAUD_TYPES


class PatternDetectorAgent:
    """
    Pattern Detector Agent for FraudShield.

    Responsibilities:
    - Match transactions against known fraud patterns
    - Detect behavioral anomalies
    - Identify temporal patterns (velocity, timing)
    - Recognize fraud type signatures
    - Track pattern evolution over time
    """

    def __init__(self):
        """Initialize Pattern Detector Agent."""
        self.config = AgentConfig(
            name="pattern_detector",
            model="gemini-flash-latest",
            description="Agent spécialisé dans la détection de patterns de fraude",
            instruction=self._build_instruction(),
            output_key="pattern_detection",
            generate_content_config=GENERATION_CONFIG,
        )

        # Tools available to this agent
        self.tools = [
            match_fraud_patterns,
            detect_anomalies,
            get_transaction_history,
        ]

        # Pattern library
        self.fraud_patterns = FRAUD_PATTERNS
        self.fraud_types = FRAUD_TYPES

    def _build_instruction(self) -> str:
        """Build agent instruction."""
        return create_agent_instruction(
            role="un expert en détection de patterns de fraude",
            responsibilities=[
                "Identifier les patterns de fraude connus dans les transactions",
                "Détecter les anomalies comportementales",
                "Analyser les patterns temporels (vélocité, timing)",
                "Reconnaître les signatures de types de fraude spécifiques",
                "Évaluer la force de correspondance des patterns",
            ],
            guidelines=[
                "Utiliser la bibliothèque de patterns prédéfinis",
                "Considérer les indicateurs multiples pour chaque pattern",
                "Pondérer les patterns selon leur risque associé",
                "Détecter les combinaisons de patterns suspects",
                "Signaler les nouveaux patterns potentiels",
            ],
            output_format="""
Retourne un JSON structuré avec:
- patterns_matched: Liste des patterns identifiés
- match_scores: Scores de correspondance par pattern
- fraud_type: Type de fraude le plus probable
- anomalies: Anomalies détectées
- velocity_analysis: Analyse de vélocité
- temporal_patterns: Patterns temporels
- combined_risk_score: Score de risque combiné
- recommendation: Recommandation basée sur les patterns
"""
        )

    async def detect(
        self,
        transaction: Dict[str, Any],
        context: AgentContext,
        include_temporal: bool = True
    ) -> Dict[str, Any]:
        """
        Detect fraud patterns in a transaction.

        Args:
            transaction: Transaction data
            context: Agent execution context
            include_temporal: Include temporal pattern analysis

        Returns:
            Pattern detection results
        """
        # Step 1: Match against known patterns
        pattern_result = match_fraud_patterns(transaction)
        matched_patterns = pattern_result.get("matched_patterns", [])

        # Step 2: Detect anomalies
        anomaly_result = detect_anomalies(transaction)
        anomalies = anomaly_result.get("anomalies", [])

        # Step 3: Temporal analysis
        temporal_patterns = []
        velocity_analysis = {}

        if include_temporal:
            beneficiary_id = transaction.get("beneficiary_id", "")
            if beneficiary_id:
                history = get_transaction_history(beneficiary_id, days=30)

                # Velocity analysis
                claims_30d = transaction.get("claims_30d", 0)
                velocity_analysis = {
                    "claims_last_30d": claims_30d,
                    "velocity_level": self._classify_velocity(claims_30d),
                    "is_anomalous": claims_30d > 10,
                }

                # Time-of-day pattern
                tx_time = transaction.get("time", "12:00")
                hour = int(tx_time.split(":")[0]) if tx_time else 12
                if hour < 6 or hour > 22:
                    temporal_patterns.append({
                        "type": "unusual_hour",
                        "description": f"Transaction à {tx_time} (heure inhabituelle)",
                        "risk_weight": 0.3
                    })

                # Day since last
                days_since = transaction.get("days_since_last", 0)
                if days_since < 2 and claims_30d > 5:
                    temporal_patterns.append({
                        "type": "rapid_succession",
                        "description": f"Demandes rapprochées ({days_since} jours depuis la dernière)",
                        "risk_weight": 0.4
                    })

        # Step 4: Identify most likely fraud type
        fraud_type = self._identify_fraud_type(matched_patterns, anomalies)

        # Step 5: Calculate combined risk score
        pattern_score = pattern_result.get("combined_pattern_score", 0)
        anomaly_score = anomaly_result.get("overall_anomaly_score", 0)
        temporal_score = sum(p.get("risk_weight", 0) for p in temporal_patterns)

        combined_score = min(
            pattern_score * 0.4 +
            anomaly_score * 0.35 +
            temporal_score * 0.25,
            1.0
        )

        # Determine recommendation
        if combined_score >= 0.6:
            recommendation = "flag"
        elif combined_score >= 0.3:
            recommendation = "review"
        else:
            recommendation = "pass"

        return {
            "status": "success",
            "transaction_id": transaction.get("transaction_id", ""),
            "patterns_checked": len(self.fraud_patterns),
            "patterns_matched": matched_patterns,
            "match_scores": {
                p["pattern_id"]: p["match_strength"]
                for p in matched_patterns
            },
            "fraud_type": fraud_type,
            "anomalies": anomalies,
            "velocity_analysis": velocity_analysis,
            "temporal_patterns": temporal_patterns,
            "score_breakdown": {
                "pattern_score": round(pattern_score, 4),
                "anomaly_score": round(anomaly_score, 4),
                "temporal_score": round(temporal_score, 4),
            },
            "combined_risk_score": round(combined_score, 4),
            "recommendation": recommendation,
            "detection_timestamp": datetime.now().isoformat(),
            "elapsed_ms": context.elapsed_time_ms()
        }

    def _classify_velocity(self, claims_30d: int) -> str:
        """Classify claim velocity."""
        if claims_30d <= 2:
            return "normal"
        elif claims_30d <= 5:
            return "elevated"
        elif claims_30d <= 10:
            return "high"
        else:
            return "extreme"

    def _identify_fraud_type(
        self,
        patterns: List[Dict],
        anomalies: List[Dict]
    ) -> Dict[str, Any]:
        """Identify most likely fraud type."""
        type_scores = {}

        # Score based on patterns
        for pattern in patterns:
            pattern_id = pattern.get("pattern_id", "")
            strength = pattern.get("match_strength", 0)

            # Map patterns to fraud types
            for fraud_type, type_info in self.fraud_types.items():
                for type_pattern in type_info.get("patterns", []):
                    if type_pattern in pattern_id:
                        type_scores[fraud_type] = type_scores.get(fraud_type, 0) + strength

        # Score based on anomalies
        for anomaly in anomalies:
            anomaly_type = anomaly.get("type", "")

            if "amount" in anomaly_type:
                type_scores["surfacturation"] = type_scores.get("surfacturation", 0) + 0.3
            if "frequency" in anomaly_type:
                type_scores["prestations_fictives"] = type_scores.get("prestations_fictives", 0) + 0.3
            if "provider" in anomaly_type:
                type_scores["collusion"] = type_scores.get("collusion", 0) + 0.3

        if not type_scores:
            return {"type": "unknown", "confidence": 0}

        # Find highest scoring type
        best_type = max(type_scores.items(), key=lambda x: x[1])

        return {
            "type": best_type[0],
            "confidence": min(best_type[1], 1.0),
            "description": self.fraud_types.get(best_type[0], {}).get("description", ""),
            "all_scores": type_scores
        }

    async def batch_detect(
        self,
        transactions: List[Dict[str, Any]],
        context: AgentContext
    ) -> Dict[str, Any]:
        """
        Detect patterns across multiple transactions.

        Args:
            transactions: List of transactions
            context: Agent execution context

        Returns:
            Batch pattern detection results
        """
        results = []
        pattern_counts = {}
        type_counts = {}

        for tx in transactions:
            result = await self.detect(tx, context, include_temporal=False)
            results.append({
                "transaction_id": result.get("transaction_id"),
                "patterns_matched": len(result.get("patterns_matched", [])),
                "fraud_type": result.get("fraud_type", {}).get("type"),
                "combined_risk_score": result.get("combined_risk_score"),
            })

            # Count patterns
            for pattern in result.get("patterns_matched", []):
                pid = pattern.get("pattern_id")
                pattern_counts[pid] = pattern_counts.get(pid, 0) + 1

            # Count fraud types
            ftype = result.get("fraud_type", {}).get("type", "unknown")
            type_counts[ftype] = type_counts.get(ftype, 0) + 1

        return {
            "status": "success",
            "transactions_analyzed": len(results),
            "pattern_frequency": pattern_counts,
            "fraud_type_distribution": type_counts,
            "results": results,
            "batch_timestamp": datetime.now().isoformat(),
            "elapsed_ms": context.elapsed_time_ms()
        }

    def get_adk_config(self) -> Dict[str, Any]:
        """Get ADK Agent configuration."""
        return {
            **self.config.to_dict(),
            "tools": self.tools,
        }


def create_agent() -> PatternDetectorAgent:
    """Factory function to create agent instance."""
    return PatternDetectorAgent()
