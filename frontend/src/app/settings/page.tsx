'use client';

import { useState, Suspense, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import {
  Cog6ToothIcon,
  ArrowPathIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ShieldExclamationIcon,
  CurrencyEuroIcon,
  CpuChipIcon,
  FingerPrintIcon,
  UserGroupIcon,
  ChartBarIcon,
  BellAlertIcon,
  LinkIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  SignalIcon,
} from '@heroicons/react/24/outline';
import { useQueryClient } from '@tanstack/react-query';
import { clsx } from 'clsx';
import {
  useAllSettings,
  useUpdateSettings,
  useExportSettings,
  useImportSettings,
  useResetSettings,
  useTestIntegrationConnection,
  useSettingsAuditLog,
} from '@/hooks/useApi';
import type {
  AllSettings,
  RiskThresholds,
  CostMatrix,
  ModelSettings,
  FraudPatternsConfig,
  AgentsConfig,
  FeaturesConfig,
  AlertRulesConfig,
  IntegrationsConfig,
  RetentionConfig,
  SystemSettings,
  FraudPattern,
  SettingsAuditLog,
} from '@/lib/api';

// Tab definitions
const tabs = [
  { id: 'risk', name: 'Seuils de Risque', icon: ShieldExclamationIcon },
  { id: 'cost', name: 'Matrice de Coûts', icon: CurrencyEuroIcon },
  { id: 'models', name: 'Modèles IA', icon: CpuChipIcon },
  { id: 'patterns', name: 'Patterns Fraude', icon: FingerPrintIcon },
  { id: 'agents', name: 'Agents', icon: UserGroupIcon },
  { id: 'features', name: 'Features ML', icon: ChartBarIcon },
  { id: 'alerts', name: 'Alertes & SLA', icon: BellAlertIcon },
  { id: 'integrations', name: 'Intégrations', icon: LinkIcon },
  { id: 'retention', name: 'RGPD', icon: ShieldCheckIcon },
  { id: 'system', name: 'Système', icon: WrenchScrewdriverIcon },
];

// Toast notification component
function Toast({
  message,
  type,
  onClose
}: {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-50 border-green-500 text-green-800',
    error: 'bg-red-50 border-red-500 text-red-800',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
    info: 'bg-blue-50 border-blue-500 text-blue-800',
  };

  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: Cog6ToothIcon,
  };

  const Icon = icons[type];

  return (
    <div className={clsx('fixed top-4 right-4 z-50 p-4 rounded-lg border-l-4 shadow-lg max-w-md flex items-start space-x-3', colors[type])}>
      <Icon className="h-5 w-5 flex-shrink-0" />
      <p className="text-sm flex-1">{message}</p>
      <button onClick={onClose} className="flex-shrink-0">
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

// Slider component
function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  unit = '',
  description,
  color = 'primary',
  disabled = false,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  description?: string;
  color?: 'primary' | 'red' | 'orange' | 'yellow' | 'green';
  disabled?: boolean;
}) {
  const colorClasses = {
    primary: 'accent-primary-600',
    red: 'accent-red-600',
    orange: 'accent-orange-600',
    yellow: 'accent-yellow-600',
    green: 'accent-green-600',
  };

  return (
    <div className={clsx('space-y-2', disabled && 'opacity-50')}>
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-mono text-gray-900">
          {value.toFixed(step < 1 ? Math.abs(Math.log10(step)) : 0)}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className={clsx('w-full h-2 bg-gray-200 rounded-lg cursor-pointer', colorClasses[color], disabled && 'cursor-not-allowed')}
      />
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  );
}

