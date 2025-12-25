"""
FraudShield AI - Alerts Router
Endpoints for alert management
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime, timedelta
import uuid

router = APIRouter()

# Types
AlertSeverity = Literal["info", "warning", "high", "critical"]
AlertStatus = Literal["new", "acknowledged", "investigating", "resolved", "dismissed"]
AlertType = Literal["anomaly", "threshold", "pattern", "ml_detection", "rule_based", "real_time"]
AlertEntityType = Literal["transaction", "beneficiary", "document", "network", "system"]
AlertActionType = Literal["acknowledge", "investigate", "escalate", "resolve", "dismiss", "comment"]


class AlertAction(BaseModel):
    id: str
    action_type: AlertActionType
    description: str
    performed_by: str
    performed_at: str


class Alert(BaseModel):
    id: str
    alert_id: str
    title: str
    description: str
    severity: AlertSeverity
    status: AlertStatus
    type: AlertType
    source: str
    entity_type: AlertEntityType
    entity_id: str
    risk_score: float
    created_at: str
    updated_at: str
    acknowledged_at: Optional[str] = None
    resolved_at: Optional[str] = None
    acknowledged_by: Optional[str] = None
    resolved_by: Optional[str] = None
    related_transactions: List[str] = []
    metadata: Dict[str, Any] = {}
    actions_taken: List[AlertAction] = []


class AlertListResponse(BaseModel):
    alerts: List[Alert]
    total: int
    page: int
    limit: int


class AlertStatsResponse(BaseModel):
    active: int
    critical: int
    investigating: int
    resolved_today: int
    new_today: int
    acknowledged: int
    dismissed: int
    average_resolution_time: float


class AlertActionRequest(BaseModel):
    action: AlertActionType
    comment: Optional[str] = None


class AlertCommentRequest(BaseModel):
    comment: str


class CreateInvestigationRequest(BaseModel):
    alert_id: str
    reason: Optional[str] = None


class InvestigationResponse(BaseModel):
    id: str
    investigation_id: str
    title: str
    status: str
    created_at: str


# Mock data store
mock_alerts: List[Alert] = [
    Alert(
        id="1",
        alert_id="ALT-2024-001",
        title="Transaction anormalement elevee detectee",
        description="Montant de 45 000 EUR depasse le seuil de 10 000 EUR pour ce type de prestation",
        severity="critical",
        status="new",
        type="threshold",
        source="Rule Engine",
        entity_type="transaction",
        entity_id="TXN-2024-0891",
        risk_score=0.92,
        created_at=datetime.now().isoformat(),
        updated_at=datetime.now().isoformat(),
        related_transactions=["TXN-2024-0891"],
        metadata={"threshold": 10000, "actual": 45000},
        actions_taken=[],
    ),
    Alert(
        id="2",
        alert_id="ALT-2024-002",
        title="Pattern de fraude detecte - Multiple beneficiaires",
        description="Meme adresse IP utilisee pour 5 beneficiaires differents en 24h",
        severity="high",
        status="investigating",
        type="pattern",
        source="ML Detection",
        entity_type="network",
        entity_id="NET-2024-045",
        risk_score=0.85,
        created_at=(datetime.now() - timedelta(hours=2)).isoformat(),
        updated_at=datetime.now().isoformat(),
        acknowledged_at=(datetime.now() - timedelta(hours=1)).isoformat(),
        acknowledged_by="Marie Dupont",
        related_transactions=["TXN-2024-0878", "TXN-2024-0879", "TXN-2024-0880"],
        metadata={"ip_address": "192.168.1.100", "beneficiary_count": 5},
        actions_taken=[
            AlertAction(
                id="a1",
                action_type="acknowledge",
                description="Alerte prise en compte",
                performed_by="Marie Dupont",
                performed_at=(datetime.now() - timedelta(hours=1)).isoformat(),
            )
        ],
    ),
    Alert(
        id="3",
        alert_id="ALT-2024-003",
        title="Anomalie ML - Score de fraude eleve",
        description="Le modele ML a detecte une probabilite de fraude de 87% sur cette transaction",
        severity="high",
        status="acknowledged",
        type="ml_detection",
        source="Fraud Detection Model v2.1",
        entity_type="transaction",
        entity_id="TXN-2024-0895",
        risk_score=0.87,
        created_at=(datetime.now() - timedelta(hours=3)).isoformat(),
        updated_at=(datetime.now() - timedelta(hours=2)).isoformat(),
        acknowledged_at=(datetime.now() - timedelta(hours=2)).isoformat(),
        acknowledged_by="Jean Martin",
        related_transactions=["TXN-2024-0895"],
        metadata={"model_version": "2.1", "confidence": 0.92},
        actions_taken=[],
    ),
    Alert(
        id="4",
        alert_id="ALT-2024-004",
        title="Document suspect - Signature non conforme",
        description="La signature sur le document ne correspond pas au specimen enregistre",
        severity="warning",
        status="resolved",
        type="rule_based",
        source="Document Verification",
        entity_type="document",
        entity_id="DOC-2024-1234",
        risk_score=0.65,
        created_at=(datetime.now() - timedelta(days=1)).isoformat(),
        updated_at=(datetime.now() - timedelta(hours=8)).isoformat(),
        resolved_at=(datetime.now() - timedelta(hours=8)).isoformat(),
        resolved_by="Sophie Bernard",
        related_transactions=["TXN-2024-0867"],
        metadata={"document_type": "attestation", "match_score": 0.23},
        actions_taken=[
            AlertAction(
                id="a2",
                action_type="investigate",
                description="Verification manuelle du document",
                performed_by="Sophie Bernard",
                performed_at=(datetime.now() - timedelta(hours=16)).isoformat(),
            ),
            AlertAction(
                id="a3",
                action_type="resolve",
                description="Faux positif confirme - document valide",
                performed_by="Sophie Bernard",
                performed_at=(datetime.now() - timedelta(hours=8)).isoformat(),
            ),
        ],
    ),
    Alert(
        id="5",
        alert_id="ALT-2024-005",
        title="Beneficiaire a haut risque",
        description="Ce beneficiaire a ete implique dans 3 alertes au cours des 30 derniers jours",
        severity="warning",
        status="new",
        type="anomaly",
        source="Risk Scoring Engine",
        entity_type="beneficiary",
        entity_id="BEN-789456",
        risk_score=0.72,
        created_at=(datetime.now() - timedelta(hours=5)).isoformat(),
        updated_at=(datetime.now() - timedelta(hours=5)).isoformat(),
        related_transactions=["TXN-2024-0850", "TXN-2024-0865", "TXN-2024-0890"],
        metadata={"alert_count_30d": 3, "total_amount": 15000},
        actions_taken=[],
    ),
    Alert(
        id="6",
        alert_id="ALT-2024-006",
        title="Reseau de fraude potentiel identifie",
        description="12 beneficiaires partageant les memes coordonnees bancaires",
        severity="critical",
        status="investigating",
        type="pattern",
        source="Network Analysis",
        entity_type="network",
        entity_id="NET-2024-089",
        risk_score=0.95,
        created_at=(datetime.now() - timedelta(hours=6)).isoformat(),
        updated_at=(datetime.now() - timedelta(hours=2)).isoformat(),
        acknowledged_at=(datetime.now() - timedelta(hours=5)).isoformat(),
        acknowledged_by="Marie Dupont",
        related_transactions=["TXN-2024-0800", "TXN-2024-0801", "TXN-2024-0802", "TXN-2024-0803"],
        metadata={"beneficiary_count": 12, "shared_iban": "FR76***456"},
        actions_taken=[
            AlertAction(
                id="a5",
                action_type="escalate",
                description="Escalade vers equipe investigation",
                performed_by="Marie Dupont",
                performed_at=(datetime.now() - timedelta(hours=4)).isoformat(),
            )
        ],
    ),
]


@router.get("", response_model=AlertListResponse)
async def get_alerts(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    severity: Optional[AlertSeverity] = None,
    status: Optional[AlertStatus] = None,
    type: Optional[AlertType] = None,
    entity_type: Optional[AlertEntityType] = None,
    search: Optional[str] = None,
):
    """Recupere la liste des alertes avec filtres et pagination."""
    filtered = mock_alerts.copy()

    if severity:
        filtered = [a for a in filtered if a.severity == severity]
    if status:
        filtered = [a for a in filtered if a.status == status]
    if type:
        filtered = [a for a in filtered if a.type == type]
    if entity_type:
        filtered = [a for a in filtered if a.entity_type == entity_type]
    if search:
        search_lower = search.lower()
        filtered = [
            a for a in filtered
            if search_lower in a.alert_id.lower()
            or search_lower in a.title.lower()
            or search_lower in a.description.lower()
        ]

    total = len(filtered)
    start = (page - 1) * limit
    end = start + limit
    paginated = filtered[start:end]

    return AlertListResponse(
        alerts=paginated,
        total=total,
        page=page,
        limit=limit,
    )


@router.get("/stats", response_model=AlertStatsResponse)
async def get_alert_stats():
    """Recupere les statistiques des alertes."""
    active = len([a for a in mock_alerts if a.status not in ["resolved", "dismissed"]])
    critical = len([a for a in mock_alerts if a.severity == "critical" and a.status not in ["resolved", "dismissed"]])
    investigating = len([a for a in mock_alerts if a.status == "investigating"])

    today = datetime.now().date()
    resolved_today = len([
        a for a in mock_alerts
        if a.resolved_at and datetime.fromisoformat(a.resolved_at.replace("Z", "+00:00")).date() == today
    ])
    new_today = len([
        a for a in mock_alerts
        if datetime.fromisoformat(a.created_at.replace("Z", "+00:00")).date() == today
    ])
    acknowledged = len([a for a in mock_alerts if a.status == "acknowledged"])
    dismissed = len([a for a in mock_alerts if a.status == "dismissed"])

    return AlertStatsResponse(
        active=active,
        critical=critical,
        investigating=investigating,
        resolved_today=resolved_today,
        new_today=new_today,
        acknowledged=acknowledged,
        dismissed=dismissed,
        average_resolution_time=3600,  # 1 hour in seconds
    )


# Alert rules endpoints - MUST be defined before /{alert_id} route
class AlertRule(BaseModel):
    id: str
    name: str
    description: str
    type: Literal["threshold", "pattern", "ml", "composite"]
    severity: AlertSeverity
    enabled: bool
    conditions: str
    created_at: str
    last_triggered: Optional[str] = None
    trigger_count: int = 0


class AlertRulesResponse(BaseModel):
    rules: List[AlertRule]
    total: int


mock_rules = [
    AlertRule(
        id="1",
        name="Seuil montant eleve",
        description="Declenche une alerte si le montant depasse 10 000 EUR",
        type="threshold",
        severity="high",
        enabled=True,
        conditions="amount > 10000",
        created_at="2024-01-01T00:00:00Z",
        last_triggered="2024-01-21T10:30:00Z",
        trigger_count=156,
    ),
    AlertRule(
        id="2",
        name="Detection anomalie ML",
        description="Modele de detection de fraude base sur le machine learning",
        type="ml",
        severity="critical",
        enabled=True,
        conditions="fraud_probability > 0.85",
        created_at="2024-01-01T00:00:00Z",
        last_triggered="2024-01-21T08:45:00Z",
        trigger_count=89,
    ),
]


@router.get("/rules", response_model=AlertRulesResponse)
async def get_alert_rules():
    """Recupere la liste des regles d'alerte."""
    return AlertRulesResponse(rules=mock_rules, total=len(mock_rules))


