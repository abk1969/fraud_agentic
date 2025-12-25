"""
FraudShield AI - Identity Verifier Agent
Specialized agent for identity verification and usurpation detection

Integrates with:
- RNIPP (French national identity register)
- INSEE databases
- Bank verification services
- Sanctions and watchlists
"""

from typing import Dict, Any, List, Optional
from datetime import datetime

from .base_agent import (
    AgentConfig,
    AgentContext,
    create_agent_instruction,
    GENERATION_CONFIG,
)
from ..tools.identity_tools import (
    verify_identity,
    check_rnipp,
    validate_rib,
    cross_reference_data,
    check_sanctions_list,
)


class IdentityVerifierAgent:
    """
    Identity Verifier Agent for FraudShield.

    Responsibilities:
    - Verify beneficiary identity against official sources
    - Detect identity usurpation attempts
    - Validate bank account information
    - Cross-reference data consistency
    - Check sanctions and watchlists
    """

    def __init__(self):
        """Initialize Identity Verifier Agent."""
        self.config = AgentConfig(
            name="identity_verifier",
            model="gemini-flash-latest",
            description="Agent spécialisé dans la vérification d'identité et détection d'usurpation",
            instruction=self._build_instruction(),
            output_key="identity_verification",
            generate_content_config=GENERATION_CONFIG,
        )

        # Tools available to this agent
        self.tools = [
            verify_identity,
            check_rnipp,
            validate_rib,
            cross_reference_data,
            check_sanctions_list,
        ]

    def _build_instruction(self) -> str:
        """Build agent instruction."""
        return create_agent_instruction(
            role="un expert en vérification d'identité et conformité",
            responsibilities=[
                "Vérifier l'identité des bénéficiaires via RNIPP et bases officielles",
                "Détecter les tentatives d'usurpation d'identité",
                "Valider les coordonnées bancaires (IBAN, BIC)",
                "Vérifier la cohérence des données entre différentes sources",
                "Consulter les listes de sanctions et de surveillance",
            ],
            guidelines=[
                "Appliquer les niveaux de vérification appropriés selon le risque",
                "Signaler toute incohérence dans les données d'identité",
                "Vérifier systématiquement le NIR pour les remboursements santé",
                "Porter attention aux changements récents de coordonnées bancaires",
                "Respecter les exigences RGPD dans le traitement des données",
            ],
            output_format="""
Retourne un JSON structuré avec:
- identity_verified: Boolean de vérification globale
- verification_score: Score de vérification (0-1)
- checks_performed: Liste des vérifications effectuées
- issues_found: Problèmes identifiés
- sanctions_match: Correspondance avec listes de sanctions
- rib_valid: Validité des coordonnées bancaires
- risk_indicators: Indicateurs de risque d'usurpation
- recommendation: Recommandation (proceed, verify, block)
"""
        )

    async def verify(
        self,
        beneficiary_data: Dict[str, Any],
        context: AgentContext,
        verification_level: str = "standard"
    ) -> Dict[str, Any]:
        """
        Verify beneficiary identity.

        Args:
            beneficiary_data: Beneficiary information
            context: Agent execution context
            verification_level: basic, standard, or enhanced

        Returns:
            Identity verification results
        """
        issues = []
        risk_indicators = []
        checks_performed = []

        # Step 1: Basic identity verification
        person_data = {
            "last_name": beneficiary_data.get("last_name", ""),
            "first_name": beneficiary_data.get("first_name", ""),
            "birth_date": beneficiary_data.get("birth_date", ""),
            "address": beneficiary_data.get("address", {}),
        }

        identity_result = verify_identity(person_data, verification_level)
        checks_performed.append("identity_verification")

        if not identity_result.get("identity_verified"):
            issues.append({
                "type": "identity_not_verified",
                "severity": "high",
                "details": "L'identité n'a pas pu être vérifiée"
            })
            risk_indicators.append("identity_verification_failed")

        # Step 2: RNIPP check if NIR provided
        rnipp_result = None
        if beneficiary_data.get("nir"):
            rnipp_result = check_rnipp(
                nir=beneficiary_data.get("nir", ""),
                last_name=beneficiary_data.get("last_name", ""),
                first_name=beneficiary_data.get("first_name", ""),
                birth_date=beneficiary_data.get("birth_date", "")
            )
            checks_performed.append("rnipp_check")

            if rnipp_result.get("status") == "error":
                issues.append({
                    "type": "rnipp_error",
                    "severity": "high",
                    "details": rnipp_result.get("error_message", "Erreur RNIPP")
                })
                risk_indicators.append("invalid_nir")
            elif not rnipp_result.get("name_matches"):
                issues.append({
                    "type": "rnipp_mismatch",
                    "severity": "high",
                    "details": "Le nom ne correspond pas au NIR"
                })
                risk_indicators.append("nir_name_mismatch")

        # Step 3: RIB validation if provided
        rib_result = None
        if beneficiary_data.get("iban"):
            rib_result = validate_rib(
                iban=beneficiary_data.get("iban", ""),
                bic=beneficiary_data.get("bic"),
                holder_name=f"{beneficiary_data.get('first_name', '')} {beneficiary_data.get('last_name', '')}"
            )
            checks_performed.append("rib_validation")

            if not rib_result.get("overall_valid"):
                issues.append({
                    "type": "invalid_rib",
                    "severity": "high",
                    "details": "Coordonnées bancaires invalides"
                })
                risk_indicators.append("invalid_bank_account")

            for risk in rib_result.get("risk_indicators", []):
                risk_indicators.append(risk.get("type", ""))

        # Step 4: Cross-reference data
        beneficiary_id = beneficiary_data.get("beneficiary_id", "")
        if beneficiary_id:
            cross_ref_result = cross_reference_data(
                beneficiary_id=beneficiary_id,
                data_points=beneficiary_data
            )
            checks_performed.append("cross_reference")

            for inconsistency in cross_ref_result.get("inconsistencies", []):
                issues.append({
                    "type": "data_inconsistency",
                    "severity": "medium",
                    "details": inconsistency.get("details", "")
                })
                risk_indicators.append("data_inconsistency")

        # Step 5: Sanctions check
        sanctions_result = check_sanctions_list(person_data)
        checks_performed.append("sanctions_check")

        if sanctions_result.get("any_match_found"):
            issues.append({
                "type": "sanctions_match",
                "severity": "critical",
                "details": "Correspondance trouvée sur liste de sanctions"
            })
            risk_indicators.append("sanctions_match")

        # Calculate verification score
        total_checks = len(checks_performed)
        passed_checks = total_checks - len([i for i in issues if i["severity"] in ["high", "critical"]])
        verification_score = passed_checks / total_checks if total_checks > 0 else 0

        # Determine recommendation
        if any(i["severity"] == "critical" for i in issues):
            recommendation = "block"
        elif any(i["severity"] == "high" for i in issues):
            recommendation = "verify"
        elif len(issues) > 0:
            recommendation = "review"
        else:
            recommendation = "proceed"

        return {
            "status": "success",
            "beneficiary_id": beneficiary_id,
            "verification_level": verification_level,
            "identity_verified": verification_score >= 0.8,
            "verification_score": round(verification_score, 4),
            "checks_performed": checks_performed,
            "issues_found": issues,
            "risk_indicators": risk_indicators,
            "rnipp_check": rnipp_result,
            "rib_validation": rib_result,
            "sanctions_match": sanctions_result.get("any_match_found", False),
            "recommendation": recommendation,
            "verification_timestamp": datetime.now().isoformat(),
            "elapsed_ms": context.elapsed_time_ms()
        }

    async def quick_check(
        self,
        nir: str,
        iban: str
    ) -> Dict[str, Any]:
        """
        Quick identity and bank verification.

        Args:
            nir: NIR to verify
            iban: IBAN to validate

        Returns:
            Quick verification results
        """
        nir_valid = len(nir.replace(" ", "")) == 15
        rib_result = validate_rib(iban)

        return {
            "status": "success",
            "nir_format_valid": nir_valid,
            "iban_valid": rib_result.get("overall_valid", False),
            "quick_check": True
        }

    def get_adk_config(self) -> Dict[str, Any]:
        """Get ADK Agent configuration."""
        return {
            **self.config.to_dict(),
            "tools": self.tools,
        }


def create_agent() -> IdentityVerifierAgent:
    """Factory function to create agent instance."""
    return IdentityVerifierAgent()
