/**
 * FraudShield AI - Intelligent Caching Strategy
 *
 * CRITICAL: This file defines caching rules for a fraud detection system.
 * Incorrect caching can lead to:
 * - Missed fraud (stale alert data)
 * - False approvals (outdated transaction status)
 * - Regulatory violations (inconsistent audit data)
 *
 * Cache Tiers:
 * 1. STATIC - Configuration, rarely changes (5-10 min)
 * 2. AGGREGATE - Analytics, statistics (2-5 min)
 * 3. VOLATILE - Status, metrics (30-60 sec)
 * 4. REALTIME - Critical business data (no cache / very short)
 * 5. NOCACHE - Mutations, decisions (never cache)
 */

export type CacheTier = 'static' | 'aggregate' | 'volatile' | 'realtime' | 'nocache';

export interface CacheConfig {
  staleTime: number;      // Time before data is considered stale (ms)
  cacheTime: number;      // Time to keep in cache after unmount (ms)
  refetchInterval: number | false;  // Auto-refresh interval (ms) or false
  refetchOnWindowFocus: boolean;
  refetchOnReconnect: boolean;
  retry: number | boolean;
}

/**
 * Cache configurations by tier
 *
 * IMPORTANT: These values are carefully chosen for fraud detection.
 * Do NOT reduce staleTime or increase refetchInterval without
 * understanding the business implications.
 */
export const CACHE_TIERS: Record<CacheTier, CacheConfig> = {
  /**
   * STATIC - Configuration data that rarely changes
   * Examples: Agent config, model architecture, fraud patterns
   *
   * Safe to cache for extended periods.
   * Changes require explicit action (retraining, config update).
   */
  static: {
    staleTime: 5 * 60 * 1000,      // Fresh for 5 minutes
    cacheTime: 30 * 60 * 1000,     // Keep in cache 30 minutes
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 3,
  },

  /**
   * AGGREGATE - Historical/aggregate data
   * Examples: Analytics, statistics, trends, rankings
   *
   * Data is computed from historical records.
   * Small delays acceptable, but should refresh periodically.
   */
  aggregate: {
    staleTime: 2 * 60 * 1000,      // Fresh for 2 minutes
    cacheTime: 10 * 60 * 1000,     // Keep in cache 10 minutes
    refetchInterval: 3 * 60 * 1000, // Refresh every 3 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
  },

  /**
   * VOLATILE - Status and metrics data
   * Examples: System status, agent health, A2A messages
   *
   * Changes frequently but not critical for decisions.
   * User expects relatively fresh data.
   */
  volatile: {
    staleTime: 30 * 1000,          // Fresh for 30 seconds
    cacheTime: 5 * 60 * 1000,      // Keep in cache 5 minutes
    refetchInterval: 60 * 1000,    // Refresh every 1 minute
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
  },

  /**
   * REALTIME - Critical business data
   * Examples: Active alerts, pending transactions, investigations
   *
   * CRITICAL: This data affects fraud decisions.
   * Must be fresh but can tolerate brief staleness.
   * Always refetch on window focus for active monitoring.
   */
  realtime: {
    staleTime: 10 * 1000,          // Fresh for 10 seconds only
    cacheTime: 2 * 60 * 1000,      // Keep in cache 2 minutes
    refetchInterval: 30 * 1000,    // Refresh every 30 seconds
    refetchOnWindowFocus: true,    // IMPORTANT: Refetch when user returns
    refetchOnReconnect: true,
    retry: 1,                      // Fail fast on errors
  },

  /**
   * NOCACHE - Mutation results, one-time data
   * Examples: Transaction analysis, fraud decisions, exports
   *
   * Never cache. Each request must hit the server.
   * Used for operations, not queries.
   */
  nocache: {
    staleTime: 0,
    cacheTime: 0,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  },
};

/**
 * Data classification for FraudShield
 *
 * Maps query keys to their appropriate cache tier.
 * REVIEW CAREFULLY when adding new data types.
 */
