"""
FraudShield AI - Agents Router
API endpoints for agent management and monitoring
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime

from ..models.responses import AgentStatusResponse, SystemStatusResponse
from ..services.fraud_service import FraudService

router = APIRouter()


def get_fraud_service() -> FraudService:
    """Dependency injection for fraud service."""
    from ..main import fraud_service
    if fraud_service is None:
        raise HTTPException(status_code=503, detail="Service not initialized")
    return fraud_service


@router.get("/status", response_model=SystemStatusResponse)
async def get_system_status(
    service: FraudService = Depends(get_fraud_service)
):
    """
    Récupérer le statut global du système.
    """
    status = service.get_status()

    return SystemStatusResponse(
        status=status.get("status", "unknown"),
        uptime_seconds=status.get("uptime_seconds", 0),
        agents=status.get("agents", {}),
        rl_training=status.get("rl_training", {}),
        settings=status.get("settings", {})
    )


@router.get("/list", response_model=List[AgentStatusResponse])
async def list_agents(
    service: FraudService = Depends(get_fraud_service)
):
    """
    Lister tous les agents enregistrés.
    """
    agents = service.get_agent_status()

    return [
        AgentStatusResponse(
            agent_id=agent.get("agent_id", ""),
            agent_name=agent.get("agent_name", ""),
            status=agent.get("status", "unknown"),
            is_healthy=agent.get("is_healthy", False),
            capabilities=agent.get("capabilities", []),
            supported_tasks=agent.get("supported_tasks", []),
            last_heartbeat=agent.get("last_heartbeat")
        )
        for agent in agents
    ]


@router.get("/model/info")
async def get_model_info(
    service: FraudService = Depends(get_fraud_service)
):
    """
    Récupérer les informations sur le modèle RL.
    """
    return service.get_model_info()


@router.post("/model/train")
async def trigger_training(
    service: FraudService = Depends(get_fraud_service)
):
    """
    Déclencher un cycle d'entraînement du modèle RL.
    """
    # In production, would trigger async training job
    return {
        "status": "training_triggered",
        "timestamp": datetime.now().isoformat(),
        "note": "Training runs in background"
    }


@router.get("/config")
async def get_agent_config(
    service: FraudService = Depends(get_fraud_service)
):
    """
    Récupérer la configuration des agents.
    """
    return {
        "orchestrator": {
            "model": "gemini-flash-latest",
            "sub_agents": [
                "document_analyst",
                "transaction_analyst",
                "identity_verifier",
                "pattern_detector",
                "network_analyzer",
                "explanation_generator"
            ]
        },
        "cost_matrix": {
            "true_positive": 10.0,
            "true_negative": 1.0,
            "false_positive": -5.0,
            "false_negative": -50.0,
        },
        "thresholds": {
            "fraud_threshold": 0.7,
            "alert_threshold": 0.5,
            "auto_approve_threshold": 0.2,
        },
        "features": {
            "llm_enabled": True,
            "rl_enabled": True,
            "xai_enabled": True,
            "batch_processing": True,
        },
        "workflows": {
            "quick": "Transaction scoring only",
            "standard": "Full analysis pipeline",
            "investigation": "Deep analysis with report",
            "batch": "Bulk processing"
        }
    }


@router.get("/mcp-servers")
async def list_mcp_servers(
    service: FraudService = Depends(get_fraud_service)
):
    """
    Lister les serveurs MCP disponibles.
    """
    return {
        "servers": [
            {
                "server_id": "database_server",
                "name": "Database MCP Server",
                "status": "connected",
                "tools": ["query_transactions", "query_entities", "query_alerts"],
                "last_ping": datetime.now().isoformat()
            },
            {
                "server_id": "documents_server",
                "name": "Documents MCP Server",
                "status": "connected",
                "tools": ["analyze_document", "detect_tampering", "extract_text"],
                "last_ping": datetime.now().isoformat()
            },
            {
                "server_id": "fraud_server",
                "name": "Fraud MCP Server",
                "status": "connected",
                "tools": ["score_transaction", "detect_patterns", "calculate_risk"],
                "last_ping": datetime.now().isoformat()
            },
            {
                "server_id": "identity_server",
                "name": "Identity MCP Server",
                "status": "connected",
                "tools": ["verify_rnipp", "check_sanctions", "validate_rib"],
                "last_ping": datetime.now().isoformat()
            }
        ]
    }


@router.get("/a2a/status")
async def get_a2a_status(
    service: FraudService = Depends(get_fraud_service)
):
    """
    Récupérer le statut du protocole A2A.
    """
    return {
        "protocol_version": "1.0",
        "status": "active",
        "total_messages": 1247,
        "messages_last_hour": 45,
        "average_latency_ms": 12,
        "recent_messages": [
            {
                "message_id": "msg-001",
                "from_agent": "orchestrator",
                "to_agent": "transaction_analyst",
                "message_type": "ANALYZE_REQUEST",
                "status": "processed",
                "timestamp": datetime.now().isoformat()
            },
            {
                "message_id": "msg-002",
                "from_agent": "transaction_analyst",
                "to_agent": "pattern_detector",
                "message_type": "PATTERN_CHECK",
                "status": "processed",
                "timestamp": datetime.now().isoformat()
            },
            {
                "message_id": "msg-003",
                "from_agent": "pattern_detector",
                "to_agent": "orchestrator",
                "message_type": "PATTERN_RESULT",
                "status": "delivered",
                "timestamp": datetime.now().isoformat()
            }
        ]
    }


# Dynamic route MUST be at the end to not catch static routes
@router.get("/{agent_id}", response_model=AgentStatusResponse)
async def get_agent(
    agent_id: str,
    service: FraudService = Depends(get_fraud_service)
):
    """
    Récupérer les détails d'un agent spécifique.
    """
    agents = service.get_agent_status()

    for agent in agents:
        if agent.get("agent_id") == agent_id:
            return AgentStatusResponse(
                agent_id=agent.get("agent_id", ""),
                agent_name=agent.get("agent_name", ""),
                status=agent.get("status", "unknown"),
                is_healthy=agent.get("is_healthy", False),
                capabilities=agent.get("capabilities", []),
                supported_tasks=agent.get("supported_tasks", []),
                last_heartbeat=agent.get("last_heartbeat")
            )

    raise HTTPException(status_code=404, detail=f"Agent {agent_id} not found")
