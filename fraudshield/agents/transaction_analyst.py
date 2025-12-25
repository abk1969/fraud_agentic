"""
FraudShield AI - Transaction Analyst Agent
Specialized agent for transaction scoring and analysis

Implements the LLM+RL hybrid approach:
1. Serialize transaction to natural language
2. Generate semantic embedding
3. Combine with structured features
4. Score using cost-sensitive RL policy
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
    serialize_transaction,
    compute_embedding,
    detect_anomalies,
    match_fraud_patterns,
    score_transaction,
    get_transaction_history,
)
from ..config.rewards import REWARD_CONFIG, classify_risk, should_flag


class TransactionAnalystAgent:
    """
    Transaction Analyst Agent for FraudShield.

    Responsibilities:
    - Analyze transaction data for fraud indicators
    - Compute fraud probability using LLM+RL hybrid model
    - Detect statistical anomalies
    - Apply cost-sensitive decision making
    - Generate feature importance explanations
    """

    def __init__(self):
        """Initialize Transaction Analyst Agent."""
        self.config = AgentConfig(
            name="transaction_analyst",
            model="gemini-flash-latest",
            description="Agent spécialisé dans l'analyse des transactions et le scoring fraude",
            instruction=self._build_instruction(),
            output_key="transaction_analysis",
            generate_content_config=GENERATION_CONFIG,
        )

        # Tools available to this agent
        self.tools = [
            serialize_transaction,
            compute_embedding,
            detect_anomalies,
            match_fraud_patterns,
            score_transaction,
            get_transaction_history,
        ]

        # Cost-sensitive thresholds from reward config
        self.reward_config = REWARD_CONFIG

    def _build_instruction(self) -> str:
        """Build agent instruction."""
        return create_agent_instruction(
            role="un analyste de transactions expert en détection de fraude",
            responsibilities=[
                "Analyser les transactions de remboursement pour détecter la fraude",
                "Calculer le score de probabilité de fraude",
                "Détecter les anomalies statistiques (montant, fréquence, timing)",
                "Identifier les patterns de fraude connus",
                "Appliquer la logique de décision cost-sensitive",
            ],
            guidelines=[
                "Utiliser l'approche LLM+RL hybride pour le scoring",
                "Prioriser le rappel (95%+) pour minimiser les faux négatifs",
                "Appliquer les coûts asymétriques: FN=-50, FP=-5, TP=+10, TN=+1",
                "Sérialiser la transaction en langage naturel avant l'embedding",
                "Considérer l'historique du bénéficiaire dans l'analyse",
                "Croiser les scores d'anomalie et de pattern matching",
            ],
            output_format="""
