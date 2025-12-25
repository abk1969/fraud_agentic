"""
FraudShield AI - Cost-Sensitive Reward Function
Implements the asymmetric reward structure from the LLM+RL approach

Reward Matrix:
- True Positive (fraud caught): +10
- True Negative (legitimate approved): +1
- False Positive (legitimate flagged): -5
- False Negative (fraud missed): -50

The 10x asymmetry between FP and FN reflects the real-world cost
where missing fraud is much more expensive than false alarms.
"""

from typing import Dict, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

from ..config.rewards import REWARD_CONFIG, RiskLevel


class PredictionOutcome(Enum):
    """Possible prediction outcomes."""
    TRUE_POSITIVE = "TP"   # Correctly flagged fraud
    TRUE_NEGATIVE = "TN"   # Correctly passed legitimate
    FALSE_POSITIVE = "FP"  # Incorrectly flagged legitimate
    FALSE_NEGATIVE = "FN"  # Incorrectly passed fraud


@dataclass
class CostSensitiveReward:
    """
    Cost-Sensitive Reward Configuration.

    The asymmetric costs reflect business reality:
    - Missing fraud (FN) is very expensive: recovery costs, reputation, regulatory
    - False alarms (FP) are annoying but manageable: manual review cost

    Ratio FN:FP = 50:5 = 10:1 reflects typical fraud costs in social protection
    """
    true_positive: float = 10.0   # Reward for catching fraud
    true_negative: float = 1.0    # Reward for correct approval
    false_positive: float = -5.0  # Penalty for false alarm
    false_negative: float = -50.0 # Penalty for missing fraud

    @property
    def fn_fp_ratio(self) -> float:
        """Get FN to FP cost ratio."""
        return abs(self.false_negative / self.false_positive)

    def get_reward(self, outcome: PredictionOutcome) -> float:
        """Get reward for an outcome."""
        rewards = {
            PredictionOutcome.TRUE_POSITIVE: self.true_positive,
            PredictionOutcome.TRUE_NEGATIVE: self.true_negative,
            PredictionOutcome.FALSE_POSITIVE: self.false_positive,
            PredictionOutcome.FALSE_NEGATIVE: self.false_negative,
        }
        return rewards.get(outcome, 0.0)


