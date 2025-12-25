"""
FraudShield AI - A2UI (Agent-to-User Interface) Protocol
Communication protocol for agent-user interactions

A2UI enables:
- Natural language responses to users
- Structured UI component generation
- Progress updates and notifications
- Interactive clarification requests
"""

from .protocol import A2UIProtocol, UIMessage, UIComponent, UIComponentType
from .response_builder import ResponseBuilder
from .notification import NotificationService

__all__ = [
    "A2UIProtocol",
    "UIMessage",
    "UIComponent",
    "UIComponentType",
    "ResponseBuilder",
    "NotificationService",
]
