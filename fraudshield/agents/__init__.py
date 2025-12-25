"""
FraudShield AI - Specialized Agents
Google ADK-based agents for fraud detection orchestration

Agent Hierarchy:
1. FraudOrchestratorAgent (Root) - Main orchestrator
   ├── DocumentAnalystAgent - Document analysis
   ├── TransactionAnalystAgent - Transaction scoring
   ├── IdentityVerifierAgent - Identity verification
   ├── PatternDetectorAgent - Pattern matching
   ├── NetworkAnalyzerAgent - Network/graph analysis
   └── ExplanationGeneratorAgent - XAI explanations

Communication:
- A2A: Agent-to-Agent protocol for internal communication
- A2UI: Agent-to-User Interface for user interactions
- MCP: Model Context Protocol for tool access
"""

from .document_analyst import DocumentAnalystAgent
from .transaction_analyst import TransactionAnalystAgent
from .identity_verifier import IdentityVerifierAgent
from .pattern_detector import PatternDetectorAgent
from .network_analyzer import NetworkAnalyzerAgent
from .explanation_generator import ExplanationGeneratorAgent
from .orchestrator import FraudOrchestratorAgent

__all__ = [
    "DocumentAnalystAgent",
    "TransactionAnalystAgent",
    "IdentityVerifierAgent",
    "PatternDetectorAgent",
    "NetworkAnalyzerAgent",
    "ExplanationGeneratorAgent",
    "FraudOrchestratorAgent",
]
