"""
FraudShield AI - Settings Router
API endpoints for system configuration management
"""

from fastapi import APIRouter, HTTPException, Request, UploadFile, File
from fastapi.responses import StreamingResponse
from typing import Optional, List
from datetime import datetime
import io

from ..models.settings import (
    AllSettings,
    SettingsUpdateRequest,
    ValidationResult,
    ConnectionTestResult,
    ImportExportResult,
    SettingsAuditLog,
    RiskThresholds,
    CostMatrix,
    ModelSettings,
    FraudPatternsConfig,
    FraudPattern,
    AgentsConfig,
    FeaturesConfig,
    AlertRulesConfig,
    IntegrationsConfig,
    RetentionConfig,
    SystemSettings,
)
from ..services.settings_service import get_settings_service

router = APIRouter(prefix="/api/v1/settings", tags=["settings"])


def get_client_ip(request: Request) -> str:
    """Extrait l'IP du client."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


# =============================================================================
# GLOBAL SETTINGS
# =============================================================================

@router.get("", response_model=AllSettings)
async def get_all_settings():
    """
    Récupère tous les paramètres du système.

    Retourne la configuration complète incluant:
    - Seuils de risque
    - Matrice de coûts RL
    - Configuration des modèles
    - Patterns de fraude
    - Configuration des agents
    - Features ML
    - Règles d'alertes
    - Intégrations
    - Politiques de rétention
    - Paramètres système
    """
    service = get_settings_service()
    return await service.get_all_settings()


@router.put("", response_model=AllSettings)
async def update_settings(
    update: SettingsUpdateRequest,
    request: Request,
    user_id: Optional[str] = None,
    user_email: Optional[str] = None
):
    """
    Met à jour les paramètres du système.

    Seules les sections fournies seront mises à jour.
    Les modifications sont enregistrées dans l'audit log.
    """
    service = get_settings_service()

    # Validate first
    validation = await service.validate_settings(update)
    if not validation.valid:
        raise HTTPException(status_code=400, detail={
            "message": "Validation failed",
            "errors": validation.errors,
            "warnings": validation.warnings
        })

    return await service.update_settings(
        update,
        user_id=user_id,
        user_email=user_email,
        ip_address=get_client_ip(request)
    )


@router.post("/validate", response_model=ValidationResult)
async def validate_settings(update: SettingsUpdateRequest):
    """
    Valide les paramètres sans les sauvegarder.

    Retourne les erreurs et avertissements éventuels.
    """
    service = get_settings_service()
    return await service.validate_settings(update)


# =============================================================================
# RISK THRESHOLDS
# =============================================================================

@router.get("/risk-thresholds", response_model=RiskThresholds)
async def get_risk_thresholds():
    """Récupère les seuils de classification des risques."""
    service = get_settings_service()
    return await service.get_risk_thresholds()


@router.put("/risk-thresholds", response_model=RiskThresholds)
async def update_risk_thresholds(
    thresholds: RiskThresholds,
    request: Request,
    user_id: Optional[str] = None,
    user_email: Optional[str] = None
):
    """Met à jour les seuils de classification des risques."""
    service = get_settings_service()
    return await service.update_risk_thresholds(
        thresholds,
        user_id=user_id,
        user_email=user_email,
        ip_address=get_client_ip(request)
    )


# =============================================================================
# COST MATRIX
# =============================================================================

@router.get("/cost-matrix", response_model=CostMatrix)
async def get_cost_matrix():
    """Récupère la matrice de coûts pour l'apprentissage par renforcement."""
    service = get_settings_service()
    return await service.get_cost_matrix()


@router.put("/cost-matrix", response_model=CostMatrix)
async def update_cost_matrix(
    matrix: CostMatrix,
    request: Request,
    user_id: Optional[str] = None,
    user_email: Optional[str] = None
):
    """Met à jour la matrice de coûts RL."""
    service = get_settings_service()
    update = SettingsUpdateRequest(cost_matrix=matrix)
    result = await service.update_settings(
        update,
        user_id=user_id,
        user_email=user_email,
        ip_address=get_client_ip(request)
    )
    return result.cost_matrix


# =============================================================================
# MODEL SETTINGS
# =============================================================================

@router.get("/models", response_model=ModelSettings)
async def get_model_settings():
    """Récupère la configuration des modèles IA."""
    service = get_settings_service()
    return await service.get_model_settings()


@router.put("/models", response_model=ModelSettings)
async def update_model_settings(
    models: ModelSettings,
    request: Request,
    user_id: Optional[str] = None,
    user_email: Optional[str] = None
):
    """Met à jour la configuration des modèles IA."""
    service = get_settings_service()
    update = SettingsUpdateRequest(models=models)
    result = await service.update_settings(
        update,
        user_id=user_id,
        user_email=user_email,
        ip_address=get_client_ip(request)
    )
    return result.models


