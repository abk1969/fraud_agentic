'use client';

import { useState, useMemo } from 'react';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  BellAlertIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShieldExclamationIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { useAlerts } from '@/hooks/useApi';
import type { AlertDetails, AlertSeverity, AlertStatus, AlertType, AlertEntityType } from '@/lib/api';

export interface AlertFiltersState {
  search: string;
  severity: string;
  status: string;
  type: string;
  entityType: string;
  dateFrom: string;
  dateTo: string;
}

interface AlertListProps {
  filters: AlertFiltersState;
  onSelectAlert: (alert: AlertDetails) => void;
}

type SortField = 'created_at' | 'severity' | 'status' | 'risk_score';
type SortOrder = 'asc' | 'desc';

const severityConfig: Record<AlertSeverity, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  info: { label: 'Info', color: 'bg-blue-100 text-blue-800', icon: InformationCircleIcon },
  warning: { label: 'Attention', color: 'bg-yellow-100 text-yellow-800', icon: ExclamationTriangleIcon },
  high: { label: 'Haute', color: 'bg-orange-100 text-orange-800', icon: BellAlertIcon },
  critical: { label: 'Critique', color: 'bg-red-100 text-red-800', icon: ShieldExclamationIcon },
};

const statusConfig: Record<AlertStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  new: { label: 'Nouvelle', color: 'bg-red-100 text-red-800', icon: BellAlertIcon },
  acknowledged: { label: 'Prise en compte', color: 'bg-blue-100 text-blue-800', icon: EyeIcon },
  investigating: { label: 'Investigation', color: 'bg-purple-100 text-purple-800', icon: ClockIcon },
  resolved: { label: 'Resolue', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
  dismissed: { label: 'Rejetee', color: 'bg-gray-100 text-gray-800', icon: XCircleIcon },
};

const typeLabels: Record<AlertType, string> = {
  anomaly: 'Anomalie',
  threshold: 'Seuil',
  pattern: 'Pattern',
  ml_detection: 'ML',
  rule_based: 'Regle',
  real_time: 'Temps reel',
};

const entityTypeLabels: Record<AlertEntityType, string> = {
  transaction: 'Transaction',
  beneficiary: 'Beneficiaire',
  document: 'Document',
  network: 'Reseau',
  system: 'Systeme',
};

