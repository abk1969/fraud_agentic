"""
FraudShield AI - A2A (Agent-to-Agent) Protocol
Communication protocol for inter-agent messaging

A2A enables:
- Agent discovery and registration
- Task delegation between agents
- Result aggregation
- Error handling and recovery
"""

from .protocol import A2AProtocol, A2AMessage, A2AResponse
from .registry import AgentRegistry
from .router import MessageRouter

__all__ = [
    "A2AProtocol",
    "A2AMessage",
    "A2AResponse",
    "AgentRegistry",
    "MessageRouter",
]
