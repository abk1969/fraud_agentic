'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  UserIcon,
  CalendarIcon,
  CurrencyEuroIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import type { Investigation, InvestigationFiltersState } from '@/app/investigations/page';

interface InvestigationListProps {
  filters: InvestigationFiltersState;
  selectedId?: string;
  onSelectInvestigation: (investigation: Investigation) => void;
}

type SortField = 'created_at' | 'priority' | 'status' | 'total_amount' | 'risk_score';
type SortOrder = 'asc' | 'desc';

const statusConfig = {
  open: { label: 'Ouvert', color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'En cours', color: 'bg-amber-100 text-amber-800' },
  pending_review: { label: 'En revision', color: 'bg-purple-100 text-purple-800' },
  closed: { label: 'Cloture', color: 'bg-green-100 text-green-800' },
  escalated: { label: 'Escalade', color: 'bg-red-100 text-red-800' },
};

const priorityConfig = {
  low: { label: 'Faible', color: 'bg-gray-100 text-gray-800' },
  medium: { label: 'Moyenne', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'Haute', color: 'bg-orange-100 text-orange-800' },
  critical: { label: 'Critique', color: 'bg-red-100 text-red-800' },
};

const typeConfig = {
  fraud_ring: { label: 'Reseau de fraude', icon: ExclamationTriangleIcon },
  identity_theft: { label: 'Vol d\'identite', icon: UserIcon },
  document_fraud: { label: 'Fraude documentaire', icon: CalendarIcon },
  benefit_fraud: { label: 'Fraude prestations', icon: CurrencyEuroIcon },
  other: { label: 'Autre', icon: ExclamationTriangleIcon },
};

const mockInvestigations: Investigation[] = [
  {
    id: '1',
    investigation_id: 'INV-2024-001',
    title: 'Reseau de fausses declarations medicales',
    description: 'Suspicion de collusion entre plusieurs beneficiaires et un professionnel de sante',
    status: 'in_progress',
    priority: 'critical',
    type: 'fraud_ring',
    assigned_to: 'Marie Dupont',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-20T14:00:00Z',
    transactions: ['TXN-001', 'TXN-002', 'TXN-003'],
    entities: [
      { id: 'e1', type: 'beneficiary', value: 'Jean Martin', risk_score: 0.85, connections: 5 },
      { id: 'e2', type: 'address', value: '15 rue de Paris', risk_score: 0.72, connections: 3 },
    ],
    findings: [
      { id: 'f1', type: 'alert', content: 'Montants anormalement eleves', created_at: '2024-01-16T09:00:00Z', created_by: 'System', severity: 'critical' },
    ],
    total_amount: 45000,
    risk_score: 0.92,
  },
  {
    id: '2',
    investigation_id: 'INV-2024-002',
    title: 'Usurpation d\'identite - Dossier BEN-789456',
    description: 'Documents potentiellement falsifies detectes lors de la verification',
    status: 'open',
    priority: 'high',
    type: 'identity_theft',
    assigned_to: 'Jean Martin',
    created_at: '2024-01-18T08:15:00Z',
    updated_at: '2024-01-19T11:30:00Z',
    transactions: ['TXN-004', 'TXN-005'],
    entities: [
      { id: 'e3', type: 'document', value: 'CNI-123456', risk_score: 0.95, connections: 2 },
    ],
    findings: [],
    total_amount: 12500,
    risk_score: 0.78,
  },
  {
    id: '3',
    investigation_id: 'INV-2024-003',
    title: 'Fraude documentaire - Certificats medicaux',
    description: 'Serie de certificats medicaux suspects provenant du meme etablissement',
    status: 'pending_review',
    priority: 'medium',
    type: 'document_fraud',
    assigned_to: 'Sophie Bernard',
    created_at: '2024-01-10T14:45:00Z',
    updated_at: '2024-01-17T16:20:00Z',
    transactions: ['TXN-006'],
    entities: [
      { id: 'e4', type: 'beneficiary', value: 'Pierre Durand', risk_score: 0.65, connections: 1 },
    ],
    findings: [
      { id: 'f2', type: 'evidence', content: 'Signature non conforme', created_at: '2024-01-12T10:00:00Z', created_by: 'Marie Dupont', severity: 'warning' },
    ],
    total_amount: 8200,
    risk_score: 0.58,
  },
  {
    id: '4',
    investigation_id: 'INV-2024-004',
    title: 'Fraude aux prestations familiales',
    description: 'Declaration de situation familiale erronee',
    status: 'closed',
    priority: 'low',
    type: 'benefit_fraud',
    assigned_to: 'Pierre Durand',
    created_at: '2024-01-05T09:00:00Z',
    updated_at: '2024-01-12T15:00:00Z',
    closed_at: '2024-01-12T15:00:00Z',
    transactions: ['TXN-007', 'TXN-008'],
    entities: [],
    findings: [
      { id: 'f3', type: 'action', content: 'Remboursement demande', created_at: '2024-01-12T15:00:00Z', created_by: 'Pierre Durand' },
    ],
    total_amount: 3500,
    risk_score: 0.35,
  },
  {
    id: '5',
    investigation_id: 'INV-2024-005',
    title: 'Reseau international de fraude',
    description: 'Connexions detectees avec des comptes bancaires etrangers suspects',
    status: 'escalated',
    priority: 'critical',
    type: 'fraud_ring',
    assigned_to: 'Marie Dupont',
    created_at: '2024-01-20T07:30:00Z',
    updated_at: '2024-01-21T09:45:00Z',
    transactions: ['TXN-009', 'TXN-010', 'TXN-011', 'TXN-012'],
    entities: [
      { id: 'e5', type: 'bank_account', value: 'IBAN-XXX', risk_score: 0.98, connections: 8 },
      { id: 'e6', type: 'beneficiary', value: 'Societe XYZ', risk_score: 0.91, connections: 6 },
    ],
    findings: [
      { id: 'f4', type: 'alert', content: 'Transaction transfrontaliere suspecte', created_at: '2024-01-20T08:00:00Z', created_by: 'System', severity: 'critical' },
    ],
    total_amount: 125000,
    risk_score: 0.96,
  },
  {
    id: '6',
    investigation_id: 'INV-2024-006',
    title: 'Anomalie de facturation - Cabinet medical',
    description: 'Surfacturation repetee detectee sur plusieurs mois',
    status: 'in_progress',
    priority: 'high',
    type: 'benefit_fraud',
    assigned_to: 'Jean Martin',
    created_at: '2024-01-19T11:00:00Z',
    updated_at: '2024-01-21T10:00:00Z',
    transactions: ['TXN-013', 'TXN-014', 'TXN-015'],
    entities: [
      { id: 'e7', type: 'phone', value: '0612345678', risk_score: 0.45, connections: 2 },
    ],
    findings: [],
    total_amount: 28000,
    risk_score: 0.72,
  },
];

