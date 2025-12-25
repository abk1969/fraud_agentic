"""
FraudShield AI - A2A Protocol Implementation
Agent-to-Agent communication protocol

Based on Google ADK A2A specification for:
- Structured message passing
- Task delegation
- Result propagation
"""

from typing import Dict, Any, List, Optional, Union
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import uuid
import json


class MessageType(Enum):
    """Types of A2A messages."""
    TASK_REQUEST = "task_request"
    TASK_RESPONSE = "task_response"
    STATUS_UPDATE = "status_update"
    ERROR = "error"
    HEARTBEAT = "heartbeat"
    DISCOVERY = "discovery"


class TaskStatus(Enum):
    """Task execution status."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class A2AMessage:
    """
    A2A Protocol Message.

    Standard message format for agent-to-agent communication.
    """
    message_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    message_type: MessageType = MessageType.TASK_REQUEST
    sender_agent: str = ""
    target_agent: str = ""
    correlation_id: Optional[str] = None
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    payload: Dict[str, Any] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert message to dictionary."""
        return {
            "message_id": self.message_id,
            "message_type": self.message_type.value,
            "sender_agent": self.sender_agent,
            "target_agent": self.target_agent,
            "correlation_id": self.correlation_id,
            "timestamp": self.timestamp,
            "payload": self.payload,
            "metadata": self.metadata,
        }

    def to_json(self) -> str:
        """Convert message to JSON string."""
        return json.dumps(self.to_dict())

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "A2AMessage":
        """Create message from dictionary."""
        return cls(
            message_id=data.get("message_id", str(uuid.uuid4())),
            message_type=MessageType(data.get("message_type", "task_request")),
            sender_agent=data.get("sender_agent", ""),
            target_agent=data.get("target_agent", ""),
            correlation_id=data.get("correlation_id"),
            timestamp=data.get("timestamp", datetime.now().isoformat()),
            payload=data.get("payload", {}),
            metadata=data.get("metadata", {}),
        )