@router.get("/{alert_id}", response_model=Alert)
async def get_alert(alert_id: str):
    """Recupere une alerte par son ID."""
    alert = next((a for a in mock_alerts if a.id == alert_id or a.alert_id == alert_id), None)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@router.post("/{alert_id}/action", response_model=Alert)
async def update_alert_status(alert_id: str, request: AlertActionRequest):
    """Met a jour le statut d'une alerte avec une action."""
    alert = next((a for a in mock_alerts if a.id == alert_id or a.alert_id == alert_id), None)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    now = datetime.now().isoformat()

    # Create action
    action = AlertAction(
        id=str(uuid.uuid4()),
        action_type=request.action,
        description=request.comment or f"Action: {request.action}",
        performed_by="Current User",
        performed_at=now,
    )
    alert.actions_taken.append(action)
    alert.updated_at = now

    # Update status based on action
    status_map = {
        "acknowledge": "acknowledged",
        "investigate": "investigating",
        "resolve": "resolved",
        "dismiss": "dismissed",
    }

    if request.action in status_map:
        alert.status = status_map[request.action]

    if request.action == "acknowledge":
        alert.acknowledged_at = now
        alert.acknowledged_by = "Current User"
    elif request.action in ["resolve", "dismiss"]:
        alert.resolved_at = now
        alert.resolved_by = "Current User"

    return alert


