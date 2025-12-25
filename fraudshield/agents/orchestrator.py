"""
FraudShield AI - Fraud Orchestrator Agent
Main orchestrator agent coordinating all specialized agents

Architecture:
- Uses ADK hierarchical agent pattern
- Delegates to specialized sub-agents
- Implements parallel and sequential workflows
- Manages A2A communication
- Provides A2UI responses
"""

from typing import Dict, Any, List, Optional, Union
from datetime import datetime
from dataclasses import dataclass, field
from enum import Enum

from .base_agent import (
    AgentConfig,
    AgentContext,
    create_agent_instruction,
    GENERATION_CONFIG,
)
from .document_analyst import DocumentAnalystAgent
from .transaction_analyst import TransactionAnalystAgent
from .identity_verifier import IdentityVerifierAgent
from .pattern_detector import PatternDetectorAgent
from .network_analyzer import NetworkAnalyzerAgent
from .explanation_generator import ExplanationGeneratorAgent

from ..config.rewards import REWARD_CONFIG, classify_risk, should_flag, RiskLevel


class WorkflowType(Enum):
    """Types of fraud detection workflows."""
    STANDARD = "standard"  # Full analysis
    QUICK = "quick"  # Fast pre-screening
    INVESTIGATION = "investigation"  # Deep investigation
    BATCH = "batch"  # Batch processing


@dataclass
class OrchestratorState:
    """State maintained by the orchestrator."""
    transaction_id: str = ""
    case_id: str = ""
    workflow_type: WorkflowType = WorkflowType.STANDARD
    current_phase: str = "intake"
    results: Dict[str, Any] = field(default_factory=dict)
    decisions: List[Dict[str, Any]] = field(default_factory=list)
    start_time: datetime = field(default_factory=datetime.now)

    def elapsed_ms(self) -> int:
        """Get elapsed time in milliseconds."""
        return int((datetime.now() - self.start_time).total_seconds() * 1000)


