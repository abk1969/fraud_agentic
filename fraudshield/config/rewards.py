"""
FraudShield AI - Reward Configuration
Cost-sensitive reward matrix for RL-based fraud detection

Based on the asymmetric cost principle:
- False Negatives (missed fraud) are extremely costly
- False Positives (false alarms) have moderate cost
- Correct detections are rewarded
"""

from dataclasses import dataclass
from typing import Dict, Literal
from enum import Enum


class Action(Enum):
    """Agent actions for fraud classification"""
    PASS = 0  # Allow transaction
    FLAG = 1  # Flag for investigation


class Outcome(Enum):
    """Actual outcome of transaction"""
    LEGITIMATE = 0
    FRAUD = 1


@dataclass
class RewardConfig:
    """
    Cost-sensitive reward configuration aligned with business objectives.

    Reward function: R(action, reality)
    - Large penalty for false negatives (missed fraud) = -50
    - Moderate penalty for false positives (false alarms) = -5
    - High reward for true positives (caught fraud) = +10
    - Small reward for true negatives (correct passes) = +1
    """

    # True Positive: FLAG action on FRAUD transaction
    true_positive_reward: float = 10.0

    # True Negative: PASS action on LEGITIMATE transaction
    true_negative_reward: float = 1.0

    # False Positive: FLAG action on LEGITIMATE transaction
    false_positive_penalty: float = -5.0

    # False Negative: PASS action on FRAUD transaction (CRITICAL)
    false_negative_penalty: float = -50.0

    # Discount factor for RL (gamma)
    discount_factor: float = 0.99

    def get_reward(self, action: Action, actual: Outcome) -> float:
        """
        Calculate reward based on action and actual outcome.

        Args:
            action: Agent's decision (PASS or FLAG)
            actual: True nature of transaction (LEGITIMATE or FRAUD)

        Returns:
            Reward value
        """
        if action == Action.FLAG and actual == Outcome.FRAUD:
            return self.true_positive_reward  # Caught fraud!
        elif action == Action.PASS and actual == Outcome.LEGITIMATE:
            return self.true_negative_reward  # Correctly passed
        elif action == Action.FLAG and actual == Outcome.LEGITIMATE:
            return self.false_positive_penalty  # False alarm
        elif action == Action.PASS and actual == Outcome.FRAUD:
            return self.false_negative_penalty  # Missed fraud!
        else:
            raise ValueError(f"Invalid action/outcome combination: {action}, {actual}")

    def get_reward_matrix(self) -> Dict[str, Dict[str, float]]:
        """Return the full reward matrix"""
        return {
            "FLAG": {
                "FRAUD": self.true_positive_reward,
                "LEGITIMATE": self.false_positive_penalty
            },
            "PASS": {
                "FRAUD": self.false_negative_penalty,
                "LEGITIMATE": self.true_negative_reward
            }
        }

    @property
    def cost_ratio(self) -> float:
        """
        Ratio of FN cost to FP cost.
        Higher ratio = more emphasis on recall.
        """
        return abs(self.false_negative_penalty / self.false_positive_penalty)


# Default reward matrix instance
REWARD_MATRIX = RewardConfig()

# Alias for backward compatibility
REWARD_CONFIG = REWARD_MATRIX


# Risk level classification based on score
class RiskLevel(Enum):
    """Risk classification levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


def classify_risk(score: float) -> RiskLevel:
    """
    Classify risk level based on fraud probability score.

    Thresholds are intentionally low to favor recall (catch more fraud).

    Args:
        score: Fraud probability between 0 and 1

    Returns:
        RiskLevel classification
    """
    if score >= 0.7:
        return RiskLevel.CRITICAL
    elif score >= 0.4:
        return RiskLevel.HIGH
    elif score >= 0.2:
        return RiskLevel.MEDIUM
    else:
        return RiskLevel.LOW


def should_flag(score: float, threshold: float = 0.3) -> bool:
    """
    Determine if transaction should be flagged.

    Uses a low threshold by default to maximize recall.
    Better to have false positives than miss fraud.

    Args:
        score: Fraud probability between 0 and 1
        threshold: Decision threshold (default 0.3 for high recall)

    Returns:
        True if should flag for investigation
    """
    return score >= threshold


# Decision routing rules
ROUTING_RULES = {
    RiskLevel.CRITICAL: {
        "action": "block_immediate",
        "queue": "fraud_investigation_urgent",
        "sla_hours": 2,
        "auto_escalate": True
    },
    RiskLevel.HIGH: {
        "action": "flag_review",
        "queue": "fraud_investigation",
        "sla_hours": 24,
        "auto_escalate": False
    },
    RiskLevel.MEDIUM: {
        "action": "flag_review",
        "queue": "manual_review",
        "sla_hours": 72,
        "auto_escalate": False
    },
    RiskLevel.LOW: {
        "action": "auto_approve",
        "queue": None,
        "sla_hours": None,
        "auto_escalate": False
    }
}
