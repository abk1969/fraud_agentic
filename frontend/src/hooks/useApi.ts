'use client';

/**
 * FraudShield AI - API Hooks with Intelligent Caching
 *
 * CRITICAL: Cache strategy is designed for fraud detection requirements.
 *
 * Data Classification:
 * - REALTIME: Alerts, Transactions, Investigations (critical for fraud detection)
 * - VOLATILE: System status, Agent health (important but not critical)
 * - AGGREGATE: Analytics, Statistics (historical, can be stale)
 * - STATIC: Configuration (rarely changes)
 *
 * See: lib/cache-strategy.ts for full configuration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, {
  TransactionRequest,
  FraudDecisionResponse,
  TransactionListParams,
  InvestigationListParams,
  AlertListParams,
  AlertActionType,
  ExportReportRequest,
} from '@/lib/api';
import {
  createQueryOptions,
  MUTATION_INVALIDATIONS,
} from '@/lib/cache-strategy';

// ============================================================================
// CACHE TIER CONFIGURATIONS
// ============================================================================

/**
 * REALTIME - Critical business data
 * Short cache, frequent refresh, refetch on window focus
 * Used for: Alerts, Transactions, Investigations, Dashboard
 */
const REALTIME_OPTIONS = {
  staleTime: 10 * 1000,           // Fresh for 10 seconds
  gcTime: 2 * 60 * 1000,          // Keep 2 minutes
  refetchInterval: 30 * 1000,     // Refresh every 30 seconds
  refetchOnWindowFocus: true,     // CRITICAL: Refetch when user returns
  refetchOnReconnect: true,
  retry: 1,
};

/**
 * VOLATILE - Status and metrics
 * Medium cache, periodic refresh
 * Used for: System status, Agent health, A2A status
 */
const VOLATILE_OPTIONS = {
  staleTime: 30 * 1000,           // Fresh for 30 seconds
  gcTime: 5 * 60 * 1000,          // Keep 5 minutes
  refetchInterval: 60 * 1000,     // Refresh every 1 minute
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  retry: 2,
};

/**
 * AGGREGATE - Historical/computed data
 * Longer cache, less frequent refresh
 * Used for: Analytics, Statistics, Trends
 */
const AGGREGATE_OPTIONS = {
  staleTime: 2 * 60 * 1000,       // Fresh for 2 minutes
  gcTime: 10 * 60 * 1000,         // Keep 10 minutes
  refetchInterval: 3 * 60 * 1000, // Refresh every 3 minutes
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  retry: 2,
};

/**
 * STATIC - Configuration data
 * Long cache, rare refresh
 * Used for: Agent config, Model info, MCP servers
 */
const STATIC_OPTIONS = {
  staleTime: 5 * 60 * 1000,       // Fresh for 5 minutes
  gcTime: 30 * 60 * 1000,         // Keep 30 minutes
  refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  retry: 3,
};

// ============================================================================
// DASHBOARD HOOKS - REALTIME (Critical for fraud monitoring)
// ============================================================================

/**
 * Dashboard statistics including active fraud counts
 * REALTIME: Must be fresh for fraud monitoring
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.getDashboardStats(),
    ...REALTIME_OPTIONS,
  });
}

/**
 * Fraud trends over time
 * AGGREGATE: Historical data
 */
export function useFraudTrends(days = 30) {
  return useQuery({
    queryKey: ['fraud-trends', days],
    queryFn: () => api.getFraudTrends(days),
    ...AGGREGATE_OPTIONS,
    refetchInterval: false, // Trends don't change frequently
  });
}

/**
 * Risk distribution
 * AGGREGATE: Computed statistics
 */
export function useRiskDistribution() {
  return useQuery({
    queryKey: ['risk-distribution'],
    queryFn: () => api.getRiskDistribution(),
    ...AGGREGATE_OPTIONS,
  });
}

/**
 * Agent performance metrics for dashboard
 * VOLATILE: Status data
 */
export function useAgentMetrics() {
  return useQuery({
    queryKey: ['agent-metrics'],
    queryFn: () => api.getAgentMetrics(),
    ...VOLATILE_OPTIONS,
  });
}

// ============================================================================
// TRANSACTION HOOKS - REALTIME (Critical for fraud detection)
// ============================================================================

/**
 * Transaction list
 * REALTIME: Transactions need fresh data for fraud decisions
 */
export function useTransactions(params?: TransactionListParams) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => api.getTransactions(params),
    ...REALTIME_OPTIONS,
  });
}

/**
 * Single transaction details
 * REALTIME: Individual transaction data must be current
 */
