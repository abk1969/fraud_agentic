"""
FraudShield AI - WebSocket Manager
Real-time communication with clients
"""

from typing import Dict, List, Any
from fastapi import WebSocket
import json


class WebSocketManager:
    """
    WebSocket Connection Manager.

    Manages WebSocket connections for real-time updates.
    """

    def __init__(self):
        """Initialize WebSocket manager."""
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        """
        Accept and register a new WebSocket connection.

        Args:
            websocket: WebSocket connection
            client_id: Client identifier
        """
        await websocket.accept()
        self.active_connections[client_id] = websocket
        await self.send_personal_message(
            {"type": "connected", "client_id": client_id},
            client_id
        )

    def disconnect(self, client_id: str):
        """
        Remove a WebSocket connection.

        Args:
            client_id: Client identifier
        """
        if client_id in self.active_connections:
            del self.active_connections[client_id]

    async def send_personal_message(self, message: Dict[str, Any], client_id: str):
        """
        Send message to specific client.

        Args:
            message: Message to send
            client_id: Target client
        """
        if client_id in self.active_connections:
            websocket = self.active_connections[client_id]
            await websocket.send_text(json.dumps(message))

    async def broadcast(self, message: Dict[str, Any]):
        """
        Broadcast message to all connected clients.

        Args:
            message: Message to broadcast
        """
        for client_id, websocket in self.active_connections.items():
            try:
                await websocket.send_text(json.dumps(message))
            except Exception:
                # Client might have disconnected
                pass

    async def send_fraud_alert(
        self,
        client_id: str,
        transaction_id: str,
        decision: str,
        risk_level: str,
        fraud_probability: float
    ):
        """
        Send fraud alert to client.

        Args:
            client_id: Target client
            transaction_id: Transaction ID
            decision: Fraud decision
            risk_level: Risk level
            fraud_probability: Fraud probability
        """
        await self.send_personal_message(
            {
                "type": "fraud_alert",
                "transaction_id": transaction_id,
                "decision": decision,
                "risk_level": risk_level,
                "fraud_probability": fraud_probability,
            },
            client_id
        )

    async def send_progress_update(
        self,
        client_id: str,
        transaction_id: str,
        phase: str,
        progress: float,
        message: str = ""
    ):
        """
        Send processing progress update.

        Args:
            client_id: Target client
            transaction_id: Transaction being processed
            phase: Current phase
            progress: Progress percentage
            message: Optional status message
        """
        await self.send_personal_message(
            {
                "type": "progress",
                "transaction_id": transaction_id,
                "phase": phase,
                "progress": progress,
                "message": message,
            },
            client_id
        )

    async def send_batch_progress(
        self,
        client_id: str,
        batch_id: str,
        processed: int,
        total: int,
        flagged: int
    ):
        """
        Send batch processing progress.

        Args:
            client_id: Target client
            batch_id: Batch ID
            processed: Transactions processed
            total: Total transactions
            flagged: Flagged count
        """
        await self.send_personal_message(
            {
                "type": "batch_progress",
                "batch_id": batch_id,
                "processed": processed,
                "total": total,
                "flagged": flagged,
                "progress": processed / total if total > 0 else 0,
            },
            client_id
        )

    def get_connected_clients(self) -> List[str]:
        """Get list of connected client IDs."""
        return list(self.active_connections.keys())

    def get_connection_count(self) -> int:
        """Get number of active connections."""
        return len(self.active_connections)
