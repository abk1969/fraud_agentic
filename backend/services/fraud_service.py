"""
FraudShield AI - Fraud Detection Service
Bridge between FastAPI and FraudShield core
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import asyncio

# Import FraudShield core
import sys
sys.path.insert(0, '..')
from fraudshield.app import FraudShieldApp, get_app
from fraudshield.agents.base_agent import AgentContext


class FraudService:
    """
    Fraud Detection Service.

    Wraps FraudShield AI core for use in FastAPI.
    """

    def __init__(self):
        """Initialize fraud service."""
        self.app: Optional[FraudShieldApp] = None
        self.initialized = False

    async def initialize(self):
        """Initialize the service and underlying FraudShield app."""
        if not self.initialized:
            self.app = get_app()
            self.initialized = True

    async def shutdown(self):
        """Shutdown the service."""
        self.initialized = False

    async def process_transaction(
        self,
        transaction: Dict[str, Any],
        documents: Optional[List[Dict]] = None,
        beneficiary: Optional[Dict[str, Any]] = None,
        workflow: str = "standard",
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Process a transaction for fraud detection.

        Args:
            transaction: Transaction data
            documents: Optional documents
            beneficiary: Optional beneficiary data
            workflow: Workflow type
            user_id: User ID for notifications

        Returns:
            Fraud detection result
        """
        if not self.initialized or self.app is None:
            raise RuntimeError("Service not initialized")

        result = await self.app.process_transaction(
            transaction=transaction,
            documents=documents,
            beneficiary=beneficiary,
            workflow=workflow,
            user_id=user_id
        )

        return result

    async def process_batch(
        self,
        transactions: List[Dict[str, Any]],
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
        if not self.initialized or self.app is None:
            raise RuntimeError("Service not initialized")

        result = await self.app.process_batch(
            transactions=transactions,
            user_id=user_id
        )

        return result

    async def analyze_documents(
        self,
        documents: List[Dict[str, Any]],
        transaction_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyze documents for tampering and entities.

        Args:
            documents: List of documents to analyze
            transaction_id: Optional related transaction

        Returns:
            Document analysis result
        """
        if not self.initialized or self.app is None:
            raise RuntimeError("Service not initialized")

        context = AgentContext(transaction_id=transaction_id or "")
        result = await self.app.orchestrator.document_analyst.analyze(
            documents, context
        )

        return result

    async def verify_identity(
        self,
        beneficiary_data: Dict[str, Any],
        verification_level: str = "standard"
    ) -> Dict[str, Any]:
        """
        Verify beneficiary identity.

        Args:
            beneficiary_data: Beneficiary information
            verification_level: Verification level

        Returns:
            Identity verification result
        """
        if not self.initialized or self.app is None:
            raise RuntimeError("Service not initialized")

        context = AgentContext()
        result = await self.app.orchestrator.identity_verifier.verify(
            beneficiary_data, context, verification_level
        )

        return result

    async def analyze_network(
        self,
        entity_id: str,
        entity_type: str = "beneficiary",
        depth: int = 2
    ) -> Dict[str, Any]:
        """
        Analyze entity network.

        Args:
            entity_id: Entity to analyze
            entity_type: Type of entity
            depth: Analysis depth

        Returns:
            Network analysis result
        """
        if not self.initialized or self.app is None:
            raise RuntimeError("Service not initialized")

        context = AgentContext()
        result = await self.app.orchestrator.network_analyzer.analyze(
            entity_id, context, entity_type, depth
        )

        return result

    async def create_investigation_report(
        self,
        case_id: str,
        investigation_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Create investigation report.

        Args:
            case_id: Case identifier
            investigation_data: Investigation data

        Returns:
            Investigation report
        """
        if not self.initialized or self.app is None:
            raise RuntimeError("Service not initialized")

        context = AgentContext(case_id=case_id)
        result = await self.app.orchestrator.explanation_generator.create_report(
            case_id, investigation_data, context
        )

        return result

    async def submit_feedback(
        self,
        transaction_id: str,
        actual_fraud: bool,
        investigator_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Submit feedback for model training.

        Args:
            transaction_id: Transaction ID
            actual_fraud: Ground truth label
            investigator_id: Investigator who verified

        Returns:
            Feedback confirmation
        """
        if not self.initialized or self.app is None:
            raise RuntimeError("Service not initialized")

        # In production, this would add to RL training buffer
        # For now, just acknowledge
        return {
            "status": "received",
            "transaction_id": transaction_id,
            "actual_fraud": actual_fraud,
            "timestamp": datetime.now().isoformat(),
            "note": "Feedback recorded for model training"
        }

    def get_status(self) -> Dict[str, Any]:
        """Get service status."""
        if not self.initialized or self.app is None:
            return {"status": "not_initialized"}

        return self.app.get_status()

    def get_model_info(self) -> Dict[str, Any]:
        """Get model information."""
        if not self.initialized or self.app is None:
            return {"status": "not_initialized"}

        return self.app.get_model_info()

    def get_agent_status(self) -> List[Dict[str, Any]]:
        """Get status of all agents."""
        if not self.initialized or self.app is None:
            return []

        agents = self.app.registry.get_all_agents()
        return [agent.to_dict() for agent in agents]