class RewardCalculator:
    """
    Reward Calculator for RL Training.

    Calculates rewards based on prediction outcomes using the
    cost-sensitive reward function.
    """

    def __init__(self, reward_config: Optional[CostSensitiveReward] = None):
        """
        Initialize reward calculator.

        Args:
            reward_config: Reward configuration (uses default if not provided)
        """
        self.config = reward_config or CostSensitiveReward(
            true_positive=REWARD_CONFIG.true_positive_reward,
            true_negative=REWARD_CONFIG.true_negative_reward,
            false_positive=REWARD_CONFIG.false_positive_penalty,
            false_negative=REWARD_CONFIG.false_negative_penalty,
        )

    def calculate_reward(
        self,
        predicted_fraud: bool,
        actual_fraud: bool
    ) -> Tuple[float, PredictionOutcome]:
        """
        Calculate reward for a prediction.

        Args:
            predicted_fraud: Model's prediction (True = flag as fraud)
            actual_fraud: Ground truth (True = actually fraud)

        Returns:
            Tuple of (reward value, outcome type)
        """
        if predicted_fraud and actual_fraud:
            outcome = PredictionOutcome.TRUE_POSITIVE
        elif not predicted_fraud and not actual_fraud:
            outcome = PredictionOutcome.TRUE_NEGATIVE
        elif predicted_fraud and not actual_fraud:
            outcome = PredictionOutcome.FALSE_POSITIVE
        else:  # not predicted_fraud and actual_fraud
            outcome = PredictionOutcome.FALSE_NEGATIVE

        return self.config.get_reward(outcome), outcome

    def calculate_expected_reward(
        self,
        fraud_probability: float,
        flag_decision: bool
    ) -> float:
        """
        Calculate expected reward for a decision given fraud probability.

        E[reward | flag] = p(fraud) * TP + (1-p(fraud)) * FP
        E[reward | pass] = p(fraud) * FN + (1-p(fraud)) * TN

        Args:
            fraud_probability: Estimated probability of fraud
            flag_decision: Whether to flag the transaction

        Returns:
            Expected reward value
        """
        p_fraud = fraud_probability
        p_legit = 1 - fraud_probability

        if flag_decision:
            return (
                p_fraud * self.config.true_positive +
                p_legit * self.config.false_positive
            )
        else:
            return (
                p_fraud * self.config.false_negative +
                p_legit * self.config.true_negative
            )

    def calculate_optimal_threshold(self) -> float:
        """
        Calculate optimal decision threshold based on costs.

        Optimal threshold = (C_FP) / (C_FP + C_FN)
        where C_FP and C_FN are the absolute costs

        For FP=-5 and FN=-50: threshold = 5/(5+50) = 0.091

        This is lower than 0.5 because missing fraud is more costly.
        """
        c_fp = abs(self.config.false_positive)
        c_fn = abs(self.config.false_negative)

        return c_fp / (c_fp + c_fn)

    def calculate_advantage(
        self,
        state_value: float,
        reward: float,
        next_state_value: float,
        gamma: float = 0.99
    ) -> float:
        """
        Calculate advantage for A2C algorithm.

        A(s,a) = r + γV(s') - V(s)

        Args:
            state_value: Value of current state V(s)
            reward: Immediate reward r
            next_state_value: Value of next state V(s')
            gamma: Discount factor

        Returns:
            Advantage value
        """
        return reward + gamma * next_state_value - state_value

    def calculate_td_error(
        self,
        state_value: float,
        reward: float,
        next_state_value: float,
        gamma: float = 0.99,
        done: bool = False
    ) -> float:
        """
        Calculate TD error for value function update.

        δ = r + γV(s') - V(s)  (if not done)
        δ = r - V(s)           (if done)

        Args:
            state_value: Value of current state
            reward: Immediate reward
            next_state_value: Value of next state
            gamma: Discount factor
            done: Whether episode is complete

        Returns:
            TD error
        """
        if done:
            return reward - state_value
        return reward + gamma * next_state_value - state_value

    def get_batch_statistics(
        self,
        outcomes: list
    ) -> Dict[str, Any]:
        """
        Calculate statistics for a batch of outcomes.

        Args:
            outcomes: List of (predicted, actual) tuples

        Returns:
            Dictionary with batch statistics
        """
        counts = {outcome: 0 for outcome in PredictionOutcome}
        total_reward = 0.0

        for predicted, actual in outcomes:
            reward, outcome = self.calculate_reward(predicted, actual)
            counts[outcome] += 1
            total_reward += reward

        total = len(outcomes)
        tp = counts[PredictionOutcome.TRUE_POSITIVE]
        tn = counts[PredictionOutcome.TRUE_NEGATIVE]
        fp = counts[PredictionOutcome.FALSE_POSITIVE]
        fn = counts[PredictionOutcome.FALSE_NEGATIVE]

        # Calculate metrics
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
        accuracy = (tp + tn) / total if total > 0 else 0

        return {
            "total": total,
            "counts": {
                "TP": tp,
                "TN": tn,
                "FP": fp,
                "FN": fn,
            },
            "total_reward": total_reward,
            "average_reward": total_reward / total if total > 0 else 0,
            "metrics": {
                "precision": precision,
                "recall": recall,
                "f1_score": f1,
                "accuracy": accuracy,
            },
            "cost_analysis": {
                "fraud_caught_value": tp * self.config.true_positive,
                "legitimate_approved_value": tn * self.config.true_negative,
                "false_alarm_cost": fp * abs(self.config.false_positive),
                "missed_fraud_cost": fn * abs(self.config.false_negative),
            }
        }