export function useTransaction(transactionId: string) {
  return useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => api.getTransaction(transactionId),
    enabled: !!transactionId,
    ...REALTIME_OPTIONS,
    refetchInterval: false, // Don't auto-refresh single items
  });
}

/**
 * Analyze transaction for fraud
 * MUTATION: Never cached, always fresh analysis
 */
export function useAnalyzeTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TransactionRequest) => api.analyzeTransaction(data),
    onSuccess: () => {
      // CRITICAL: Invalidate all related data after fraud analysis
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-stats'] });
    },
  });
}

/**
 * Batch transaction analysis
 * MUTATION: Never cached
 */
export function useAnalyzeBatchTransactions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactions: TransactionRequest[]) => api.analyzeBatchTransactions(transactions),
    onSuccess: () => {
      // Invalidate all transaction and alert data
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-stats'] });
      queryClient.invalidateQueries({ queryKey: ['fraud-statistics'] });
    },
  });
}

// ============================================================================
// DOCUMENT HOOKS
// ============================================================================

/**
 * Analyze document
 * MUTATION: Always fresh analysis
 */
export function useAnalyzeDocument() {
  return useMutation({
    mutationFn: ({ file, transactionId }: { file: File; transactionId?: string }) =>
      api.analyzeDocument(file, transactionId),
  });
}

/**
 * Document analysis results
 * REALTIME: Document status affects fraud decisions
 */
export function useDocumentAnalysis(documentId: string) {
  return useQuery({
    queryKey: ['document', documentId],
    queryFn: () => api.getDocumentAnalysis(documentId),
    enabled: !!documentId,
    ...REALTIME_OPTIONS,
    refetchInterval: false,
  });
}

// ============================================================================
// INVESTIGATION HOOKS - REALTIME (Critical for fraud workflow)
// ============================================================================

/**
 * Investigation list
 * REALTIME: Active investigations need current status
 */
export function useInvestigations(params?: InvestigationListParams) {
  return useQuery({
    queryKey: ['investigations', params],
    queryFn: () => api.getInvestigations(params),
    ...REALTIME_OPTIONS,
  });
}

/**
 * Single investigation
 * REALTIME: Investigation details must be current
 */
export function useInvestigation(investigationId: string) {
  return useQuery({
    queryKey: ['investigation', investigationId],
    queryFn: () => api.getInvestigation(investigationId),
    enabled: !!investigationId,
    ...REALTIME_OPTIONS,
    refetchInterval: false,
  });
}

/**
 * Start investigation
 * MUTATION: Triggers workflow change
 */
export function useStartInvestigation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ transactionId, reason }: { transactionId: string; reason?: string }) =>
      api.startInvestigation(transactionId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investigations'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-stats'] });
    },
  });
}

/**
 * Network analysis
 * MUTATION: Always fresh analysis
 */
export function useNetworkAnalysis() {
  return useMutation({
    mutationFn: (entityId: string) => api.analyzeNetwork(entityId),
  });
}

// ============================================================================
// AGENT HOOKS - VOLATILE (Status monitoring)
// ============================================================================

/**
 * System status
 * VOLATILE: Important for monitoring but not critical for decisions
 */
export function useSystemStatus() {
  return useQuery({
    queryKey: ['system-status'],
    queryFn: () => api.getSystemStatus(),
    ...VOLATILE_OPTIONS,
  });
}

/**
 * List of agents
 * VOLATILE: Agent status for monitoring
 */
export function useAgentsList() {
  return useQuery({
    queryKey: ['agents-list'],
    queryFn: () => api.getAgentsList(),
    ...VOLATILE_OPTIONS,
  });
}

/**
 * Agent details
 * VOLATILE: Individual agent status
 */
export function useAgentDetails(agentId: string) {
  return useQuery({
    queryKey: ['agent', agentId],
    queryFn: () => api.getAgentDetails(agentId),
    enabled: !!agentId,
    ...VOLATILE_OPTIONS,
    refetchInterval: false,
  });
}

/**
 * Model information
 * STATIC: Only changes on training
 */
export function useModelInfo() {
  return useQuery({
    queryKey: ['model-info'],
    queryFn: () => api.getModelInfo(),
    ...STATIC_OPTIONS,
  });
}

/**
 * Trigger model training
 * MUTATION: Important state change
 */
export function useTriggerTraining() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.triggerModelTraining(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['model-info'] });
      queryClient.invalidateQueries({ queryKey: ['training-status'] });
      queryClient.invalidateQueries({ queryKey: ['system-status'] });
      queryClient.invalidateQueries({ queryKey: ['model-performance'] });
    },
  });
}

/**
 * Agent configuration
 * STATIC: Configuration rarely changes
 */
