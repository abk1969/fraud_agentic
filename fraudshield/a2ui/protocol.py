"""
FraudShield AI - A2UI Protocol Implementation
Agent-to-User Interface communication

Enables agents to:
- Generate natural language responses
- Create structured UI components
- Send progress updates
- Request user clarification
"""

from typing import Dict, Any, List, Optional, Union
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import uuid


class UIComponentType(Enum):
    """Types of UI components agents can generate."""
    TEXT = "text"
    CARD = "card"
    TABLE = "table"
    CHART = "chart"
    ALERT = "alert"
    PROGRESS = "progress"
    ACTION_BUTTONS = "action_buttons"
    FORM = "form"
    TIMELINE = "timeline"
    RISK_INDICATOR = "risk_indicator"


class MessageSeverity(Enum):
    """Message severity levels."""
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


@dataclass
class UIComponent:
    """
    UI Component for agent-generated interfaces.

    Represents a structured UI element that can be rendered
    by the frontend application.
    """
    component_type: UIComponentType
    content: Dict[str, Any]
    style: Optional[Dict[str, str]] = None
    actions: Optional[List[Dict[str, Any]]] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "type": self.component_type.value,
            "content": self.content,
            "style": self.style,
            "actions": self.actions,
            "metadata": self.metadata,
        }


@dataclass
class UIMessage:
    """
    UI Message container.

    Contains all information needed to render an agent response
    in the user interface.
    """
    message_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    agent_id: str = ""
    agent_name: str = ""
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    text: str = ""
    components: List[UIComponent] = field(default_factory=list)
    severity: MessageSeverity = MessageSeverity.INFO
    requires_action: bool = False
    action_options: Optional[List[Dict[str, str]]] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "message_id": self.message_id,
            "agent_id": self.agent_id,
            "agent_name": self.agent_name,
            "timestamp": self.timestamp,
            "text": self.text,
            "components": [c.to_dict() for c in self.components],
            "severity": self.severity.value,
            "requires_action": self.requires_action,
            "action_options": self.action_options,
            "metadata": self.metadata,
        }


