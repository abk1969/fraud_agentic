# FraudShield AI Platform
# Full Agentic AI for Fraud Detection in French Social Protection Groups
# Built with Google ADK (Agent Development Kit)

"""
FraudShield AI - Enterprise Fraud Detection Platform

A Full Stack Agentic AI application implementing the LLM+RL hybrid
approach for fraud detection in French social protection systems.

Key Components:
- agents: Specialized AI agents (Document, Transaction, Identity, etc.)
- mcp_servers: MCP protocol servers for tool access
- tools: Fraud detection, document analysis, network analysis tools
- config: Configuration and reward functions
- a2a: Agent-to-Agent communication protocol
- a2ui: Agent-to-User Interface protocol
- rl: Reinforcement Learning components (A2C policy, trainer)

Usage:
    from fraudshield import get_app

    app = get_app()
    result = await app.process_transaction(transaction_data)
"""

__version__ = "1.0.0"
__author__ = "FraudShield AI Team"
__license__ = "Proprietary"

from . import agents
from . import mcp_servers
from . import tools
from . import config
from . import a2a
from . import a2ui
from . import rl

from .app import FraudShieldApp, get_app

__all__ = [
    "FraudShieldApp",
    "get_app",
    "agents",
    "mcp_servers",
    "tools",
    "config",
    "a2a",
    "a2ui",
    "rl",
]
