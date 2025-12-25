"""
FraudShield AI - A2C Policy Network
Implements Advantage Actor-Critic for fraud detection

Architecture:
- Actor (Policy): Outputs action probabilities (flag/pass)
- Critic (Value): Estimates state value for advantage calculation
- Input: Concatenated LLM embedding + structured features
"""

from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, field
import math


@dataclass
class NetworkConfig:
    """Neural network configuration."""
    input_dim: int = 768 + 10  # LLM embedding + structured features
    hidden_dims: List[int] = field(default_factory=lambda: [256, 128])
    output_dim: int = 2  # flag or pass
    activation: str = "relu"
    dropout: float = 0.2


class PolicyNetwork:
    """
    Policy Network (Actor) for A2C.

    Outputs action probabilities for fraud detection decisions.

    In production, this would be a PyTorch/TensorFlow neural network.
    This implementation provides the architecture and logic.
    """

    def __init__(self, config: Optional[NetworkConfig] = None):
        """
        Initialize policy network.

        Args:
            config: Network configuration
        """
        self.config = config or NetworkConfig()

        # Layer shapes (for production implementation)
        self.layers = []
        prev_dim = self.config.input_dim

        for hidden_dim in self.config.hidden_dims:
            self.layers.append({
                "type": "linear",
                "in_features": prev_dim,
                "out_features": hidden_dim,
            })
            self.layers.append({"type": self.config.activation})
            self.layers.append({"type": "dropout", "p": self.config.dropout})
            prev_dim = hidden_dim

        # Output layer
        self.layers.append({
            "type": "linear",
            "in_features": prev_dim,
            "out_features": self.config.output_dim,
        })
        self.layers.append({"type": "softmax"})

    def forward(
        self,
        embedding: List[float],
        structured_features: List[float]
    ) -> Dict[str, Any]:
        """
        Forward pass through policy network.

        Args:
            embedding: LLM embedding vector
            structured_features: Structured feature vector

        Returns:
            Action probabilities and value estimate
        """
        # Concatenate inputs
        input_vector = embedding + structured_features

        # Placeholder forward pass
        # In production: actual neural network computation
        pass_prob = 0.5
        flag_prob = 0.5

        # Apply temperature scaling for exploration
        temperature = 1.0

        return {
            "action_probs": {
                "pass": pass_prob,
                "flag": flag_prob,
            },
            "input_dim": len(input_vector),
            "note": "Production uses trained neural network"
        }

    def select_action(
        self,
        embedding: List[float],
        structured_features: List[float],
        deterministic: bool = False
    ) -> Tuple[str, float]:
        """
        Select action based on policy.

        Args:
            embedding: LLM embedding
            structured_features: Structured features
            deterministic: Use deterministic (greedy) selection

        Returns:
            Tuple of (action, action_probability)
        """
        output = self.forward(embedding, structured_features)
        probs = output["action_probs"]

        if deterministic:
            # Greedy selection
            action = max(probs, key=probs.get)
        else:
            # Sample from distribution (placeholder)
            # In production: torch.multinomial
            action = "flag" if probs["flag"] > 0.5 else "pass"

        return action, probs[action]

    def get_architecture(self) -> Dict[str, Any]:
        """Get network architecture description."""
        return {
            "type": "PolicyNetwork",
            "input_dim": self.config.input_dim,
            "hidden_dims": self.config.hidden_dims,
            "output_dim": self.config.output_dim,
            "activation": self.config.activation,
            "dropout": self.config.dropout,
            "layers": self.layers,
            "total_params": self._count_params(),
        }

    def _count_params(self) -> int:
        """Estimate total parameters."""
        total = 0
        prev_dim = self.config.input_dim

        for hidden_dim in self.config.hidden_dims:
            total += prev_dim * hidden_dim + hidden_dim  # weights + bias
            prev_dim = hidden_dim

        total += prev_dim * self.config.output_dim + self.config.output_dim

        return total