@dataclass
class A2AResponse:
    """
    A2A Protocol Response.

    Response format for task completion.
    """
    message_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    correlation_id: str = ""
    status: TaskStatus = TaskStatus.COMPLETED
    sender_agent: str = ""
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    result: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert response to dictionary."""
        return {
            "message_id": self.message_id,
            "correlation_id": self.correlation_id,
            "status": self.status.value,
            "sender_agent": self.sender_agent,
            "timestamp": self.timestamp,
            "result": self.result,
            "error": self.error,
            "metadata": self.metadata,
        }

    def to_json(self) -> str:
        """Convert response to JSON string."""
        return json.dumps(self.to_dict())

    @property
    def is_success(self) -> bool:
        """Check if response indicates success."""
        return self.status == TaskStatus.COMPLETED and self.error is None


class A2AProtocol:
    """
    A2A Protocol Handler.

    Manages agent-to-agent communication following the A2A specification.
    """

    def __init__(self, agent_id: str, agent_name: str):
        """
        Initialize A2A protocol handler.

        Args:
            agent_id: Unique agent identifier
            agent_name: Human-readable agent name
        """
        self.agent_id = agent_id
        self.agent_name = agent_name
        self.pending_tasks: Dict[str, A2AMessage] = {}
        self.completed_tasks: Dict[str, A2AResponse] = {}

    def create_task_request(
        self,
        target_agent: str,
        task_type: str,
        task_data: Dict[str, Any],
        priority: str = "normal",
        timeout_ms: int = 30000
    ) -> A2AMessage:
        """
        Create a task request message.

        Args:
            target_agent: Target agent ID
            task_type: Type of task to execute
            task_data: Task parameters
            priority: Task priority (low, normal, high, critical)
            timeout_ms: Task timeout in milliseconds

        Returns:
            A2AMessage configured as task request
        """
        message = A2AMessage(
            message_type=MessageType.TASK_REQUEST,
            sender_agent=self.agent_id,
            target_agent=target_agent,
            payload={
                "task_type": task_type,
                "task_data": task_data,
            },
            metadata={
                "priority": priority,
                "timeout_ms": timeout_ms,
                "sender_name": self.agent_name,
            }
        )

        # Track pending task
        self.pending_tasks[message.message_id] = message

        return message

    def create_task_response(
        self,
        original_message: A2AMessage,
        result: Dict[str, Any],
        status: TaskStatus = TaskStatus.COMPLETED,
        error: Optional[str] = None
    ) -> A2AResponse:
        """
        Create a task response.

        Args:
            original_message: Original task request
            result: Task execution result
            status: Task completion status
            error: Error message if failed

        Returns:
            A2AResponse for the task
        """
        response = A2AResponse(
            correlation_id=original_message.message_id,
            status=status,
            sender_agent=self.agent_id,
            result=result,
            error=error,
            metadata={
                "original_sender": original_message.sender_agent,
                "task_type": original_message.payload.get("task_type"),
            }
        )

        return response

    def create_status_update(
        self,
        correlation_id: str,
        status: TaskStatus,
        progress: float = 0.0,
        message: str = ""
    ) -> A2AMessage:
        """
        Create a status update message.

        Args:
            correlation_id: Original task message ID
            status: Current task status
            progress: Progress percentage (0-1)
            message: Status message

        Returns:
            A2AMessage with status update
        """
        return A2AMessage(
            message_type=MessageType.STATUS_UPDATE,
            sender_agent=self.agent_id,
            correlation_id=correlation_id,
            payload={
                "status": status.value,
                "progress": progress,
                "message": message,
            }
        )

    def create_error_message(
        self,
        correlation_id: str,
        error_code: str,
        error_message: str,
        recoverable: bool = True
    ) -> A2AMessage:
        """
        Create an error message.

        Args:
            correlation_id: Related message ID
            error_code: Error code
            error_message: Error description
            recoverable: Whether error is recoverable

        Returns:
            A2AMessage with error information
        """
        return A2AMessage(
            message_type=MessageType.ERROR,
            sender_agent=self.agent_id,
            correlation_id=correlation_id,
            payload={
                "error_code": error_code,
                "error_message": error_message,
                "recoverable": recoverable,
            }
        )

    def process_response(self, response: A2AResponse) -> bool:
        """
        Process incoming response.

        Args:
            response: Response to process

        Returns:
            True if response was expected, False otherwise
        """
        correlation_id = response.correlation_id

        if correlation_id in self.pending_tasks:
            # Remove from pending
            del self.pending_tasks[correlation_id]
            # Store in completed
            self.completed_tasks[correlation_id] = response
            return True

        return False

    def get_pending_tasks(self) -> List[A2AMessage]:
        """Get list of pending tasks."""
        return list(self.pending_tasks.values())

    def get_completed_task(self, message_id: str) -> Optional[A2AResponse]:
        """Get completed task response by message ID."""
        return self.completed_tasks.get(message_id)

    def create_heartbeat(self) -> A2AMessage:
        """Create heartbeat message for health monitoring."""
        return A2AMessage(
            message_type=MessageType.HEARTBEAT,
            sender_agent=self.agent_id,
            payload={
                "agent_name": self.agent_name,
                "pending_tasks": len(self.pending_tasks),
                "status": "healthy",
            }
        )

    def create_discovery_message(
        self,
        capabilities: List[str],
        supported_tasks: List[str]
    ) -> A2AMessage:
        """
        Create discovery announcement message.

        Args:
            capabilities: Agent capabilities
            supported_tasks: Task types this agent can handle

        Returns:
            A2AMessage for agent discovery
        """
        return A2AMessage(
            message_type=MessageType.DISCOVERY,
            sender_agent=self.agent_id,
            payload={
                "agent_id": self.agent_id,
                "agent_name": self.agent_name,
                "capabilities": capabilities,
                "supported_tasks": supported_tasks,
                "status": "available",
            }
        )