class FraudOrchestratorAgent:
    """
    Fraud Orchestrator Agent - Main coordinator for FraudShield.

    Responsibilities:
    - Coordinate fraud detection workflow
    - Delegate tasks to specialized agents
    - Aggregate results from sub-agents
    - Make final fraud decision
    - Generate comprehensive response
    - Handle A2A and A2UI communication
    """

    def __init__(self):
        """Initialize Fraud Orchestrator Agent."""
        self.config = AgentConfig(
            name="fraud_orchestrator",
            model="gemini-flash-latest",
            description="Agent orchestrateur principal de détection de fraude",
            instruction=self._build_instruction(),
            output_key="fraud_decision",
            generate_content_config=GENERATION_CONFIG,
        )

        # Initialize sub-agents
        self.document_analyst = DocumentAnalystAgent()
        self.transaction_analyst = TransactionAnalystAgent()
        self.identity_verifier = IdentityVerifierAgent()
        self.pattern_detector = PatternDetectorAgent()
        self.network_analyzer = NetworkAnalyzerAgent()
        self.explanation_generator = ExplanationGeneratorAgent()

        # Sub-agents list for ADK configuration
        self.sub_agents = [
            self.document_analyst,
            self.transaction_analyst,
            self.identity_verifier,
            self.pattern_detector,
            self.network_analyzer,
            self.explanation_generator,
        ]

        # Reward configuration
        self.reward_config = REWARD_CONFIG

    def _build_instruction(self) -> str:
        """Build orchestrator instruction."""
        return create_agent_instruction(
            role="l'orchestrateur principal du système FraudShield AI",
            responsibilities=[
                "Coordonner le workflow complet de détection de fraude",
                "Déléguer les tâches aux agents spécialisés appropriés",
                "Agréger les résultats des différentes analyses",
                "Prendre la décision finale de signalement",
                "Générer une réponse complète avec explications",
            ],
            guidelines=[
                "Exécuter les analyses indépendantes en parallèle",
                "Appliquer la logique cost-sensitive pour la décision finale",
                "Prioriser le rappel (95%+) pour minimiser les faux négatifs",
                "Inclure toujours une explication de la décision",
                "Fournir un niveau de confiance pour chaque décision",
                "Respecter les SLA de traitement selon le niveau de risque",
            ],
            output_format="""
Retourne un JSON structuré avec:
- decision: Décision finale (PASS, FLAG, BLOCK)
- fraud_probability: Probabilité de fraude (0-1)
- risk_level: Niveau de risque (low, medium, high, critical)
- confidence: Niveau de confiance global
- analysis_summary: Résumé des analyses effectuées
- key_findings: Découvertes principales
- explanation: Explication de la décision
- recommended_actions: Actions recommandées
- audit_trail: Piste d'audit complète
- processing_time_ms: Temps de traitement
"""
        )

    async def process(
        self,
        request: Dict[str, Any],
        workflow: WorkflowType = WorkflowType.STANDARD
    ) -> Dict[str, Any]:
        """
        Process a fraud detection request.

        Args:
            request: Request containing transaction and documents
            workflow: Type of workflow to execute

        Returns:
            Complete fraud detection result
        """
        # Initialize state
        state = OrchestratorState(
            transaction_id=request.get("transaction_id", ""),
            case_id=request.get("case_id", f"CASE-{datetime.now().strftime('%Y%m%d%H%M%S')}"),
            workflow_type=workflow,
        )

        context = AgentContext(
            transaction_id=state.transaction_id,
            case_id=state.case_id,
        )

        try:
            if workflow == WorkflowType.QUICK:
                return await self._quick_workflow(request, state, context)
            elif workflow == WorkflowType.INVESTIGATION:
                return await self._investigation_workflow(request, state, context)
            elif workflow == WorkflowType.BATCH:
                return await self._batch_workflow(request, state, context)
            else:
                return await self._standard_workflow(request, state, context)

        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "transaction_id": state.transaction_id,
                "case_id": state.case_id,
                "elapsed_ms": state.elapsed_ms()
            }

    async def _standard_workflow(
        self,
        request: Dict[str, Any],
        state: OrchestratorState,
        context: AgentContext
    ) -> Dict[str, Any]:
        """
        Execute standard fraud detection workflow.

        Phases:
        1. INTAKE - Document and data ingestion
        2. ANALYZE - Parallel analysis by specialized agents
        3. DECIDE - Aggregate and make decision
        4. EXPLAIN - Generate explanation
        """
        transaction = request.get("transaction", {})
        documents = request.get("documents", [])
        beneficiary = request.get("beneficiary", {})

        # Phase 1: INTAKE
        state.current_phase = "intake"
        intake_result = await self._intake_phase(transaction, documents, beneficiary)
        state.results["intake"] = intake_result

        # Phase 2: ANALYZE (Parallel execution)
        state.current_phase = "analyze"
        analysis_results = await self._analyze_phase(
            transaction, documents, beneficiary, context
        )
        state.results["analysis"] = analysis_results

        # Phase 3: DECIDE
        state.current_phase = "decide"
        decision_result = await self._decide_phase(analysis_results, context)
        state.results["decision"] = decision_result

        # Phase 4: EXPLAIN
        state.current_phase = "explain"
        explanation_result = await self._explain_phase(
            decision_result, analysis_results, context
        )
        state.results["explanation"] = explanation_result

        # Compile final response
        return self._compile_response(state, context)

    async def _intake_phase(
        self,
        transaction: Dict,
        documents: List[Dict],
        beneficiary: Dict
    ) -> Dict[str, Any]:
        """Intake phase - validate and prepare data."""
        return {
            "transaction_received": bool(transaction),
            "documents_count": len(documents),
            "beneficiary_provided": bool(beneficiary),
            "validation_passed": True,
            "timestamp": datetime.now().isoformat()
        }

    async def _analyze_phase(
        self,
        transaction: Dict,
        documents: List[Dict],
        beneficiary: Dict,
        context: AgentContext
    ) -> Dict[str, Any]:
        """
        Analysis phase - run specialized agents in parallel.

        Parallel execution:
        - Document analysis
        - Transaction scoring
        - Pattern detection

        Sequential (requires transaction results):
        - Identity verification
        - Network analysis
        """
        results = {}

        # Parallel analyses
        # In production, use asyncio.gather for true parallelism

        # 1. Document Analysis
        if documents:
            doc_result = await self.document_analyst.analyze(documents, context)
            results["document_analysis"] = doc_result

        # 2. Transaction Scoring
        tx_result = await self.transaction_analyst.analyze(transaction, context)
        results["transaction_analysis"] = tx_result

        # 3. Pattern Detection
        pattern_result = await self.pattern_detector.detect(transaction, context)
        results["pattern_detection"] = pattern_result

        # 4. Identity Verification (if beneficiary data provided)
        if beneficiary:
            identity_result = await self.identity_verifier.verify(
                beneficiary, context
            )
            results["identity_verification"] = identity_result

        # 5. Network Analysis (if beneficiary ID provided)
        beneficiary_id = beneficiary.get("beneficiary_id") or transaction.get("beneficiary_id")
        if beneficiary_id:
            network_result = await self.network_analyzer.analyze(
                beneficiary_id, context
            )
            results["network_analysis"] = network_result

        return results

    async def _decide_phase(
        self,
        analysis_results: Dict,
        context: AgentContext
    ) -> Dict[str, Any]:
        """
        Decision phase - aggregate scores and make final decision.

        Uses cost-sensitive thresholds from reward configuration.
        """
        # Extract scores from analyses
        scores = {
            "transaction": analysis_results.get("transaction_analysis", {}).get("fraud_probability", 0),
            "document": 1 - analysis_results.get("document_analysis", {}).get("overall_authenticity_score", 1),
            "pattern": analysis_results.get("pattern_detection", {}).get("combined_risk_score", 0),
            "identity": 1 - analysis_results.get("identity_verification", {}).get("verification_score", 1),
            "network": analysis_results.get("network_analysis", {}).get("network_risk_score", 0),
        }

        # Weighted aggregation
        weights = {
            "transaction": 0.30,
            "document": 0.20,
            "pattern": 0.25,
            "identity": 0.15,
            "network": 0.10,
        }

        # Calculate weighted score
        weighted_score = sum(
            scores.get(k, 0) * weights.get(k, 0)
            for k in weights
        )

        # Apply cost-sensitive decision
        fraud_probability = min(max(weighted_score, 0), 1)
        risk_level = classify_risk(fraud_probability)
        flag_decision = should_flag(fraud_probability)

        # Determine final action
        if risk_level == RiskLevel.CRITICAL:
            action = "BLOCK"
        elif flag_decision:
            action = "FLAG"
        else:
            action = "PASS"

        # Calculate confidence
        score_variance = sum((s - weighted_score) ** 2 for s in scores.values()) / len(scores)
        confidence = 1 - min(score_variance, 0.25) * 4  # Normalize to 0-1

        # Collect key findings
        key_findings = self._extract_key_findings(analysis_results)

        return {
            "action": action,
            "fraud_probability": round(fraud_probability, 4),
            "risk_level": risk_level.value,
            "confidence": round(confidence, 4),
            "component_scores": {k: round(v, 4) for k, v in scores.items()},
            "weights_used": weights,
            "threshold_used": self.reward_config.flag_threshold,
            "key_findings": key_findings,
            "cost_matrix_applied": {
                "TP": self.reward_config.true_positive_reward,
                "TN": self.reward_config.true_negative_reward,
                "FP": self.reward_config.false_positive_penalty,
                "FN": self.reward_config.false_negative_penalty,
            }
        }

    def _extract_key_findings(self, analysis_results: Dict) -> List[Dict[str, str]]:
        """Extract key findings from all analyses."""
        findings = []

        # From transaction analysis
        tx_analysis = analysis_results.get("transaction_analysis", {})
        for anomaly in tx_analysis.get("anomalies", []):
            findings.append({
                "source": "transaction",
                "type": anomaly.get("type", ""),
                "severity": anomaly.get("severity", "medium"),
                "description": anomaly.get("description", "")
            })

        # From document analysis
        doc_analysis = analysis_results.get("document_analysis", {})
        if doc_analysis.get("overall_authenticity_score", 1) < 0.7:
            findings.append({
                "source": "document",
                "type": "authenticity_concern",
                "severity": "high",
                "description": "Score d'authenticité documentaire faible"
            })

        # From pattern detection
        pattern_analysis = analysis_results.get("pattern_detection", {})
        for pattern in pattern_analysis.get("patterns_matched", []):
            findings.append({
                "source": "pattern",
                "type": pattern.get("pattern_id", ""),
                "severity": "high" if pattern.get("match_strength", 0) > 0.7 else "medium",
                "description": pattern.get("pattern_name", "")
            })

        # From identity verification
        identity_analysis = analysis_results.get("identity_verification", {})
        for issue in identity_analysis.get("issues_found", []):
            findings.append({
                "source": "identity",
                "type": issue.get("type", ""),
                "severity": issue.get("severity", "medium"),
                "description": issue.get("details", "")
            })

        # From network analysis
        network_analysis = analysis_results.get("network_analysis", {})
        if network_analysis.get("fraud_rings", {}).get("detected_count", 0) > 0:
            findings.append({
                "source": "network",
                "type": "fraud_ring",
                "severity": "critical",
                "description": "Cercle de fraude potentiel détecté"
            })

        # Sort by severity
        severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        findings.sort(key=lambda f: severity_order.get(f.get("severity", "low"), 3))

        return findings[:10]  # Top 10 findings

    async def _explain_phase(
        self,
        decision_result: Dict,
        analysis_results: Dict,
        context: AgentContext
    ) -> Dict[str, Any]:
        """Explanation phase - generate human-readable explanation."""
        # Prepare decision data for explanation
        decision_data = {
            "transaction_id": context.transaction_id,
            "fraud_probability": decision_result.get("fraud_probability", 0),
            "risk_level": decision_result.get("risk_level", "unknown"),
            "recommended_action": decision_result.get("action", "REVIEW"),
            "anomalies": analysis_results.get("transaction_analysis", {}).get("anomalies", []),
            "matched_patterns": analysis_results.get("pattern_detection", {}).get("patterns_matched", []),
            "components": decision_result.get("component_scores", {}),
        }

        explanation = await self.explanation_generator.explain(
            decision_data, context, detail_level="standard"
        )

        return explanation

    def _compile_response(
        self,
        state: OrchestratorState,
        context: AgentContext
    ) -> Dict[str, Any]:
        """Compile final response from all phases."""
        decision = state.results.get("decision", {})
        explanation = state.results.get("explanation", {})
        analysis = state.results.get("analysis", {})

        return {
            "status": "success",
            "transaction_id": state.transaction_id,
            "case_id": state.case_id,
            "workflow": state.workflow_type.value,

            # Decision
            "decision": decision.get("action", "REVIEW"),
            "fraud_probability": decision.get("fraud_probability", 0),
            "risk_level": decision.get("risk_level", "unknown"),
            "confidence": decision.get("confidence", 0),

            # Analysis summary
            "analysis_summary": {
                "phases_completed": ["intake", "analyze", "decide", "explain"],
                "agents_invoked": list(analysis.keys()),
                "component_scores": decision.get("component_scores", {}),
            },

            # Key findings
            "key_findings": decision.get("key_findings", []),

            # Explanation
            "explanation": explanation.get("explanation_text", ""),
            "recommendations": explanation.get("recommendations", []),

            # Audit trail
            "audit_trail": {
                "case_id": state.case_id,
                "transaction_id": state.transaction_id,
                "timestamp": datetime.now().isoformat(),
                "decision": decision.get("action"),
                "fraud_probability": decision.get("fraud_probability"),
                "threshold_used": decision.get("threshold_used"),
                "cost_matrix": decision.get("cost_matrix_applied"),
                "model_version": "fraudshield-v1.0",
            },

            # Metadata
            "processing_time_ms": state.elapsed_ms(),
            "generated_at": datetime.now().isoformat(),
        }

    async def _quick_workflow(
        self,
        request: Dict,
        state: OrchestratorState,
        context: AgentContext
    ) -> Dict[str, Any]:
        """Quick pre-screening workflow."""
        transaction = request.get("transaction", {})

        # Only transaction scoring
        tx_result = await self.transaction_analyst.analyze(
            transaction, context, include_history=False
        )

        fraud_probability = tx_result.get("fraud_probability", 0)
        risk_level = classify_risk(fraud_probability)

        return {
            "status": "success",
            "transaction_id": state.transaction_id,
            "workflow": "quick",
            "decision": "FLAG" if should_flag(fraud_probability) else "PASS",
            "fraud_probability": fraud_probability,
            "risk_level": risk_level.value,
            "quick_screen": True,
            "requires_full_analysis": risk_level in [RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.CRITICAL],
            "processing_time_ms": state.elapsed_ms(),
        }

    async def _investigation_workflow(
        self,
        request: Dict,
        state: OrchestratorState,
        context: AgentContext
    ) -> Dict[str, Any]:
        """Deep investigation workflow."""
        # Run standard workflow first
        result = await self._standard_workflow(request, state, context)

        # Add investigation report
        investigation_data = {
            "case_id": state.case_id,
            "transaction": request.get("transaction", {}),
            "analysis": state.results.get("analysis", {}),
            "decision": state.results.get("decision", {}),
        }

        report = await self.explanation_generator.create_report(
            state.case_id, investigation_data, context
        )

        result["investigation_report"] = report

        return result

    async def _batch_workflow(
        self,
        request: Dict,
        state: OrchestratorState,
        context: AgentContext
    ) -> Dict[str, Any]:
        """Batch processing workflow."""
        transactions = request.get("transactions", [])

        # Batch scoring
        batch_result = await self.transaction_analyst.batch_analyze(
            transactions, context
        )

        return {
            "status": "success",
            "workflow": "batch",
            "transactions_processed": batch_result.get("transactions_analyzed", 0),
            "flagged_count": batch_result.get("flagged_count", 0),
            "pass_count": batch_result.get("pass_count", 0),
            "average_fraud_probability": batch_result.get("average_fraud_probability", 0),
            "results": batch_result.get("results", []),
            "processing_time_ms": state.elapsed_ms(),
        }

    def get_adk_config(self) -> Dict[str, Any]:
        """
        Get ADK Agent configuration.

        Returns configuration dict for google.adk.agents.Agent
        with sub_agents for hierarchical orchestration.
        """
        return {
            **self.config.to_dict(),
            "sub_agents": [agent.get_adk_config() for agent in self.sub_agents],
        }


def create_orchestrator() -> FraudOrchestratorAgent:
    """Factory function to create orchestrator instance."""
    return FraudOrchestratorAgent()
