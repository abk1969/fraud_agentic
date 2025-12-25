"""
FraudShield AI - Message Router
Routes A2A messages between agents

Implements:
- Task-based routing
- Load balancing
- Priority queuing
- Retry logic
"""

from typing import Dict, Any, List, Optional, Callable, Awaitable
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import asyncio

from .protocol import A2AMessage, A2AResponse, MessageType, TaskStatus
from .registry import AgentRegistry, AgentInfo, get_registry


class RoutingStrategy(Enum):
    """Message routing strategies."""
    DIRECT = "direct"  # Route to specific agent
    ROUND_ROBIN = "round_robin"  # Distribute evenly
    LEAST_BUSY = "least_busy"  # Route to least busy agent
    CAPABILITY_MATCH = "capability_match"  # Route by capability


@dataclass
class RoutingRule:
    """Routing rule configuration."""
    task_type: str
    target_agent_type: Optional[str] = None
    required_capability: Optional[str] = None
    strategy: RoutingStrategy = RoutingStrategy.CAPABILITY_MATCH
    priority_boost: int = 0


@dataclass
class PendingMessage:
    """Message pending delivery."""
    message: A2AMessage
    priority: int = 0
    retry_count: int = 0
    max_retries: int = 3
    created_at: datetime = field(default_factory=datetime.now)