# =============================================================================
# FRAUD PATTERNS
# =============================================================================

@router.get("/fraud-patterns", response_model=FraudPatternsConfig)
async def get_fraud_patterns():
    """Récupère la configuration des patterns de fraude."""
    service = get_settings_service()
    return await service.get_fraud_patterns()


@router.put("/fraud-patterns", response_model=FraudPatternsConfig)
async def update_fraud_patterns(
    patterns: FraudPatternsConfig,
    request: Request,
    user_id: Optional[str] = None,
    user_email: Optional[str] = None
):
    """Met à jour la configuration des patterns de fraude."""
    service = get_settings_service()
    update = SettingsUpdateRequest(fraud_patterns=patterns)
    result = await service.update_settings(
        update,
        user_id=user_id,
        user_email=user_email,
        ip_address=get_client_ip(request)
    )
    return result.fraud_patterns


@router.patch("/fraud-patterns/{pattern_id}", response_model=FraudPattern)
async def update_single_fraud_pattern(
    pattern_id: str,
    pattern_update: dict,
    request: Request,
    user_id: Optional[str] = None,
    user_email: Optional[str] = None
):
    """Met à jour un pattern de fraude spécifique."""
    service = get_settings_service()
    try:
        return await service.update_fraud_pattern(
            pattern_id,
            pattern_update,
            user_id=user_id,
            user_email=user_email,
            ip_address=get_client_ip(request)
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# =============================================================================
# AGENTS CONFIG
# =============================================================================

@router.get("/agents", response_model=AgentsConfig)
async def get_agents_config():
    """Récupère la configuration des agents et de l'orchestration."""
    service = get_settings_service()
    return await service.get_agents_config()


@router.put("/agents", response_model=AgentsConfig)
async def update_agents_config(
    agents: AgentsConfig,
    request: Request,
    user_id: Optional[str] = None,
    user_email: Optional[str] = None
):
    """Met à jour la configuration des agents."""
    service = get_settings_service()
    update = SettingsUpdateRequest(agents=agents)
    result = await service.update_settings(
        update,
        user_id=user_id,
        user_email=user_email,
        ip_address=get_client_ip(request)
    )
    return result.agents


# =============================================================================
# FEATURES CONFIG
# =============================================================================

@router.get("/features", response_model=FeaturesConfig)
async def get_features_config():
    """Récupère la configuration des features ML."""
    service = get_settings_service()
    return await service.get_features_config()


@router.put("/features", response_model=FeaturesConfig)
async def update_features_config(
    features: FeaturesConfig,
    request: Request,
    user_id: Optional[str] = None,
    user_email: Optional[str] = None
):
    """Met à jour la configuration des features ML."""
    service = get_settings_service()
    update = SettingsUpdateRequest(features=features)
    result = await service.update_settings(
        update,
        user_id=user_id,
        user_email=user_email,
        ip_address=get_client_ip(request)
    )
    return result.features


# =============================================================================
# ALERT RULES
# =============================================================================

@router.get("/alert-rules", response_model=AlertRulesConfig)
async def get_alert_rules():
    """Récupère les règles d'alertes et SLA."""
    service = get_settings_service()
    return await service.get_alert_rules()


@router.put("/alert-rules", response_model=AlertRulesConfig)
async def update_alert_rules(
    rules: AlertRulesConfig,
    request: Request,
    user_id: Optional[str] = None,
    user_email: Optional[str] = None
):
    """Met à jour les règles d'alertes."""
    service = get_settings_service()
    update = SettingsUpdateRequest(alert_rules=rules)
    result = await service.update_settings(
        update,
        user_id=user_id,
        user_email=user_email,
        ip_address=get_client_ip(request)
    )
    return result.alert_rules


# =============================================================================
# INTEGRATIONS
# =============================================================================

@router.get("/integrations", response_model=IntegrationsConfig)
async def get_integrations():
    """Récupère la configuration des intégrations externes."""
    service = get_settings_service()
    return await service.get_integrations()


@router.put("/integrations", response_model=IntegrationsConfig)
async def update_integrations(
    integrations: IntegrationsConfig,
    request: Request,
    user_id: Optional[str] = None,
    user_email: Optional[str] = None
):
    """Met à jour la configuration des intégrations."""
    service = get_settings_service()
    update = SettingsUpdateRequest(integrations=integrations)
    result = await service.update_settings(
        update,
        user_id=user_id,
        user_email=user_email,
        ip_address=get_client_ip(request)
    )
    return result.integrations


@router.post("/integrations/{service_name}/test", response_model=ConnectionTestResult)
async def test_integration_connection(service_name: str):
    """Teste la connexion à un service externe."""
    service = get_settings_service()
    return await service.test_connection(service_name)


# =============================================================================
# RETENTION / RGPD
# =============================================================================

@router.get("/retention", response_model=RetentionConfig)
async def get_retention_config():
    """Récupère les politiques de rétention RGPD."""
    service = get_settings_service()
    return await service.get_retention_config()


@router.put("/retention", response_model=RetentionConfig)
async def update_retention_config(
    retention: RetentionConfig,
    request: Request,
    user_id: Optional[str] = None,
    user_email: Optional[str] = None
):
    """Met à jour les politiques de rétention."""
    service = get_settings_service()
    update = SettingsUpdateRequest(retention=retention)
    result = await service.update_settings(
        update,
        user_id=user_id,
        user_email=user_email,
        ip_address=get_client_ip(request)
    )
    return result.retention


# =============================================================================
# SYSTEM SETTINGS
# =============================================================================

@router.get("/system", response_model=SystemSettings)
async def get_system_settings():
    """Récupère les paramètres système."""
    service = get_settings_service()
    return await service.get_system_settings()


@router.put("/system", response_model=SystemSettings)
async def update_system_settings(
    system: SystemSettings,
    request: Request,
    user_id: Optional[str] = None,
    user_email: Optional[str] = None
):
    """Met à jour les paramètres système."""
    service = get_settings_service()
    update = SettingsUpdateRequest(system=system)
    result = await service.update_settings(
        update,
        user_id=user_id,
        user_email=user_email,
        ip_address=get_client_ip(request)
    )
    return result.system


# =============================================================================
# IMPORT / EXPORT
# =============================================================================

@router.get("/export")
async def export_settings():
    """
    Exporte la configuration complète en JSON.

    Retourne un fichier JSON téléchargeable avec un checksum.
    """
    service = get_settings_service()
    content, checksum = await service.export_settings()

    filename = f"fraudshield_settings_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"

    return StreamingResponse(
        io.BytesIO(content),
        media_type="application/json",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "X-Settings-Checksum": checksum
        }
    )


