"""
FraudShield AI - Explanation Generator Agent
Specialized agent for generating human-readable explanations

Implements XAI (Explainable AI) requirements:
- RGPD compliance (right to explanation)
- Audit trail generation
- Investigation report creation
"""

from typing import Dict, Any, List, Optional
from datetime import datetime

from .base_agent import (
    AgentConfig,
    AgentContext,
    create_agent_instruction,
    GENERATION_CONFIG,
)
from ..tools.explanation_tools import (
    generate_explanation,
    create_investigation_report,
    summarize_case,
    get_attention_weights,
    format_for_audit,
)


class ExplanationGeneratorAgent:
    """
    Explanation Generator Agent for FraudShield.

    Responsibilities:
    - Generate human-readable explanations of decisions
    - Create investigation reports
    - Format data for audit compliance
    - Produce case summaries
    - Visualize feature importance
    """

    def __init__(self):
        """Initialize Explanation Generator Agent."""
        self.config = AgentConfig(
            name="explanation_generator",
            model="gemini-flash-latest",
            description="Agent spécialisé dans la génération d'explications et rapports",
            instruction=self._build_instruction(),
            output_key="explanation",
            generate_content_config={
                **GENERATION_CONFIG,
                "temperature": 0.3,  # Slightly higher for natural language
            },
        )

        # Tools available to this agent
        self.tools = [
            generate_explanation,
            create_investigation_report,
            summarize_case,
            get_attention_weights,
            format_for_audit,
        ]

    def _build_instruction(self) -> str:
        """Build agent instruction."""
        return create_agent_instruction(
            role="un expert en communication et documentation de décisions IA",
            responsibilities=[
                "Générer des explications claires des décisions de détection",
                "Produire des rapports d'investigation complets",
                "Créer des résumés exécutifs pour les gestionnaires",
                "Formater les données pour la conformité RGPD",
                "Visualiser l'importance des facteurs de décision",
            ],
            guidelines=[
                "Adapter le niveau de détail au public cible",
                "Utiliser un langage professionnel mais accessible",
                "Inclure tous les facteurs ayant contribué à la décision",
                "Respecter les exigences d'auditabilité",
                "Fournir des recommandations actionnables",
            ],
            output_format="""
Retourne un JSON structuré avec:
- explanation_level: Niveau de détail (brief, standard, detailed)
- explanation_text: Texte explicatif formaté
- key_factors: Facteurs principaux de la décision
- confidence: Niveau de confiance
- recommendations: Actions recommandées
- audit_trail: Éléments pour piste d'audit
- rgpd_compliant: Conformité RGPD
"""
        )

    async def explain(
        self,
        decision_data: Dict[str, Any],
        context: AgentContext,
        detail_level: str = "standard",
        audience: str = "analyst"
    ) -> Dict[str, Any]:
        """
        Generate explanation for a fraud detection decision.

        Args:
            decision_data: Decision data to explain
            context: Agent execution context
            detail_level: brief, standard, or detailed
            audience: analyst, manager, or beneficiary

        Returns:
            Formatted explanation
        """
        # Generate base explanation
        explanation_result = generate_explanation(decision_data, detail_level)

        # Get attention weights for feature importance
        transaction_id = decision_data.get("transaction_id", "")
        attention_result = get_attention_weights(transaction_id)

        # Extract key factors
        key_factors = self._extract_key_factors(decision_data, attention_result)

        # Adapt explanation to audience
        adapted_explanation = self._adapt_to_audience(
            explanation_result.get("explanation", ""),
            audience,
            decision_data
        )

        # Generate recommendations
        recommendations = self._generate_recommendations(decision_data)

        return {
            "status": "success",
            "transaction_id": transaction_id,
            "explanation_level": detail_level,
            "audience": audience,
            "explanation_text": adapted_explanation,
            "all_explanations": explanation_result.get("all_explanations", {}),
            "key_factors": key_factors,
            "feature_importance": attention_result.get("attention_analysis", {}).get("feature_importance", {}),
            "interpretation": attention_result.get("interpretation", ""),
            "recommendations": recommendations,
            "decision_summary": {
                "fraud_probability": decision_data.get("fraud_probability", 0),
                "risk_level": decision_data.get("risk_level", "unknown"),
                "action": decision_data.get("recommended_action", "REVIEW"),
            },
            "rgpd_compliant": True,
            "generated_at": datetime.now().isoformat(),
            "elapsed_ms": context.elapsed_time_ms()
        }

    def _extract_key_factors(
        self,
        decision_data: Dict,
        attention_data: Dict
    ) -> List[Dict[str, Any]]:
        """Extract and rank key decision factors."""
        factors = []

        # From anomalies
        for anomaly in decision_data.get("anomalies", []):
            factors.append({
                "type": "anomaly",
                "name": anomaly.get("type", ""),
                "description": anomaly.get("description", ""),
                "severity": anomaly.get("severity", "medium"),
                "impact": "negative"
            })

        # From patterns
        for pattern in decision_data.get("matched_patterns", []):
            factors.append({
                "type": "pattern",
                "name": pattern.get("pattern_name", ""),
                "description": pattern.get("description", ""),
                "match_strength": pattern.get("match_strength", 0),
                "impact": "negative"
            })

        # From feature importance
        importance = attention_data.get("attention_analysis", {}).get("feature_importance", {})
        for feature, weight in sorted(importance.items(), key=lambda x: x[1], reverse=True)[:5]:
            factors.append({
                "type": "feature",
                "name": feature,
                "weight": weight,
                "impact": "contributing"
            })

        # Sort by impact/severity
        severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        factors.sort(key=lambda f: severity_order.get(f.get("severity", "low"), 3))

        return factors[:10]  # Top 10 factors

    def _adapt_to_audience(
        self,
        explanation: str,
        audience: str,
        decision_data: Dict
    ) -> str:
        """Adapt explanation to target audience."""
        risk_level = decision_data.get("risk_level", "unknown")
        probability = decision_data.get("fraud_probability", 0)

        if audience == "beneficiary":
            # Simple, non-technical explanation
            if risk_level in ["high", "critical"]:
                return (
                    "Votre demande nécessite une vérification complémentaire. "
                    "Un conseiller vous contactera prochainement pour "
                    "compléter votre dossier."
                )
            else:
                return (
                    "Votre demande est en cours de traitement. "
                    "Vous serez informé(e) de son avancement."
                )

        elif audience == "manager":
            # Executive summary
            return (
                f"Score de risque: {probability:.0%} ({risk_level.upper()})\n"
                f"Action: {decision_data.get('recommended_action', 'REVIEW')}\n\n"
                f"{explanation}"
            )

        else:  # analyst - full technical detail
            return explanation

    def _generate_recommendations(
        self,
        decision_data: Dict
    ) -> List[Dict[str, str]]:
        """Generate actionable recommendations."""
        recommendations = []
        risk_level = decision_data.get("risk_level", "low")
        action = decision_data.get("recommended_action", "PASS")

        if action == "FLAG":
            recommendations.append({
                "priority": "high",
                "action": "Transférer pour investigation",
                "reason": f"Risque {risk_level} détecté"
            })

            if any(a.get("type") == "amount_spike" for a in decision_data.get("anomalies", [])):
                recommendations.append({
                    "priority": "medium",
                    "action": "Vérifier les justificatifs du montant",
                    "reason": "Montant anormalement élevé"
                })

            if decision_data.get("matched_patterns"):
                recommendations.append({
                    "priority": "medium",
                    "action": "Comparer avec cas similaires",
                    "reason": "Pattern de fraude identifié"
                })

        else:
            recommendations.append({
                "priority": "low",
                "action": "Traitement automatique possible",
                "reason": "Aucun indicateur de risque significatif"
            })

        return recommendations

    async def create_report(
        self,
        case_id: str,
        investigation_data: Dict[str, Any],
        context: AgentContext
    ) -> Dict[str, Any]:
        """
        Create investigation report.

        Args:
            case_id: Case identifier
            investigation_data: All investigation data
            context: Agent execution context

        Returns:
            Complete investigation report
        """
        report = create_investigation_report(case_id, investigation_data)

        return {
            **report,
            "elapsed_ms": context.elapsed_time_ms()
        }

    async def create_audit_record(
        self,
        decision_data: Dict[str, Any],
        context: AgentContext,
        include_technical: bool = False
    ) -> Dict[str, Any]:
        """
        Create audit-ready record.

        Args:
            decision_data: Decision data to format
            context: Agent execution context
            include_technical: Include technical details

        Returns:
            Audit-formatted record
        """
        audit = format_for_audit(decision_data, include_technical)

        return {
            **audit,
            "elapsed_ms": context.elapsed_time_ms()
        }

    async def summarize(
        self,
        case_data: Dict[str, Any],
        context: AgentContext,
        max_length: int = 500
    ) -> Dict[str, Any]:
        """
        Generate case summary.

        Args:
            case_data: Case data to summarize
            context: Agent execution context
            max_length: Maximum summary length

        Returns:
            Case summary
        """
        summary = summarize_case(case_data, max_length)

        return {
            **summary,
            "elapsed_ms": context.elapsed_time_ms()
        }

    def get_adk_config(self) -> Dict[str, Any]:
        """Get ADK Agent configuration."""
        return {
            **self.config.to_dict(),
            "tools": self.tools,
        }


def create_agent() -> ExplanationGeneratorAgent:
    """Factory function to create agent instance."""
    return ExplanationGeneratorAgent()
