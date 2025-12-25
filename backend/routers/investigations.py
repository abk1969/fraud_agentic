"""
FraudShield AI - Investigations Router
API endpoints for fraud investigations
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid

from ..models.requests import InvestigationRequest, NetworkAnalysisRequest
from ..models.responses import InvestigationReportResponse, NetworkAnalysisResponse, InvestigationListResponse, InvestigationStartResponse
from ..services.fraud_service import FraudService

router = APIRouter()


# =============================================================================
# REQUEST MODELS (locaux au router)
# =============================================================================

class StartInvestigationRequest(BaseModel):
    """Requête pour démarrer une investigation depuis une transaction."""
    transaction_id: str = Field(..., description="ID de la transaction à investiguer")
    reason: Optional[str] = Field(default=None, description="Raison de l'investigation")


class CreateFromAlertRequest(BaseModel):
    """Requête pour créer une investigation depuis une alerte."""
    alert_id: str = Field(..., description="ID de l'alerte")
    reason: Optional[str] = Field(default=None, description="Raison de l'investigation")


def get_fraud_service() -> FraudService:
    """Dependency injection for fraud service."""
    from ..main import fraud_service
    if fraud_service is None:
        raise HTTPException(status_code=503, detail="Service not initialized")
    return fraud_service


# =============================================================================
# MOCK DATA STORE
# =============================================================================

mock_investigations: List[Dict[str, Any]] = [
    {
        "investigation_id": "INV-2025-001",
        "transaction_id": "TX-2025-0891",
        "alert_id": "ALT-2024-001",
        "status": "open",
        "priority": "high",
        "assigned_to": "Marie Dupont",
        "reason": "Transaction anormalement elevee",
        "findings": ["Montant 4x superieur a la moyenne", "Nouveau prestataire"],
        "risk_score": 0.85,
        "created_at": (datetime.now() - timedelta(hours=6)).isoformat(),
        "updated_at": datetime.now().isoformat(),
    },
    {
        "investigation_id": "INV-2025-002",
        "transaction_id": "TX-2025-0878",
        "alert_id": "ALT-2024-002",
        "status": "in_progress",
        "priority": "critical",
        "assigned_to": "Jean Martin",
        "reason": "Pattern de fraude detecte",
        "findings": ["Meme IP pour 5 beneficiaires", "Documents suspects"],
        "risk_score": 0.92,
        "created_at": (datetime.now() - timedelta(days=1)).isoformat(),
        "updated_at": (datetime.now() - timedelta(hours=2)).isoformat(),
    },
    {
        "investigation_id": "INV-2025-003",
        "transaction_id": "TX-2025-0867",
        "alert_id": None,
        "status": "closed",
        "priority": "medium",
        "assigned_to": "Sophie Bernard",
        "reason": "Verification manuelle",
        "findings": ["Faux positif confirme"],
        "risk_score": 0.45,
        "fraud_confirmed": False,
        "created_at": (datetime.now() - timedelta(days=3)).isoformat(),
        "updated_at": (datetime.now() - timedelta(days=2)).isoformat(),
        "closed_at": (datetime.now() - timedelta(days=2)).isoformat(),
    },
]


# =============================================================================
# LIST INVESTIGATIONS
# =============================================================================

@router.get("", response_model=InvestigationListResponse)
async def list_investigations(
    page: int = Query(1, ge=1, description="Numero de page"),
    limit: int = Query(10, ge=1, le=100, description="Nombre d'elements par page"),
    status: Optional[str] = Query(None, description="Filtrer par statut: open, in_progress, closed"),
    priority: Optional[str] = Query(None, description="Filtrer par priorite: low, medium, high, critical"),
    service: FraudService = Depends(get_fraud_service)
):
    """
    Liste les investigations avec pagination et filtres.
    """
    filtered = mock_investigations.copy()

    if status:
        filtered = [inv for inv in filtered if inv.get("status") == status]
    if priority:
        filtered = [inv for inv in filtered if inv.get("priority") == priority]

    total = len(filtered)
    start = (page - 1) * limit
    end = start + limit
    paginated = filtered[start:end]

    return InvestigationListResponse(
        investigations=paginated,
        total=total,
        page=page,
        limit=limit
    )


# =============================================================================
# START INVESTIGATION
# =============================================================================

@router.post("/start", response_model=InvestigationStartResponse)
async def start_investigation(
    request: StartInvestigationRequest,
    service: FraudService = Depends(get_fraud_service)
):
    """
    Demarre une investigation a partir d'une transaction.

    Cree un nouveau dossier d'investigation lie a la transaction specifiee.
    """
    investigation_id = f"INV-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4].upper()}"

    # Ajouter au mock store
    new_investigation = {
        "investigation_id": investigation_id,
        "transaction_id": request.transaction_id,
        "alert_id": None,
        "status": "open",
        "priority": "medium",
        "assigned_to": None,
        "reason": request.reason,
        "findings": [],
        "risk_score": 0.0,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }
    mock_investigations.append(new_investigation)

    return InvestigationStartResponse(
        investigation_id=investigation_id,
        status="open",
        created_at=datetime.now().isoformat(),
        transaction_id=request.transaction_id,
        reason=request.reason
    )


# =============================================================================
# CREATE FROM ALERT
# =============================================================================

@router.post("/from-alert", response_model=InvestigationStartResponse)
async def create_investigation_from_alert(
    request: CreateFromAlertRequest,
    service: FraudService = Depends(get_fraud_service)
):
    """
    Cree une investigation a partir d'une alerte.

    Lie automatiquement l'investigation a l'alerte source.
    """
    investigation_id = f"INV-{datetime.now().strftime('%Y')}-{uuid.uuid4().hex[:8].upper()}"

    # Ajouter au mock store
    new_investigation = {
        "investigation_id": investigation_id,
        "transaction_id": None,
        "alert_id": request.alert_id,
        "status": "open",
        "priority": "high",
        "assigned_to": None,
        "reason": request.reason or f"Investigation depuis alerte {request.alert_id}",
        "findings": [],
        "risk_score": 0.0,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }
    mock_investigations.append(new_investigation)

    return InvestigationStartResponse(
        investigation_id=investigation_id,
        status="open",
        created_at=datetime.now().isoformat(),
        reason=request.reason
    )


# =============================================================================
# CREATE FULL INVESTIGATION REPORT
# =============================================================================

@router.post("/create", response_model=InvestigationReportResponse)
async def create_investigation(
    request: InvestigationRequest,
    service: FraudService = Depends(get_fraud_service)
):
    """
    Créer un rapport d'investigation complet.

    Inclut:
    - Résumé exécutif
    - Chronologie des événements
    - Preuves collectées
    - Analyse détaillée
    - Analyse de réseau
    - Recommandations
    """
    try:
        investigation_data = {
            "case_id": request.case_id,
            "transaction_ids": request.transaction_ids,
            "beneficiary_id": request.beneficiary_id,
            "include_network": request.include_network_analysis,
            "include_historical": request.include_historical,
            "depth": request.depth
        }

        result = await service.create_investigation_report(
            case_id=request.case_id,
            investigation_data=investigation_data
        )

        return InvestigationReportResponse(
            status="success",
            case_id=request.case_id,
            report_id=result.get("report_id", ""),
            report_text=result.get("report_text", ""),
            sections=result.get("sections", {}),
            page_count_estimate=result.get("page_count_estimate", 1),
            generated_at=datetime.now().isoformat()
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/network", response_model=NetworkAnalysisResponse)
async def analyze_network(
    request: NetworkAnalysisRequest,
    service: FraudService = Depends(get_fraud_service)
):
    """
    Analyser le réseau de relations autour d'une entité.

    Détecte:
    - Communautés suspectes
    - Cercles de fraude
    - Entités pivots
    - Connexions à risque
    """
    try:
        result = await service.analyze_network(
            entity_id=request.entity_id,
            entity_type=request.entity_type,
            depth=request.depth
        )

        return NetworkAnalysisResponse(
            status="success",
            entity_id=request.entity_id,
            network_risk_score=result.get("network_risk_score", 0),
            network_stats=result.get("network_stats", {}),
            community=result.get("community", {}),
            fraud_rings=result.get("fraud_rings", {}),
            key_entities=result.get("key_entities", []),
            recommendation=result.get("recommendation", "normal"),
            processing_time_ms=result.get("elapsed_ms", 0)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{investigation_id}")
async def get_investigation(
    investigation_id: str,
    service: FraudService = Depends(get_fraud_service)
):
    """
    Recuperer les details d'une investigation par son ID.
    """
    # Chercher dans le mock store
    investigation = next(
        (inv for inv in mock_investigations if inv.get("investigation_id") == investigation_id),
        None
    )

    if investigation:
        return {
            **investigation,
            "timeline": [
                {
                    "event_type": "created",
                    "action": "Investigation ouverte",
                    "timestamp": investigation.get("created_at"),
                    "agent": "system"
                },
                {
                    "event_type": "updated",
                    "action": "Mise a jour",
                    "timestamp": investigation.get("updated_at"),
                    "agent": investigation.get("assigned_to") or "system"
                }
            ]
        }

    # Si non trouve, retourner structure vide
    return {
        "investigation_id": investigation_id,
        "transaction_id": None,
        "status": "not_found",
        "findings": [],
        "timeline": [],
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "note": "Investigation lookup requires database integration"
    }


@router.get("/{case_id}/timeline")
async def get_investigation_timeline(
    case_id: str,
    service: FraudService = Depends(get_fraud_service)
):
    """
    Récupérer la chronologie d'une investigation.
    """
    return {
        "case_id": case_id,
        "timeline": [],
        "note": "Timeline requires database integration"
    }


@router.post("/{case_id}/evidence")
async def add_evidence(
    case_id: str,
    evidence_type: str,
    description: str,
    document_id: Optional[str] = None,
    service: FraudService = Depends(get_fraud_service)
):
    """
    Ajouter une preuve à une investigation.
    """
    return {
        "case_id": case_id,
        "evidence_id": f"EVD-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "evidence_type": evidence_type,
        "description": description,
        "document_id": document_id,
        "added_at": datetime.now().isoformat()
    }


@router.post("/{case_id}/resolve")
async def resolve_investigation(
    case_id: str,
    resolution: str,
    confirmed_fraud: bool,
    notes: Optional[str] = None,
    investigator_id: Optional[str] = None,
    service: FraudService = Depends(get_fraud_service)
):
    """
    Résoudre une investigation.

    La résolution est utilisée pour l'entraînement du modèle RL.
    """
    return {
        "case_id": case_id,
        "resolution": resolution,
        "confirmed_fraud": confirmed_fraud,
        "notes": notes,
        "investigator_id": investigator_id,
        "resolved_at": datetime.now().isoformat(),
        "feedback_recorded": True
    }


@router.get("/fraud-rings/scan")
async def scan_fraud_rings(
    min_size: int = 3,
    service: FraudService = Depends(get_fraud_service)
):
    """
    Scanner le réseau pour détecter les cercles de fraude.
    """
    # In production, would run network scan
    return {
        "scan_type": "full_network",
        "min_ring_size": min_size,
        "rings_detected": 0,
        "rings": [],
        "scan_timestamp": datetime.now().isoformat(),
        "note": "Full scan requires Neo4j integration"
    }


@router.post("/path")
async def find_entity_path(
    source_entity_id: str,
    target_entity_id: str,
    max_hops: int = 5,
    service: FraudService = Depends(get_fraud_service)
):
    """
    Trouver le chemin entre deux entités dans le réseau.
    """
    return {
        "source": source_entity_id,
        "target": target_entity_id,
        "max_hops": max_hops,
        "path_found": False,
        "path": [],
        "note": "Path finding requires Neo4j integration"
    }