class ValueNetwork:
    """
    Value Network (Critic) for A2C.

    Estimates state value for advantage calculation.
    """

    def __init__(self, config: Optional[NetworkConfig] = None):
        """
        Initialize value network.

        Args:
            config: Network configuration
        """
        self.config = config or NetworkConfig()
        self.config.output_dim = 1  # Single value output

        # Layer shapes
        self.layers = []
        prev_dim = self.config.input_dim

        for hidden_dim in self.config.hidden_dims:
            self.layers.append({
                "type": "linear",
                "in_features": prev_dim,
                "out_features": hidden_dim,
            })
            self.layers.append({"type": self.config.activation})
            prev_dim = hidden_dim

        # Output layer (no activation for value)
        self.layers.append({
            "type": "linear",
            "in_features": prev_dim,
            "out_features": 1,
        })

    def forward(
        self,
        embedding: List[float],
        structured_features: List[float]
    ) -> float:
        """
        Forward pass to estimate state value.

        Args:
            embedding: LLM embedding
            structured_features: Structured features

        Returns:
            Estimated state value
        """
        # Placeholder - production uses actual network
        input_vector = embedding + structured_features

        # Simple heuristic value estimate
        # In production: neural network output
        value = 0.0

        return value

    def get_architecture(self) -> Dict[str, Any]:
        """Get network architecture description."""
        return {
            "type": "ValueNetwork",
            "input_dim": self.config.input_dim,
            "hidden_dims": self.config.hidden_dims,
            "output_dim": 1,
            "activation": self.config.activation,
            "layers": self.layers,
        }


class A2CPolicy:
    """
    Advantage Actor-Critic Policy.

    Combines policy (actor) and value (critic) networks for
    cost-sensitive fraud detection.
    """

    def __init__(
        self,
        embedding_dim: int = 768,
        num_structured_features: int = 10,
        hidden_dims: Optional[List[int]] = None
    ):
        """
        Initialize A2C policy.

        Args:
            embedding_dim: Dimension of LLM embedding
            num_structured_features: Number of structured features
            hidden_dims: Hidden layer dimensions
        """
        config = NetworkConfig(
            input_dim=embedding_dim + num_structured_features,
            hidden_dims=hidden_dims or [256, 128],
        )

        self.policy_network = PolicyNetwork(config)
        self.value_network = ValueNetwork(config)

        self.embedding_dim = embedding_dim
        self.num_structured_features = num_structured_features

    def predict(
        self,
        embedding: List[float],
        structured_features: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Make prediction with policy.

        Args:
            embedding: LLM embedding vector
            structured_features: Named structured features

        Returns:
            Prediction with action, value, and probabilities
        """
        # Convert structured features to list
        feature_list = [
            structured_features.get("amount_normalized", 0),
            structured_features.get("frequency_score", 0),
            structured_features.get("provider_risk", 0),
            structured_features.get("tenure_score", 0),
            structured_features.get("document_score", 0),
            structured_features.get("identity_score", 0),
            structured_features.get("network_score", 0),
            structured_features.get("pattern_score", 0),
            structured_features.get("time_score", 0),
            structured_features.get("historical_score", 0),
        ]

        # Get action probabilities
        policy_output = self.policy_network.forward(embedding, feature_list)

        # Get state value
        value = self.value_network.forward(embedding, feature_list)

        # Select action
        action, action_prob = self.policy_network.select_action(
            embedding, feature_list, deterministic=True
        )

        return {
            "action": action,
            "action_probability": action_prob,
            "action_probs": policy_output["action_probs"],
            "state_value": value,
            "should_flag": action == "flag",
        }

    def get_model_info(self) -> Dict[str, Any]:
        """Get model information."""
        return {
            "model_type": "A2C",
            "embedding_dim": self.embedding_dim,
            "num_structured_features": self.num_structured_features,
            "policy_network": self.policy_network.get_architecture(),
            "value_network": self.value_network.get_architecture(),
            "cost_sensitive": True,
            "optimization": "PPO",  # Would use PPO for training stability
        }
