"""
FraudShield AI - Main Application Entry Point
Full Stack Agentic AI for Fraud Detection

This is the main entry point that initializes and runs the
FraudShield AI fraud detection system.

Architecture:
- Google ADK for agent orchestration
- MCP for tool access
- A2A for inter-agent communication
- A2UI for user interface responses
- LLM+RL hybrid for fraud detection
"""

from typing import Dict, Any, Optional
from datetime import datetime
import asyncio

# Agents
from .agents.orchestrator import FraudOrchestratorAgent, WorkflowType
from .agents.base_agent import AgentContext

# A2A and A2UI
from .a2a.registry import AgentRegistry, get_registry
from .a2a.router import MessageRouter
from .a2a.protocol import A2AProtocol
from .a2ui.response_builder import ResponseBuilder
from .a2ui.notification import get_notification_service

# RL
from .rl.trainer import RLTrainer
from .rl.policy import A2CPolicy

# Config
from .config.settings import Settings


class FraudShieldApp:
    """
    FraudShield AI Application.

    Main application class that coordinates all components
    for fraud detection.
    """

    def __init__(self, settings: Optional[Settings] = None):
        """
        Initialize FraudShield application.

        Args:
            settings: Application settings
        """
        self.settings = settings or Settings()

        # Initialize core components
        self.orchestrator = FraudOrchestratorAgent()
        self.registry = get_registry()
        self.router = MessageRouter(self.registry)
        self.response_builder = ResponseBuilder()
        self.notification_service = get_notification_service()

        # Initialize RL components
        self.rl_policy = A2CPolicy(
            embedding_dim=self.settings.EMBEDDING_DIM,
            num_structured_features=10,
        )
        self.rl_trainer = RLTrainer(policy=self.rl_policy)

        # Register agents
        self._register_agents()

        self.initialized = True
        self.start_time = datetime.now()

    def _register_agents(self):
        """Register all agents with the registry."""
        agents = [
            ("fraud_orchestrator", "FraudShield Orchestrator", "orchestrator",
             ["orchestration", "decision"], ["process_fraud_detection"]),
            ("document_analyst", "Document Analyst", "analyst",
             ["document_analysis", "ocr", "tampering"], ["analyze_document"]),
            ("transaction_analyst", "Transaction Analyst", "analyst",
             ["transaction_scoring", "embedding", "anomaly"], ["score_transaction"]),
            ("identity_verifier", "Identity Verifier", "verifier",
             ["identity", "rnipp", "sanctions"], ["verify_identity"]),
            ("pattern_detector", "Pattern Detector", "detector",
             ["pattern_matching", "fraud_patterns"], ["detect_patterns"]),
            ("network_analyzer", "Network Analyzer", "analyzer",
             ["graph_analysis", "community", "fraud_rings"], ["analyze_network"]),
            ("explanation_generator", "Explanation Generator", "generator",
             ["explanation", "xai", "reports"], ["generate_explanation"]),
        ]

        for agent_id, name, agent_type, capabilities, tasks in agents:
            self.registry.register(
                agent_id=agent_id,
                agent_name=name,
                agent_type=agent_type,
                capabilities=capabilities,
                supported_tasks=tasks,
            )

    async def process_transaction(
        self,
        transaction: Dict[str, Any],
        documents: Optional[list] = None,
        beneficiary: Optional[Dict[str, Any]] = None,
        workflow: str = "standard",
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Process a transaction for fraud detection.

        Args:
            transaction: Transaction data
            documents: Optional list of documents
            beneficiary: Optional beneficiary data
            workflow: Workflow type (quick, standard, investigation, batch)
            user_id: User ID for notifications

        Returns:
            Fraud detection result
        """
        # Prepare request
        request = {
            "transaction_id": transaction.get("transaction_id", ""),
            "transaction": transaction,
            "documents": documents or [],
            "beneficiary": beneficiary or {},
        }

        # Select workflow
        workflow_type = {
            "quick": WorkflowType.QUICK,
            "standard": WorkflowType.STANDARD,
            "investigation": WorkflowType.INVESTIGATION,
            "batch": WorkflowType.BATCH,
        }.get(workflow, WorkflowType.STANDARD)

        # Process with orchestrator
        result = await self.orchestrator.process(request, workflow_type)

        # Build UI response
        ui_response = self.response_builder.build_fraud_detection_response(result)

        # Send notification if flagged
        if result.get("decision") in ["FLAG", "BLOCK"] and user_id:
            notification = self.notification_service.notify_fraud_detected(
                user_id=user_id,
                case_id=result.get("case_id", ""),
                risk_level=result.get("risk_level", "unknown"),
                transaction_id=transaction.get("transaction_id", ""),
                amount=transaction.get("amount", 0),
            )
            await self.notification_service.send(notification)

        # Add RL experience for training
        if transaction.get("transaction_id"):
            # In production, actual label comes from feedback
            self._add_training_experience(result, transaction)

        return {
            "result": result,
            "ui_response": ui_response.to_dict(),
            "processed_at": datetime.now().isoformat(),
        }

    async def process_batch(
        self,
        transactions: list,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Process batch of transactions.

        Args:
            transactions: List of transactions
            user_id: User ID for notifications

        Returns:
            Batch processing result
        """
        request = {
            "transactions": transactions,
        }

        result = await self.orchestrator.process(request, WorkflowType.BATCH)

        # Build UI response
        ui_response = self.response_builder.build_batch_processing_response(result)

        # Send notification
        if user_id:
            notification = self.notification_service.notify_batch_complete(
                user_id=user_id,
                batch_id=f"BATCH-{datetime.now().strftime('%Y%m%d%H%M%S')}",
                total=result.get("transactions_processed", 0),
                flagged=result.get("flagged_count", 0),
            )
            await self.notification_service.send(notification)

        return {
            "result": result,
            "ui_response": ui_response.to_dict(),
        }

    def _add_training_experience(
        self,
        result: Dict[str, Any],
        transaction: Dict[str, Any]
    ):
        """Add experience for RL training."""
        # Extract embedding (placeholder - production extracts from model)
        embedding = [0.0] * self.settings.EMBEDDING_DIM

        # Extract structured features
        features = {
            "amount_normalized": min(transaction.get("amount", 0) / 5000, 1.0),
            "frequency_score": min(transaction.get("claims_30d", 0) / 10, 1.0),
            "provider_risk": transaction.get("provider_risk_score", 0),
            "tenure_score": min(transaction.get("tenure_months", 0) / 36, 1.0),
            "document_score": 0.0,
            "identity_score": 0.0,
            "network_score": 0.0,
            "pattern_score": result.get("fraud_probability", 0),
            "time_score": 0.0,
            "historical_score": 0.0,
        }

        # Action taken
        action = "flag" if result.get("decision") in ["FLAG", "BLOCK"] else "pass"

        # Note: actual_fraud would come from feedback/investigation
        # For now, we don't add to training without ground truth
        # self.rl_trainer.add_experience(embedding, features, action, actual_fraud)

    def train_model(self) -> Dict[str, Any]:
        """
        Trigger RL model training.

        Returns:
            Training statistics
        """
        return self.rl_trainer.train_epoch()

    def get_status(self) -> Dict[str, Any]:
        """Get application status."""
        registry_stats = self.registry.get_registry_stats()
        training_stats = self.rl_trainer.get_training_summary()

        return {
            "status": "running" if self.initialized else "initializing",
            "uptime_seconds": (datetime.now() - self.start_time).total_seconds(),
            "agents": registry_stats,
            "rl_training": training_stats,
            "settings": {
                "project_id": self.settings.project_id,
                "region": self.settings.region,
                "model": self.settings.gemini_model,
                "workflows": ["quick", "standard", "investigation", "batch"]
            }
        }

    def get_model_info(self) -> Dict[str, Any]:
        """Get RL model information."""
        return self.rl_policy.get_model_info()


# Singleton application instance
_app: Optional[FraudShieldApp] = None


def get_app() -> FraudShieldApp:
    """Get or create application instance."""
    global _app
    if _app is None:
        _app = FraudShieldApp()
    return _app


async def main():
    """Main entry point for running the application."""
    app = get_app()

    print("FraudShield AI - Fraud Detection System")
    print("=" * 50)
    print(f"Status: {app.get_status()['status']}")
    print(f"Agents registered: {app.registry.get_registry_stats()['total_agents']}")
    print()

    # Example transaction processing
    example_transaction = {
        "transaction_id": "TX-2025-001",
        "type": "REMBOURSEMENT",
        "amount": 1500.00,
        "date": "2025-01-15",
        "time": "14:30",
        "beneficiary_id": "BEN-12345",
        "beneficiary_name": "Jean Dupont",
        "provider_id": "PRO-001",
        "provider_name": "Cabinet Médical A",
        "provider_risk_score": 0.3,
        "claims_30d": 8,
        "total_30d": 2500.0,
        "tenure_months": 6,
        "days_since_last": 3,
    }

    print("Processing example transaction...")
    result = await app.process_transaction(
        transaction=example_transaction,
        workflow="standard"
    )

    print(f"\nDecision: {result['result'].get('decision')}")
    print(f"Fraud Probability: {result['result'].get('fraud_probability', 0):.1%}")
    print(f"Risk Level: {result['result'].get('risk_level')}")
    print(f"Processing Time: {result['result'].get('processing_time_ms')}ms")


if __name__ == "__main__":
    asyncio.run(main())
