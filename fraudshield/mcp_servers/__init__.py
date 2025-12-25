"""
FraudShield AI - MCP Servers
Model Context Protocol servers for tool exposure

MCP Servers expose tools that can be consumed by:
- ADK Agents via McpToolset
- External systems via SSE/stdio
- A2A protocol connections
"""

from .database_server import DatabaseMCPServer
from .documents_server import DocumentsMCPServer
from .fraud_server import FraudMCPServer
from .identity_server import IdentityMCPServer

__all__ = [
    "DatabaseMCPServer",
    "DocumentsMCPServer",
    "FraudMCPServer",
    "IdentityMCPServer",
]
