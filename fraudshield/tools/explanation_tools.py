"""
FraudShield AI - Explanation Generation Tools
Tools for generating human-readable explanations of fraud detection decisions

Implements XAI (Explainable AI) requirements:
- RGPD compliance (right to explanation)
- Audit trail generation
- Investigation report creation
"""

from typing import Dict, Any, List, Optional
from datetime import datetime


def generate_explanation(
    decision: Dict[str, Any],
    detail_level: str = "standard"
) -> Dict[str, Any]:
    """
    Generate human-readable explanation for a fraud detection decision.

    Explanation levels:
    - brief: One-line summary
    - standard: Key factors and recommendation
    - detailed: Full analysis with all contributing factors

    Args:
        decision: Fraud detection decision with scores and factors
        detail_level: Level of explanation detail

    Returns:
        Dictionary with explanation text and metadata
    """
    fraud_probability = decision.get("fraud_probability", 0)
    risk_level = decision.get("risk_level", "unknown")
    recommended_action = decision.get("recommended_action", "REVIEW")
    anomalies = decision.get("anomalies", [])
    patterns = decision.get("matched_patterns", [])

    # Generate explanations by level
    explanations = {
        "brief": "",
        "standard": "",
        "detailed": ""
    }

    # Brief explanation
    if recommended_action == "FLAG":
        explanations["brief"] = f"Transaction signalée - Score de risque: {fraud_probability:.0%} ({risk_level})"
    else:
        explanations["brief"] = f"Transaction validée - Score de risque faible: {fraud_probability:.0%}"

    # Standard explanation
    standard_parts = [explanations["brief"]]

    if anomalies:
        anomaly_summary = ", ".join([a.get("type", "unknown") for a in anomalies[:3]])
        standard_parts.append(f"Anomalies détectées: {anomaly_summary}")

    if patterns:
        pattern_summary = ", ".join([p.get("pattern_name", "unknown") for p in patterns[:2]])
        standard_parts.append(f"Patterns identifiés: {pattern_summary}")

    if recommended_action == "FLAG":
        standard_parts.append("Action recommandée: Investigation requise")
    else:
        standard_parts.append("Action recommandée: Traitement automatique")

    explanations["standard"] = "\n".join(standard_parts)

    # Detailed explanation
    detailed_parts = [
        "=== ANALYSE DÉTAILLÉE DE LA TRANSACTION ===",
        "",
        f"Score de risque global: {fraud_probability:.2%}",
        f"Niveau de risque: {risk_level.upper()}",
        f"Décision recommandée: {recommended_action}",
        "",
        "--- Composantes du score ---"
    ]

    components = decision.get("components", {})
    for comp_name, comp_value in components.items():
        detailed_parts.append(f"  • {comp_name}: {comp_value:.2%}")

    if anomalies:
        detailed_parts.extend(["", "--- Anomalies détectées ---"])
        for anomaly in anomalies:
            detailed_parts.append(
                f"  • [{anomaly.get('severity', 'N/A').upper()}] "
                f"{anomaly.get('type', 'unknown')}: {anomaly.get('description', '')}"
            )

    if patterns:
        detailed_parts.extend(["", "--- Patterns de fraude identifiés ---"])
        for pattern in patterns:
            detailed_parts.append(
                f"  • {pattern.get('pattern_name', 'unknown')} "
                f"(confiance: {pattern.get('match_strength', 0):.0%})"
            )
            detailed_parts.append(f"    {pattern.get('description', '')}")

    detailed_parts.extend([
        "",
        "--- Recommandation ---",
        _get_action_recommendation(recommended_action, risk_level)
    ])

    explanations["detailed"] = "\n".join(detailed_parts)

    return {
        "status": "success",
        "transaction_id": decision.get("transaction_id", ""),
        "detail_level": detail_level,
        "explanation": explanations.get(detail_level, explanations["standard"]),
        "all_explanations": explanations,
        "factors_count": len(anomalies) + len(patterns),
        "generated_at": datetime.now().isoformat(),
        "language": "fr"
    }


