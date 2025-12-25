'use client';

import { useRouter } from 'next/navigation';
import { ExclamationTriangleIcon, ClockIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { useAlerts } from '@/hooks/useApi';
import type { AlertDetails, AlertSeverity } from '@/lib/api';

const riskColors: Record<AlertSeverity, string> = {
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
};

const riskLabels: Record<AlertSeverity, string> = {
  info: 'Info',
  warning: 'Moyen',
  high: 'Eleve',
  critical: 'Critique',
};

const mockAlerts: AlertDetails[] = [
  {
    id: '1',
    alert_id: 'ALT-2024-001',
    title: 'Usurpation d\'identite',
    description: 'Tentative de fraude detectee',
    severity: 'critical',
    status: 'new',
    type: 'pattern',
    source: 'ML Detection',
    entity_type: 'transaction',
    entity_id: 'TXN-2024-8847',
    risk_score: 0.92,
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60000).toISOString(),
    related_transactions: ['TXN-2024-8847'],
    metadata: { amount: 15234 },
    actions_taken: [],
  },
  {
    id: '2',
    alert_id: 'ALT-2024-002',
    title: 'Montant anormal',
    description: 'Montant depasse le seuil',
    severity: 'high',
    status: 'new',
    type: 'threshold',
    source: 'Rule Engine',
    entity_type: 'transaction',
    entity_id: 'TXN-2024-8842',
    risk_score: 0.78,
    created_at: new Date(Date.now() - 12 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60000).toISOString(),
    related_transactions: ['TXN-2024-8842'],
    metadata: { amount: 8500 },
    actions_taken: [],
  },
  {
    id: '3',
    alert_id: 'ALT-2024-003',
    title: 'Reseau frauduleux',
    description: 'Connexions suspectes detectees',
    severity: 'critical',
    status: 'investigating',
    type: 'pattern',
    source: 'Network Analysis',
    entity_type: 'network',
    entity_id: 'TXN-2024-8839',
    risk_score: 0.95,
    created_at: new Date(Date.now() - 18 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 18 * 60000).toISOString(),
    related_transactions: ['TXN-2024-8839'],
    metadata: { amount: 23100 },
    actions_taken: [],
  },
  {
    id: '4',
    alert_id: 'ALT-2024-004',
    title: 'Documents suspects',
    description: 'Anomalie detectee',
    severity: 'warning',
    status: 'new',
    type: 'rule_based',
    source: 'Document Analysis',
    entity_type: 'document',
    entity_id: 'TXN-2024-8835',
    risk_score: 0.55,
    created_at: new Date(Date.now() - 25 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 25 * 60000).toISOString(),
    related_transactions: ['TXN-2024-8835'],
    metadata: { amount: 4200 },
    actions_taken: [],
  },
  {
    id: '5',
    alert_id: 'ALT-2024-005',
    title: 'Comportement atypique',
    description: 'Pattern inhabituel',
    severity: 'high',
    status: 'acknowledged',
    type: 'ml_detection',
    source: 'ML Detection',
    entity_type: 'beneficiary',
    entity_id: 'TXN-2024-8831',
    risk_score: 0.72,
    created_at: new Date(Date.now() - 32 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 32 * 60000).toISOString(),
    related_transactions: ['TXN-2024-8831'],
    metadata: { amount: 11800 },
    actions_taken: [],
  },
];

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  return `Il y a ${diffDays}j`;
}

function formatAmount(metadata: Record<string, unknown>): string {
  const amount = metadata?.amount;
  if (typeof amount === 'number') {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  }
  return '-';
}

export function RecentAlerts() {
  const router = useRouter();
  const { data, isLoading } = useAlerts({ limit: 5 });

  const alerts = data?.alerts || mockAlerts;

  const handleViewAll = () => {
    router.push('/alerts');
  };

  const handleAlertClick = (alert: AlertDetails) => {
    router.push(`/alerts?id=${alert.id}`);
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Alertes recentes</h3>
        <button
          onClick={handleViewAll}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center group"
        >
          Voir tout
          <ArrowRightIcon className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      <div className="space-y-3">
        {alerts.slice(0, 5).map((alert) => (
          <div
            key={alert.id}
            onClick={() => handleAlertClick(alert)}
            className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div
                  className={clsx(
                    'p-1.5 rounded-lg',
                    alert.severity === 'critical'
                      ? 'bg-red-100'
                      : alert.severity === 'high'
                      ? 'bg-orange-100'
                      : alert.severity === 'warning'
                      ? 'bg-yellow-100'
                      : 'bg-blue-100'
                  )}
                >
                  <ExclamationTriangleIcon
                    className={clsx(
                      'h-4 w-4',
                      alert.severity === 'critical'
                        ? 'text-red-600'
                        : alert.severity === 'high'
                        ? 'text-orange-600'
                        : alert.severity === 'warning'
                        ? 'text-yellow-600'
                        : 'text-blue-600'
                    )}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                  <p className="text-xs text-gray-500">{alert.entity_id}</p>
                </div>
              </div>
              <span
                className={clsx(
                  'px-2 py-0.5 text-xs font-medium rounded-full border',
                  riskColors[alert.severity]
                )}
              >
                {riskLabels[alert.severity]}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span className="font-medium text-gray-900">{formatAmount(alert.metadata)}</span>
              <div className="flex items-center">
                <ClockIcon className="h-3 w-3 mr-1" />
                {getTimeAgo(alert.created_at)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
