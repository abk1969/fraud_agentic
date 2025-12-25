const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;

    let url = `${this.baseUrl}${endpoint}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      url += `?${searchParams.toString()}`;
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Transactions
  async analyzeTransaction(data: TransactionRequest): Promise<FraudDecisionResponse> {
    return this.request('/api/v1/transactions/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async analyzeBatchTransactions(transactions: TransactionRequest[]): Promise<BatchAnalysisResponse> {
    return this.request('/api/v1/transactions/batch', {
      method: 'POST',
      body: JSON.stringify({ transactions }),
    });
  }

  async getTransaction(transactionId: string): Promise<TransactionDetails> {
    return this.request(`/api/v1/transactions/${transactionId}`);
  }

  async getTransactions(params?: TransactionListParams): Promise<TransactionListResponse> {
    return this.request('/api/v1/transactions', { params: params as Record<string, string | number | boolean> });
  }

  // Documents
  async analyzeDocument(file: File, transactionId?: string): Promise<DocumentAnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (transactionId) {
      formData.append('transaction_id', transactionId);
    }

    const response = await fetch(`${this.baseUrl}/api/v1/documents/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getDocumentAnalysis(documentId: string): Promise<DocumentAnalysisResponse> {
    return this.request(`/api/v1/documents/${documentId}`);
  }

  // Investigations
  async startInvestigation(transactionId: string, reason?: string): Promise<InvestigationResponse> {
    return this.request('/api/v1/investigations/start', {
      method: 'POST',
      body: JSON.stringify({ transaction_id: transactionId, reason }),
    });
  }

  async getInvestigation(investigationId: string): Promise<InvestigationDetails> {
    return this.request(`/api/v1/investigations/${investigationId}`);
  }

  async getInvestigations(params?: InvestigationListParams): Promise<InvestigationListResponse> {
    return this.request('/api/v1/investigations', { params: params as Record<string, string | number | boolean> });
  }

  async analyzeNetwork(entityId: string): Promise<NetworkAnalysisResponse> {
    return this.request('/api/v1/investigations/network', {
      method: 'POST',
      body: JSON.stringify({ entity_id: entityId }),
    });
  }

  // Analytics
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request('/api/v1/analytics/dashboard');
  }

  async getFraudTrends(days?: number): Promise<FraudTrends> {
    return this.request('/api/v1/analytics/trends', { params: { days: days || 30 } });
  }

  async getRiskDistribution(): Promise<RiskDistribution> {
    return this.request('/api/v1/analytics/risk-distribution');
  }

  async getAgentMetrics(): Promise<AgentMetrics> {
    return this.request('/api/v1/analytics/agent-metrics');
  }

  // Agents
  async getSystemStatus(): Promise<SystemStatusResponse> {
    return this.request('/api/v1/agents/status');
  }

  async getAgentsList(): Promise<AgentInfo[]> {
    return this.request('/api/v1/agents/list');
  }

  async getAgentDetails(agentId: string): Promise<AgentInfo> {
    return this.request(`/api/v1/agents/${agentId}`);
  }

  async getModelInfo(): Promise<ModelInfo> {
    return this.request('/api/v1/agents/model/info');
  }

  async triggerModelTraining(): Promise<TrainingTriggerResponse> {
    return this.request('/api/v1/agents/model/train', { method: 'POST' });
  }

  async getAgentConfig(): Promise<AgentConfig> {
    return this.request('/api/v1/agents/config');
  }

  async getMcpServers(): Promise<McpServersResponse> {
    return this.request('/api/v1/agents/mcp-servers');
  }

  async getA2AStatus(): Promise<A2AStatusResponse> {
    return this.request('/api/v1/agents/a2a/status');
  }

  // Alerts
  async getAlerts(params?: AlertListParams): Promise<AlertListResponse> {
    return this.request('/api/v1/alerts', { params: params as Record<string, string | number | boolean> });
  }

  async getAlert(alertId: string): Promise<AlertDetails> {
    return this.request(`/api/v1/alerts/${alertId}`);
  }

  async getAlertStats(): Promise<AlertStatsResponse> {
    return this.request('/api/v1/alerts/stats');
  }

  async updateAlertStatus(alertId: string, action: AlertActionType, comment?: string): Promise<AlertDetails> {
    return this.request(`/api/v1/alerts/${alertId}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, comment }),
    });
  }

  async addAlertComment(alertId: string, comment: string): Promise<AlertDetails> {
    return this.request(`/api/v1/alerts/${alertId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  }

  async createInvestigationFromAlert(alertId: string, reason?: string): Promise<InvestigationResponse> {
    return this.request('/api/v1/investigations/from-alert', {
      method: 'POST',
      body: JSON.stringify({ alert_id: alertId, reason }),
    });
  }

  // Health
  async checkHealth(): Promise<HealthResponse> {
    return this.request('/health');
  }

  // Analytics
  async getAnalyticsDashboard(period: string = '30d'): Promise<AnalyticsDashboard> {
    return this.request('/api/v1/analytics/dashboard', { params: { period } });
  }

  async getFraudStatistics(params?: { start_date?: string; end_date?: string; group_by?: string }): Promise<FraudStatistics> {
    return this.request('/api/v1/analytics/statistics', { params: params as Record<string, string> });
  }

  async getFraudTypeDistribution(period: string = '30d'): Promise<FraudTypeDistribution> {
    return this.request('/api/v1/analytics/fraud-types', { params: { period } });
  }

  async getProviderRiskRanking(limit: number = 20): Promise<ProviderRiskRanking> {
    return this.request('/api/v1/analytics/providers/risk', { params: { limit } });
  }

  async getBeneficiaryRiskRanking(limit: number = 20): Promise<BeneficiaryRiskRanking> {
    return this.request('/api/v1/analytics/beneficiaries/risk', { params: { limit } });
  }

  async getModelPerformance(period: string = '30d'): Promise<ModelPerformance> {
    return this.request('/api/v1/analytics/model/performance', { params: { period } });
  }

  async getTrainingStatus(): Promise<TrainingStatus> {
    return this.request('/api/v1/analytics/model/training');
  }

  async exportReport(request: ExportReportRequest): Promise<ExportReportResponse> {
    return this.request('/api/v1/analytics/export', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Settings
  async getAllSettings(): Promise<AllSettings> {
    return this.request('/api/v1/settings');
  }

  async updateSettings(update: SettingsUpdateRequest): Promise<AllSettings> {
    return this.request('/api/v1/settings', {
      method: 'PUT',
      body: JSON.stringify(update),
    });
  }

  async validateSettings(update: SettingsUpdateRequest): Promise<ValidationResult> {
    return this.request('/api/v1/settings/validate', {
      method: 'POST',
      body: JSON.stringify(update),
    });
  }

  async getRiskThresholds(): Promise<RiskThresholds> {
    return this.request('/api/v1/settings/risk-thresholds');
  }

  async updateRiskThresholds(thresholds: RiskThresholds): Promise<RiskThresholds> {
    return this.request('/api/v1/settings/risk-thresholds', {
      method: 'PUT',
      body: JSON.stringify(thresholds),
    });
  }

  async getCostMatrix(): Promise<CostMatrix> {
    return this.request('/api/v1/settings/cost-matrix');
  }

  async updateCostMatrix(matrix: CostMatrix): Promise<CostMatrix> {
    return this.request('/api/v1/settings/cost-matrix', {
      method: 'PUT',
      body: JSON.stringify(matrix),
    });
  }

  async getModelSettings(): Promise<ModelSettings> {
    return this.request('/api/v1/settings/models');
  }

  async updateModelSettings(models: ModelSettings): Promise<ModelSettings> {
    return this.request('/api/v1/settings/models', {
      method: 'PUT',
      body: JSON.stringify(models),
    });
  }

  async getFraudPatterns(): Promise<FraudPatternsConfig> {
    return this.request('/api/v1/settings/fraud-patterns');
  }

  async updateFraudPatterns(patterns: FraudPatternsConfig): Promise<FraudPatternsConfig> {
    return this.request('/api/v1/settings/fraud-patterns', {
      method: 'PUT',
      body: JSON.stringify(patterns),
    });
  }

  async getAgentsSettings(): Promise<AgentsConfig> {
    return this.request('/api/v1/settings/agents');
  }

  async updateAgentsSettings(agents: AgentsConfig): Promise<AgentsConfig> {
    return this.request('/api/v1/settings/agents', {
      method: 'PUT',
      body: JSON.stringify(agents),
    });
  }

  async getFeaturesConfig(): Promise<FeaturesConfig> {
    return this.request('/api/v1/settings/features');
  }

  async updateFeaturesConfig(features: FeaturesConfig): Promise<FeaturesConfig> {
    return this.request('/api/v1/settings/features', {
      method: 'PUT',
      body: JSON.stringify(features),
    });
  }

  async getAlertRulesConfig(): Promise<AlertRulesConfig> {
    return this.request('/api/v1/settings/alert-rules');
  }

  async updateAlertRulesConfig(rules: AlertRulesConfig): Promise<AlertRulesConfig> {
    return this.request('/api/v1/settings/alert-rules', {
      method: 'PUT',
      body: JSON.stringify(rules),
    });
  }

  async getIntegrationsConfig(): Promise<IntegrationsConfig> {
    return this.request('/api/v1/settings/integrations');
  }

  async updateIntegrationsConfig(integrations: IntegrationsConfig): Promise<IntegrationsConfig> {
    return this.request('/api/v1/settings/integrations', {
      method: 'PUT',
      body: JSON.stringify(integrations),
    });
  }

  async testIntegrationConnection(serviceName: string): Promise<ConnectionTestResult> {
    return this.request(`/api/v1/settings/integrations/${serviceName}/test`, {
      method: 'POST',
    });
  }

  async getRetentionConfig(): Promise<RetentionConfig> {
    return this.request('/api/v1/settings/retention');
  }

  async updateRetentionConfig(retention: RetentionConfig): Promise<RetentionConfig> {
    return this.request('/api/v1/settings/retention', {
      method: 'PUT',
      body: JSON.stringify(retention),
    });
  }

  async getSystemSettings(): Promise<SystemSettings> {
    return this.request('/api/v1/settings/system');
  }

  async updateSystemSettings(system: SystemSettings): Promise<SystemSettings> {
    return this.request('/api/v1/settings/system', {
      method: 'PUT',
      body: JSON.stringify(system),
    });
  }

  async exportSettings(): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/v1/settings/export`);
    if (!response.ok) {
      throw new Error('Failed to export settings');
    }
    return response.blob();
  }

  async importSettings(file: File): Promise<{ success: boolean; message: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/api/v1/settings/import`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async resetSettings(): Promise<AllSettings> {
    return this.request('/api/v1/settings/reset', {
      method: 'POST',
      params: { confirm: true },
    });
  }

  async getSettingsAuditLog(limit: number = 100, offset: number = 0): Promise<SettingsAuditLog[]> {
    return this.request('/api/v1/settings/audit-log', {
      params: { limit, offset },
    });
  }

  async reloadSettings(): Promise<{ status: string; message: string }> {
    return this.request('/api/v1/settings/reload', {
      method: 'POST',
    });
  }
}

// Types
export interface TransactionRequest {
  transaction_id: string;
  amount: number;
  currency: string;
  beneficiary_id: string;
  beneficiary_name: string;
  transaction_type: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface FraudDecisionResponse {
  transaction_id: string;
  decision: 'approve' | 'review' | 'reject' | 'investigate';
  confidence: number;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  explanation: string;
  recommended_actions: string[];
  processing_time_ms: number;
  agents_involved: string[];
}

export interface BatchAnalysisResponse {
  batch_id: string;
  total: number;
  processed: number;
  results: FraudDecisionResponse[];
  summary: {
    approved: number;
    review: number;
    rejected: number;
    investigate: number;
  };
}

export interface TransactionDetails {
  transaction_id: string;
  amount: number;
  currency: string;
  beneficiary_id: string;
  beneficiary_name: string;
  transaction_type: string;
  status: string;
  risk_score: number;
  created_at: string;
  analysis_result?: FraudDecisionResponse;
}

export interface TransactionListParams {
  page?: number;
  limit?: number;
  status?: string;
  risk_level?: string;
  date_from?: string;
  date_to?: string;
}

export interface TransactionListResponse {
  transactions: TransactionDetails[];
  total: number;
  page: number;
  limit: number;
}

export interface DocumentAnalysisResponse {
  document_id: string;
  document_type: string;
  authenticity_score: number;
  is_authentic: boolean;
  issues: string[];
  extracted_data: Record<string, unknown>;
  analysis_details: string;
}

export interface InvestigationResponse {
  investigation_id: string;
  status: string;
  created_at: string;
  // Champs optionnels retournes par le backend
  transaction_id?: string;
  reason?: string;
  alert_id?: string;
}

export interface InvestigationDetails {
  investigation_id: string;
  transaction_id?: string;  // Optionnel car peut etre cree depuis alerte
  alert_id?: string;
  status: string;
  priority?: string;
  assigned_to?: string;
  reason?: string;
  findings: string[];
  risk_score?: number;
  network_analysis?: NetworkAnalysisResponse;
  timeline: InvestigationEvent[];
  created_at: string;
  updated_at: string;
  closed_at?: string;
  fraud_confirmed?: boolean;
  note?: string;
}

export interface InvestigationEvent {
  timestamp: string;
  agent: string;
  action: string;
  details?: string;
  event_type?: string;
}

export interface InvestigationListParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface InvestigationListResponse {
  investigations: InvestigationDetails[];
  total: number;
  page: number;
  limit: number;
}

export interface NetworkAnalysisResponse {
  entity_id: string;
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  fraud_rings: FraudRing[];
  risk_assessment: string;
}

export interface NetworkNode {
  id: string;
  type: string;
  label: string;
  risk_score: number;
}

export interface NetworkEdge {
  source: string;
  target: string;
  relationship: string;
  weight: number;
}

export interface FraudRing {
  id: string;
  members: string[];
  total_amount: number;
  confidence: number;
}

export interface DashboardStats {
  transactions_analyzed: number;
  transactions_change: number;
  frauds_detected: number;
  frauds_change: number;
  detection_rate: number;
  detection_rate_change: number;
  amount_saved: number;
  amount_saved_change: number;
}

export interface FraudTrends {
  data: {
    date: string;
    transactions: number;
    frauds: number;
    rate: number;
  }[];
}

export interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface AgentMetrics {
  total_tasks: number;
  average_response_time: number;
  success_rate: number;
  agent_stats: {
    agent_id: string;
    tasks_completed: number;
    average_time: number;
  }[];
}

// Agent types
export interface AgentInfo {
  agent_id: string;
  agent_name: string;
  status: 'active' | 'busy' | 'idle' | 'error' | 'unknown';
  is_healthy: boolean;
  capabilities: string[];
  supported_tasks: string[];
  last_heartbeat?: string;
}

export interface SystemStatusResponse {
  status: string;
  uptime_seconds: number;
  agents: {
    total: number;
    active: number;
    healthy: number;
  };
  rl_training: {
    status: string;
    last_trained?: string;
    episodes_completed?: number;
    current_reward?: number;
  };
  settings: {
    model: string;
    workflows: string[];
  };
}

export interface ModelInfo {
  model_type: string;
  model_name: string;
  model_version: string;
  embedding_model: string;
  embedding_dimension: number;
  rl_policy: string;
  rl_training_status: 'idle' | 'training' | 'completed' | 'error';
  input_dim: number;
  hidden_dim: number;
  action_dim: number;
  total_params: number;
  experience_buffer_size: number;
  training_episodes: number;
  average_reward: number;
  last_training?: string;
  last_trained?: string;
  performance_metrics: {
    precision: number;
    recall: number;
    f1_score: number;
    false_positive_rate: number;
  };
}

export interface TrainingTriggerResponse {
  status: string;
  timestamp: string;
  note: string;
}

export interface AgentConfig {
  orchestrator: {
    model: string;
    sub_agents: string[];
  };
  cost_sensitive: {
    true_positive: number;
    true_negative: number;
    false_positive: number;
    false_negative: number;
    flag_threshold: number;
  };
  cost_matrix: {
    true_positive: number;
    true_negative: number;
    false_positive: number;
    false_negative: number;
  };
  thresholds: {
    fraud_threshold: number;
    alert_threshold: number;
    auto_approve_threshold: number;
  };
  features: {
    llm_enabled: boolean;
    rl_enabled: boolean;
    xai_enabled: boolean;
    batch_processing: boolean;
  };
  workflows: {
    [key: string]: string;
  };
}

export interface McpServer {
  server_id: string;
  name: string;
  status: 'active' | 'inactive' | 'error' | 'connected' | 'disconnected';
  tools_count?: number;
  tools: string[];
  last_ping?: string;
}

export interface McpServersResponse {
  servers: McpServer[];
}

export interface A2AMessage {
  message_id: string;
  from_agent: string;
  to_agent: string;
  message_type: string;
  status: 'pending' | 'delivered' | 'processed' | 'failed';
  timestamp: string;
}

export interface A2AStatusResponse {
  protocol: string;
  version: string;
  protocol_version?: string;
  registered_agents: number;
  routing_rules: number;
  pending_messages: number;
  total_messages: number;
  messages_last_hour: number;
  average_latency_ms: number;
  recent_messages: A2AMessage[];
  status: string;
}

export interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
}

// Analytics Types
export interface AnalyticsDashboard {
  period: string;
  period_days: number;
  summary: {
    total_transactions: number;
    flagged_transactions: number;
    confirmed_fraud: number;
    false_positives: number;
    pending_review: number;
    total_amount_processed: number;
    total_amount_saved: number;
  };
  metrics: {
    detection_rate: number;
    precision: number;
    recall: number;
    f1_score: number;
    false_positive_rate: number;
  };
  trends: {
    fraud_rate_trend: { date: string; value: number }[];
    volume_trend: { date: string; value: number }[];
    amount_trend: { date: string; value: number }[];
  };
  generated_at: string;
}

export interface FraudStatistics {
  period: { start: string; end: string };
  group_by: string;
  statistics: {
    date: string;
    transactions: number;
    flagged: number;
    confirmed_fraud: number;
    amount: number;
    flagged_amount: number;
  }[];
  totals: {
    total_transactions: number;
    total_flagged: number;
    total_amount: number;
    flagged_amount: number;
  };
}

export interface FraudTypeDistribution {
  period: string;
  distribution: {
    type: string;
    count: number;
    percentage: number;
    amount: number;
  }[];
  total: number;
}

export interface ProviderRiskRanking {
  ranking: {
    provider_id: string;
    provider_name: string;
    risk_score: number;
    total_transactions: number;
    flagged_transactions: number;
    total_amount: number;
    fraud_rate: number;
  }[];
  limit: number;
}

export interface BeneficiaryRiskRanking {
  ranking: {
    beneficiary_id: string;
    beneficiary_name: string;
    risk_score: number;
    total_transactions: number;
    flagged_transactions: number;
    total_amount: number;
    fraud_rate: number;
  }[];
  limit: number;
}

export interface ModelPerformance {
  period: string;
  model: { type: string; version: string };
  performance: {
    precision: number;
    recall: number;
    f1_score: number;
    auc_roc: number;
  };
  cost_analysis: {
    true_positives: number;
    true_negatives: number;
    false_positives: number;
    false_negatives: number;
    total_reward: number;
    average_reward: number;
  };
  confusion_matrix: {
    tp: number;
    tn: number;
    fp: number;
    fn: number;
  };
}

export interface TrainingStatus {
  status: 'idle' | 'training' | 'completed' | 'failed';
  current_epoch?: number;
  total_epochs?: number;
  loss?: number;
  last_trained?: string;
  next_scheduled?: string;
  experience_buffer_size?: number;
}

export interface ExportReportRequest {
  report_type: 'summary' | 'detailed' | 'compliance';
  start_date: string;
  end_date: string;
  format: 'pdf' | 'csv' | 'xlsx';
}

export interface ExportReportResponse {
  report_type: string;
  period: { start: string; end: string };
  format: string;
  status: 'pending' | 'generating' | 'ready' | 'failed';
  download_url?: string;
}

// Alert Types
export type AlertSeverity = 'info' | 'warning' | 'high' | 'critical';
export type AlertStatus = 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'dismissed';
export type AlertType = 'anomaly' | 'threshold' | 'pattern' | 'ml_detection' | 'rule_based' | 'real_time';
export type AlertEntityType = 'transaction' | 'beneficiary' | 'document' | 'network' | 'system';
export type AlertActionType = 'acknowledge' | 'investigate' | 'escalate' | 'resolve' | 'dismiss' | 'comment';

export interface AlertAction {
  id: string;
  action_type: AlertActionType;
  description: string;
  performed_by: string;
  performed_at: string;
}

export interface AlertDetails {
  id: string;
  alert_id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  type: AlertType;
  source: string;
  entity_type: AlertEntityType;
  entity_id: string;
  risk_score: number;
  created_at: string;
  updated_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  acknowledged_by?: string;
  resolved_by?: string;
  related_transactions: string[];
  metadata: Record<string, unknown>;
  actions_taken: AlertAction[];
}

export interface AlertListParams {
  page?: number;
  limit?: number;
  severity?: AlertSeverity;
  status?: AlertStatus;
  type?: AlertType;
  entity_type?: AlertEntityType;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface AlertListResponse {
  alerts: AlertDetails[];
  total: number;
  page: number;
  limit: number;
}

export interface AlertStatsResponse {
  active: number;
  critical: number;
  investigating: number;
  resolved_today: number;
  new_today: number;
  acknowledged: number;
  dismissed: number;
  average_resolution_time: number;
}

export type AlertRuleType = 'threshold' | 'pattern' | 'ml' | 'composite';

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  type: AlertRuleType;
  severity: AlertSeverity;
  enabled: boolean;
  conditions: string;
  created_at: string;
  last_triggered?: string;
  trigger_count: number;
}

// Settings Types
export interface RiskThresholds {
  critical_threshold: number;
  high_threshold: number;
  medium_threshold: number;
  auto_approve_threshold: number;
}

export interface CostMatrix {
  true_positive_reward: number;
  true_negative_reward: number;
  false_positive_penalty: number;
  false_negative_penalty: number;
}

export interface AgentTemperature {
  orchestrator: number;
  analyzer: number;
  explainer: number;
  detector: number;
}

export interface AgentMaxTokens {
  orchestrator: number;
  analyzer: number;
  explainer: number;
  detector: number;
}

export interface RLParameters {
  learning_rate: number;
  gamma: number;
  entropy_coefficient: number;
  embedding_dimension: number;
  batch_size: number;
  epochs_per_update: number;
}

export interface ModelSettings {
  primary_model: string;
  vision_model: string;
  embedding_model: string;
  temperatures: AgentTemperature;
  max_tokens: AgentMaxTokens;
  rl_parameters: RLParameters;
}

export interface FraudPattern {
  id: string;
  name: string;
  description: string;
  indicators: string[];
  risk_weight: number;
  enabled: boolean;
}

export interface FraudPatternsConfig {
  patterns: FraudPattern[];
}

export interface AgentWeight {
  name: string;
  display_name: string;
  weight: number;
  enabled: boolean;
  description: string;
}

export interface AgentsConfig {
  default_workflow: string;
  parallel_execution: boolean;
  llm_enabled: boolean;
  rl_enabled: boolean;
  xai_enabled: boolean;
  batch_processing_enabled: boolean;
  agent_weights: AgentWeight[];
}

export interface FeatureItem {
  name: string;
  display_name: string;
  category: string;
  enabled: boolean;
  importance_weight: number;
}

export interface FeaturesConfig {
  structured_features: FeatureItem[];
  graph_features: FeatureItem[];
  document_features: FeatureItem[];
}

export interface AlertRuleConfig {
  risk_level: string;
  queue_name: string | null;
  sla_hours: number | null;
  auto_escalate: boolean;
  notification_channels: string[];
  action: string;
}

export interface AlertRulesConfig {
  rules: AlertRuleConfig[];
  webhook_url: string | null;
  slack_webhook_url: string | null;
  email_recipients: string[];
}

export interface IntegrationConfig {
  name: string;
  display_name: string;
  url: string;
  api_key: string | null;
  enabled: boolean;
  last_health_check: string | null;
  health_status: string | null;
  category: string;
}

export interface IntegrationsConfig {
  apis: IntegrationConfig[];
  databases: IntegrationConfig[];
  mcp_servers: IntegrationConfig[];
}

export interface RetentionPolicy {
  data_type: string;
  display_name: string;
  retention_days: number;
  anonymize_after_days: number | null;
}

export interface AnonymizationField {
  field_name: string;
  display_name: string;
  enabled: boolean;
}

export interface RetentionConfig {
  policies: RetentionPolicy[];
  anonymization_enabled: boolean;
  anonymization_fields: AnonymizationField[];
  gdpr_export_format: string;
  erasure_request_days: number;
}

export interface SystemSettings {
  maintenance_mode: boolean;
  maintenance_message: string;
  debug_mode: boolean;
  log_level: string;
  api_version: string;
  frontend_version: string;
}

export interface AllSettings {
  version: string;
  updated_at: string | null;
  updated_by: string | null;
  risk_thresholds: RiskThresholds;
  cost_matrix: CostMatrix;
  models: ModelSettings;
  fraud_patterns: FraudPatternsConfig;
  agents: AgentsConfig;
  features: FeaturesConfig;
  alert_rules: AlertRulesConfig;
  integrations: IntegrationsConfig;
  retention: RetentionConfig;
  system: SystemSettings;
}

export interface SettingsUpdateRequest {
  risk_thresholds?: RiskThresholds;
  cost_matrix?: CostMatrix;
  models?: ModelSettings;
  fraud_patterns?: FraudPatternsConfig;
  agents?: AgentsConfig;
  features?: FeaturesConfig;
  alert_rules?: AlertRulesConfig;
  integrations?: IntegrationsConfig;
  retention?: RetentionConfig;
  system?: SystemSettings;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ConnectionTestResult {
  service_name: string;
  success: boolean;
  latency_ms: number | null;
  error_message: string | null;
  tested_at: string;
}

export interface SettingsAuditLog {
  id: string;
  timestamp: string;
  user_id: string | null;
  user_email: string | null;
  setting_type: string;
  setting_key: string | null;
  old_value: unknown;
  new_value: unknown;
  ip_address: string | null;
  action: string;
}

export const api = new ApiClient(API_BASE_URL);
export default api;
