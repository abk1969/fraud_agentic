"""
FraudShield AI - Settings Service
Business logic for system configuration management with JSON file persistence
"""

import json
import hashlib
import aiofiles
import asyncio
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import uuid4
import httpx

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


class SettingsService:
    """Service de gestion des paramètres système."""

    def __init__(self, settings_file: str = "data/settings.json", audit_file: str = "data/settings_audit.json"):
        self.settings_file = Path(settings_file)
        self.audit_file = Path(audit_file)
        self._settings_cache: Optional[AllSettings] = None
        self._lock = asyncio.Lock()

        # Ensure data directory exists
        self.settings_file.parent.mkdir(parents=True, exist_ok=True)

    # =========================================================================
    # CORE CRUD OPERATIONS
    # =========================================================================

    async def _get_settings_unlocked(self) -> AllSettings:
        """Récupère les paramètres (appeler avec le lock déjà acquis)."""
        if self._settings_cache is not None:
            return self._settings_cache

        if self.settings_file.exists():
            try:
                async with aiofiles.open(self.settings_file, 'r', encoding='utf-8') as f:
                    content = await f.read()
                    data = json.loads(content)
                    self._settings_cache = AllSettings(**data)
            except Exception as e:
                print(f"Error loading settings: {e}")
                self._settings_cache = self._get_default_settings()
        else:
            self._settings_cache = self._get_default_settings()
            await self._save_settings(self._settings_cache)

        return self._settings_cache

    async def get_all_settings(self) -> AllSettings:
        """Récupère tous les paramètres."""
        async with self._lock:
            return await self._get_settings_unlocked()

    async def update_settings(
        self,
        update: SettingsUpdateRequest,
        user_id: Optional[str] = None,
        user_email: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> AllSettings:
        """Met à jour les paramètres."""
        async with self._lock:
            current = await self._get_settings_unlocked()

            # Track changes for audit
            changes = []

            if update.risk_thresholds is not None:
                changes.append(("risk_thresholds", current.risk_thresholds.model_dump(), update.risk_thresholds.model_dump()))
                current.risk_thresholds = update.risk_thresholds

            if update.cost_matrix is not None:
                changes.append(("cost_matrix", current.cost_matrix.model_dump(), update.cost_matrix.model_dump()))
                current.cost_matrix = update.cost_matrix

            if update.models is not None:
                changes.append(("models", current.models.model_dump(), update.models.model_dump()))
                current.models = update.models

            if update.fraud_patterns is not None:
                changes.append(("fraud_patterns", current.fraud_patterns.model_dump(), update.fraud_patterns.model_dump()))
                current.fraud_patterns = update.fraud_patterns

            if update.agents is not None:
                changes.append(("agents", current.agents.model_dump(), update.agents.model_dump()))
                current.agents = update.agents

            if update.features is not None:
                changes.append(("features", current.features.model_dump(), update.features.model_dump()))
                current.features = update.features

            if update.alert_rules is not None:
                changes.append(("alert_rules", current.alert_rules.model_dump(), update.alert_rules.model_dump()))
                current.alert_rules = update.alert_rules

            if update.integrations is not None:
                changes.append(("integrations", current.integrations.model_dump(), update.integrations.model_dump()))
                current.integrations = update.integrations

            if update.retention is not None:
                changes.append(("retention", current.retention.model_dump(), update.retention.model_dump()))
                current.retention = update.retention

            if update.system is not None:
                changes.append(("system", current.system.model_dump(), update.system.model_dump()))
                current.system = update.system

            # Update metadata
            current.updated_at = datetime.utcnow()
            current.updated_by = user_email or user_id

            # Save and audit
            await self._save_settings(current)

            for setting_type, old_value, new_value in changes:
                await self._log_audit(
                    setting_type=setting_type,
                    old_value=old_value,
                    new_value=new_value,
                    user_id=user_id,
                    user_email=user_email,
                    ip_address=ip_address,
                    action="update"
                )

            self._settings_cache = current
            return current

    async def _save_settings(self, settings: AllSettings) -> None:
        """Sauvegarde les paramètres dans le fichier JSON."""
        async with aiofiles.open(self.settings_file, 'w', encoding='utf-8') as f:
            await f.write(settings.model_dump_json(indent=2))

    # =========================================================================
    # SECTION-SPECIFIC GETTERS
    # =========================================================================

    async def get_risk_thresholds(self) -> RiskThresholds:
        """Récupère les seuils de risque."""
        settings = await self.get_all_settings()
        return settings.risk_thresholds

    async def get_cost_matrix(self) -> CostMatrix:
        """Récupère la matrice de coûts."""
        settings = await self.get_all_settings()
        return settings.cost_matrix

    async def get_model_settings(self) -> ModelSettings:
        """Récupère la configuration des modèles."""
        settings = await self.get_all_settings()
        return settings.models

    async def get_fraud_patterns(self) -> FraudPatternsConfig:
        """Récupère les patterns de fraude."""
        settings = await self.get_all_settings()
        return settings.fraud_patterns

    async def get_agents_config(self) -> AgentsConfig:
        """Récupère la configuration des agents."""
        settings = await self.get_all_settings()
        return settings.agents

    async def get_features_config(self) -> FeaturesConfig:
        """Récupère la configuration des features."""
        settings = await self.get_all_settings()
        return settings.features

    async def get_alert_rules(self) -> AlertRulesConfig:
        """Récupère les règles d'alertes."""
        settings = await self.get_all_settings()
        return settings.alert_rules

    async def get_integrations(self) -> IntegrationsConfig:
        """Récupère la configuration des intégrations."""
        settings = await self.get_all_settings()
        return settings.integrations

    async def get_retention_config(self) -> RetentionConfig:
        """Récupère la configuration de rétention."""
        settings = await self.get_all_settings()
        return settings.retention

    async def get_system_settings(self) -> SystemSettings:
        """Récupère les paramètres système."""
        settings = await self.get_all_settings()
        return settings.system

    # =========================================================================
    # SECTION-SPECIFIC UPDATERS
    # =========================================================================

    async def update_risk_thresholds(
        self,
        thresholds: RiskThresholds,
        user_id: Optional[str] = None,
        user_email: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> RiskThresholds:
        """Met à jour les seuils de risque."""
        update = SettingsUpdateRequest(risk_thresholds=thresholds)
        result = await self.update_settings(update, user_id, user_email, ip_address)
        return result.risk_thresholds

    async def update_cost_matrix(
        self,
        matrix: CostMatrix,
        user_id: Optional[str] = None,
        user_email: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> CostMatrix:
        """Met à jour la matrice de coûts."""
        update = SettingsUpdateRequest(cost_matrix=matrix)
        result = await self.update_settings(update, user_id, user_email, ip_address)
        return result.cost_matrix

    async def update_fraud_pattern(
        self,
        pattern_id: str,
        pattern_update: Dict[str, Any],
        user_id: Optional[str] = None,
        user_email: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> FraudPattern:
        """Met à jour un pattern de fraude spécifique."""
        settings = await self.get_all_settings()
        patterns = settings.fraud_patterns.patterns

        for i, p in enumerate(patterns):
            if p.id == pattern_id:
                updated_data = p.model_dump()
                updated_data.update(pattern_update)
                patterns[i] = FraudPattern(**updated_data)

                update = SettingsUpdateRequest(fraud_patterns=FraudPatternsConfig(patterns=patterns))
                await self.update_settings(update, user_id, user_email, ip_address)
                return patterns[i]

        raise ValueError(f"Pattern not found: {pattern_id}")

    # =========================================================================
    # VALIDATION
    # =========================================================================

    async def validate_settings(self, settings: SettingsUpdateRequest) -> ValidationResult:
        """Valide les paramètres avant sauvegarde."""
        errors = []
        warnings = []

        # Validate risk thresholds
        if settings.risk_thresholds:
            t = settings.risk_thresholds
            if t.critical_threshold <= t.high_threshold:
                errors.append("Le seuil critique doit être supérieur au seuil élevé")
            if t.high_threshold <= t.medium_threshold:
                errors.append("Le seuil élevé doit être supérieur au seuil moyen")
            if t.medium_threshold <= t.auto_approve_threshold:
                errors.append("Le seuil moyen doit être supérieur au seuil d'auto-approbation")

        # Validate cost matrix
        if settings.cost_matrix:
            m = settings.cost_matrix
            if m.false_negative_penalty >= 0:
                errors.append("La pénalité FN doit être négative")
            if m.false_positive_penalty >= 0:
                errors.append("La pénalité FP doit être négative")
            if abs(m.false_negative_penalty) < abs(m.false_positive_penalty):
                warnings.append("Attention: La pénalité FN est inférieure à FP - cela réduira le recall")

        # Validate agent weights
        if settings.agents:
            enabled_weights = [a.weight for a in settings.agents.agent_weights if a.enabled]
            total = sum(enabled_weights)
            if abs(total - 1.0) > 0.01:
                errors.append(f"La somme des poids des agents actifs doit être 1.0 (actuellement {total:.2f})")

        # Validate RL parameters
        if settings.models and settings.models.rl_parameters:
            rl = settings.models.rl_parameters
            if rl.learning_rate > 0.01:
                warnings.append("Learning rate élevé (>0.01) peut causer une instabilité")
            if rl.gamma < 0.9:
                warnings.append("Gamma faible (<0.9) réduit l'importance des récompenses futures")

        return ValidationResult(
            valid=len(errors) == 0,
            errors=errors,
            warnings=warnings
        )

    # =========================================================================
    # CONNECTION TESTING
    # =========================================================================

    async def test_connection(self, service_name: str) -> ConnectionTestResult:
        """Teste la connexion à un service externe."""
        settings = await self.get_all_settings()
        integration = None

        # Find the integration
        for api in settings.integrations.apis:
            if api.name == service_name:
                integration = api
                break
        for db in settings.integrations.databases:
            if db.name == service_name:
                integration = db
                break
        for mcp in settings.integrations.mcp_servers:
            if mcp.name == service_name:
                integration = mcp
                break

        if not integration:
            return ConnectionTestResult(
                service_name=service_name,
                success=False,
                error_message=f"Service not found: {service_name}",
                tested_at=datetime.utcnow()
            )

        if not integration.url:
            return ConnectionTestResult(
                service_name=service_name,
                success=False,
                error_message="URL not configured",
                tested_at=datetime.utcnow()
            )

        # Test HTTP connection
        try:
            start = datetime.utcnow()
            async with httpx.AsyncClient(timeout=10.0) as client:
                # For HTTP services, try a simple GET
                if integration.url.startswith(('http://', 'https://')):
                    response = await client.get(integration.url)
                    latency = int((datetime.utcnow() - start).total_seconds() * 1000)
                    return ConnectionTestResult(
                        service_name=service_name,
                        success=response.status_code < 500,
                        latency_ms=latency,
                        tested_at=datetime.utcnow()
                    )
                else:
                    # For non-HTTP (db connections), just report as not testable via HTTP
                    return ConnectionTestResult(
                        service_name=service_name,
                        success=True,
                        error_message="Database connection testing not implemented",
                        tested_at=datetime.utcnow()
                    )
        except Exception as e:
            return ConnectionTestResult(
                service_name=service_name,
                success=False,
                error_message=str(e),
                tested_at=datetime.utcnow()
            )

    # =========================================================================
    # IMPORT / EXPORT
    # =========================================================================

    async def export_settings(self) -> tuple[bytes, str]:
        """Exporte les paramètres en JSON avec checksum."""
        settings = await self.get_all_settings()
        content = settings.model_dump_json(indent=2)
        checksum = hashlib.sha256(content.encode()).hexdigest()[:16]
        return content.encode('utf-8'), checksum

    async def import_settings(
        self,
        content: bytes,
        user_id: Optional[str] = None,
        user_email: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> ImportExportResult:
        """Importe les paramètres depuis un JSON."""
        try:
            data = json.loads(content.decode('utf-8'))
            new_settings = AllSettings(**data)

            # Validate before import
            validation = await self.validate_settings(SettingsUpdateRequest(
                risk_thresholds=new_settings.risk_thresholds,
                cost_matrix=new_settings.cost_matrix,
                models=new_settings.models,
                agents=new_settings.agents,
            ))

            if not validation.valid:
                return ImportExportResult(
                    success=False,
                    message=f"Validation failed: {', '.join(validation.errors)}",
                    timestamp=datetime.utcnow()
                )

            # Log audit for import
            await self._log_audit(
                setting_type="full_import",
                old_value=None,
                new_value="imported",
                user_id=user_id,
                user_email=user_email,
                ip_address=ip_address,
                action="import"
            )

            # Save
            new_settings.updated_at = datetime.utcnow()
            new_settings.updated_by = user_email or user_id
            async with self._lock:
                await self._save_settings(new_settings)
                self._settings_cache = new_settings

            checksum = hashlib.sha256(content).hexdigest()[:16]
            return ImportExportResult(
                success=True,
                message="Import successful",
                settings_count=10,  # Number of setting sections
                checksum=checksum,
                timestamp=datetime.utcnow()
            )
        except json.JSONDecodeError as e:
            return ImportExportResult(
                success=False,
                message=f"Invalid JSON: {e}",
                timestamp=datetime.utcnow()
            )
        except Exception as e:
            return ImportExportResult(
                success=False,
                message=f"Import error: {e}",
                timestamp=datetime.utcnow()
            )

    # =========================================================================
    # RESET
    # =========================================================================

    async def reset_to_defaults(
        self,
        user_id: Optional[str] = None,
        user_email: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> AllSettings:
        """Réinitialise tous les paramètres aux valeurs par défaut."""
        await self._log_audit(
            setting_type="full_reset",
            old_value="current",
            new_value="defaults",
            user_id=user_id,
            user_email=user_email,
            ip_address=ip_address,
            action="reset"
        )

        async with self._lock:
            self._settings_cache = self._get_default_settings()
            self._settings_cache.updated_at = datetime.utcnow()
            self._settings_cache.updated_by = user_email or user_id
            await self._save_settings(self._settings_cache)
            return self._settings_cache

    def _get_default_settings(self) -> AllSettings:
        """Retourne les paramètres par défaut."""
        settings = AllSettings()

        # Initialize default fraud patterns
        settings.fraud_patterns.patterns = [
            FraudPattern(
                id="PATTERN_001",
                name="Cascade de remboursements",
                description="Multiples demandes de petits montants sur une courte période",
                indicators=["claim_frequency_30d > 10", "avg_claim_amount < 100"],
                risk_weight=0.7,
                enabled=True
            ),
            FraudPattern(
                id="PATTERN_002",
                name="Nouveau prestataire à risque",
                description="Demande importante vers un nouveau prestataire non vérifié",
                indicators=["provider_tenure < 30", "amount > 1000", "provider_risk_score > 0.5"],
                risk_weight=0.8,
                enabled=True
            ),
            FraudPattern(
                id="PATTERN_003",
                name="Pic inhabituel de dépenses",
                description="Montant significativement supérieur à l'historique",
                indicators=["amount > avg_claim_amount * 5"],
                risk_weight=0.6,
                enabled=True
            ),
            FraudPattern(
                id="PATTERN_004",
                name="Réseau suspect",
                description="Bénéficiaire lié à d'autres cas de fraude confirmés",
                indicators=["community_risk_score > 0.7", "shared_providers_count > 3"],
                risk_weight=0.9,
                enabled=True
            ),
            FraudPattern(
                id="PATTERN_005",
                name="Documents suspects",
                description="Anomalies détectées dans les documents soumis",
                indicators=["document_authenticity_score < 0.7", "metadata_anomaly_score > 0.5"],
                risk_weight=0.85,
                enabled=True
            ),
        ]

        return settings

    # =========================================================================
    # AUDIT LOG
    # =========================================================================

    async def _log_audit(
        self,
        setting_type: str,
        old_value: Any,
        new_value: Any,
        user_id: Optional[str] = None,
        user_email: Optional[str] = None,
        ip_address: Optional[str] = None,
        action: str = "update"
    ) -> None:
        """Enregistre une entrée d'audit."""
        entry = SettingsAuditLog(
            id=str(uuid4()),
            timestamp=datetime.utcnow(),
            user_id=user_id,
            user_email=user_email,
            setting_type=setting_type,
            old_value=old_value,
            new_value=new_value,
            ip_address=ip_address,
            action=action
        )

        # Load existing audit log
        audit_log = []
        if self.audit_file.exists():
            try:
                async with aiofiles.open(self.audit_file, 'r', encoding='utf-8') as f:
                    content = await f.read()
                    audit_log = json.loads(content)
            except Exception:
                audit_log = []

        # Add new entry
        audit_log.append(entry.model_dump(mode='json'))

        # Keep only last 1000 entries
        audit_log = audit_log[-1000:]

        # Save
        async with aiofiles.open(self.audit_file, 'w', encoding='utf-8') as f:
            await f.write(json.dumps(audit_log, indent=2, default=str))

    async def get_audit_log(self, limit: int = 100, offset: int = 0) -> List[SettingsAuditLog]:
        """Récupère l'historique des modifications."""
        if not self.audit_file.exists():
            return []

        try:
            async with aiofiles.open(self.audit_file, 'r', encoding='utf-8') as f:
                content = await f.read()
                data = json.loads(content)

            # Reverse for most recent first
            data = list(reversed(data))

            # Apply pagination
            paginated = data[offset:offset + limit]

            return [SettingsAuditLog(**entry) for entry in paginated]
        except Exception:
            return []

    # =========================================================================
    # CACHE MANAGEMENT
    # =========================================================================

    async def invalidate_cache(self) -> None:
        """Invalide le cache des paramètres."""
        async with self._lock:
            self._settings_cache = None

    async def reload_settings(self) -> AllSettings:
        """Recharge les paramètres depuis le fichier."""
        await self.invalidate_cache()
        return await self.get_all_settings()


# Singleton instance
_settings_service: Optional[SettingsService] = None


def get_settings_service() -> SettingsService:
    """Retourne l'instance singleton du service."""
    global _settings_service
    if _settings_service is None:
        _settings_service = SettingsService()
    return _settings_service