class MessageRouter:
    """
    Message Router for A2A communication.

    Routes messages between agents based on:
    - Task type
    - Agent capabilities
    - Load balancing
    - Priority
    """

    def __init__(self, registry: Optional[AgentRegistry] = None):
        """
        Initialize message router.

        Args:
            registry: Agent registry (uses global if not provided)
        """
        self.registry = registry or get_registry()
        self.routing_rules: Dict[str, RoutingRule] = {}
        self.message_queue: List[PendingMessage] = []
        self.handlers: Dict[str, Callable[[A2AMessage], Awaitable[A2AResponse]]] = {}
        self.round_robin_indices: Dict[str, int] = {}

        # Initialize default routing rules
        self._init_default_rules()

    def _init_default_rules(self):
        """Initialize default routing rules for FraudShield."""
        default_rules = [
            RoutingRule(
                task_type="analyze_document",
                target_agent_type="document_analyst",
                strategy=RoutingStrategy.CAPABILITY_MATCH
            ),
            RoutingRule(
                task_type="score_transaction",
                target_agent_type="transaction_analyst",
                strategy=RoutingStrategy.CAPABILITY_MATCH
            ),
            RoutingRule(
                task_type="verify_identity",
                target_agent_type="identity_verifier",
                strategy=RoutingStrategy.CAPABILITY_MATCH
            ),
            RoutingRule(
                task_type="detect_patterns",
                target_agent_type="pattern_detector",
                strategy=RoutingStrategy.CAPABILITY_MATCH
            ),
            RoutingRule(
                task_type="analyze_network",
                target_agent_type="network_analyzer",
                strategy=RoutingStrategy.CAPABILITY_MATCH
            ),
            RoutingRule(
                task_type="generate_explanation",
                target_agent_type="explanation_generator",
                strategy=RoutingStrategy.CAPABILITY_MATCH
            ),
            RoutingRule(
                task_type="process_fraud_detection",
                target_agent_type="fraud_orchestrator",
                strategy=RoutingStrategy.DIRECT,
                priority_boost=10
            ),
        ]

        for rule in default_rules:
            self.add_routing_rule(rule)

    def add_routing_rule(self, rule: RoutingRule):
        """Add a routing rule."""
        self.routing_rules[rule.task_type] = rule

    def register_handler(
        self,
        agent_id: str,
        handler: Callable[[A2AMessage], Awaitable[A2AResponse]]
    ):
        """
        Register message handler for an agent.

        Args:
            agent_id: Agent ID
            handler: Async handler function
        """
        self.handlers[agent_id] = handler

    async def route_message(
        self,
        message: A2AMessage
    ) -> Optional[A2AResponse]:
        """
        Route a message to the appropriate agent.

        Args:
            message: Message to route

        Returns:
            Response from the handler, or None if routing fails
        """
        # Direct routing if target specified
        if message.target_agent:
            return await self._deliver_to_agent(message, message.target_agent)

        # Get task type from payload
        task_type = message.payload.get("task_type", "")

        # Find routing rule
        rule = self.routing_rules.get(task_type)
        if not rule:
            return A2AResponse(
                correlation_id=message.message_id,
                status=TaskStatus.FAILED,
                error=f"No routing rule for task type: {task_type}"
            )

        # Find target agent
        target_agent = self._select_agent(rule)
        if not target_agent:
            return A2AResponse(
                correlation_id=message.message_id,
                status=TaskStatus.FAILED,
                error=f"No available agent for task type: {task_type}"
            )

        # Deliver message
        return await self._deliver_to_agent(message, target_agent.agent_id)

    def _select_agent(self, rule: RoutingRule) -> Optional[AgentInfo]:
        """Select agent based on routing rule."""
        # Get candidate agents
        if rule.target_agent_type:
            candidates = self.registry.get_agents_by_type(rule.target_agent_type)
            candidates = [a for a in candidates if a.is_available]
        elif rule.required_capability:
            candidates = self.registry.get_agents_with_capability(
                rule.required_capability
            )
        else:
            candidates = self.registry.get_available_agents()

        if not candidates:
            return None

        # Apply routing strategy
        if rule.strategy == RoutingStrategy.DIRECT:
            return candidates[0]

        elif rule.strategy == RoutingStrategy.ROUND_ROBIN:
            key = rule.task_type
            index = self.round_robin_indices.get(key, 0)
            selected = candidates[index % len(candidates)]
            self.round_robin_indices[key] = index + 1
            return selected

        elif rule.strategy == RoutingStrategy.LEAST_BUSY:
            # In production, would check agent load metrics
            return candidates[0]

        else:  # CAPABILITY_MATCH
            return candidates[0]

    async def _deliver_to_agent(
        self,
        message: A2AMessage,
        agent_id: str
    ) -> Optional[A2AResponse]:
        """Deliver message to specific agent."""
        handler = self.handlers.get(agent_id)

        if not handler:
            return A2AResponse(
                correlation_id=message.message_id,
                status=TaskStatus.FAILED,
                error=f"No handler registered for agent: {agent_id}"
            )

        try:
            response = await handler(message)
            return response
        except Exception as e:
            return A2AResponse(
                correlation_id=message.message_id,
                status=TaskStatus.FAILED,
                error=str(e)
            )

    def queue_message(
        self,
        message: A2AMessage,
        priority: int = 0
    ):
        """
        Add message to priority queue.

        Args:
            message: Message to queue
            priority: Message priority (higher = more urgent)
        """
        # Check for priority boost from routing rules
        task_type = message.payload.get("task_type", "")
        rule = self.routing_rules.get(task_type)
        if rule:
            priority += rule.priority_boost

        pending = PendingMessage(
            message=message,
            priority=priority
        )

        # Insert in priority order
        inserted = False
        for i, existing in enumerate(self.message_queue):
            if priority > existing.priority:
                self.message_queue.insert(i, pending)
                inserted = True
                break

        if not inserted:
            self.message_queue.append(pending)

    async def process_queue(self) -> List[A2AResponse]:
        """
        Process all queued messages.

        Returns:
            List of responses
        """
        responses = []

        while self.message_queue:
            pending = self.message_queue.pop(0)

            response = await self.route_message(pending.message)

            if response and response.status == TaskStatus.FAILED:
                # Handle retry
                if pending.retry_count < pending.max_retries:
                    pending.retry_count += 1
                    self.queue_message(
                        pending.message,
                        pending.priority - 1  # Lower priority on retry
                    )

            if response:
                responses.append(response)

        return responses

    async def broadcast(
        self,
        message: A2AMessage,
        agent_type: Optional[str] = None
    ) -> List[A2AResponse]:
        """
        Broadcast message to multiple agents.

        Args:
            message: Message to broadcast
            agent_type: Optionally filter by agent type

        Returns:
            List of responses from all agents
        """
        if agent_type:
            agents = self.registry.get_agents_by_type(agent_type)
        else:
            agents = self.registry.get_available_agents()

        responses = []
        for agent in agents:
            agent_message = A2AMessage(
                message_type=message.message_type,
                sender_agent=message.sender_agent,
                target_agent=agent.agent_id,
                correlation_id=message.message_id,
                payload=message.payload,
                metadata=message.metadata,
            )
            response = await self._deliver_to_agent(agent_message, agent.agent_id)
            if response:
                responses.append(response)

        return responses

    def get_queue_stats(self) -> Dict[str, Any]:
        """Get queue statistics."""
        task_types = {}
        for pending in self.message_queue:
            task_type = pending.message.payload.get("task_type", "unknown")
            task_types[task_type] = task_types.get(task_type, 0) + 1

        return {
            "queue_length": len(self.message_queue),
            "task_types": task_types,
            "handlers_registered": len(self.handlers),
            "routing_rules": len(self.routing_rules),
        }
