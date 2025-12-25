"""
FraudShield AI - Transactions Router
API endpoints for transaction analysis
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Query
from typing import List, Optional, Union
from datetime import datetime, timedelta
import random

from ..models.requests import TransactionRequest, BatchTransactionRequest, FeedbackRequest, SimpleTransactionRequest
from ..models.responses import FraudDecisionResponse, BatchResultResponse, TransactionListResponse
from ..services.fraud_service import FraudService

router = APIRouter()


def get_fraud_service() -> FraudService:
    """Dependency injection for fraud service."""
    from ..main import fraud_service
    if fraud_service is None:
        raise HTTPException(status_code=503, detail="Service not initialized")
    return fraud_service


# =============================================================================
# LIST TRANSACTIONS
# =============================================================================

@router.get("", response_model=TransactionListResponse)
async def list_transactions(
    page: int = Query(1, ge=1, description="Numéro de page"),
    limit: int = Query(10, ge=1, le=100, description="Nombre d'éléments par page"),
    status: Optional[str] = Query(None, description="Filtrer par statut"),
    risk_level: Optional[str] = Query(None, description="Filtrer par niveau de risque"),
    date_from: Optional[str] = Query(None, description="Date de début (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Date de fin (YYYY-MM-DD)"),
    service: FraudService = Depends(get_fraud_service)
):
    """
    Liste les transactions avec pagination et filtres.

    En production, cette endpoint interrogerait la base de données.
    Pour l'instant, retourne des données mock.
    """
    # Mock data - en production, interroger la DB
    mock_transactions = []
    base_date = datetime.now()

    for i in range(15):
        tx_date = base_date - timedelta(days=i)
        risk_scores = [0.12, 0.35, 0.58, 0.72, 0.89]
        risk_levels = ["low", "medium", "medium", "high", "critical"]
        statuses = ["approved", "pending", "review", "rejected", "investigating"]

        idx = i % 5
        mock_transactions.append({
            "transaction_id": f"TX-2025-{1000 + i:04d}",
            "beneficiary_id": f"BEN-{100 + (i % 10):03d}",
            "beneficiary_name": ["Jean Dupont", "Marie Martin", "Pierre Bernard", "Sophie Leroy", "Luc Moreau"][i % 5],
            "amount": round(random.uniform(50, 5000), 2),
            "transaction_type": ["REMBOURSEMENT", "PRESTATION", "PENSION"][i % 3],
            "status": statuses[idx],
            "risk_score": risk_scores[idx],
            "risk_level": risk_levels[idx],
            "submission_date": tx_date.isoformat(),
            "decision": ["PASS", "FLAG", "BLOCK"][idx % 3] if idx > 0 else "PASS"
        })

    # Appliquer les filtres
    filtered = mock_transactions
    if status:
        filtered = [t for t in filtered if t["status"] == status]
    if risk_level:
        filtered = [t for t in filtered if t["risk_level"] == risk_level]

    # Pagination
    total = len(filtered)
    start = (page - 1) * limit
    end = start + limit
    paginated = filtered[start:end]

    return TransactionListResponse(
        transactions=paginated,
        total=total,
        page=page,
        limit=limit
    )


# =============================================================================
# ANALYZE TRANSACTION
# =============================================================================

@router.post("/analyze", response_model=FraudDecisionResponse)
async def analyze_transaction(
    request: Union[TransactionRequest, SimpleTransactionRequest],
    background_tasks: BackgroundTasks,
    service: FraudService = Depends(get_fraud_service)
):
    """
    Analyser une transaction pour détecter la fraude.

    Accepte deux formats de requête:
    - **Format complet** (TransactionRequest): Structure imbriquée avec transaction, documents, beneficiary
    - **Format simplifié** (SimpleTransactionRequest): Structure plate pour intégration frontend

    Utilise le workflow spécifié pour l'analyse:
    - **quick**: Pré-screening rapide
    - **standard**: Analyse complète
    - **investigation**: Analyse approfondie avec rapport
    """
    try:
        # Convertir si format simplifié
        if isinstance(request, SimpleTransactionRequest):
            request = request.to_full_request()

        # Convert Pydantic models to dicts
        transaction_dict = request.transaction.dict()
        documents_list = [doc.dict() for doc in request.documents] if request.documents else []
        beneficiary_dict = request.beneficiary.dict() if request.beneficiary else None

        result = await service.process_transaction(
            transaction=transaction_dict,
            documents=documents_list,
            beneficiary=beneficiary_dict,
            workflow=request.workflow.value,
            user_id=request.user_id
        )

        # Transform to response model
        fraud_result = result.get("result", {})

        # Map decision to valid enum values
        raw_decision = fraud_result.get("decision", "FLAG")
        decision_map = {"PASS": "PASS", "FLAG": "FLAG", "BLOCK": "BLOCK", "REVIEW": "FLAG"}
        decision = decision_map.get(raw_decision, "FLAG")

        return FraudDecisionResponse(
            status="success",
            transaction_id=fraud_result.get("transaction_id", ""),
            case_id=fraud_result.get("case_id", ""),
            decision=decision,
            fraud_probability=fraud_result.get("fraud_probability", 0),
            risk_level=fraud_result.get("risk_level", "low"),
            confidence=fraud_result.get("confidence", 0),
            component_scores=fraud_result.get("analysis_summary", {}).get("component_scores", {}),
            anomalies=[],
            patterns=[],
            key_findings=fraud_result.get("key_findings", []),
            explanation=fraud_result.get("explanation", ""),
            recommendations=fraud_result.get("recommendations", []),
            workflow=request.workflow.value,
            processing_time_ms=fraud_result.get("processing_time_ms", 0),
            generated_at=fraud_result.get("generated_at", datetime.now().isoformat())
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch", response_model=BatchResultResponse)
async def batch_analyze(
    request: BatchTransactionRequest,
    service: FraudService = Depends(get_fraud_service)
):
    """
    Traitement batch de plusieurs transactions.

    Limite: 1000 transactions par requête.
    """
    try:
        transactions = [tx.dict() for tx in request.transactions]

        result = await service.process_batch(
            transactions=transactions,
            user_id=request.user_id
        )

        batch_result = result.get("result", {})

        return BatchResultResponse(
            status="success",
            batch_id=request.batch_id or f"BATCH-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            transactions_processed=batch_result.get("transactions_processed", 0),
            flagged_count=batch_result.get("flagged_count", 0),
            pass_count=batch_result.get("pass_count", 0),
            average_fraud_probability=batch_result.get("average_fraud_probability", 0),
            results=batch_result.get("results", []),
            processing_time_ms=batch_result.get("processing_time_ms", 0),
            generated_at=datetime.now().isoformat()
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{transaction_id}")
async def get_transaction_analysis(
    transaction_id: str,
    service: FraudService = Depends(get_fraud_service)
):
    """
    Récupérer l'analyse d'une transaction par son ID.
    """
    # In production, would query database
    return {
        "transaction_id": transaction_id,
        "status": "not_found",
        "note": "Transaction lookup requires database integration"
    }


@router.post("/feedback")
async def submit_feedback(
    request: FeedbackRequest,
    service: FraudService = Depends(get_fraud_service)
):
    """
    Soumettre un feedback sur une décision de fraude.

    Utilisé pour améliorer le modèle via apprentissage par renforcement.
    """
    try:
        result = await service.submit_feedback(
            transaction_id=request.transaction_id,
            actual_fraud=request.actual_fraud,
            investigator_id=request.investigator_id
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{beneficiary_id}")
async def get_transaction_history(
    beneficiary_id: str,
    days: int = 90,
    limit: int = 100,
    service: FraudService = Depends(get_fraud_service)
):
    """
    Récupérer l'historique des transactions d'un bénéficiaire.
    """
    # In production, would query database
    return {
        "beneficiary_id": beneficiary_id,
        "period_days": days,
        "transactions": [],
        "note": "History lookup requires database integration"
    }
