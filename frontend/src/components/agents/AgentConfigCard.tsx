'use client';

import { useAgentConfig } from '@/hooks/useApi';
import {
  Cog6ToothIcon,
  ScaleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  MinusCircleIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

export function AgentConfigCard() {
  const { data, isLoading } = useAgentConfig();

  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    );
  }

  const mockData = {
    cost_matrix: {
      true_positive: 10,
      true_negative: 1,
      false_positive: -5,
      false_negative: -50,
    },
    thresholds: {
      fraud_threshold: 0.7,
      alert_threshold: 0.5,
      auto_approve_threshold: 0.2,
    },
    features: {
      llm_enabled: true,
      rl_enabled: true,
      xai_enabled: true,
      batch_processing: true,
    },
  };

  const config = data || mockData;

  const rewardColors: Record<string, string> = {
    true_positive: 'text-green-600 bg-green-50',
    true_negative: 'text-blue-600 bg-blue-50',
    false_positive: 'text-orange-600 bg-orange-50',
    false_negative: 'text-red-600 bg-red-50',
  };

  const rewardLabels: Record<string, string> = {
    true_positive: 'Vrai Positif',
    true_negative: 'Vrai Negatif',
    false_positive: 'Faux Positif',
    false_negative: 'Faux Negatif',
  };

  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 rounded-lg bg-orange-100">
          <Cog6ToothIcon className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Configuration</h3>
          <p className="text-sm text-gray-500">Parametres du systeme</p>
        </div>
      </div>

      {/* Cost Matrix */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <ScaleIcon className="h-4 w-4 text-gray-500 mr-2" />
          <p className="text-xs font-medium text-gray-500 uppercase">Matrice de couts (Recompenses RL)</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(config.cost_matrix || {}).map(([key, value]) => (
            <div
              key={key}
              className={clsx(
                'p-2 rounded-lg flex items-center justify-between',
                rewardColors[key] || 'bg-gray-50 text-gray-600'
              )}
            >
              <span className="text-xs font-medium">{rewardLabels[key] || key}</span>
              <span className="text-sm font-bold">
                {(value as number) >= 0 ? '+' : ''}{value as number}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Thresholds */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <ExclamationTriangleIcon className="h-4 w-4 text-gray-500 mr-2" />
          <p className="text-xs font-medium text-gray-500 uppercase">Seuils de decision</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Seuil fraude</span>
            <div className="flex items-center">
              <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                <div
                  className="h-2 bg-red-500 rounded-full"
                  style={{ width: `${(config.thresholds?.fraud_threshold || 0) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900">
                {((config.thresholds?.fraud_threshold || 0) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Seuil alerte</span>
            <div className="flex items-center">
              <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                <div
                  className="h-2 bg-orange-500 rounded-full"
                  style={{ width: `${(config.thresholds?.alert_threshold || 0) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900">
                {((config.thresholds?.alert_threshold || 0) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Auto-approbation</span>
            <div className="flex items-center">
              <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                <div
                  className="h-2 bg-green-500 rounded-full"
                  style={{ width: `${(config.thresholds?.auto_approve_threshold || 0) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900">
                {((config.thresholds?.auto_approve_threshold || 0) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase mb-2">Fonctionnalites actives</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(config.features || {}).map(([key, enabled]) => (
            <span
              key={key}
              className={clsx(
                'flex items-center px-2 py-1 rounded-lg text-xs font-medium',
                enabled ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
              )}
            >
              {enabled ? (
                <CheckCircleIcon className="h-3 w-3 mr-1" />
              ) : (
                <MinusCircleIcon className="h-3 w-3 mr-1" />
              )}
              {key.replace(/_/g, ' ').toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