const mockAlerts: AlertDetails[] = [
  {
    id: '1',
    alert_id: 'ALT-2024-001',
    title: 'Transaction anormalement elevee detectee',
    description: 'Montant de 45 000 EUR depasse le seuil de 10 000 EUR pour ce type de prestation',
    severity: 'critical',
    status: 'new',
    type: 'threshold',
    source: 'Rule Engine',
    entity_type: 'transaction',
    entity_id: 'TXN-2024-0891',
    risk_score: 0.92,
    created_at: '2024-01-21T10:30:00Z',
    updated_at: '2024-01-21T10:30:00Z',
    related_transactions: ['TXN-2024-0891'],
    metadata: { threshold: 10000, actual: 45000 },
    actions_taken: [],
  },
  {
    id: '2',
    alert_id: 'ALT-2024-002',
    title: 'Pattern de fraude detecte - Multiple beneficiaires',
    description: 'Meme adresse IP utilisee pour 5 beneficiaires differents en 24h',
    severity: 'high',
    status: 'investigating',
    type: 'pattern',
    source: 'ML Detection',
    entity_type: 'network',
    entity_id: 'NET-2024-045',
    risk_score: 0.85,
    created_at: '2024-01-21T09:15:00Z',
    updated_at: '2024-01-21T11:00:00Z',
    acknowledged_at: '2024-01-21T09:45:00Z',
    acknowledged_by: 'Marie Dupont',
    related_transactions: ['TXN-2024-0878', 'TXN-2024-0879', 'TXN-2024-0880'],
    metadata: { ip_address: '192.168.1.100', beneficiary_count: 5 },
    actions_taken: [
      { id: 'a1', action_type: 'acknowledge', description: 'Alerte prise en compte', performed_by: 'Marie Dupont', performed_at: '2024-01-21T09:45:00Z' },
    ],
  },
  {
    id: '3',
    alert_id: 'ALT-2024-003',
    title: 'Anomalie ML - Score de fraude eleve',
    description: 'Le modele ML a detecte une probabilite de fraude de 87% sur cette transaction',
    severity: 'high',
    status: 'acknowledged',
    type: 'ml_detection',
    source: 'Fraud Detection Model v2.1',
    entity_type: 'transaction',
    entity_id: 'TXN-2024-0895',
    risk_score: 0.87,
    created_at: '2024-01-21T08:45:00Z',
    updated_at: '2024-01-21T09:30:00Z',
    acknowledged_at: '2024-01-21T09:30:00Z',
    acknowledged_by: 'Jean Martin',
    related_transactions: ['TXN-2024-0895'],
    metadata: { model_version: '2.1', confidence: 0.92 },
    actions_taken: [],
  },
  {
    id: '4',
    alert_id: 'ALT-2024-004',
    title: 'Document suspect - Signature non conforme',
    description: 'La signature sur le document ne correspond pas au specimen enregistre',
    severity: 'warning',
    status: 'resolved',
    type: 'rule_based',
    source: 'Document Verification',
    entity_type: 'document',
    entity_id: 'DOC-2024-1234',
    risk_score: 0.65,
    created_at: '2024-01-20T16:20:00Z',
    updated_at: '2024-01-21T08:00:00Z',
    resolved_at: '2024-01-21T08:00:00Z',
    resolved_by: 'Sophie Bernard',
    related_transactions: ['TXN-2024-0867'],
    metadata: { document_type: 'attestation', match_score: 0.23 },
    actions_taken: [
      { id: 'a2', action_type: 'investigate', description: 'Verification manuelle du document', performed_by: 'Sophie Bernard', performed_at: '2024-01-20T17:00:00Z' },
      { id: 'a3', action_type: 'resolve', description: 'Faux positif confirme - document valide', performed_by: 'Sophie Bernard', performed_at: '2024-01-21T08:00:00Z' },
    ],
  },
  {
    id: '5',
    alert_id: 'ALT-2024-005',
    title: 'Beneficiaire a haut risque',
    description: 'Ce beneficiaire a ete implique dans 3 alertes au cours des 30 derniers jours',
    severity: 'warning',
    status: 'new',
    type: 'anomaly',
    source: 'Risk Scoring Engine',
    entity_type: 'beneficiary',
    entity_id: 'BEN-789456',
    risk_score: 0.72,
    created_at: '2024-01-21T07:00:00Z',
    updated_at: '2024-01-21T07:00:00Z',
    related_transactions: ['TXN-2024-0850', 'TXN-2024-0865', 'TXN-2024-0890'],
    metadata: { alert_count_30d: 3, total_amount: 15000 },
    actions_taken: [],
  },
  {
    id: '6',
    alert_id: 'ALT-2024-006',
    title: 'Activite suspecte en temps reel',
    description: '10 tentatives de connexion echouees en 5 minutes',
    severity: 'info',
    status: 'dismissed',
    type: 'real_time',
    source: 'Security Monitor',
    entity_type: 'system',
    entity_id: 'SYS-AUTH-001',
    risk_score: 0.35,
    created_at: '2024-01-20T14:30:00Z',
    updated_at: '2024-01-20T15:00:00Z',
    resolved_at: '2024-01-20T15:00:00Z',
    resolved_by: 'System',
    related_transactions: [],
    metadata: { attempts: 10, time_window: '5min' },
    actions_taken: [
      { id: 'a4', action_type: 'dismiss', description: 'Activite normale - mise a jour mot de passe', performed_by: 'Pierre Durand', performed_at: '2024-01-20T15:00:00Z' },
    ],
  },
  {
    id: '7',
    alert_id: 'ALT-2024-007',
    title: 'Reseau de fraude potentiel identifie',
    description: '12 beneficiaires partageant les memes coordonnees bancaires',
    severity: 'critical',
    status: 'investigating',
    type: 'pattern',
    source: 'Network Analysis',
    entity_type: 'network',
    entity_id: 'NET-2024-089',
    risk_score: 0.95,
    created_at: '2024-01-21T06:00:00Z',
    updated_at: '2024-01-21T10:00:00Z',
    acknowledged_at: '2024-01-21T06:30:00Z',
    acknowledged_by: 'Marie Dupont',
    related_transactions: ['TXN-2024-0800', 'TXN-2024-0801', 'TXN-2024-0802', 'TXN-2024-0803'],
    metadata: { beneficiary_count: 12, shared_iban: 'FR76***456' },
    actions_taken: [
      { id: 'a5', action_type: 'escalate', description: 'Escalade vers equipe investigation', performed_by: 'Marie Dupont', performed_at: '2024-01-21T07:00:00Z' },
    ],
  },
  {
    id: '8',
    alert_id: 'ALT-2024-008',
    title: 'Seuil journalier depasse',
    description: 'Le cumul des transactions pour ce beneficiaire depasse 5000 EUR/jour',
    severity: 'warning',
    status: 'new',
    type: 'threshold',
    source: 'Rule Engine',
    entity_type: 'beneficiary',
    entity_id: 'BEN-456123',
    risk_score: 0.58,
    created_at: '2024-01-21T11:00:00Z',
    updated_at: '2024-01-21T11:00:00Z',
    related_transactions: ['TXN-2024-0900', 'TXN-2024-0901', 'TXN-2024-0902'],
    metadata: { daily_limit: 5000, current_total: 7500 },
    actions_taken: [],
  },
];