Retourne un JSON structuré avec:
- fraud_probability: Score de probabilité (0-1)
- risk_level: Niveau de risque (low, medium, high, critical)
- recommended_action: Action (PASS, FLAG)
- anomalies: Liste des anomalies détectées
- matched_patterns: Patterns de fraude identifiés
- components: Décomposition du score
- confidence: Niveau de confiance
- expected_reward: Récompense attendue de la décision
"""
        )

    async def analyze(
        self,
        transaction: Dict[str, Any],
        context: AgentContext,
        include_history: bool = True
    ) -> Dict[str, Any]:
        """
        Analyze a transaction for fraud.

        Args:
            transaction: Transaction data
            context: Agent execution context
            include_history: Whether to include beneficiary history

        Returns:
            Comprehensive transaction analysis
        """
        # Step 1: Get historical context if enabled
        historical_stats = None
        if include_history:
            beneficiary_id = transaction.get("beneficiary_id", "")
            if beneficiary_id:
                history = get_transaction_history(beneficiary_id)
                historical_stats = {
                    "avg_amount": history.get("avg_amount", 100),
                    "total_30d": history.get("total_amount", 0),
                    "claim_count": history.get("transaction_count", 0),
                }

        # Step 2: Serialize transaction for LLM
        serialized = serialize_transaction(transaction)

        # Step 3: Compute embedding
        embedding_result = compute_embedding(serialized["serialized_text"])
        embedding = embedding_result.get("embedding", [])

        # Step 4: Detect anomalies
        anomaly_result = detect_anomalies(transaction, historical_stats)

        # Step 5: Match fraud patterns
        pattern_result = match_fraud_patterns(transaction)

        # Step 6: Compute final score
        score_result = score_transaction(
            transaction,
            embedding=embedding
        )

        # Step 7: Apply cost-sensitive decision
        fraud_probability = score_result.get("fraud_probability", 0)
        risk_level = classify_risk(fraud_probability)
        flag_decision = should_flag(fraud_probability)

        # Calculate expected reward
        expected_reward = self._calculate_expected_reward(
            fraud_probability,
            flag_decision
        )

        return {
            "status": "success",
            "transaction_id": transaction.get("transaction_id", ""),
            "fraud_probability": round(fraud_probability, 4),
            "risk_level": risk_level.value,
            "recommended_action": "FLAG" if flag_decision else "PASS",
            "confidence": score_result.get("confidence", 0),
            "components": score_result.get("components", {}),
            "anomalies": anomaly_result.get("anomalies", []),
            "matched_patterns": pattern_result.get("matched_patterns", []),
            "historical_context": {
                "included": include_history,
                "stats": historical_stats
            },
            "cost_sensitive": {
                "expected_reward": round(expected_reward, 4),
                "threshold_used": self.reward_config.flag_threshold,
                "cost_matrix": {
                    "TP": self.reward_config.true_positive_reward,
                    "TN": self.reward_config.true_negative_reward,
                    "FP": self.reward_config.false_positive_penalty,
                    "FN": self.reward_config.false_negative_penalty,
                }
            },
            "serialized_text": serialized.get("serialized_text", ""),
            "analysis_timestamp": datetime.now().isoformat(),
            "elapsed_ms": context.elapsed_time_ms()
        }

    def _calculate_expected_reward(
        self,
        fraud_probability: float,
        flag_decision: bool
    ) -> float:
        """
        Calculate expected reward for a decision.

        E[reward | flag] = p(fraud) * TP + (1-p(fraud)) * FP
        E[reward | pass] = p(fraud) * FN + (1-p(fraud)) * TN
        """
        p_fraud = fraud_probability
        p_legit = 1 - fraud_probability

        if flag_decision:
            # Expected reward for flagging
            return (
                p_fraud * self.reward_config.true_positive_reward +
                p_legit * self.reward_config.false_positive_penalty
            )
        else:
            # Expected reward for passing
            return (
                p_fraud * self.reward_config.false_negative_penalty +
                p_legit * self.reward_config.true_negative_reward
            )

    async def batch_analyze(
        self,
        transactions: List[Dict[str, Any]],
        context: AgentContext
    ) -> Dict[str, Any]:
        """
        Analyze multiple transactions.

        Args:
            transactions: List of transactions
            context: Agent execution context

        Returns:
            Batch analysis results
        """
        results = []
        flagged = 0
        total_fraud_prob = 0

        for tx in transactions:
            result = await self.analyze(tx, context, include_history=False)
            results.append({
                "transaction_id": result.get("transaction_id"),
                "fraud_probability": result.get("fraud_probability"),
                "risk_level": result.get("risk_level"),
                "recommended_action": result.get("recommended_action"),
            })

            if result.get("recommended_action") == "FLAG":
                flagged += 1
            total_fraud_prob += result.get("fraud_probability", 0)

        return {
            "status": "success",
            "transactions_analyzed": len(results),
            "flagged_count": flagged,
            "pass_count": len(results) - flagged,
            "average_fraud_probability": round(total_fraud_prob / len(results), 4) if results else 0,
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


def create_agent() -> TransactionAnalystAgent:
    """Factory function to create agent instance."""
    return TransactionAnalystAgent()