export function useAgentConfig() {
  return useQuery({
    queryKey: ['agent-config'],
    queryFn: () => api.getAgentConfig(),
    ...STATIC_OPTIONS,
    refetchInterval: false, // Config doesn't auto-refresh
  });
}

/**
 * MCP servers status
 * STATIC: Infrastructure rarely changes
 */
export function useMcpServers() {
  return useQuery({
    queryKey: ['mcp-servers'],
    queryFn: () => api.getMcpServers(),
    ...STATIC_OPTIONS,
  });
}

/**
 * A2A protocol status
 * VOLATILE: Communication status
 */
export function useA2AStatus() {
  return useQuery({
    queryKey: ['a2a-status'],
    queryFn: () => api.getA2AStatus(),
    ...VOLATILE_OPTIONS,
  });
}

/**
 * Health check
 * VOLATILE: System health monitoring
 */
export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => api.checkHealth(),
    ...VOLATILE_OPTIONS,
  });
}

// ============================================================================
// ALERT HOOKS - REALTIME (Critical for fraud response)
// ============================================================================

/**
 * Alert list
 * REALTIME: CRITICAL - Alerts require immediate attention
 */
export function useAlerts(params?: AlertListParams) {
  return useQuery({
    queryKey: ['alerts', params],
    queryFn: () => api.getAlerts(params),
    ...REALTIME_OPTIONS,
  });
}

/**
 * Single alert
 * REALTIME: Alert details must be current
 */
export function useAlert(alertId: string) {
  return useQuery({
    queryKey: ['alert', alertId],
    queryFn: () => api.getAlert(alertId),
    enabled: !!alertId,
    ...REALTIME_OPTIONS,
    refetchInterval: false,
  });
}

/**
 * Alert statistics
 * REALTIME: Counts of active alerts
 */
export function useAlertStats() {
  return useQuery({
    queryKey: ['alert-stats'],
    queryFn: () => api.getAlertStats(),
    ...REALTIME_OPTIONS,
  });
}

/**
 * Update alert status
 * MUTATION: CRITICAL - Changes fraud workflow state
 */
export function useUpdateAlertStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertId, action, comment }: { alertId: string; action: AlertActionType; comment?: string }) =>
      api.updateAlertStatus(alertId, action, comment),
    onSuccess: () => {
      // CRITICAL: Invalidate all alert-related data
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['investigations'] });
    },
  });
}

/**
 * Add comment to alert
 * MUTATION: Audit trail update
 */
export function useAddAlertComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertId, comment }: { alertId: string; comment: string }) =>
      api.addAlertComment(alertId, comment),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert', variables.alertId] });
    },
  });
}

/**
 * Create investigation from alert
 * MUTATION: Workflow state change
 */
export function useCreateInvestigationFromAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertId, reason }: { alertId: string; reason?: string }) =>
      api.createInvestigationFromAlert(alertId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-stats'] });
      queryClient.invalidateQueries({ queryKey: ['investigations'] });
    },
  });
}

// ============================================================================
// ANALYTICS HOOKS - AGGREGATE (Historical data)
// ============================================================================

/**
 * Analytics dashboard
 * AGGREGATE: Historical metrics
 */
export function useAnalyticsDashboard(period: string = '30d') {
  return useQuery({
    queryKey: ['analytics-dashboard', period],
    queryFn: () => api.getAnalyticsDashboard(period),
    ...AGGREGATE_OPTIONS,
  });
}

/**
 * Fraud statistics
 * AGGREGATE: Historical statistics
 */
export function useFraudStatistics(params?: { start_date?: string; end_date?: string; group_by?: string }) {
  return useQuery({
    queryKey: ['fraud-statistics', params],
    queryFn: () => api.getFraudStatistics(params),
    ...AGGREGATE_OPTIONS,
  });
}

/**
 * Fraud type distribution
 * AGGREGATE: Distribution analysis
 */
export function useFraudTypeDistribution(period: string = '30d') {
  return useQuery({
    queryKey: ['fraud-type-distribution', period],
    queryFn: () => api.getFraudTypeDistribution(period),
    ...AGGREGATE_OPTIONS,
  });
}

/**
 * Provider risk ranking
 * AGGREGATE: Risk analysis
 */
export function useProviderRiskRanking(limit: number = 20) {
  return useQuery({
    queryKey: ['provider-risk-ranking', limit],
    queryFn: () => api.getProviderRiskRanking(limit),
    ...AGGREGATE_OPTIONS,
  });
}

/**
 * Beneficiary risk ranking
 * AGGREGATE: Risk analysis
 */
