'use client';

import { useSystemStatus } from '@/hooks/useApi';
import {
  ServerIcon,
  ClockIcon,
  CpuChipIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}j ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function SystemStatusCard() {
  const { data, isLoading, error } = useSystemStatus();

  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  const isHealthy = data?.status === 'running' || data?.status === 'healthy';
  const mockData = {
    status: 'running',
    uptime_seconds: 86400,
    agents: { total: 7, active: 6, healthy: 6 },
    rl_training: { status: 'idle', last_trained: new Date().toISOString() },
    settings: { model: 'gemini-flash-latest', workflows: ['quick', 'standard', 'investigation', 'batch'] }
  };

  const status = data || mockData;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={clsx(
            'p-2 rounded-lg',
            isHealthy ? 'bg-green-100' : 'bg-red-100'
          )}>
            <ServerIcon className={clsx(
              'h-6 w-6',
              isHealthy ? 'text-green-600' : 'text-red-600'
            )} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Statut Systeme</h3>
            <p className="text-sm text-gray-500">Etat global de la plateforme</p>
          </div>
        </div>
        <div className={clsx(
          'flex items-center px-3 py-1 rounded-full text-sm font-medium',
          isHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        )}>
          {isHealthy ? (
            <CheckCircleIcon className="h-4 w-4 mr-1" />
          ) : (
            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
          )}
          {status.status}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center text-gray-500 text-xs font-medium uppercase mb-1">
            <ClockIcon className="h-4 w-4 mr-1" />
            Uptime
          </div>
          <p className="text-lg font-bold text-gray-900">
            {formatUptime(status.uptime_seconds)}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center text-gray-500 text-xs font-medium uppercase mb-1">
            <CpuChipIcon className="h-4 w-4 mr-1" />
            Agents
          </div>
          <p className="text-lg font-bold text-gray-900">
            {status.agents?.active || 0}/{status.agents?.total || 0}
          </p>
          <p className="text-xs text-gray-500">
            {status.agents?.healthy || 0} sains
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-gray-500 text-xs font-medium uppercase mb-1">
            Entrainement RL
          </div>
          <p className={clsx(
            'text-lg font-bold',
            status.rl_training?.status === 'training' ? 'text-blue-600' : 'text-gray-900'
          )}>
            {status.rl_training?.status || 'N/A'}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-gray-500 text-xs font-medium uppercase mb-1">
            Modele
          </div>
          <p className="text-sm font-medium text-gray-900 truncate">
            {status.settings?.model || 'N/A'}
          </p>
        </div>
      </div>

      {status.settings?.workflows && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">Workflows disponibles</p>
          <div className="flex flex-wrap gap-2">
            {status.settings.workflows.map((workflow: string) => (
              <span
                key={workflow}
                className="px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-lg"
              >
                {workflow}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
