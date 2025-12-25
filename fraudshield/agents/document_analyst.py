"""
FraudShield AI - Document Analyst Agent
Specialized agent for document analysis and verification

Uses:
- Document AI for OCR and entity extraction
- Gemini Vision for tampering detection
- Template matching for document classification
"""

from typing import Dict, Any, List, Optional
from datetime import datetime

from .base_agent import (
    AgentConfig,
    AgentContext,
    create_agent_instruction,
    GENERATION_CONFIG,
)
from ..tools.document_tools import (
    analyze_document,
    extract_entities,
    detect_tampering,
    classify_document,
    ocr_extract,
    validate_medical_document,
)


class DocumentAnalystAgent:
    """
    Document Analyst Agent for FraudShield.

    Responsibilities:
    - Analyze submitted documents (invoices, prescriptions, certificates)
    - Detect document tampering and falsification
    - Extract structured entities (dates, amounts, names)
    - Validate document authenticity
    - Cross-reference document information
    """

    def __init__(self):
        """Initialize Document Analyst Agent."""
        self.config = AgentConfig(
            name="document_analyst",
            model="gemini-flash-latest",
            description="Agent spécialisé dans l'analyse documentaire et la détection de falsification",
            instruction=self._build_instruction(),
            output_key="document_analysis",
            generate_content_config=GENERATION_CONFIG,
        )

        # Tools available to this agent
        self.tools = [
            analyze_document,
            extract_entities,
            detect_tampering,
            classify_document,
            ocr_extract,
            validate_medical_document,
        ]

    def _build_instruction(self) -> str:
        """Build agent instruction."""
        return create_agent_instruction(
            role="un analyste documentaire expert",
            responsibilities=[
                "Analyser tous les documents joints aux demandes de remboursement",
                "Détecter les signes de falsification ou modification",
                "Extraire les entités clés (dates, montants, noms, codes)",
                "Classifier le type de document et vérifier sa conformité",
                "Valider la cohérence entre les informations documentaires et la demande",
            ],
            guidelines=[
                "Toujours vérifier l'authenticité avant l'extraction d'informations",
                "Signaler toute incohérence entre documents d'un même dossier",
                "Porter une attention particulière aux modifications de montants ou dates",
                "Vérifier que les documents médicaux portent les signatures requises",
                "Croiser les informations extraites avec les données du bénéficiaire",
            ],
            output_format="""
Retourne un JSON structuré avec:
- document_id: Identifiant du document
- document_type: Type détecté (facture, ordonnance, certificat, etc.)
- authenticity_score: Score d'authenticité (0-1)
- tampering_detected: Boolean
- entities: Entités extraites
- validation_issues: Liste des problèmes identifiés
- risk_indicators: Indicateurs de risque
- recommendation: Recommandation (accept, review, reject)
"""
        )

    async def analyze(
        self,
        documents: List[Dict[str, Any]],
        context: AgentContext
    ) -> Dict[str, Any]:
        """
        Analyze a list of documents.

        Args:
            documents: List of document metadata with URIs
            context: Agent execution context

        Returns:
            Comprehensive document analysis results
        """
        results = []
        overall_score = 1.0
        risk_indicators = []

        for doc in documents:
            doc_uri = doc.get("uri", "")
            doc_type = doc.get("type")

            # Step 1: Classify document
            classification = classify_document(doc_uri)

            # Step 2: Extract text
            ocr_result = ocr_extract(doc_uri)

            # Step 3: Detect tampering
            tampering_result = detect_tampering(doc_uri)

            # Step 4: Extract entities
            entities_result = extract_entities(doc_uri)

            # Step 5: Validate if medical document
            validation_result = None
            if classification.get("detected_type") in ["ordonnance", "certificat_medical"]:
                validation_result = validate_medical_document(
                    doc_uri,
                    classification.get("detected_type")
                )

            # Compile document result
            doc_result = {
                "document_id": doc.get("id", ""),
                "document_uri": doc_uri,
                "classification": classification,
                "ocr": {
                    "text_length": len(ocr_result.get("text_extracted", "")),
                    "confidence": ocr_result.get("confidence", 0),
                },
                "tampering": {
                    "detected": tampering_result.get("tampering_detected", False),
                    "score": tampering_result.get("authenticity_score", 0),
                    "warnings": tampering_result.get("warnings", []),
                },
                "entities": entities_result.get("entities_found", {}),
                "validation": validation_result,
            }

            results.append(doc_result)

            # Update overall score
            auth_score = tampering_result.get("authenticity_score", 1.0)
            overall_score = min(overall_score, auth_score)

            # Collect risk indicators
            if tampering_result.get("tampering_detected"):
                risk_indicators.append({
                    "type": "document_tampering",
                    "severity": "high",
                    "document_id": doc.get("id", ""),
                    "description": "Falsification documentaire détectée"
                })

            for warning in tampering_result.get("warnings", []):
                risk_indicators.append({
                    "type": "document_warning",
                    "severity": warning.get("severity", "medium"),
                    "document_id": doc.get("id", ""),
                    "description": warning.get("details", "")
                })

        # Determine recommendation
        if overall_score < 0.5:
            recommendation = "reject"
        elif overall_score < 0.7 or len(risk_indicators) > 0:
            recommendation = "review"
        else:
            recommendation = "accept"

        return {
            "status": "success",
            "transaction_id": context.transaction_id,
            "documents_analyzed": len(results),
            "document_results": results,
            "overall_authenticity_score": round(overall_score, 4),
            "risk_indicators": risk_indicators,
            "recommendation": recommendation,
            "analysis_timestamp": datetime.now().isoformat(),
            "elapsed_ms": context.elapsed_time_ms()
        }

    async def quick_check(
        self,
        document_uri: str
    ) -> Dict[str, Any]:
        """
        Quick document authenticity check.

        Args:
            document_uri: Document URI to check

        Returns:
            Quick authenticity assessment
        """
        tampering = detect_tampering(document_uri)

        return {
            "status": "success",
            "document_uri": document_uri,
            "is_authentic": not tampering.get("tampering_detected", False),
            "authenticity_score": tampering.get("authenticity_score", 0),
            "quick_check": True
        }

    def get_adk_config(self) -> Dict[str, Any]:
        """
        Get ADK Agent configuration.

        Returns configuration dict for google.adk.agents.Agent
        """
        return {
            **self.config.to_dict(),
            "tools": self.tools,
        }


def create_agent() -> DocumentAnalystAgent:
    """Factory function to create agent instance."""
    return DocumentAnalystAgent()
