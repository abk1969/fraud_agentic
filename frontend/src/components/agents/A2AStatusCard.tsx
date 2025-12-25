'use client';

import { useA2AStatus } from '@/hooks/useApi';
import { A2AMessage } from '@/lib/api';
import {
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

export function A2AStatusCard() {
  const { data, isLoading } = useA2AStatus();

  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
        <div className="space-y-3">
          <div className="h-20 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    );
  }

  const mockData = {
    protocol_version: '1.0',
    status: 'active',
    total_messages: 1247,
    messages_last_hour: 45,
    average_latency_ms: 12,
    recent_messages: [
      {
        message_id: 'msg-001',
        from_agent: 'orchestrator',
        to_agent: 'transaction_analyst',
        message_type: 'ANALYZE_REQUEST',
        status: 'processed' as const,
        timestamp: new Date(Date.now() - 30000).toISOString(),
      },
      {
        message_id: 'msg-002',
        from_agent: 'transaction_analyst',
        to_agent: 'pattern_detector',
        message_type: 'PATTERN_CHECK',
        status: 'processed' as const,
        timestamp: new Date(Date.now() - 25000).toISOString(),
      },
      {
        message_id: 'msg-003',
        from_agent: 'pattern_detector',
        to_agent: 'orchestrator',
        message_type: 'PATTERN_RESULT',
        status: 'delivered' as const,
        timestamp: new Date(Date.now() - 20000).toISOString(),
      },
    ],
  };

  const a2aStatus = data || mockData;

  const messageStatusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
    delivered: { color: 'bg-blue-100 text-blue-800', icon: ArrowsRightLeftIcon },
    processed: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
    failed: { color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon },
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 60) return `Il y a ${diffSec}s`;
    if (diffSec < 3600) return `Il y a ${Math.floor(diffSec / 60)}m`;
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-indigo-100">
            <ArrowsRightLeftIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Protocole A2A</h3>
            <p className="text-sm text-gray-500">Agent-to-Agent Communication</p>
          </div>
        </div>
        <span className={clsx(
          'px-2 py-1 rounded-full text-xs font-medium',
          a2aStatus.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        )}>
          {a2aStatus.status === 'active' ? 'Actif' : 'Inactif'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">{a2aStatus.total_messages}</p>
          <p className="text-xs text-gray-500">Messages totaux</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-primary-600">{a2aStatus.messages_last_hour}</p>
          <p className="text-xs text-gray-500">Derniere heure</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">{a2aStatus.average_latency_ms}ms</p>
          <p className="text-xs text-gray-500">Latence moy.</p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <p className="text-xs font-medium text-gray-500 uppercase mb-3">Messages recents</p>
        <div className="space-y-2">
          {a2aStatus.recent_messages?.slice(0, 5).map((msg: A2AMessage) => {
            const config = messageStatusConfig[msg.status] || messageStatusConfig.pending;
            const StatusIcon = config.icon;

            return (
              <div
                key={msg.message_id}
                className="flex items-center justify-between bg-gray-50 rounded-lg p-2"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className={clsx('p-1 rounded', config.color)}>
                    <StatusIcon className="h-3 w-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {msg.from_agent} → {msg.to_agent}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{msg.message_type}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                  {formatTimestamp(msg.timestamp)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
