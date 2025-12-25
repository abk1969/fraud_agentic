"""
FraudShield AI - Response Builder
Builds structured UI responses from agent outputs

Transforms raw agent outputs into user-friendly
UI components and messages.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime

from .protocol import (
    A2UIProtocol,
    UIMessage,
    UIComponent,
    UIComponentType,
    MessageSeverity,
)


class ResponseBuilder:
    """
    Response Builder for A2UI messages.

    Transforms agent outputs into structured UI responses.
    """

    def __init__(self, agent_id: str = "fraudshield", agent_name: str = "FraudShield AI"):
        """
        Initialize response builder.

        Args:
            agent_id: Agent identifier
            agent_name: Display name
        """
        self.protocol = A2UIProtocol(agent_id, agent_name)

    def build_fraud_detection_response(
        self,
        result: Dict[str, Any]
    ) -> UIMessage:
        """
        Build response for fraud detection result.

        Args:
            result: Fraud detection result from orchestrator

        Returns:
            Formatted UIMessage
        """
        decision = result.get("decision", "REVIEW")
        fraud_probability = result.get("fraud_probability", 0)
        risk_level = result.get("risk_level", "unknown")
        explanation = result.get("explanation", "")
        key_findings = result.get("key_findings", [])

        return self.protocol.create_fraud_decision_message(
            decision=decision,
            fraud_probability=fraud_probability,
            risk_level=risk_level,
            explanation=explanation,
            key_findings=key_findings,
        )

    def build_document_analysis_response(
        self,
        result: Dict[str, Any]
    ) -> UIMessage:
        """
        Build response for document analysis result.

        Args:
            result: Document analysis result

        Returns:
            Formatted UIMessage
        """
        docs_analyzed = result.get("documents_analyzed", 0)
        authenticity = result.get("overall_authenticity_score", 1)
        recommendation = result.get("recommendation", "review")

        # Determine severity
        if recommendation == "reject":
            severity = MessageSeverity.ERROR
        elif recommendation == "review":
            severity = MessageSeverity.WARNING
        else:
            severity = MessageSeverity.SUCCESS

        # Build components
        components = []

        # Summary card
        summary = UIComponent(
            component_type=UIComponentType.CARD,
            content={
                "title": "Analyse Documentaire",
                "metrics": [
                    {"label": "Documents analysés", "value": docs_analyzed},
                    {"label": "Score d'authenticité", "value": f"{authenticity:.0%}"},
                    {"label": "Recommandation", "value": recommendation.upper()},
                ],
            }
        )
        components.append(summary)

        # Risk indicators
        risk_indicators = result.get("risk_indicators", [])
        if risk_indicators:
            risks = UIComponent(
                component_type=UIComponentType.ALERT,
                content={
                    "title": "Indicateurs de Risque",
                    "items": [
                        f"[{r.get('severity', '').upper()}] {r.get('description', '')}"
                        for r in risk_indicators[:5]
                    ],
                }
            )
            components.append(risks)

        # Document details table
        doc_results = result.get("document_results", [])
        if doc_results:
            table = UIComponent(
                component_type=UIComponentType.TABLE,
                content={
                    "headers": ["Document", "Type", "Authenticité", "Status"],
                    "rows": [
                        [
                            doc.get("document_id", ""),
                            doc.get("classification", {}).get("detected_type", ""),
                            f"{doc.get('tampering', {}).get('score', 0):.0%}",
                            "OK" if not doc.get("tampering", {}).get("detected") else "ALERTE"
                        ]
                        for doc in doc_results
                    ],
                }
            )
            components.append(table)

        return UIMessage(
            agent_id=self.protocol.agent_id,
            agent_name=self.protocol.agent_name,
            text=f"Analyse de {docs_analyzed} document(s) terminée. Score d'authenticité: {authenticity:.0%}",
            components=components,
            severity=severity,
            requires_action=recommendation != "accept",
        )

    def build_network_analysis_response(
        self,
        result: Dict[str, Any]
    ) -> UIMessage:
        """
        Build response for network analysis result.

        Args:
            result: Network analysis result

        Returns:
            Formatted UIMessage
        """
        entity_id = result.get("entity_id", "")
        network_score = result.get("network_risk_score", 0)
        fraud_rings = result.get("fraud_rings", {})
        recommendation = result.get("recommendation", "normal")

        # Determine severity
        if recommendation == "investigate":
            severity = MessageSeverity.CRITICAL
        elif recommendation == "monitor":
            severity = MessageSeverity.WARNING
        else:
            severity = MessageSeverity.INFO

        components = []

        # Network stats card
        stats = result.get("network_stats", {})
        stats_card = UIComponent(
            component_type=UIComponentType.CARD,
            content={
                "title": "Statistiques Réseau",
                "metrics": [
                    {"label": "Noeuds connectés", "value": stats.get("total_nodes", 0)},
                    {"label": "Relations", "value": stats.get("total_relationships", 0)},
                    {"label": "Score de risque", "value": f"{network_score:.0%}"},
                ],
            }
        )
        components.append(stats_card)

        # Fraud rings alert
        rings_count = fraud_rings.get("detected_count", 0)
        if rings_count > 0:
            rings_alert = UIComponent(
                component_type=UIComponentType.ALERT,
                content={
                    "title": "Cercles de Fraude Détectés",
                    "message": f"{rings_count} cercle(s) de fraude potentiel(s) identifié(s)",
                    "details": [
                        f"Montant à risque: {fraud_rings.get('total_amount_at_risk', 0):.2f}€",
                        f"Entités impliquées: {fraud_rings.get('total_entities_involved', 0)}",
                    ],
                }
            )
            components.append(rings_alert)

        # Community info
        community = result.get("community", {})
        if community.get("size", 0) > 0:
            community_card = UIComponent(
                component_type=UIComponentType.CARD,
                content={
                    "title": "Communauté",
                    "metrics": [
                        {"label": "Taille", "value": community.get("size", 0)},
                        {"label": "Densité", "value": f"{community.get('density', 0):.0%}"},
                        {"label": "Taux de fraude", "value": f"{community.get('fraud_rate', 0):.0%}"},
                        {"label": "Niveau de risque", "value": community.get("risk_level", "").upper()},
                    ],
                }
            )
            components.append(community_card)

        return UIMessage(
            agent_id=self.protocol.agent_id,
            agent_name=self.protocol.agent_name,
            text=f"Analyse réseau pour {entity_id}. Recommandation: {recommendation.upper()}",
            components=components,
            severity=severity,
            requires_action=recommendation == "investigate",
        )

    def build_batch_processing_response(
        self,
        result: Dict[str, Any]
    ) -> UIMessage:
        """
        Build response for batch processing result.

        Args:
            result: Batch processing result

        Returns:
            Formatted UIMessage
        """
        total = result.get("transactions_processed", 0)
        flagged = result.get("flagged_count", 0)
        passed = result.get("pass_count", 0)
        avg_prob = result.get("average_fraud_probability", 0)

        # Determine severity based on flagged ratio
        flag_ratio = flagged / total if total > 0 else 0
        if flag_ratio > 0.2:
            severity = MessageSeverity.WARNING
        else:
            severity = MessageSeverity.SUCCESS

        components = []

        # Summary card
        summary = UIComponent(
            component_type=UIComponentType.CARD,
            content={
                "title": "Résumé du Traitement Batch",
                "metrics": [
                    {"label": "Total traité", "value": total},
                    {"label": "Signalés", "value": flagged},
                    {"label": "Validés", "value": passed},
                    {"label": "Probabilité moyenne", "value": f"{avg_prob:.1%}"},
                ],
            }
        )
        components.append(summary)

        # Chart for distribution
        chart = UIComponent(
            component_type=UIComponentType.CHART,
            content={
                "type": "pie",
                "title": "Distribution des Décisions",
                "data": [
                    {"label": "Signalés", "value": flagged, "color": "#F44336"},
                    {"label": "Validés", "value": passed, "color": "#4CAF50"},
                ],
            }
        )
        components.append(chart)

        # Flagged transactions table
        results = result.get("results", [])
        flagged_txs = [r for r in results if r.get("recommended_action") == "FLAG"]
        if flagged_txs:
            table = UIComponent(
                component_type=UIComponentType.TABLE,
                content={
                    "headers": ["Transaction", "Probabilité", "Risque"],
                    "rows": [
                        [
                            tx.get("transaction_id", ""),
                            f"{tx.get('fraud_probability', 0):.1%}",
                            tx.get("risk_level", "").upper(),
                        ]
                        for tx in flagged_txs[:10]
                    ],
                }
            )
            components.append(table)

        return UIMessage(
            agent_id=self.protocol.agent_id,
            agent_name=self.protocol.agent_name,
            text=f"Batch terminé: {total} transactions, {flagged} signalées ({flag_ratio:.1%})",
            components=components,
            severity=severity,
        )

    def build_error_response(
        self,
        error: str,
        context: Optional[Dict[str, Any]] = None
    ) -> UIMessage:
        """
        Build error response message.

        Args:
            error: Error message
            context: Optional error context

        Returns:
            Error UIMessage
        """
        components = [
            UIComponent(
                component_type=UIComponentType.ALERT,
                content={
                    "title": "Erreur de Traitement",
                    "message": error,
                    "context": context or {},
                }
            )
        ]

        return UIMessage(
            agent_id=self.protocol.agent_id,
            agent_name=self.protocol.agent_name,
            text=f"Erreur: {error}",
            components=components,
            severity=MessageSeverity.ERROR,
            requires_action=True,
            action_options=[
                {"label": "Réessayer", "action": "retry"},
                {"label": "Contacter Support", "action": "support"},
            ],
        )

    def build_processing_started_response(
        self,
        transaction_id: str,
        case_id: str
    ) -> UIMessage:
        """
        Build processing started message.

        Args:
            transaction_id: Transaction being processed
            case_id: Case ID assigned

        Returns:
            Processing started UIMessage
        """
        return self.protocol.create_progress_message(
            phase="Initialisation",
            progress=0.0,
            message=f"Analyse de la transaction {transaction_id} démarrée (Dossier: {case_id})"
        )

    def build_phase_update_response(
        self,
        phase: str,
        progress: float,
        details: Optional[str] = None
    ) -> UIMessage:
        """
        Build phase update message.

        Args:
            phase: Current phase name
            progress: Progress percentage
            details: Optional phase details

        Returns:
            Phase update UIMessage
        """
        phase_names = {
            "intake": "Réception des données",
            "analyze": "Analyse en cours",
            "decide": "Prise de décision",
            "explain": "Génération des explications",
        }

        display_phase = phase_names.get(phase, phase)

        return self.protocol.create_progress_message(
            phase=display_phase,
            progress=progress,
            message=details or f"Phase: {display_phase}"
        )