@router.post("/import", response_model=ImportExportResult)
async def import_settings(
    file: UploadFile = File(...),
    request: Request = None,
    user_id: Optional[str] = None,
    user_email: Optional[str] = None
):
    """
    Importe une configuration depuis un fichier JSON.

    Le fichier est validé avant l'import.
    """
    if not file.filename.endswith('.json'):
        raise HTTPException(status_code=400, detail="Le fichier doit être au format JSON")

    content = await file.read()
    if len(content) > 1024 * 1024:  # 1MB limit
        raise HTTPException(status_code=400, detail="Le fichier est trop volumineux (max 1MB)")

    service = get_settings_service()
    return await service.import_settings(
        content,
        user_id=user_id,
        user_email=user_email,
        ip_address=get_client_ip(request) if request else None
    )


# =============================================================================
# RESET
# =============================================================================

@router.post("/reset", response_model=AllSettings)
async def reset_to_defaults(
    request: Request,
    user_id: Optional[str] = None,
    user_email: Optional[str] = None,
    confirm: bool = False
):
    """
    Réinitialise tous les paramètres aux valeurs par défaut.

    ⚠️ Cette action est irréversible.
    Le paramètre `confirm=true` est requis.
    """
    if not confirm:
        raise HTTPException(
            status_code=400,
            detail="Confirmation requise. Ajoutez ?confirm=true pour confirmer la réinitialisation."
        )

    service = get_settings_service()
    return await service.reset_to_defaults(
        user_id=user_id,
        user_email=user_email,
        ip_address=get_client_ip(request)
    )


# =============================================================================
# AUDIT LOG
# =============================================================================

@router.get("/audit-log", response_model=List[SettingsAuditLog])
async def get_audit_log(limit: int = 100, offset: int = 0):
    """
    Récupère l'historique des modifications.

    Paramètres:
    - limit: Nombre maximum d'entrées (défaut: 100, max: 1000)
    - offset: Décalage pour pagination
    """
    if limit > 1000:
        limit = 1000

    service = get_settings_service()
    return await service.get_audit_log(limit=limit, offset=offset)


# =============================================================================
# CACHE MANAGEMENT
# =============================================================================

@router.post("/reload")
async def reload_settings():
    """
    Recharge les paramètres depuis le fichier.

    Utile après une modification manuelle du fichier de configuration.
    """
    service = get_settings_service()
    settings = await service.reload_settings()
    return {
        "status": "success",
        "message": "Settings reloaded successfully",
        "version": settings.version,
        "updated_at": settings.updated_at
    }


@router.post("/invalidate-cache")
async def invalidate_cache():
    """Invalide le cache des paramètres."""
    service = get_settings_service()
    await service.invalidate_cache()
    return {"status": "success", "message": "Cache invalidated"}
