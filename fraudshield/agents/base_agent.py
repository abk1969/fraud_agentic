"""
FraudShield AI - Base Agent Configuration
Common agent configuration and utilities for ADK agents
"""

from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class AgentConfig:
    """Configuration for FraudShield agents."""
    name: str
    model: str = "gemini-flash-latest"
    description: str = ""
    instruction: str = ""
    output_key: Optional[str] = None
    generate_content_config: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for ADK Agent initialization."""
        config = {
            "name": self.name,
            "model": self.model,
            "instruction": self.instruction,
        }
        if self.description:
            config["description"] = self.description
        if self.output_key:
            config["output_key"] = self.output_key
        if self.generate_content_config:
            config["generate_content_config"] = self.generate_content_config
        return config


@dataclass
class AgentContext:
    """Shared context for agent execution."""
    transaction_id: str = ""
    case_id: str = ""
    beneficiary_id: str = ""
    session_id: str = ""
    start_time: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def elapsed_time_ms(self) -> int:
        """Get elapsed time in milliseconds."""
        return int((datetime.now() - self.start_time).total_seconds() * 1000)


# Common Gemini generation configuration
GENERATION_CONFIG = {
    "temperature": 0.2,  # Low temperature for consistent analysis
    "top_p": 0.8,
    "top_k": 40,
    "max_output_tokens": 4096,
}

# Safety settings for fraud analysis (allow sensitive content for investigation)
SAFETY_SETTINGS = {
    "harassment": "block_none",
    "hate_speech": "block_none",
    "sexually_explicit": "block_none",
    "dangerous_content": "block_none",
}


def create_agent_instruction(
    role: str,
    responsibilities: List[str],
    guidelines: List[str],
    output_format: Optional[str] = None
) -> str:
    """
    Create standardized agent instruction.

    Args:
        role: Agent's role description
        responsibilities: List of responsibilities
        guidelines: List of behavioral guidelines
        output_format: Expected output format

    Returns:
        Formatted instruction string
    """
    instruction_parts = [
        f"Tu es {role} au sein de FraudShield AI, le système de détection de fraude.",
        "",
        "## Responsabilités",
    ]

    for i, resp in enumerate(responsibilities, 1):
        instruction_parts.append(f"{i}. {resp}")

    instruction_parts.extend([
        "",
        "## Directives",
    ])

    for guideline in guidelines:
        instruction_parts.append(f"- {guideline}")

    if output_format:
        instruction_parts.extend([
            "",
            "## Format de sortie",
            output_format
        ])

    instruction_parts.extend([
        "",
        "## Langue",
        "Réponds toujours en français. Utilise un vocabulaire professionnel adapté "
        "au domaine de la protection sociale et de la lutte anti-fraude."
    ])

    return "\n".join(instruction_parts)


def format_tool_result(
    tool_name: str,
    result: Dict[str, Any],
    success: bool = True
) -> Dict[str, Any]:
    """Format tool result for agent consumption."""
    return {
        "tool": tool_name,
        "success": success,
        "timestamp": datetime.now().isoformat(),
        "result": result
    }


def aggregate_scores(
    scores: List[Dict[str, float]],
    weights: Optional[Dict[str, float]] = None
) -> float:
    """
    Aggregate multiple scores with optional weights.

    Args:
        scores: List of score dictionaries
        weights: Optional weight for each score type

    Returns:
        Weighted average score
    """
    if not scores:
        return 0.0

    if weights is None:
        # Equal weights
        total = sum(s.get("score", 0) for s in scores)
        return total / len(scores)

    weighted_sum = 0.0
    weight_sum = 0.0

    for score_dict in scores:
        for key, value in score_dict.items():
            if key in weights:
                weighted_sum += value * weights[key]
                weight_sum += weights[key]

    return weighted_sum / weight_sum if weight_sum > 0 else 0.0
