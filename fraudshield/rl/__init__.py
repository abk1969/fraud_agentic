"""
FraudShield AI - Reinforcement Learning Module
Cost-sensitive RL for fraud detection

Implements:
- A2C (Advantage Actor-Critic) policy
- Cost-sensitive reward function
- Experience replay
- Policy optimization
"""

from .policy import A2CPolicy, PolicyNetwork, ValueNetwork
from .reward import RewardCalculator, CostSensitiveReward
from .trainer import RLTrainer

__all__ = [
    "A2CPolicy",
    "PolicyNetwork",
    "ValueNetwork",
    "RewardCalculator",
    "CostSensitiveReward",
    "RLTrainer",
]