@router.post("/{alert_id}/comments", response_model=Alert)
async def add_alert_comment(alert_id: str, request: AlertCommentRequest):
    """Ajoute un commentaire a une alerte."""
    alert = next((a for a in mock_alerts if a.id == alert_id or a.alert_id == alert_id), None)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    action = AlertAction(
        id=str(uuid.uuid4()),
        action_type="comment",
        description=request.comment,
        performed_by="Current User",
        performed_at=datetime.now().isoformat(),
    )
    alert.actions_taken.append(action)
    alert.updated_at = datetime.now().isoformat()

    return alert


@router.post("/from-alert", response_model=InvestigationResponse, deprecated=True)
async def create_investigation_from_alert(request: CreateInvestigationRequest):
    """
    DEPRECATED: Utilisez POST /api/v1/investigations/from-alert a la place.

    Cree une investigation a partir d'une alerte.
    """
    alert = next((a for a in mock_alerts if a.id == request.alert_id or a.alert_id == request.alert_id), None)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    # Update alert status
    alert.status = "investigating"
    alert.updated_at = datetime.now().isoformat()

    # Create investigation
    inv_id = f"INV-{datetime.now().strftime('%Y')}-{str(uuid.uuid4())[:8].upper()}"

    return InvestigationResponse(
        id=str(uuid.uuid4()),
        investigation_id=inv_id,
        title=f"Investigation depuis {alert.alert_id}: {alert.title}",
        status="open",
        created_at=datetime.now().isoformat(),
    )