export function InvestigationList({
  filters,
  selectedId,
  onSelectInvestigation,
}: InvestigationListProps) {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchInvestigations = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/investigations');
        if (response.ok) {
          const data = await response.json();
          setInvestigations(data.investigations || data || mockInvestigations);
        } else {
          setInvestigations(mockInvestigations);
        }
      } catch {
        setInvestigations(mockInvestigations);
      }
      setLoading(false);
    };

    fetchInvestigations();
  }, []);

  const filteredInvestigations = useMemo(() => {
    return investigations.filter((inv) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          inv.investigation_id.toLowerCase().includes(searchLower) ||
          inv.title.toLowerCase().includes(searchLower) ||
          inv.description.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      if (filters.status && inv.status !== filters.status) return false;
      if (filters.priority && inv.priority !== filters.priority) return false;
      if (filters.type && inv.type !== filters.type) return false;
      if (filters.assignedTo && !inv.assigned_to.toLowerCase().includes(filters.assignedTo.toLowerCase())) return false;
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        if (new Date(inv.created_at) < fromDate) return false;
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        if (new Date(inv.created_at) > toDate) return false;
      }
      return true;
    });
  }, [investigations, filters]);

  const sortedInvestigations = useMemo(() => {
    const sorted = [...filteredInvestigations].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'total_amount':
          comparison = a.total_amount - b.total_amount;
          break;
        case 'risk_score':
          comparison = a.risk_score - b.risk_score;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [filteredInvestigations, sortField, sortOrder]);

  const paginatedInvestigations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedInvestigations.slice(start, start + pageSize);
  }, [sortedInvestigations, currentPage]);

  const totalPages = Math.ceil(sortedInvestigations.length / pageSize);

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
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="animate-pulse p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Enquete
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
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('priority')}
              >
                <div className="flex items-center space-x-1">
                  <span>Priorite</span>
                  <SortIcon field="priority" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigne a
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('total_amount')}
              >
                <div className="flex items-center space-x-1">
                  <span>Montant</span>
                  <SortIcon field="total_amount" />
                </div>
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
            {paginatedInvestigations.map((inv) => {
              const TypeIcon = typeConfig[inv.type].icon;
              return (
                <tr
                  key={inv.id}
                  onClick={() => onSelectInvestigation(inv)}
                  className={clsx(
                    'cursor-pointer hover:bg-gray-50 transition-colors',
                    selectedId === inv.id && 'bg-primary-50'
                  )}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <TypeIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {inv.investigation_id}
                        </div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {inv.title}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={clsx(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        statusConfig[inv.status].color
                      )}
                    >
                      {statusConfig[inv.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={clsx(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        priorityConfig[inv.priority].color
                      )}
                    >
                      {priorityConfig[inv.priority].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {typeConfig[inv.type].label}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-2">
                        <span className="text-xs font-medium text-primary-700">
                          {inv.assigned_to.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="text-sm text-gray-900">{inv.assigned_to}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatAmount(inv.total_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={clsx(
                            'h-2 rounded-full',
                            inv.risk_score > 0.7
                              ? 'bg-red-500'
                              : inv.risk_score > 0.4
                              ? 'bg-orange-500'
                              : 'bg-green-500'
                          )}
                          style={{ width: `${inv.risk_score * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {(inv.risk_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(inv.created_at)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {sortedInvestigations.length} enquete(s) trouvee(s)
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
