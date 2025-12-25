'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import {
  getCacheConfig,
  CACHE_TIERS,
  DATA_CLASSIFICATION,
  matchQueryKey,
} from '@/lib/cache-strategy';

/**
 * FraudShield AI - Query Client Provider
 *
 * CRITICAL: This configuration affects data freshness for fraud detection.
 *
 * Cache Strategy:
 * - REALTIME data (alerts, transactions): Short cache, frequent refresh
 * - VOLATILE data (status, metrics): Medium cache
 * - AGGREGATE data (analytics): Longer cache
 * - STATIC data (config): Very long cache
 *
 * See: lib/cache-strategy.ts for detailed classification
 */

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Default to VOLATILE tier for unknown queries
        staleTime: CACHE_TIERS.volatile.staleTime,
        gcTime: CACHE_TIERS.volatile.cacheTime,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: 2,

        // Network mode: always try server first
        networkMode: 'offlineFirst',

        // Don't refetch on mount if data is fresh
        refetchOnMount: true,
      },
      mutations: {
        // Mutations should always retry on failure
        retry: 1,
        networkMode: 'always',
      },
    },
  });
}

export function Providers({ children }: { children: ReactNode }) {
  // Create QueryClient only once per app lifecycle
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

/**
 * Hook to get the query client for manual cache operations
 *
 * Use sparingly - prefer React Query's built-in invalidation
 */
export { useQueryClient } from '@tanstack/react-query';