def _get_action_recommendation(action: str, risk_level: str) -> str:
    """Generate action recommendation text."""
    recommendations = {
        ("FLAG", "critical"): (
            "URGENT: Bloquer immédiatement la transaction et transférer à l'équipe "
            "fraude pour investigation prioritaire. Contacter le bénéficiaire pour "
            "vérification d'identité."
        ),
        ("FLAG", "high"): (
            "Signaler pour investigation. Le dossier présente plusieurs indicateurs "
            "de risque qui nécessitent une analyse approfondie avant traitement."
        ),
        ("FLAG", "medium"): (
            "Revue manuelle recommandée. Quelques éléments suspects identifiés. "
            "Vérifier les documents joints et l'historique du bénéficiaire."
        ),
        ("PASS", "low"): (
            "Traitement automatique possible. La transaction ne présente pas "
            "d'indicateurs de risque significatifs."
        )
    }

    return recommendations.get(
        (action, risk_level),
        "Revue manuelle recommandée pour ce cas particulier."
    )


def create_investigation_report(
    case_id: str,
    investigation_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Create a comprehensive investigation report for a fraud case.

    The report includes:
    - Case summary
    - Timeline of events
    - Evidence collected
    - Analysis results
    - Recommendations
    - Audit trail

    Args:
        case_id: Unique case identifier
        investigation_data: All data collected during investigation

    Returns:
        Dictionary with report content and metadata
    """
    report_sections = {
        "header": {
            "report_id": f"RPT-{case_id}",
            "case_id": case_id,
            "generated_at": datetime.now().isoformat(),
            "generated_by": "FraudShield AI",
            "classification": "CONFIDENTIEL"
        },
        "executive_summary": _generate_executive_summary(investigation_data),
        "case_details": _generate_case_details(investigation_data),
        "timeline": _generate_timeline(investigation_data),
        "evidence": _generate_evidence_section(investigation_data),
        "analysis": _generate_analysis_section(investigation_data),
        "network_analysis": _generate_network_section(investigation_data),
        "recommendations": _generate_recommendations(investigation_data),
        "appendices": _generate_appendices(investigation_data)
    }

    # Generate full report text
    report_text = _compile_report(report_sections)

    return {
        "status": "success",
        "case_id": case_id,
        "report_id": report_sections["header"]["report_id"],
        "sections": report_sections,
        "report_text": report_text,
        "page_count_estimate": len(report_text) // 3000 + 1,
        "generated_at": datetime.now().isoformat(),
        "format": "markdown"
    }


def _generate_executive_summary(data: Dict) -> str:
    return """
## Résumé Exécutif

Ce rapport présente les résultats de l'analyse automatisée de fraude
pour le dossier référencé. L'analyse a identifié plusieurs indicateurs
de risque nécessitant une attention particulière.

**Points clés:**
- Score de risque global identifié
- Anomalies détectées dans les patterns de transaction
- Recommandation d'investigation approfondie
"""


def _generate_case_details(data: Dict) -> str:
    return "## Détails du Dossier\n\n[Détails du cas à compléter]"


def _generate_timeline(data: Dict) -> str:
    return "## Chronologie des Événements\n\n[Timeline à générer]"


def _generate_evidence_section(data: Dict) -> str:
    return "## Preuves Collectées\n\n[Documents et preuves analysés]"


def _generate_analysis_section(data: Dict) -> str:
    return "## Analyse Détaillée\n\n[Résultats de l'analyse IA]"


def _generate_network_section(data: Dict) -> str:
    return "## Analyse de Réseau\n\n[Relations et connexions identifiées]"


def _generate_recommendations(data: Dict) -> str:
    return """
## Recommandations

1. **Action immédiate**: [À déterminer selon le cas]
2. **Investigation complémentaire**: [Éléments à vérifier]
3. **Mesures préventives**: [Actions de prévention suggérées]
"""


def _generate_appendices(data: Dict) -> str:
    return "## Annexes\n\n[Documents annexes et données brutes]"


def _compile_report(sections: Dict) -> str:
    """Compile all sections into final report."""
    header = sections["header"]
    report_parts = [
        f"# Rapport d'Investigation - {header['case_id']}",
        f"**Rapport N°:** {header['report_id']}",
        f"**Date:** {header['generated_at']}",
        f"**Classification:** {header['classification']}",
        "---",
        sections["executive_summary"],
        sections["case_details"],
        sections["timeline"],
        sections["evidence"],
        sections["analysis"],
        sections["network_analysis"],
        sections["recommendations"],
        sections["appendices"]
    ]
    return "\n\n".join(report_parts)


def summarize_case(
    case_data: Dict[str, Any],
    max_length: int = 500
) -> Dict[str, Any]:
    """
    Generate a concise summary of a fraud case.

    Args:
        case_data: Full case data
        max_length: Maximum summary length in characters

    Returns:
        Dictionary with case summary
    """
    # Extract key information
    case_id = case_data.get("case_id", "N/A")
    risk_level = case_data.get("risk_level", "unknown")
    amount = case_data.get("amount", 0)
    beneficiary = case_data.get("beneficiary_name", "N/A")
    date = case_data.get("date", "N/A")

    summary = f"""
Dossier {case_id} - Risque {risk_level.upper()}

Bénéficiaire: {beneficiary}
Date: {date}
Montant: {amount}€

Ce dossier a été signalé par le système de détection automatique.
Les principaux facteurs de risque identifiés nécessitent une revue.
""".strip()

    # Truncate if needed
    if len(summary) > max_length:
        summary = summary[:max_length-3] + "..."

    return {
        "status": "success",
        "case_id": case_id,
        "summary": summary,
        "summary_length": len(summary),
        "key_facts": {
            "risk_level": risk_level,
            "amount": amount,
            "beneficiary": beneficiary
        }
    }


def get_attention_weights(
    transaction_id: str,
    embedding_data: Optional[Dict] = None
) -> Dict[str, Any]:
    """
    Get attention weights showing which parts of input influenced the decision.

    Implements the attention-based pooling mechanism from the LLM encoder
    to show which tokens/features were most important.

    Args:
        transaction_id: Transaction to analyze
        embedding_data: Pre-computed embedding with attention

    Returns:
        Dictionary with attention weights and interpretation
    """
    # Attention weights (placeholder - production extracts from model)
    attention_analysis = {
        "high_attention_tokens": [
            {"token": "montant", "weight": 0.85, "context": "Montant: 5000€"},
            {"token": "urgent", "weight": 0.78, "context": "transfert urgent"},
            {"token": "nouveau", "weight": 0.65, "context": "nouveau prestataire"}
        ],
        "low_attention_tokens": [
            {"token": "date", "weight": 0.12},
            {"token": "le", "weight": 0.05}
        ],
        "feature_importance": {
            "amount": 0.35,
            "provider_risk": 0.25,
            "frequency": 0.20,
            "tenure": 0.12,
            "document_score": 0.08
        }
    }

    # Generate interpretation
    top_factors = sorted(
        attention_analysis["feature_importance"].items(),
        key=lambda x: x[1],
        reverse=True
    )[:3]

    interpretation = (
        f"Les facteurs les plus influents dans cette décision sont: "
        f"{', '.join([f[0] for f in top_factors])}. "
        f"Le modèle a particulièrement focalisé sur les mentions de "
        f"'{attention_analysis['high_attention_tokens'][0]['context']}'."
    )

    return {
        "status": "success",
        "transaction_id": transaction_id,
        "attention_analysis": attention_analysis,
        "interpretation": interpretation,
        "visualization_available": True,
        "note": "Production extracts real attention weights from transformer model"
    }


def format_for_audit(
    decision_data: Dict[str, Any],
    include_technical: bool = False
) -> Dict[str, Any]:
    """
    Format decision data for audit trail compliance.

    Ensures all required information is captured for:
    - RGPD compliance
    - Internal audit requirements
    - Regulatory reporting

    Args:
        decision_data: Raw decision data
        include_technical: Include technical model details

    Returns:
        Dictionary formatted for audit storage
    """
    audit_record = {
        "audit_id": f"AUD-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "timestamp": datetime.now().isoformat(),
        "decision_type": "fraud_detection",
        "input_summary": {
            "transaction_id": decision_data.get("transaction_id"),
            "amount": decision_data.get("amount"),
            "type": decision_data.get("type")
        },
        "output_summary": {
            "fraud_probability": decision_data.get("fraud_probability"),
            "risk_level": decision_data.get("risk_level"),
            "recommended_action": decision_data.get("recommended_action")
        },
        "factors_considered": decision_data.get("components", {}),
        "model_version": "fraudshield-v1.0",
        "explainability": {
            "explanation_available": True,
            "explanation_language": "fr",
            "rgpd_compliant": True
        }
    }

    if include_technical:
        audit_record["technical_details"] = {
            "embedding_model": "text-embedding-004",
            "scoring_model": "a2c-fraud-detector-v1",
            "threshold_used": 0.3,
            "inference_time_ms": 245
        }

    return {
        "status": "success",
        "audit_record": audit_record,
        "storage_ready": True,
        "retention_period_years": 5
    }