export function useBeneficiaryRiskRanking(limit: number = 20) {
  return useQuery({
    queryKey: ['beneficiary-risk-ranking', limit],
    queryFn: () => api.getBeneficiaryRiskRanking(limit),
    ...AGGREGATE_OPTIONS,
  });
}

/**
 * Model performance metrics
 * AGGREGATE: Historical performance
 */
export function useModelPerformance(period: string = '30d') {
  return useQuery({
    queryKey: ['model-performance', period],
    queryFn: () => api.getModelPerformance(period),
    ...AGGREGATE_OPTIONS,
  });
}

/**
 * Training status
 * VOLATILE: Training process monitoring
 */
export function useTrainingStatus() {
  return useQuery({
    queryKey: ['training-status'],
    queryFn: () => api.getTrainingStatus(),
    ...VOLATILE_OPTIONS,
  });
}

/**
 * Export report
 * MUTATION: One-time operation, never cached
 */
export function useExportReport() {
  return useMutation({
    mutationFn: (request: ExportReportRequest) => api.exportReport(request),
  });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Force refresh all critical data
 * Use when user clicks "Actualiser" button
 */
export function useForceRefreshCriticalData() {
  const queryClient = useQueryClient();

  return () => {
    // Invalidate all REALTIME data
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
    queryClient.invalidateQueries({ queryKey: ['alert-stats'] });
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['investigations'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
  };
}

/**
 * Force refresh all data (including VOLATILE and AGGREGATE)
 * Use sparingly - only when user explicitly requests full refresh
 */
export function useForceRefreshAll() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries();
  };
}

// ============================================================================
// SETTINGS HOOKS - STATIC (Configuration data)
// ============================================================================

/**
 * All settings
 * STATIC: Configuration rarely changes
 */
export function useAllSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => api.getAllSettings(),
    ...STATIC_OPTIONS,
    refetchInterval: false,
  });
}

/**
 * Update settings
 * MUTATION: Configuration update
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (update: Parameters<typeof api.updateSettings>[0]) => api.updateSettings(update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      // Also invalidate agent config as it may be affected
      queryClient.invalidateQueries({ queryKey: ['agent-config'] });
    },
  });
}

/**
 * Validate settings before saving
 * MUTATION: Validation check
 */
export function useValidateSettings() {
  return useMutation({
    mutationFn: (update: Parameters<typeof api.validateSettings>[0]) => api.validateSettings(update),
  });
}

/**
 * Risk thresholds
 * STATIC: Configuration
 */
export function useRiskThresholds() {
  return useQuery({
    queryKey: ['settings', 'risk-thresholds'],
    queryFn: () => api.getRiskThresholds(),
    ...STATIC_OPTIONS,
    refetchInterval: false,
  });
}

/**
 * Update risk thresholds
 * MUTATION
 */
export function useUpdateRiskThresholds() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (thresholds: Parameters<typeof api.updateRiskThresholds>[0]) => api.updateRiskThresholds(thresholds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

/**
 * Cost matrix
 * STATIC: RL configuration
 */
export function useCostMatrix() {
  return useQuery({
    queryKey: ['settings', 'cost-matrix'],
    queryFn: () => api.getCostMatrix(),
    ...STATIC_OPTIONS,
    refetchInterval: false,
  });
}

/**
 * Update cost matrix
 * MUTATION
 */
export function useUpdateCostMatrix() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matrix: Parameters<typeof api.updateCostMatrix>[0]) => api.updateCostMatrix(matrix),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

/**
 * Test integration connection
 * MUTATION: One-time test
 */
export function useTestIntegrationConnection() {
  return useMutation({
    mutationFn: (serviceName: string) => api.testIntegrationConnection(serviceName),
  });
}

/**
 * Export settings to file
 * MUTATION: One-time operation
 */
export function useExportSettings() {
  return useMutation({
    mutationFn: async () => {
      const blob = await api.exportSettings();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fraudshield_settings_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
}

/**
 * Import settings from file
 * MUTATION: Configuration import
 */
export function useImportSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => api.importSettings(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['agent-config'] });
    },
  });
}

/**
 * Reset settings to defaults
 * MUTATION: Dangerous operation
 */
export function useResetSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.resetSettings(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['agent-config'] });
    },
  });
}

/**
 * Settings audit log
 * STATIC: Historical data
 */
export function useSettingsAuditLog(limit: number = 100, offset: number = 0) {
  return useQuery({
    queryKey: ['settings', 'audit-log', limit, offset],
    queryFn: () => api.getSettingsAuditLog(limit, offset),
    ...STATIC_OPTIONS,
  });
}

/**
 * Reload settings from file
 * MUTATION: Cache invalidation
 */
export function useReloadSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.reloadSettings(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