class A2UIProtocol:
    """
    A2UI Protocol Handler.

    Manages agent-to-user interface communication.
    """

    def __init__(self, agent_id: str, agent_name: str):
        """
        Initialize A2UI protocol handler.

        Args:
            agent_id: Agent identifier
            agent_name: Human-readable agent name
        """
        self.agent_id = agent_id
        self.agent_name = agent_name

    def create_text_message(
        self,
        text: str,
        severity: MessageSeverity = MessageSeverity.INFO
    ) -> UIMessage:
        """Create simple text message."""
        return UIMessage(
            agent_id=self.agent_id,
            agent_name=self.agent_name,
            text=text,
            severity=severity,
        )

    def create_fraud_decision_message(
        self,
        decision: str,
        fraud_probability: float,
        risk_level: str,
        explanation: str,
        key_findings: List[Dict[str, str]]
    ) -> UIMessage:
        """
        Create fraud decision UI message.

        Args:
            decision: PASS, FLAG, or BLOCK
            fraud_probability: Probability score
            risk_level: Risk level string
            explanation: Human-readable explanation
            key_findings: List of key findings

        Returns:
            Formatted UIMessage for fraud decision
        """
        # Determine severity based on decision
        severity_map = {
            "PASS": MessageSeverity.SUCCESS,
            "FLAG": MessageSeverity.WARNING,
            "BLOCK": MessageSeverity.CRITICAL,
        }
        severity = severity_map.get(decision, MessageSeverity.INFO)

        # Create risk indicator component
        risk_indicator = UIComponent(
            component_type=UIComponentType.RISK_INDICATOR,
            content={
                "score": fraud_probability,
                "level": risk_level,
                "decision": decision,
            },
            style={
                "color": self._get_risk_color(risk_level),
            }
        )

        # Create findings card
        findings_card = UIComponent(
            component_type=UIComponentType.CARD,
            content={
                "title": "Facteurs de Décision",
                "items": [
                    {
                        "type": f.get("type", ""),
                        "description": f.get("description", ""),
                        "severity": f.get("severity", "medium"),
                    }
                    for f in key_findings[:5]
                ],
            }
        )

        # Create action buttons based on decision
        actions = self._get_decision_actions(decision)
        action_buttons = UIComponent(
            component_type=UIComponentType.ACTION_BUTTONS,
            content={"buttons": actions}
        )

        return UIMessage(
            agent_id=self.agent_id,
            agent_name=self.agent_name,
            text=explanation,
            components=[risk_indicator, findings_card, action_buttons],
            severity=severity,
            requires_action=decision in ["FLAG", "BLOCK"],
            action_options=actions if decision != "PASS" else None,
        )

    def create_progress_message(
        self,
        phase: str,
        progress: float,
        message: str = ""
    ) -> UIMessage:
        """
        Create progress update message.

        Args:
            phase: Current processing phase
            progress: Progress percentage (0-1)
            message: Optional status message

        Returns:
            Progress UIMessage
        """
        progress_component = UIComponent(
            component_type=UIComponentType.PROGRESS,
            content={
                "phase": phase,
                "progress": progress,
                "message": message,
            }
        )

        return UIMessage(
            agent_id=self.agent_id,
            agent_name=self.agent_name,
            text=message or f"En cours: {phase}",
            components=[progress_component],
            severity=MessageSeverity.INFO,
        )

    def create_alert_message(
        self,
        title: str,
        message: str,
        severity: MessageSeverity,
        actions: Optional[List[Dict[str, str]]] = None
    ) -> UIMessage:
        """
        Create alert message.

        Args:
            title: Alert title
            message: Alert message
            severity: Alert severity
            actions: Optional action buttons

        Returns:
            Alert UIMessage
        """
        alert_component = UIComponent(
            component_type=UIComponentType.ALERT,
            content={
                "title": title,
                "message": message,
            },
            actions=actions,
        )

        return UIMessage(
            agent_id=self.agent_id,
            agent_name=self.agent_name,
            text=message,
            components=[alert_component],
            severity=severity,
            requires_action=actions is not None,
            action_options=actions,
        )

    def create_investigation_report_message(
        self,
        case_id: str,
        report_sections: Dict[str, str],
        timeline: List[Dict[str, Any]]
    ) -> UIMessage:
        """
        Create investigation report message.

        Args:
            case_id: Case identifier
            report_sections: Report section contents
            timeline: Event timeline

        Returns:
            Investigation report UIMessage
        """
        # Header card
        header = UIComponent(
            component_type=UIComponentType.CARD,
            content={
                "title": f"Rapport d'Investigation - {case_id}",
                "subtitle": "Rapport généré par FraudShield AI",
            }
        )

        # Timeline component
        timeline_component = UIComponent(
            component_type=UIComponentType.TIMELINE,
            content={"events": timeline}
        )

        # Report sections as cards
        section_cards = []
        for section_name, section_content in report_sections.items():
            section_cards.append(UIComponent(
                component_type=UIComponentType.CARD,
                content={
                    "title": section_name,
                    "body": section_content,
                }
            ))

        # Action buttons
        actions = UIComponent(
            component_type=UIComponentType.ACTION_BUTTONS,
            content={
                "buttons": [
                    {"label": "Télécharger PDF", "action": "download_pdf"},
                    {"label": "Partager", "action": "share"},
                    {"label": "Archiver", "action": "archive"},
                ]
            }
        )

        return UIMessage(
            agent_id=self.agent_id,
            agent_name=self.agent_name,
            text=f"Rapport d'investigation pour le dossier {case_id}",
            components=[header, timeline_component] + section_cards + [actions],
            severity=MessageSeverity.INFO,
        )

    def create_clarification_request(
        self,
        question: str,
        options: List[Dict[str, str]],
        context: str = ""
    ) -> UIMessage:
        """
        Create clarification request message.

        Args:
            question: Question to ask user
            options: Available response options
            context: Additional context

        Returns:
            Clarification request UIMessage
        """
        form_component = UIComponent(
            component_type=UIComponentType.FORM,
            content={
                "question": question,
                "context": context,
                "options": options,
            }
        )

        return UIMessage(
            agent_id=self.agent_id,
            agent_name=self.agent_name,
            text=question,
            components=[form_component],
            severity=MessageSeverity.INFO,
            requires_action=True,
            action_options=options,
        )

    def _get_risk_color(self, risk_level: str) -> str:
        """Get color for risk level."""
        colors = {
            "low": "#4CAF50",  # Green
            "medium": "#FF9800",  # Orange
            "high": "#F44336",  # Red
            "critical": "#9C27B0",  # Purple
        }
        return colors.get(risk_level.lower(), "#9E9E9E")

    def _get_decision_actions(self, decision: str) -> List[Dict[str, str]]:
        """Get action buttons for decision."""
        if decision == "PASS":
            return [
                {"label": "Valider", "action": "approve"},
                {"label": "Détails", "action": "view_details"},
            ]
        elif decision == "FLAG":
            return [
                {"label": "Enquêter", "action": "investigate"},
                {"label": "Approuver", "action": "override_approve"},
                {"label": "Rejeter", "action": "reject"},
            ]
        else:  # BLOCK
            return [
                {"label": "Confirmer Blocage", "action": "confirm_block"},
                {"label": "Escalader", "action": "escalate"},
                {"label": "Réviser", "action": "review"},
            ]