export function AlertList({ filters, onSelectAlert }: AlertListProps) {
  const { data, isLoading, error } = useAlerts();
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Use API data or fallback to mock
  const alerts = data?.alerts || mockAlerts;

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          alert.alert_id.toLowerCase().includes(searchLower) ||
          alert.title.toLowerCase().includes(searchLower) ||
          alert.description.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      if (filters.severity && alert.severity !== filters.severity) return false;
      if (filters.status && alert.status !== filters.status) return false;
      if (filters.type && alert.type !== filters.type) return false;
      if (filters.entityType && alert.entity_type !== filters.entityType) return false;
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        if (new Date(alert.created_at) < fromDate) return false;
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        if (new Date(alert.created_at) > toDate) return false;
      }
      return true;
    });
  }, [alerts, filters]);

  const sortedAlerts = useMemo(() => {
    const sorted = [...filteredAlerts].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'severity':
          const severityOrder = { critical: 4, high: 3, warning: 2, info: 1 };
          comparison = severityOrder[a.severity] - severityOrder[b.severity];
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'risk_score':
          comparison = a.risk_score - b.risk_score;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [filteredAlerts, sortField, sortOrder]);

  const paginatedAlerts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedAlerts.slice(start, start + pageSize);
  }, [sortedAlerts, currentPage]);

  const totalPages = Math.ceil(sortedAlerts.length / pageSize);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? (
      <ChevronUpIcon className="h-4 w-4" />
    ) : (
      <ChevronDownIcon className="h-4 w-4" />
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return `Il y a ${diffDays}j`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="animate-pulse p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
        <div className="text-center text-red-600">
          Erreur lors du chargement des alertes. Utilisation des donnees de demonstration.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Alerte
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('severity')}
              >
                <div className="flex items-center space-x-1">
                  <span>Severite</span>
                  <SortIcon field="severity" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-1">
                  <span>Statut</span>
                  <SortIcon field="status" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entite
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('risk_score')}
              >
                <div className="flex items-center space-x-1">
                  <span>Risque</span>
                  <SortIcon field="risk_score" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  <SortIcon field="created_at" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedAlerts.map((alert) => {
              const SeverityIcon = severityConfig[alert.severity].icon;
              const StatusIcon = statusConfig[alert.status].icon;
              return (
                <tr
                  key={alert.id}
                  onClick={() => onSelectAlert(alert)}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      <div className={clsx(
                        'flex-shrink-0 p-2 rounded-lg',
                        alert.severity === 'critical' ? 'bg-red-100' :
                        alert.severity === 'high' ? 'bg-orange-100' :
                        alert.severity === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                      )}>
                        <SeverityIcon className={clsx(
                          'h-5 w-5',
                          alert.severity === 'critical' ? 'text-red-600' :
                          alert.severity === 'high' ? 'text-orange-600' :
                          alert.severity === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                        )} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {alert.alert_id}
                        </div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {alert.title}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={clsx(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      severityConfig[alert.severity].color
                    )}>
                      {severityConfig[alert.severity].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={clsx(
                      'px-2 py-1 text-xs font-medium rounded-full inline-flex items-center',
                      statusConfig[alert.status].color
                    )}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig[alert.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {typeLabels[alert.type]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <span className="text-sm text-gray-900">
                        {entityTypeLabels[alert.entity_type]}
                      </span>
                      <p className="text-xs text-gray-500">{alert.entity_id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={clsx(
                            'h-2 rounded-full',
                            alert.risk_score > 0.7
                              ? 'bg-red-500'
                              : alert.risk_score > 0.4
                              ? 'bg-orange-500'
                              : 'bg-green-500'
                          )}
                          style={{ width: `${alert.risk_score * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {(alert.risk_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <span className="text-sm text-gray-900">
                        {formatDate(alert.created_at)}
                      </span>
                      <p className="text-xs text-gray-500">{getTimeAgo(alert.created_at)}</p>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {paginatedAlerts.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          Aucune alerte ne correspond aux criteres de recherche
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {sortedAlerts.length} alerte(s) trouvee(s)
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Precedent
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} sur {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
