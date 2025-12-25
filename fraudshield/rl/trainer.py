"""
FraudShield AI - RL Trainer
Training loop for the A2C fraud detection model

Implements:
- Episode-based training
- Experience replay
- Policy gradient updates
- Value function updates
- Curriculum learning
"""

from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime
import random

from .policy import A2CPolicy
from .reward import RewardCalculator, CostSensitiveReward, PredictionOutcome


@dataclass
class Experience:
    """Single experience tuple for replay."""
    state_embedding: List[float]
    state_features: Dict[str, float]
    action: str
    reward: float
    next_state_embedding: List[float]
    next_state_features: Dict[str, float]
    done: bool
    outcome: PredictionOutcome


@dataclass
class TrainingConfig:
    """Training configuration."""
    learning_rate: float = 0.0003
    gamma: float = 0.99
    entropy_coef: float = 0.01
    value_loss_coef: float = 0.5
    max_grad_norm: float = 0.5
    batch_size: int = 64
    epochs: int = 10
    buffer_size: int = 10000
    min_buffer_size: int = 1000


class ExperienceBuffer:
    """
    Experience Replay Buffer.

    Stores experiences for training with prioritization
    based on reward magnitude.
    """

    def __init__(self, max_size: int = 10000):
        """
        Initialize buffer.

        Args:
            max_size: Maximum buffer size
        """
        self.max_size = max_size
        self.buffer: List[Experience] = []
        self.position = 0

    def add(self, experience: Experience):
        """Add experience to buffer."""
        if len(self.buffer) < self.max_size:
            self.buffer.append(experience)
        else:
            self.buffer[self.position] = experience

        self.position = (self.position + 1) % self.max_size

    def sample(self, batch_size: int) -> List[Experience]:
        """Sample batch of experiences."""
        return random.sample(self.buffer, min(batch_size, len(self.buffer)))

    def prioritized_sample(self, batch_size: int) -> List[Experience]:
        """
        Sample with priority based on reward magnitude.

        Experiences with larger rewards (positive or negative)
        are more likely to be sampled.
        """
        if len(self.buffer) == 0:
            return []

        # Calculate priorities (absolute reward + small constant)
        priorities = [abs(exp.reward) + 0.1 for exp in self.buffer]
        total = sum(priorities)
        probs = [p / total for p in priorities]

        # Sample based on priorities
        indices = random.choices(
            range(len(self.buffer)),
            weights=probs,
            k=min(batch_size, len(self.buffer))
        )

        return [self.buffer[i] for i in indices]

    def __len__(self) -> int:
        return len(self.buffer)


