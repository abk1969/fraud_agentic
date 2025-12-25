"""
FraudShield AI - Agent Registry
Agent discovery and registration service

Manages:
- Agent registration and deregistration
- Agent capability discovery
- Agent health monitoring
- Load balancing information
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum


class AgentStatus(Enum):
    """Agent availability status."""
    AVAILABLE = "available"
    BUSY = "busy"
    UNAVAILABLE = "unavailable"
    MAINTENANCE = "maintenance"


@dataclass
class AgentInfo:
    """Information about a registered agent."""
    agent_id: str
    agent_name: str
    agent_type: str
    capabilities: List[str] = field(default_factory=list)
    supported_tasks: List[str] = field(default_factory=list)
    status: AgentStatus = AgentStatus.AVAILABLE
    endpoint: Optional[str] = None
    last_heartbeat: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)

    @property
    def is_healthy(self) -> bool:
        """Check if agent is healthy (heartbeat within last 60 seconds)."""
        return datetime.now() - self.last_heartbeat < timedelta(seconds=60)

    @property
    def is_available(self) -> bool:
        """Check if agent is available for tasks."""
        return self.status == AgentStatus.AVAILABLE and self.is_healthy

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "agent_id": self.agent_id,
            "agent_name": self.agent_name,
            "agent_type": self.agent_type,
            "capabilities": self.capabilities,
            "supported_tasks": self.supported_tasks,
            "status": self.status.value,
            "endpoint": self.endpoint,
            "last_heartbeat": self.last_heartbeat.isoformat(),
            "is_healthy": self.is_healthy,
            "is_available": self.is_available,
            "metadata": self.metadata,
        }


class AgentRegistry:
    """
    Agent Registry Service.

    Central registry for all FraudShield agents.
    Enables agent discovery and task routing.
    """

    def __init__(self):
        """Initialize agent registry."""
        self.agents: Dict[str, AgentInfo] = {}
        self.task_to_agents: Dict[str, List[str]] = {}

    def register(
        self,
        agent_id: str,
        agent_name: str,
        agent_type: str,
        capabilities: List[str],
        supported_tasks: List[str],
        endpoint: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> AgentInfo:
        """
        Register an agent.

        Args:
            agent_id: Unique agent identifier
            agent_name: Human-readable name
            agent_type: Agent type category
            capabilities: Agent capabilities
            supported_tasks: Task types the agent can handle
            endpoint: Optional communication endpoint
            metadata: Additional metadata

        Returns:
            Registered AgentInfo
        """
        agent_info = AgentInfo(
            agent_id=agent_id,
            agent_name=agent_name,
            agent_type=agent_type,
            capabilities=capabilities,
            supported_tasks=supported_tasks,
            endpoint=endpoint,
            metadata=metadata or {},
        )

        self.agents[agent_id] = agent_info

        # Update task-to-agent mapping
        for task in supported_tasks:
            if task not in self.task_to_agents:
                self.task_to_agents[task] = []
            if agent_id not in self.task_to_agents[task]:
                self.task_to_agents[task].append(agent_id)

        return agent_info

    def deregister(self, agent_id: str) -> bool:
        """
        Deregister an agent.

        Args:
            agent_id: Agent to deregister

        Returns:
            True if agent was found and removed
        """
        if agent_id not in self.agents:
            return False

        agent_info = self.agents[agent_id]

        # Remove from task mapping
        for task in agent_info.supported_tasks:
            if task in self.task_to_agents:
                self.task_to_agents[task] = [
                    a for a in self.task_to_agents[task] if a != agent_id
                ]

        del self.agents[agent_id]
        return True

    def update_status(self, agent_id: str, status: AgentStatus) -> bool:
        """
        Update agent status.

        Args:
            agent_id: Agent to update
            status: New status

        Returns:
            True if agent was found and updated
        """
        if agent_id not in self.agents:
            return False

        self.agents[agent_id].status = status
        return True

    def heartbeat(self, agent_id: str) -> bool:
        """
        Record agent heartbeat.

        Args:
            agent_id: Agent sending heartbeat

        Returns:
            True if agent was found and updated
        """
        if agent_id not in self.agents:
            return False

        self.agents[agent_id].last_heartbeat = datetime.now()
        return True

    def get_agent(self, agent_id: str) -> Optional[AgentInfo]:
        """Get agent information by ID."""
        return self.agents.get(agent_id)

    def get_agents_by_type(self, agent_type: str) -> List[AgentInfo]:
        """Get all agents of a specific type."""
        return [a for a in self.agents.values() if a.agent_type == agent_type]

    def get_agents_for_task(
        self,
        task_type: str,
        only_available: bool = True
    ) -> List[AgentInfo]:
        """
        Get agents capable of handling a task type.

        Args:
            task_type: Type of task
            only_available: Only return available agents

        Returns:
            List of capable agents
        """
        agent_ids = self.task_to_agents.get(task_type, [])
        agents = [self.agents[aid] for aid in agent_ids if aid in self.agents]

        if only_available:
            agents = [a for a in agents if a.is_available]

        return agents

    def get_agents_with_capability(
        self,
        capability: str,
        only_available: bool = True
    ) -> List[AgentInfo]:
        """
        Get agents with a specific capability.

        Args:
            capability: Required capability
            only_available: Only return available agents

        Returns:
            List of capable agents
        """
        agents = [
            a for a in self.agents.values()
            if capability in a.capabilities
        ]

        if only_available:
            agents = [a for a in agents if a.is_available]

        return agents

    def get_all_agents(self) -> List[AgentInfo]:
        """Get all registered agents."""
        return list(self.agents.values())

    def get_healthy_agents(self) -> List[AgentInfo]:
        """Get all healthy agents."""
        return [a for a in self.agents.values() if a.is_healthy]

    def get_available_agents(self) -> List[AgentInfo]:
        """Get all available agents."""
        return [a for a in self.agents.values() if a.is_available]

    def cleanup_stale_agents(self, max_age_seconds: int = 120) -> List[str]:
        """
        Remove agents that haven't sent heartbeat recently.

        Args:
            max_age_seconds: Maximum age for last heartbeat

        Returns:
            List of removed agent IDs
        """
        cutoff = datetime.now() - timedelta(seconds=max_age_seconds)
        stale_agents = [
            aid for aid, agent in self.agents.items()
            if agent.last_heartbeat < cutoff
        ]

        for agent_id in stale_agents:
            self.deregister(agent_id)

        return stale_agents

    def get_registry_stats(self) -> Dict[str, Any]:
        """Get registry statistics."""
        return {
            "total_agents": len(self.agents),
            "available_agents": len(self.get_available_agents()),
            "healthy_agents": len(self.get_healthy_agents()),
            "task_types": len(self.task_to_agents),
            "agents_by_type": {
                agent_type: len([a for a in self.agents.values() if a.agent_type == agent_type])
                for agent_type in set(a.agent_type for a in self.agents.values())
            }
        }


# Global registry instance
_registry: Optional[AgentRegistry] = None


def get_registry() -> AgentRegistry:
    """Get global registry instance."""
    global _registry
    if _registry is None:
        _registry = AgentRegistry()
    return _registry