// Toggle component
function Toggle({
  label,
  checked,
  onChange,
  description,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <div className={clsx('flex items-center justify-between py-2', disabled && 'opacity-50')}>
      <div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={clsx(
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          checked ? 'bg-primary-600' : 'bg-gray-200',
          disabled && 'cursor-not-allowed'
        )}
      >
        <span
          className={clsx(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
}

// Card component
function SettingsCard({ title, children, className, actions }: {
  title: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className={clsx('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {actions && <div className="flex items-center space-x-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

// Risk Thresholds Tab
function RiskThresholdsTab({ settings, onChange }: { settings: RiskThresholds; onChange: (s: RiskThresholds) => void }) {
  return (
    <div className="space-y-6">
      <SettingsCard title="Classification des Risques">
        <div className="space-y-6">
          <Slider
            label="Seuil CRITIQUE (Blocage immédiat)"
            value={settings.critical_threshold}
            onChange={(v) => onChange({ ...settings, critical_threshold: v })}
            color="red"
            description="Transactions bloquées automatiquement au-dessus de ce seuil"
          />
          <Slider
            label="Seuil ÉLEVÉ (Revue prioritaire)"
            value={settings.high_threshold}
            onChange={(v) => onChange({ ...settings, high_threshold: v })}
            color="orange"
            description="Signalées pour revue urgente (SLA 24h)"
          />
          <Slider
            label="Seuil MOYEN (Revue standard)"
            value={settings.medium_threshold}
            onChange={(v) => onChange({ ...settings, medium_threshold: v })}
            color="yellow"
            description="Signalées pour revue manuelle (SLA 72h)"
          />
          <Slider
            label="Seuil Auto-approbation"
            value={settings.auto_approve_threshold}
            onChange={(v) => onChange({ ...settings, auto_approve_threshold: v })}
            color="green"
            description="Transactions approuvées automatiquement en dessous de ce seuil"
          />
        </div>
      </SettingsCard>

      <SettingsCard title="Prévisualisation des Seuils">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span className="text-sm">CRITIQUE: score &ge; {settings.critical_threshold.toFixed(2)} &rarr; Blocage, SLA 2h</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded bg-orange-500" />
            <span className="text-sm">ÉLEVÉ: score &ge; {settings.high_threshold.toFixed(2)} &rarr; Flag review, SLA 24h</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded bg-yellow-500" />
            <span className="text-sm">MOYEN: score &ge; {settings.medium_threshold.toFixed(2)} &rarr; Review manuel, SLA 72h</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span className="text-sm">FAIBLE: score &lt; {settings.auto_approve_threshold.toFixed(2)} &rarr; Auto-approve</span>
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-500">
          Impact: Dashboard, Transactions, Alertes
        </p>
      </SettingsCard>
    </div>
  );
}

// Cost Matrix Tab
function CostMatrixTab({ settings, onChange }: { settings: CostMatrix; onChange: (s: CostMatrix) => void }) {
  const costRatio = Math.abs(settings.false_negative_penalty / settings.false_positive_penalty);
  const optimalThreshold = Math.abs(settings.false_positive_penalty) /
    (Math.abs(settings.false_positive_penalty) + Math.abs(settings.false_negative_penalty));

  return (
    <div className="space-y-6">
      <SettingsCard title="Matrice de Récompenses (Apprentissage par Renforcement)">
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4"></th>
                <th className="text-left py-2 px-4">Réalité: FRAUDE</th>
                <th className="text-left py-2 px-4">Réalité: LÉGITIME</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 px-4 font-medium">Action: FLAG</td>
                <td className="py-2 px-4 text-green-600">TP = +{settings.true_positive_reward}</td>
                <td className="py-2 px-4 text-red-600">FP = {settings.false_positive_penalty}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-medium">Action: PASS</td>
                <td className="py-2 px-4 text-red-600">FN = {settings.false_negative_penalty}</td>
                <td className="py-2 px-4 text-green-600">TN = +{settings.true_negative_reward}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          <Slider
            label="Vrai Positif (Fraude détectée)"
            value={settings.true_positive_reward}
            onChange={(v) => onChange({ ...settings, true_positive_reward: v })}
            min={0}
            max={50}
            step={1}
            color="green"
          />
          <Slider
            label="Vrai Négatif (Légitime passé)"
            value={settings.true_negative_reward}
            onChange={(v) => onChange({ ...settings, true_negative_reward: v })}
            min={0}
            max={10}
            step={0.5}
            color="green"
          />
          <Slider
            label="Faux Positif (Fausse alerte)"
            value={Math.abs(settings.false_positive_penalty)}
            onChange={(v) => onChange({ ...settings, false_positive_penalty: -v })}
            min={0}
            max={20}
            step={1}
            color="orange"
          />
          <Slider
            label="Faux Négatif (Fraude manquée)"
            value={Math.abs(settings.false_negative_penalty)}
            onChange={(v) => onChange({ ...settings, false_negative_penalty: -v })}
            min={0}
            max={100}
            step={5}
            color="red"
          />
        </div>
      </SettingsCard>

      <SettingsCard title="Métriques Dérivées">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Ratio de coût FN/FP:</span>
            <span className="font-mono font-bold">{costRatio.toFixed(1)}x</span>
          </div>
          <div className="flex justify-between">
            <span>Seuil optimal théorique:</span>
            <span className="font-mono">p(fraude) &gt; {optimalThreshold.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Priorité:</span>
            <span className="font-bold text-primary-600">RECALL (minimiser FN)</span>
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-500">
          Impact: Scoring RL, Décisions automatiques
        </p>
      </SettingsCard>
    </div>
  );
}

// Models Tab
function ModelsTab({ settings, onChange }: { settings: ModelSettings; onChange: (s: ModelSettings) => void }) {
  return (
    <div className="space-y-6">
      <SettingsCard title="Modèle Principal">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modèle LLM</label>
            <select
              value={settings.primary_model}
              onChange={(e) => onChange({ ...settings, primary_model: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="gemini-flash-latest">gemini-flash-latest</option>
              <option value="gemini-pro">gemini-pro</option>
              <option value="gemini-pro-vision">gemini-pro-vision</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modèle Embedding</label>
            <input
              type="text"
              value={settings.embedding_model}
              onChange={(e) => onChange({ ...settings, embedding_model: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Températures par Agent">
        <div className="space-y-4">
          <Slider
            label="Orchestrator"
            value={settings.temperatures.orchestrator}
            onChange={(v) => onChange({ ...settings, temperatures: { ...settings.temperatures, orchestrator: v } })}
            max={2}
            description="Bas pour routage consistant"
          />
          <Slider
            label="Analyzer"
            value={settings.temperatures.analyzer}
            onChange={(v) => onChange({ ...settings, temperatures: { ...settings.temperatures, analyzer: v } })}
            max={2}
            description="Précision d'analyse"
          />
          <Slider
            label="Explainer"
            value={settings.temperatures.explainer}
            onChange={(v) => onChange({ ...settings, temperatures: { ...settings.temperatures, explainer: v } })}
            max={2}
            description="Créativité des explications"
          />
          <Slider
            label="Detector"
            value={settings.temperatures.detector}
            onChange={(v) => onChange({ ...settings, temperatures: { ...settings.temperatures, detector: v } })}
            max={2}
            description="Scoring déterministe"
          />
        </div>
      </SettingsCard>

      <SettingsCard title="Paramètres RL">
        <div className="space-y-4">
          <Slider
            label="Learning Rate"
            value={settings.rl_parameters.learning_rate}
            onChange={(v) => onChange({ ...settings, rl_parameters: { ...settings.rl_parameters, learning_rate: v } })}
            min={0.000001}
            max={0.01}
            step={0.0001}
          />
          <Slider
            label="Gamma (Discount)"
            value={settings.rl_parameters.gamma}
            onChange={(v) => onChange({ ...settings, rl_parameters: { ...settings.rl_parameters, gamma: v } })}
            min={0.9}
            max={1}
            step={0.01}
          />
          <Slider
            label="Entropy Coefficient"
            value={settings.rl_parameters.entropy_coefficient}
            onChange={(v) => onChange({ ...settings, rl_parameters: { ...settings.rl_parameters, entropy_coefficient: v } })}
            min={0}
            max={0.1}
            step={0.001}
          />
          <div className="flex justify-between text-sm">
            <span>Embedding Dimension:</span>
            <span className="font-mono">{settings.rl_parameters.embedding_dimension}</span>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}

// Patterns Tab
function PatternsTab({
  settings,
  onChange,
  onAddPattern,
}: {
  settings: FraudPatternsConfig;
  onChange: (s: FraudPatternsConfig) => void;
  onAddPattern: () => void;
}) {
  const updatePattern = (index: number, updates: Partial<FraudPattern>) => {
    const newPatterns = [...settings.patterns];
    newPatterns[index] = { ...newPatterns[index], ...updates };
    onChange({ patterns: newPatterns });
  };

  const deletePattern = (index: number) => {
    const newPatterns = settings.patterns.filter((_, i) => i !== index);
    onChange({ patterns: newPatterns });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={onAddPattern}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Ajouter un pattern</span>
        </button>
      </div>

      {settings.patterns.map((pattern, index) => (
        <SettingsCard
          key={pattern.id}
          title=""
          actions={
            <button
              onClick={() => deletePattern(index)}
              className="p-1 text-red-600 hover:bg-red-50 rounded"
              title="Supprimer ce pattern"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          }
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Toggle
                label=""
                checked={pattern.enabled}
                onChange={(v) => updatePattern(index, { enabled: v })}
              />
              <div>
                <h4 className="font-medium text-gray-900">{pattern.id} - {pattern.name}</h4>
                <p className="text-sm text-gray-500">{pattern.description}</p>
              </div>
            </div>
          </div>
          <Slider
            label="Poids de risque"
            value={pattern.risk_weight}
            onChange={(v) => updatePattern(index, { risk_weight: v })}
            color={pattern.enabled ? 'primary' : 'primary'}
          />
          <div className="mt-2">
            <p className="text-xs text-gray-500">Indicateurs: {pattern.indicators.join(', ')}</p>
          </div>
        </SettingsCard>
      ))}
      <p className="text-xs text-gray-500">
        Impact: PatternDetectorAgent, Scoring
      </p>
    </div>
  );
}

// Agents Tab
function AgentsTab({ settings, onChange }: { settings: AgentsConfig; onChange: (s: AgentsConfig) => void }) {
  const totalWeight = settings.agent_weights.filter(a => a.enabled).reduce((sum, a) => sum + a.weight, 0);

  const updateAgentWeight = (index: number, updates: Partial<typeof settings.agent_weights[0]>) => {
    const newWeights = [...settings.agent_weights];
    newWeights[index] = { ...newWeights[index], ...updates };
    onChange({ ...settings, agent_weights: newWeights });
  };

  return (
    <div className="space-y-6">
      <SettingsCard title="Workflow par Défaut">
        <div className="flex flex-wrap gap-4">
          {['quick', 'standard', 'investigation', 'batch'].map((wf) => (
            <label key={wf} className="flex items-center space-x-2">
              <input
                type="radio"
                name="workflow"
                value={wf}
                checked={settings.default_workflow === wf}
                onChange={() => onChange({ ...settings, default_workflow: wf })}
                className="text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm uppercase">{wf}</span>
            </label>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="Poids d'Agrégation (Phase DECIDE)">
        <div className="space-y-4">
          {settings.agent_weights.map((agent, index) => (
            <div key={agent.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <Toggle
                  label={agent.display_name}
                  checked={agent.enabled}
                  onChange={(v) => updateAgentWeight(index, { enabled: v })}
                  description={agent.description}
                />
              </div>
              {agent.enabled && (
                <Slider
                  label=""
                  value={agent.weight}
                  onChange={(v) => updateAgentWeight(index, { weight: v })}
                />
              )}
            </div>
          ))}
          <div className={clsx(
            'flex justify-between pt-4 border-t',
            Math.abs(totalWeight - 1) < 0.01 ? 'text-green-600' : 'text-red-600'
          )}>
            <span>Total:</span>
            <span className="font-mono font-bold">{totalWeight.toFixed(2)}</span>
          </div>
          {Math.abs(totalWeight - 1) >= 0.01 && (
            <p className="text-xs text-red-500">La somme des poids doit égaler 1.00</p>
          )}
        </div>
      </SettingsCard>

      <SettingsCard title="Options d'Exécution">
        <div className="space-y-2">
          <Toggle
            label="Exécution parallèle des agents"
            checked={settings.parallel_execution}
            onChange={(v) => onChange({ ...settings, parallel_execution: v })}
          />
          <Toggle
            label="LLM Enabled (Embeddings sémantiques)"
            checked={settings.llm_enabled}
            onChange={(v) => onChange({ ...settings, llm_enabled: v })}
          />
          <Toggle
            label="RL Enabled (Policy network)"
            checked={settings.rl_enabled}
            onChange={(v) => onChange({ ...settings, rl_enabled: v })}
          />
          <Toggle
            label="XAI Enabled (Explications RGPD)"
            checked={settings.xai_enabled}
            onChange={(v) => onChange({ ...settings, xai_enabled: v })}
          />
          <Toggle
            label="Batch Processing Enabled"
            checked={settings.batch_processing_enabled}
            onChange={(v) => onChange({ ...settings, batch_processing_enabled: v })}
          />
        </div>
      </SettingsCard>
    </div>
  );
}

// Features Tab
function FeaturesTab({ settings, onChange }: { settings: FeaturesConfig; onChange: (s: FeaturesConfig) => void }) {
  const renderFeatureGroup = (
    title: string,
    features: typeof settings.structured_features,
    key: 'structured_features' | 'graph_features' | 'document_features'
  ) => (
    <SettingsCard title={title}>
      <div className="space-y-3">
        {features.map((feature, index) => (
          <div key={feature.name} className="flex items-center justify-between">
            <Toggle
              label={feature.display_name}
              checked={feature.enabled}
              onChange={(enabled) => {
                const newFeatures = [...features];
                newFeatures[index] = { ...newFeatures[index], enabled };
                onChange({ ...settings, [key]: newFeatures });
              }}
            />
            {feature.enabled && (
              <input
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={feature.importance_weight}
                onChange={(e) => {
                  const newFeatures = [...features];
                  newFeatures[index] = { ...newFeatures[index], importance_weight: parseFloat(e.target.value) || 0 };
                  onChange({ ...settings, [key]: newFeatures });
                }}
                className="w-20 text-sm rounded-md border-gray-300"
              />
            )}
          </div>
        ))}
      </div>
    </SettingsCard>
  );

  return (
    <div className="space-y-6">
      {renderFeatureGroup('Features Structurées', settings.structured_features, 'structured_features')}
      {renderFeatureGroup('Features Graphe', settings.graph_features, 'graph_features')}
      {renderFeatureGroup('Features Document', settings.document_features, 'document_features')}
    </div>
  );
}

// Alerts Tab
function AlertsTab({ settings, onChange }: { settings: AlertRulesConfig; onChange: (s: AlertRulesConfig) => void }) {
  const updateRule = (index: number, updates: Partial<typeof settings.rules[0]>) => {
    const newRules = [...settings.rules];
    newRules[index] = { ...newRules[index], ...updates };
    onChange({ ...settings, rules: newRules });
  };

  const riskColors: Record<string, string> = {
    critical: 'border-red-500 bg-red-50',
    high: 'border-orange-500 bg-orange-50',
    medium: 'border-yellow-500 bg-yellow-50',
    low: 'border-green-500 bg-green-50',
  };

  return (
    <div className="space-y-6">
      {settings.rules.map((rule, index) => (
        <div key={rule.risk_level} className={clsx('rounded-lg border-l-4 p-4', riskColors[rule.risk_level])}>
          <h4 className="font-medium text-gray-900 uppercase mb-4">{rule.risk_level}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Queue</label>
              <input
                type="text"
                value={rule.queue_name || ''}
                onChange={(e) => updateRule(index, { queue_name: e.target.value || null })}
                className="w-full text-sm rounded-md border-gray-300"
                placeholder="Nom de la queue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SLA (heures)</label>
              <input
                type="number"
                value={rule.sla_hours || ''}
                onChange={(e) => updateRule(index, { sla_hours: parseInt(e.target.value) || null })}
                className="w-full text-sm rounded-md border-gray-300"
                placeholder="Heures"
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Toggle
              label="Auto-escalade"
              checked={rule.auto_escalate}
              onChange={(v) => updateRule(index, { auto_escalate: v })}
            />
            <div className="flex flex-wrap gap-2">
              {['email', 'sms', 'webhook'].map((channel) => (
                <label key={channel} className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={rule.notification_channels.includes(channel)}
                    onChange={(e) => {
                      const channels = e.target.checked
                        ? [...rule.notification_channels, channel]
                        : rule.notification_channels.filter(c => c !== channel);
                      updateRule(index, { notification_channels: channels });
                    }}
                    className="text-primary-600 rounded"
                  />
                  <span className="text-xs uppercase">{channel}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      ))}

      <SettingsCard title="Webhooks">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Webhook</label>
            <input
              type="url"
              value={settings.webhook_url || ''}
              onChange={(e) => onChange({ ...settings, webhook_url: e.target.value || null })}
              className="w-full text-sm rounded-md border-gray-300"
              placeholder="https://hooks.example.com/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slack Webhook</label>
            <input
              type="url"
              value={settings.slack_webhook_url || ''}
              onChange={(e) => onChange({ ...settings, slack_webhook_url: e.target.value || null })}
              className="w-full text-sm rounded-md border-gray-300"
              placeholder="https://hooks.slack.com/..."
            />
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}

// Integrations Tab
function IntegrationsTab({
  settings,
  onChange,
  onTestConnection,
  testingService,
}: {
  settings: IntegrationsConfig;
  onChange: (s: IntegrationsConfig) => void;
  onTestConnection: (serviceName: string) => void;
  testingService: string | null;
}) {
  const renderIntegrationGroup = (
    title: string,
    integrations: typeof settings.apis,
    key: 'apis' | 'databases' | 'mcp_servers'
  ) => (
    <SettingsCard title={title}>
      <div className="space-y-4">
        {integrations.map((integration, index) => (
          <div key={integration.name} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Toggle
                  label=""
                  checked={integration.enabled}
                  onChange={(enabled) => {
                    const newIntegrations = [...integrations];
                    newIntegrations[index] = { ...newIntegrations[index], enabled };
                    onChange({ ...settings, [key]: newIntegrations });
                  }}
                />
                <span className="font-medium">{integration.display_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={clsx(
                  'text-xs px-2 py-1 rounded',
                  integration.health_status === 'ok' ? 'bg-green-100 text-green-700' :
                  integration.health_status === 'error' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                )}>
                  {integration.health_status || 'Non testé'}
                </span>
                <button
                  onClick={() => onTestConnection(integration.name)}
                  disabled={!integration.enabled || testingService === integration.name}
                  className={clsx(
                    'flex items-center space-x-1 px-2 py-1 text-xs rounded border',
                    testingService === integration.name
                      ? 'bg-gray-100 text-gray-400 cursor-wait'
                      : 'bg-white text-primary-600 border-primary-300 hover:bg-primary-50'
                  )}
                >
                  {testingService === integration.name ? (
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    <SignalIcon className="h-4 w-4" />
                  )}
                  <span>Tester</span>
                </button>
              </div>
            </div>
            <input
              type="text"
              value={integration.url}
              onChange={(e) => {
                const newIntegrations = [...integrations];
                newIntegrations[index] = { ...newIntegrations[index], url: e.target.value };
                onChange({ ...settings, [key]: newIntegrations });
              }}
              className="w-full text-sm rounded-md border-gray-300"
              placeholder="URL"
            />
          </div>
        ))}
      </div>
    </SettingsCard>
  );

  return (
    <div className="space-y-6">
      {renderIntegrationGroup('APIs Métier', settings.apis, 'apis')}
      {renderIntegrationGroup('Bases de Données', settings.databases, 'databases')}
      {renderIntegrationGroup('Serveurs MCP', settings.mcp_servers, 'mcp_servers')}
    </div>
  );
}

// Retention Tab
function RetentionTab({ settings, onChange }: { settings: RetentionConfig; onChange: (s: RetentionConfig) => void }) {
  return (
    <div className="space-y-6">
      <SettingsCard title="Rétention des Données">
        <div className="space-y-4">
          {settings.policies.map((policy, index) => (
            <div key={policy.data_type} className="flex items-center justify-between">
              <span className="text-sm">{policy.display_name}</span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={policy.retention_days}
                  onChange={(e) => {
                    const newPolicies = [...settings.policies];
                    newPolicies[index] = { ...newPolicies[index], retention_days: parseInt(e.target.value) || 1 };
                    onChange({ ...settings, policies: newPolicies });
                  }}
                  className="w-20 text-sm rounded-md border-gray-300"
                  min="1"
                />
                <span className="text-sm text-gray-500">jours</span>
              </div>
            </div>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="Anonymisation">
        <Toggle
          label="Activer l'anonymisation automatique"
          checked={settings.anonymization_enabled}
          onChange={(v) => onChange({ ...settings, anonymization_enabled: v })}
        />
        {settings.anonymization_enabled && (
          <div className="mt-4 space-y-2">
            {settings.anonymization_fields.map((field, index) => (
              <Toggle
                key={field.field_name}
                label={field.display_name}
                checked={field.enabled}
                onChange={(enabled) => {
                  const newFields = [...settings.anonymization_fields];
                  newFields[index] = { ...newFields[index], enabled };
                  onChange({ ...settings, anonymization_fields: newFields });
                }}
              />
            ))}
          </div>
        )}
      </SettingsCard>

      <SettingsCard title="Export RGPD">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Format d&apos;export</label>
            <select
              value={settings.gdpr_export_format}
              onChange={(e) => onChange({ ...settings, gdpr_export_format: e.target.value })}
              className="w-full rounded-md border-gray-300"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="xml">XML</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Délai traitement effacement</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={settings.erasure_request_days}
                onChange={(e) => onChange({ ...settings, erasure_request_days: parseInt(e.target.value) || 1 })}
                className="w-20 rounded-md border-gray-300"
                min="1"
                max="90"
              />
              <span className="text-sm text-gray-500">jours</span>
            </div>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}

// Audit Log Modal
function AuditLogModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { data: auditLog, isLoading } = useSettingsAuditLog(50, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
            <ClockIcon className="h-5 w-5" />
            <span>Historique des modifications</span>
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <ArrowPathIcon className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : auditLog && auditLog.length > 0 ? (
            <div className="space-y-3">
              {auditLog.map((entry: SettingsAuditLog) => (
                <div key={entry.id} className="border rounded-lg p-3 text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-primary-600">{entry.setting_type}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(entry.timestamp).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-600">
                    <span>Action: {entry.action}</span>
                    {entry.user_email && <span>Par: {entry.user_email}</span>}
                    {entry.ip_address && <span>IP: {entry.ip_address}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">Aucune modification enregistrée</p>
          )}
        </div>
        <div className="p-4 border-t">
          <button onClick={onClose} className="btn-secondary w-full">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// System Tab
function SystemTab({
  settings,
  onChange,
  onExport,
  onImport,
  onReset,
  onShowAuditLog,
  allSettings,
  isExporting,
  isImporting,
}: {
  settings: SystemSettings;
  onChange: (s: SystemSettings) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
  onShowAuditLog: () => void;
  allSettings: AllSettings | null;
  isExporting: boolean;
  isImporting: boolean;
}) {
  return (
    <div className="space-y-6">
      <SettingsCard title="Informations Système">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Version API:</span>
            <span className="font-mono">{settings.api_version}</span>
          </div>
          <div className="flex justify-between">
            <span>Version Frontend:</span>
            <span className="font-mono">{settings.frontend_version}</span>
          </div>
          {allSettings?.updated_at && (
            <div className="flex justify-between">
              <span>Dernière mise à jour:</span>
              <span>{new Date(allSettings.updated_at).toLocaleString('fr-FR')}</span>
            </div>
          )}
          {allSettings?.updated_by && (
            <div className="flex justify-between">
              <span>Modifié par:</span>
              <span>{allSettings.updated_by}</span>
            </div>
          )}
        </div>
      </SettingsCard>

      <SettingsCard title="Export / Import">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={onExport}
            disabled={isExporting}
            className={clsx(
              'btn-secondary flex items-center space-x-2',
              isExporting && 'opacity-50 cursor-wait'
            )}
          >
            {isExporting ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              <ArrowDownTrayIcon className="h-5 w-5" />
            )}
            <span>{isExporting ? 'Export en cours...' : 'Exporter'}</span>
          </button>
          <label className={clsx(
            'btn-secondary flex items-center space-x-2 cursor-pointer',
            isImporting && 'opacity-50 cursor-wait'
          )}>
            {isImporting ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              <ArrowUpTrayIcon className="h-5 w-5" />
            )}
            <span>{isImporting ? 'Import en cours...' : 'Importer'}</span>
            <input
              type="file"
              accept=".json"
              onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])}
              disabled={isImporting}
              className="hidden"
            />
          </label>
          <button
            onClick={onShowAuditLog}
            className="btn-secondary flex items-center space-x-2"
          >
            <ClockIcon className="h-5 w-5" />
            <span>Historique</span>
          </button>
        </div>
      </SettingsCard>

      <SettingsCard title="Maintenance">
        <div className="space-y-4">
          <Toggle
            label="Mode maintenance"
            checked={settings.maintenance_mode}
            onChange={(v) => onChange({ ...settings, maintenance_mode: v })}
          />
          {settings.maintenance_mode && (
            <input
              type="text"
              value={settings.maintenance_message}
              onChange={(e) => onChange({ ...settings, maintenance_message: e.target.value })}
              className="w-full rounded-md border-gray-300"
              placeholder="Message de maintenance..."
            />
          )}
          <Toggle
            label="Mode debug (logs détaillés)"
            checked={settings.debug_mode}
            onChange={(v) => onChange({ ...settings, debug_mode: v })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Niveau de log</label>
            <select
              value={settings.log_level}
              onChange={(e) => onChange({ ...settings, log_level: e.target.value })}
              className="w-full rounded-md border-gray-300"
            >
              <option value="DEBUG">DEBUG</option>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="ERROR">ERROR</option>
            </select>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Actions Dangereuses">
        <button
          onClick={onReset}
          className="btn-secondary text-red-600 border-red-300 hover:bg-red-50 flex items-center space-x-2"
        >
          <ExclamationTriangleIcon className="h-5 w-5" />
          <span>Réinitialiser aux valeurs par défaut</span>
        </button>
        <p className="mt-2 text-xs text-red-500">Cette action est irréversible.</p>
      </SettingsCard>
    </div>
  );
}

// Add Pattern Modal
function AddPatternModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (pattern: FraudPattern) => void;
}) {
  const [pattern, setPattern] = useState<FraudPattern>({
    id: '',
    name: '',
    description: '',
    indicators: [],
    risk_weight: 0.5,
    enabled: true,
  });
  const [indicatorsText, setIndicatorsText] = useState('');

  const handleSubmit = () => {
    if (!pattern.id || !pattern.name) return;
    onAdd({
      ...pattern,
      indicators: indicatorsText.split('\n').filter(i => i.trim()),
    });
    onClose();
    // Reset form
    setPattern({
      id: '',
      name: '',
      description: '',
      indicators: [],
      risk_weight: 0.5,
      enabled: true,
    });
    setIndicatorsText('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Ajouter un pattern de fraude</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID du pattern *</label>
            <input
              type="text"
              value={pattern.id}
              onChange={(e) => setPattern({ ...pattern, id: e.target.value })}
              className="w-full rounded-md border-gray-300"
              placeholder="PATTERN_XXX"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input
              type="text"
              value={pattern.name}
              onChange={(e) => setPattern({ ...pattern, name: e.target.value })}
              className="w-full rounded-md border-gray-300"
              placeholder="Nom du pattern"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={pattern.description}
              onChange={(e) => setPattern({ ...pattern, description: e.target.value })}
              className="w-full rounded-md border-gray-300"
              rows={2}
              placeholder="Description du pattern"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Indicateurs (un par ligne)</label>
            <textarea
              value={indicatorsText}
              onChange={(e) => setIndicatorsText(e.target.value)}
              className="w-full rounded-md border-gray-300 font-mono text-sm"
              rows={3}
              placeholder="amount > 1000&#10;frequency > 5"
            />
          </div>
          <Slider
            label="Poids de risque"
            value={pattern.risk_weight}
            onChange={(v) => setPattern({ ...pattern, risk_weight: v })}
          />
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button onClick={onClose} className="btn-secondary">
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!pattern.id || !pattern.name}
            className={clsx(
              'btn-primary',
              (!pattern.id || !pattern.name) && 'opacity-50 cursor-not-allowed'
            )}
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Settings Page
function SettingsPageContent() {
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('risk');
  const [hasChanges, setHasChanges] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [showAddPattern, setShowAddPattern] = useState(false);
  const [testingService, setTestingService] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  // API hooks
  const { data: settings, isLoading, error } = useAllSettings();
  const updateMutation = useUpdateSettings();
  const exportMutation = useExportSettings();
  const importMutation = useImportSettings();
  const resetMutation = useResetSettings();
  const testConnectionMutation = useTestIntegrationConnection();

  // Local state for editing
  const [localSettings, setLocalSettings] = useState<AllSettings | null>(null);

  // Show toast helper
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setToast({ message, type });
  }, []);

  // Initialize local settings from API
  useEffect(() => {
    if (settings && !localSettings) {
      setLocalSettings(settings);
    }
  }, [settings, localSettings]);

  // Track changes
  useEffect(() => {
    if (settings && localSettings) {
      setHasChanges(JSON.stringify(settings) !== JSON.stringify(localSettings));
    }
  }, [settings, localSettings]);

  const handleSave = async () => {
    if (!localSettings) return;
    try {
      await updateMutation.mutateAsync({
        risk_thresholds: localSettings.risk_thresholds,
        cost_matrix: localSettings.cost_matrix,
        models: localSettings.models,
        fraud_patterns: localSettings.fraud_patterns,
        agents: localSettings.agents,
        features: localSettings.features,
        alert_rules: localSettings.alert_rules,
        integrations: localSettings.integrations,
        retention: localSettings.retention,
        system: localSettings.system,
      });
      setHasChanges(false);
      showToast('Paramètres sauvegardés avec succès', 'success');
    } catch (err) {
      console.error('Failed to save settings:', err);
      showToast('Erreur lors de la sauvegarde des paramètres', 'error');
    }
  };

  const handleCancel = () => {
    if (settings) {
      setLocalSettings({ ...settings });
      setHasChanges(false);
      showToast('Modifications annulées', 'info');
    }
  };

  const handleReset = async () => {
    try {
      await resetMutation.mutateAsync();
      setLocalSettings(null);
      setShowResetConfirm(false);
      showToast('Paramètres réinitialisés aux valeurs par défaut', 'success');
    } catch (err) {
      console.error('Failed to reset settings:', err);
      showToast('Erreur lors de la réinitialisation', 'error');
    }
  };

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync();
      showToast('Export téléchargé avec succès', 'success');
    } catch (err) {
      console.error('Failed to export settings:', err);
      showToast('Erreur lors de l\'export', 'error');
    }
  };

  const handleImport = async (file: File) => {
    try {
      await importMutation.mutateAsync(file);
      setLocalSettings(null);
      showToast('Import réussi', 'success');
    } catch (err) {
      console.error('Failed to import settings:', err);
      showToast('Erreur lors de l\'import: fichier invalide', 'error');
    }
  };

  const handleTestConnection = async (serviceName: string) => {
    setTestingService(serviceName);
    try {
      const result = await testConnectionMutation.mutateAsync(serviceName);
      if (result.success) {
        showToast(`Connexion à ${serviceName} réussie (${result.latency_ms}ms)`, 'success');
      } else {
        showToast(`Connexion à ${serviceName} échouée: ${result.error_message}`, 'error');
      }
    } catch (err) {
      showToast(`Erreur de test de connexion à ${serviceName}`, 'error');
    } finally {
      setTestingService(null);
    }
  };

  const handleAddPattern = (pattern: FraudPattern) => {
    if (localSettings) {
      setLocalSettings({
        ...localSettings,
        fraud_patterns: {
          patterns: [...localSettings.fraud_patterns.patterns, pattern],
        },
      });
      showToast(`Pattern ${pattern.id} ajouté`, 'success');
    }
  };

  if (isLoading || !localSettings) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center text-red-600">
          <ExclamationTriangleIcon className="h-12 w-12 mx-auto" />
          <p className="mt-4">Erreur de chargement des paramètres</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 btn-primary"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'risk':
        return <RiskThresholdsTab settings={localSettings.risk_thresholds} onChange={(s) => setLocalSettings({ ...localSettings, risk_thresholds: s })} />;
      case 'cost':
        return <CostMatrixTab settings={localSettings.cost_matrix} onChange={(s) => setLocalSettings({ ...localSettings, cost_matrix: s })} />;
      case 'models':
        return <ModelsTab settings={localSettings.models} onChange={(s) => setLocalSettings({ ...localSettings, models: s })} />;
      case 'patterns':
        return (
          <PatternsTab
            settings={localSettings.fraud_patterns}
            onChange={(s) => setLocalSettings({ ...localSettings, fraud_patterns: s })}
            onAddPattern={() => setShowAddPattern(true)}
          />
        );
      case 'agents':
        return <AgentsTab settings={localSettings.agents} onChange={(s) => setLocalSettings({ ...localSettings, agents: s })} />;
      case 'features':
        return <FeaturesTab settings={localSettings.features} onChange={(s) => setLocalSettings({ ...localSettings, features: s })} />;
      case 'alerts':
        return <AlertsTab settings={localSettings.alert_rules} onChange={(s) => setLocalSettings({ ...localSettings, alert_rules: s })} />;
      case 'integrations':
        return (
          <IntegrationsTab
            settings={localSettings.integrations}
            onChange={(s) => setLocalSettings({ ...localSettings, integrations: s })}
            onTestConnection={handleTestConnection}
            testingService={testingService}
          />
        );
      case 'retention':
        return <RetentionTab settings={localSettings.retention} onChange={(s) => setLocalSettings({ ...localSettings, retention: s })} />;
      case 'system':
        return (
          <SystemTab
            settings={localSettings.system}
            onChange={(s) => setLocalSettings({ ...localSettings, system: s })}
            onExport={handleExport}
            onImport={handleImport}
            onReset={() => setShowResetConfirm(true)}
            onShowAuditLog={() => setShowAuditLog(true)}
            allSettings={localSettings}
            isExporting={exportMutation.isPending}
            isImporting={importMutation.isPending}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Page header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Cog6ToothIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Paramètres</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Centre de configuration intelligent du système FraudShield AI
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {hasChanges && (
                  <span className="text-sm text-orange-600 flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    Modifications non sauvegardées
                  </span>
                )}
                {hasChanges && (
                  <button
                    onClick={handleCancel}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <XMarkIcon className="h-5 w-5" />
                    <span>Annuler</span>
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || updateMutation.isPending}
                  className={clsx(
                    'btn-primary flex items-center space-x-2',
                    (!hasChanges || updateMutation.isPending) && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {updateMutation.isPending ? (
                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  ) : (
                    <CheckIcon className="h-5 w-5" />
                  )}
                  <span>Sauvegarder</span>
                </button>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={clsx(
                        'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      )}
                    >
                      <Icon className={clsx(
                        'mr-2 h-5 w-5',
                        activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      )} />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab content */}
            <div className="pb-8">
              {renderTabContent()}
            </div>
          </div>
        </main>
      </div>

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Reset confirmation modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Confirmer la réinitialisation</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir réinitialiser tous les paramètres aux valeurs par défaut ?
              Cette action est <strong>irréversible</strong>.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="btn-secondary"
              >
                Annuler
              </button>
              <button
                onClick={handleReset}
                disabled={resetMutation.isPending}
                className="btn-primary bg-red-600 hover:bg-red-700 flex items-center space-x-2"
              >
                {resetMutation.isPending && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
                <span>{resetMutation.isPending ? 'Réinitialisation...' : 'Réinitialiser'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Modal */}
      <AuditLogModal isOpen={showAuditLog} onClose={() => setShowAuditLog(false)} />

      {/* Add Pattern Modal */}
      <AddPatternModal
        isOpen={showAddPattern}
        onClose={() => setShowAddPattern(false)}
        onAdd={handleAddPattern}
      />
    </div>
  );
}

function SettingsPageLoading() {
  return (
    <div className="flex h-screen bg-gray-50 items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Chargement des paramètres...</p>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsPageLoading />}>
      <SettingsPageContent />
    </Suspense>
  );
}