export const DATA_CLASSIFICATION: Record<string, CacheTier> = {
  // STATIC - Safe to cache long-term
  'agent-config': 'static',
  'model-info': 'static',
  'mcp-servers': 'static',
  'fraud-patterns': 'static',

  // AGGREGATE - Historical/computed data
  'analytics-dashboard': 'aggregate',
  'fraud-statistics': 'aggregate',
  'fraud-trends': 'aggregate',
  'fraud-type-distribution': 'aggregate',
  'provider-risk-ranking': 'aggregate',
  'beneficiary-risk-ranking': 'aggregate',
  'model-performance': 'aggregate',
  'risk-distribution': 'aggregate',

  // VOLATILE - Frequently changing status
  'system-status': 'volatile',
  'agents-list': 'volatile',
  'agent-metrics': 'volatile',
  'a2a-status': 'volatile',
  'health': 'volatile',
  'training-status': 'volatile',

  // REALTIME - Critical business data
  'alerts': 'realtime',
  'alert': 'realtime',
  'alert-stats': 'realtime',
  'transactions': 'realtime',
  'transaction': 'realtime',
  'investigations': 'realtime',
  'investigation': 'realtime',
  'dashboard-stats': 'realtime',  // Contains active fraud counts

  // Individual lookups - realtime for consistency
  'document': 'realtime',
};

/**
 * Get cache configuration for a query key
 */
export function getCacheConfig(queryKey: string | string[]): CacheConfig {
  const key = Array.isArray(queryKey) ? queryKey[0] : queryKey;
  const tier = DATA_CLASSIFICATION[key] || 'volatile';
  return CACHE_TIERS[tier];
}

/**
 * Check if data should be invalidated after a mutation
 *
 * CRITICAL: Defines which queries to invalidate when data changes.
 * Missing invalidation = stale data = potential fraud missed.
 */
export const MUTATION_INVALIDATIONS: Record<string, string[]> = {
  // When alert status changes, refresh all alert-related data
  'update-alert-status': [
    'alerts',
    'alert-stats',
    'dashboard-stats',
    'investigations',
  ],

  // When investigation starts, refresh investigation and alert data
  'start-investigation': [
    'investigations',
    'alerts',
    'alert-stats',
  ],

  // When transaction is analyzed, refresh transaction lists
  'analyze-transaction': [
    'transactions',
    'dashboard-stats',
    'alerts',        // New fraud may create alerts
    'alert-stats',
  ],

  // When batch analysis completes
  'analyze-batch': [
    'transactions',
    'dashboard-stats',
    'alerts',
    'alert-stats',
    'fraud-statistics',
  ],

  // When model is trained
  'trigger-training': [
    'model-info',
    'training-status',
    'system-status',
    'model-performance',
  ],

  // When alert comment is added
  'add-alert-comment': [
    'alerts',
    'alert',
  ],

  // When investigation is created from alert
  'create-investigation-from-alert': [
    'alerts',
    'alert-stats',
    'investigations',
  ],
};

/**
 * Queries that should NEVER be served from cache
 * These always fetch fresh data from server
 */
export const ALWAYS_FRESH_QUERIES = [
  // Fraud decision endpoints - critical
  'analyze-transaction',
  'analyze-batch',

  // Export operations
  'export-report',

  // Real-time verification
  'verify-identity',
  'analyze-network',
];

/**
 * Create query options from cache tier
 */
export function createQueryOptions(tier: CacheTier) {
  const config = CACHE_TIERS[tier];
  return {
    staleTime: config.staleTime,
    gcTime: config.cacheTime, // gcTime is the new name for cacheTime in React Query v5
    refetchInterval: config.refetchInterval,
    refetchOnWindowFocus: config.refetchOnWindowFocus,
    refetchOnReconnect: config.refetchOnReconnect,
    retry: config.retry,
  };
}

/**
 * Utility to check if a query key matches a pattern
 */
export function matchQueryKey(queryKey: unknown[], pattern: string): boolean {
  if (!Array.isArray(queryKey) || queryKey.length === 0) return false;
  return queryKey[0] === pattern;
}