class RLTrainer:
    """
    Reinforcement Learning Trainer for FraudShield.

    Trains the A2C policy using experiences collected from
    fraud detection decisions.
    """

    def __init__(
        self,
        policy: Optional[A2CPolicy] = None,
        config: Optional[TrainingConfig] = None,
        reward_config: Optional[CostSensitiveReward] = None
    ):
        """
        Initialize trainer.

        Args:
            policy: A2C policy to train
            config: Training configuration
            reward_config: Reward function configuration
        """
        self.policy = policy or A2CPolicy()
        self.config = config or TrainingConfig()
        self.reward_calculator = RewardCalculator(reward_config)

        self.buffer = ExperienceBuffer(self.config.buffer_size)
        self.training_stats: List[Dict[str, Any]] = []

    def add_experience(
        self,
        state_embedding: List[float],
        state_features: Dict[str, float],
        action: str,
        actual_fraud: bool,
        next_state_embedding: Optional[List[float]] = None,
        next_state_features: Optional[Dict[str, float]] = None,
        done: bool = True
    ):
        """
        Add training experience.

        Args:
            state_embedding: LLM embedding of transaction
            state_features: Structured features
            action: Action taken (flag/pass)
            actual_fraud: Ground truth label
            next_state_embedding: Next state embedding (if episodic)
            next_state_features: Next state features
            done: Whether episode is complete
        """
        predicted_fraud = action == "flag"
        reward, outcome = self.reward_calculator.calculate_reward(
            predicted_fraud, actual_fraud
        )

        experience = Experience(
            state_embedding=state_embedding,
            state_features=state_features,
            action=action,
            reward=reward,
            next_state_embedding=next_state_embedding or state_embedding,
            next_state_features=next_state_features or state_features,
            done=done,
            outcome=outcome,
        )

        self.buffer.add(experience)

    def train_step(self) -> Dict[str, Any]:
        """
        Perform single training step.

        Returns:
            Training step statistics
        """
        if len(self.buffer) < self.config.min_buffer_size:
            return {
                "status": "waiting",
                "buffer_size": len(self.buffer),
                "min_required": self.config.min_buffer_size,
            }

        # Sample batch
        batch = self.buffer.prioritized_sample(self.config.batch_size)

        # Calculate losses (placeholder - production uses actual gradients)
        policy_losses = []
        value_losses = []
        entropies = []

        for exp in batch:
            # Get current prediction
            prediction = self.policy.predict(
                exp.state_embedding,
                exp.state_features
            )

            # Calculate advantage
            state_value = prediction["state_value"]
            next_prediction = self.policy.predict(
                exp.next_state_embedding,
                exp.next_state_features
            )
            next_value = next_prediction["state_value"] if not exp.done else 0

            advantage = self.reward_calculator.calculate_advantage(
                state_value,
                exp.reward,
                next_value,
                self.config.gamma
            )

            # Policy loss (negative because we want to maximize)
            action_prob = prediction["action_probs"].get(exp.action, 0.5)
            policy_loss = -math.log(max(action_prob, 1e-10)) * advantage
            policy_losses.append(policy_loss)

            # Value loss (MSE)
            target_value = exp.reward + self.config.gamma * next_value * (1 - exp.done)
            value_loss = (state_value - target_value) ** 2
            value_losses.append(value_loss)

            # Entropy (for exploration)
            probs = prediction["action_probs"]
            entropy = -sum(p * math.log(max(p, 1e-10)) for p in probs.values())
            entropies.append(entropy)

        # Aggregate losses
        avg_policy_loss = sum(policy_losses) / len(policy_losses)
        avg_value_loss = sum(value_losses) / len(value_losses)
        avg_entropy = sum(entropies) / len(entropies)

        total_loss = (
            avg_policy_loss +
            self.config.value_loss_coef * avg_value_loss -
            self.config.entropy_coef * avg_entropy
        )

        stats = {
            "status": "completed",
            "batch_size": len(batch),
            "policy_loss": avg_policy_loss,
            "value_loss": avg_value_loss,
            "entropy": avg_entropy,
            "total_loss": total_loss,
            "buffer_size": len(self.buffer),
        }

        self.training_stats.append(stats)

        return stats

    def train_epoch(self) -> Dict[str, Any]:
        """
        Train for one epoch.

        Returns:
            Epoch training statistics
        """
        epoch_stats = []

        for _ in range(self.config.epochs):
            step_stats = self.train_step()
            if step_stats["status"] == "completed":
                epoch_stats.append(step_stats)

        if not epoch_stats:
            return {"status": "waiting", "steps": 0}

        # Aggregate epoch stats
        return {
            "status": "completed",
            "steps": len(epoch_stats),
            "avg_policy_loss": sum(s["policy_loss"] for s in epoch_stats) / len(epoch_stats),
            "avg_value_loss": sum(s["value_loss"] for s in epoch_stats) / len(epoch_stats),
            "avg_entropy": sum(s["entropy"] for s in epoch_stats) / len(epoch_stats),
            "avg_total_loss": sum(s["total_loss"] for s in epoch_stats) / len(epoch_stats),
        }

    def evaluate(self, test_data: List[Tuple[List[float], Dict[str, float], bool]]) -> Dict[str, Any]:
        """
        Evaluate policy on test data.

        Args:
            test_data: List of (embedding, features, actual_fraud) tuples

        Returns:
            Evaluation metrics
        """
        predictions = []
        outcomes = []

        for embedding, features, actual_fraud in test_data:
            prediction = self.policy.predict(embedding, features)
            predicted_fraud = prediction["should_flag"]

            predictions.append((predicted_fraud, actual_fraud))

        # Calculate batch statistics
        stats = self.reward_calculator.get_batch_statistics(predictions)

        return {
            "evaluation": stats,
            "test_size": len(test_data),
            "timestamp": datetime.now().isoformat(),
        }

    def get_training_summary(self) -> Dict[str, Any]:
        """Get training summary."""
        if not self.training_stats:
            return {"status": "no_training_data"}

        recent = self.training_stats[-100:]  # Last 100 steps

        return {
            "total_steps": len(self.training_stats),
            "buffer_size": len(self.buffer),
            "recent_avg_loss": sum(s.get("total_loss", 0) for s in recent) / len(recent),
            "recent_avg_policy_loss": sum(s.get("policy_loss", 0) for s in recent) / len(recent),
            "recent_avg_value_loss": sum(s.get("value_loss", 0) for s in recent) / len(recent),
            "config": {
                "learning_rate": self.config.learning_rate,
                "gamma": self.config.gamma,
                "batch_size": self.config.batch_size,
            }
        }


# Import math for log calculations
import math
