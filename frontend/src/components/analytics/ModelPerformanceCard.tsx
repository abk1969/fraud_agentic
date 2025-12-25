'use client';

import { useModelPerformance, useTrainingStatus } from '@/hooks/useApi';
import { clsx } from 'clsx';
import {
  CpuChipIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface ModelPerformanceCardProps {
  period: string;
}

export function ModelPerformanceCard({ period }: ModelPerformanceCardProps) {
  const { data: performance, isLoading: perfLoading } = useModelPerformance(period);
  const { data: training, isLoading: trainLoading } = useTrainingStatus();

  const isLoading = perfLoading || trainLoading;

  // Mock data for demo
  const mockPerformance = {
    period: '30d',
    model: { type: 'A2C', version: '1.2.0' },
    performance: { precision: 0.87, recall: 0.94, f1_score: 0.90, auc_roc: 0.92 },
    cost_analysis: {
      true_positives: 456,
      true_negatives: 8234,
      false_positives: 68,
      false_negatives: 24,
      total_reward: 4520,
      average_reward: 0.51,
    },
    confusion_matrix: { tp: 456, tn: 8234, fp: 68, fn: 24 },
  };

  const mockTraining = {
    status: 'idle' as const,
    last_trained: '2024-12-23T18:30:00Z',
    next_scheduled: '2024-12-30T18:30:00Z',
    experience_buffer_size: 15420,
  };

  const perf = performance || mockPerformance;
  const train = training || mockTraining;

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'training': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'training': return ArrowPathIcon;
      case 'completed': return CheckCircleIcon;
      case 'failed': return ExclamationCircleIcon;
      default: return ClockIcon;
    }
  };

  const StatusIcon = getStatusIcon(train.status);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <CpuChipIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Performance du modele</h3>
            <p className="text-sm text-gray-500">{perf.model.type} v{perf.model.version}</p>
          </div>
        </div>
        <span className={clsx(
          'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
          getStatusColor(train.status)
        )}>
          <StatusIcon className={clsx('h-4 w-4 mr-1.5', train.status === 'training' && 'animate-spin')} />
          {train.status === 'idle' ? 'Pret' :
           train.status === 'training' ? 'Entrainement...' :
           train.status === 'completed' ? 'Termine' : 'Erreur'}
        </span>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-600 font-medium">Precision</p>
          <p className="text-2xl font-bold text-blue-700">{(perf.performance.precision * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-600 font-medium">Recall</p>
          <p className="text-2xl font-bold text-green-700">{(perf.performance.recall * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-purple-600 font-medium">F1-Score</p>
          <p className="text-2xl font-bold text-purple-700">{(perf.performance.f1_score * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-indigo-600 font-medium">AUC-ROC</p>
          <p className="text-2xl font-bold text-indigo-700">{(perf.performance.auc_roc * 100).toFixed(1)}%</p>
        </div>
      </div>

      {/* Confusion Matrix */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Matrice de confusion</h4>
        <div className="grid grid-cols-2 gap-2 max-w-sm">
          <div className="bg-green-100 rounded-lg p-3 text-center">
            <p className="text-xs text-green-600">Vrais Positifs</p>
            <p className="text-xl font-bold text-green-700">{perf.cost_analysis.true_positives}</p>
          </div>
          <div className="bg-red-100 rounded-lg p-3 text-center">
            <p className="text-xs text-red-600">Faux Positifs</p>
            <p className="text-xl font-bold text-red-700">{perf.cost_analysis.false_positives}</p>
          </div>
          <div className="bg-orange-100 rounded-lg p-3 text-center">
            <p className="text-xs text-orange-600">Faux Negatifs</p>
            <p className="text-xl font-bold text-orange-700">{perf.cost_analysis.false_negatives}</p>
          </div>
          <div className="bg-blue-100 rounded-lg p-3 text-center">
            <p className="text-xs text-blue-600">Vrais Negatifs</p>
            <p className="text-xl font-bold text-blue-700">{perf.cost_analysis.true_negatives}</p>
          </div>
        </div>
      </div>

      {/* Cost Analysis */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <ChartBarIcon className="h-4 w-4 mr-2" />
          Analyse des couts (Reward RL)
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Reward total</p>
            <p className="text-lg font-semibold text-green-600">+{perf.cost_analysis.total_reward.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Reward moyen</p>
            <p className="text-lg font-semibold text-gray-900">{perf.cost_analysis.average_reward.toFixed(2)}/txn</p>
          </div>
        </div>
      </div>

      {/* Training Info */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Dernier entrainement</p>
            <p className="font-medium text-gray-900">
              {train.last_trained ? new Date(train.last_trained).toLocaleDateString('fr-FR') : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Prochain planifie</p>
            <p className="font-medium text-gray-900">
              {train.next_scheduled ? new Date(train.next_scheduled).toLocaleDateString('fr-FR') : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Buffer experience</p>
            <p className="font-medium text-gray-900">
              {train.experience_buffer_size?.toLocaleString() || 0} samples
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
