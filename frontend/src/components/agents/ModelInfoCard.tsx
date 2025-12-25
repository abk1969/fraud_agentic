'use client';

import { useModelInfo, useTriggerTraining } from '@/hooks/useApi';
import {
  SparklesIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

export function ModelInfoCard() {
  const { data, isLoading } = useModelInfo();
  const { mutate: triggerTraining, isPending: isTraining } = useTriggerTraining();

  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    );
  }

  const mockData = {
    model_name: 'gemini-flash-latest',
    model_version: '2.0',
    embedding_model: 'text-embedding-004',
    embedding_dimension: 768,
    rl_policy: 'A2C',
    rl_training_status: 'idle',
    last_training: new Date(Date.now() - 86400000).toISOString(),
    performance_metrics: {
      precision: 0.85,
      recall: 0.96,
      f1_score: 0.90,
      false_positive_rate: 0.08,
    },
  };

  const info = data || mockData;
  const metrics = info.performance_metrics;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-purple-100">
            <SparklesIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Modele LLM + RL</h3>
            <p className="text-sm text-gray-500">Architecture hybride</p>
          </div>
        </div>
        <button
          onClick={() => triggerTraining()}
          disabled={isTraining || info.rl_training_status === 'training'}
          className={clsx(
            'flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            isTraining || info.rl_training_status === 'training'
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
          )}
        >
          <ArrowPathIcon className={clsx('h-4 w-4 mr-1', isTraining && 'animate-spin')} />
          {isTraining ? 'Entrainement...' : 'Entrainer'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase font-medium mb-1">Modele LLM</p>
          <p className="text-sm font-semibold text-gray-900">{info.model_name}</p>
          <p className="text-xs text-gray-500">v{info.model_version}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase font-medium mb-1">Embeddings</p>
          <p className="text-sm font-semibold text-gray-900">{info.embedding_model}</p>
          <p className="text-xs text-gray-500">{info.embedding_dimension}d</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase font-medium mb-1">Politique RL</p>
          <p className="text-sm font-semibold text-gray-900">{info.rl_policy}</p>
          <p className="text-xs text-gray-500">
            <span className={clsx(
              info.rl_training_status === 'training' ? 'text-blue-600' : 'text-gray-500'
            )}>
              {info.rl_training_status}
            </span>
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center text-xs text-gray-500 uppercase font-medium mb-1">
            <ClockIcon className="h-3 w-3 mr-1" />
            Dernier entrainement
          </div>
          <p className="text-sm font-semibold text-gray-900">{formatDate(info.last_training)}</p>
        </div>
      </div>

      {metrics && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center mb-3">
            <ChartBarIcon className="h-4 w-4 text-gray-500 mr-2" />
            <p className="text-xs font-medium text-gray-500 uppercase">Performance du modele</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">
                {((metrics.precision || 0) * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500">Precision</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">
                {((metrics.recall || 0) * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500">Rappel</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">
                {((metrics.f1_score || 0) * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500">F1-Score</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-red-600">
                {((metrics.false_positive_rate || 0) * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500">Faux Positifs</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
