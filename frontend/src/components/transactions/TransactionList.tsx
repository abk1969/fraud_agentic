'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  EyeIcon,
  PlayIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import type { Transaction, TransactionFiltersState } from '@/app/transactions/page';

interface TransactionListProps {
  filters: TransactionFiltersState;
  onSelectTransaction: (transaction: Transaction) => void;
}

type SortField = 'created_at' | 'amount' | 'risk_score' | 'beneficiary_name';
type SortDirection = 'asc' | 'desc';

// Mock data - will be replaced by API calls
const mockTransactions: Transaction[] = [
  {
    id: '1',
    transaction_id: 'TXN-2024-8847',
    beneficiary_name: 'Jean Dupont',
    beneficiary_id: 'BEN-001234',
    amount: 15234,
    currency: 'EUR',
    type: 'Remboursement sante',
    status: 'review',
    risk_level: 'critical',
    risk_score: 0.92,
    created_at: '2024-12-24T10:30:00Z',
    analyzed_at: '2024-12-24T10:30:05Z',
    decision: 'review',
    factors: ['Usurpation identite suspectee', 'Montant inhabituel'],
  },
  {
    id: '2',
    transaction_id: 'TXN-2024-8846',
    beneficiary_name: 'Marie Martin',
    beneficiary_id: 'BEN-005678',
    amount: 2450,
    currency: 'EUR',
    type: 'Allocation familiale',
    status: 'approved',
    risk_level: 'low',
    risk_score: 0.08,
    created_at: '2024-12-24T10:25:00Z',
    analyzed_at: '2024-12-24T10:25:02Z',
    decision: 'approve',
    factors: [],
  },
  {
    id: '3',
    transaction_id: 'TXN-2024-8845',
    beneficiary_name: 'Pierre Bernard',
    beneficiary_id: 'BEN-009012',
    amount: 8500,
    currency: 'EUR',
    type: 'Indemnite journaliere',
    status: 'rejected',
    risk_level: 'high',
    risk_score: 0.78,
    created_at: '2024-12-24T10:20:00Z',
    analyzed_at: '2024-12-24T10:20:08Z',
    decision: 'reject',
    factors: ['Documents falsifies', 'Reseau frauduleux detecte'],
  },
  {
    id: '4',
    transaction_id: 'TXN-2024-8844',
    beneficiary_name: 'Sophie Leroy',
    beneficiary_id: 'BEN-003456',
    amount: 1200,
    currency: 'EUR',
    type: 'Aide au logement',
    status: 'approved',
    risk_level: 'low',
    risk_score: 0.05,
    created_at: '2024-12-24T10:15:00Z',
    analyzed_at: '2024-12-24T10:15:01Z',
    decision: 'approve',
    factors: [],
  },
  {
    id: '5',
    transaction_id: 'TXN-2024-8843',
    beneficiary_name: 'Michel Dubois',
    beneficiary_id: 'BEN-007890',
    amount: 4200,
    currency: 'EUR',
    type: 'Pension retraite',
    status: 'review',
    risk_level: 'medium',
    risk_score: 0.45,
    created_at: '2024-12-24T10:10:00Z',
    analyzed_at: '2024-12-24T10:10:04Z',
    decision: 'review',
    factors: ['Changement adresse recent'],
  },
  {
    id: '6',
    transaction_id: 'TXN-2024-8842',
    beneficiary_name: 'Claire Moreau',
    beneficiary_id: 'BEN-002345',
    amount: 23100,
    currency: 'EUR',
    type: 'Remboursement hospitalier',
    status: 'investigating',
    risk_level: 'critical',
    risk_score: 0.95,
    created_at: '2024-12-24T10:05:00Z',
    analyzed_at: '2024-12-24T10:05:12Z',
    decision: 'investigate',
    factors: ['Montant exceptionnel', 'Beneficiaire inconnu', 'Adresse suspecte'],
  },
  {
    id: '7',
    transaction_id: 'TXN-2024-8841',
    beneficiary_name: 'Thomas Petit',
    beneficiary_id: 'BEN-006789',
    amount: 890,
    currency: 'EUR',
    type: 'Allocation chomage',
    status: 'approved',
    risk_level: 'low',
    risk_score: 0.12,
    created_at: '2024-12-24T10:00:00Z',
    analyzed_at: '2024-12-24T10:00:02Z',
    decision: 'approve',
    factors: [],
  },
  {
    id: '8',
    transaction_id: 'TXN-2024-8840',
    beneficiary_name: 'Isabelle Garcia',
    beneficiary_id: 'BEN-004567',
    amount: 3800,
    currency: 'EUR',
    type: 'Complement sante',
    status: 'pending',
    risk_level: 'medium',
    risk_score: 0.38,
    created_at: '2024-12-24T09:55:00Z',
    factors: ['En cours analyse'],
  },
  {
    id: '9',
    transaction_id: 'TXN-2024-8839',
    beneficiary_name: 'Francois Robert',
    beneficiary_id: 'BEN-008901',
    amount: 11800,
    currency: 'EUR',
    type: 'Indemnite accident',
    status: 'review',
    risk_level: 'high',
    risk_score: 0.67,
    created_at: '2024-12-24T09:50:00Z',
    analyzed_at: '2024-12-24T09:50:06Z',
    decision: 'review',
    factors: ['Comportement atypique', 'Multiple demandes'],
  },
  {
    id: '10',
    transaction_id: 'TXN-2024-8838',
    beneficiary_name: 'Anne Richard',
    beneficiary_id: 'BEN-001567',
    amount: 560,
    currency: 'EUR',
    type: 'Prime activite',
    status: 'approved',
    risk_level: 'low',
    risk_score: 0.03,
    created_at: '2024-12-24T09:45:00Z',
    analyzed_at: '2024-12-24T09:45:01Z',
    decision: 'approve',
    factors: [],
  },
];

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-gray-100 text-gray-800' },
  approved: { label: 'Approuvee', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejetee', color: 'bg-red-100 text-red-800' },
  review: { label: 'A examiner', color: 'bg-amber-100 text-amber-800' },
  investigating: { label: 'Investigation', color: 'bg-purple-100 text-purple-800' },
};

const riskConfig = {
  low: { label: 'Faible', color: 'bg-green-100 text-green-800 border-green-200' },
  medium: { label: 'Moyen', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  high: { label: 'Eleve', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  critical: { label: 'Critique', color: 'bg-red-100 text-red-800 border-red-200' },
};

export function TransactionList({ filters, onSelectTransaction }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 10;

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Apply filters
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.transaction_id.toLowerCase().includes(search) ||
          t.beneficiary_name.toLowerCase().includes(search) ||
          t.beneficiary_id.toLowerCase().includes(search)
      );
    }

    if (filters.status) {
      result = result.filter((t) => t.status === filters.status);
    }

    if (filters.riskLevel) {
      result = result.filter((t) => t.risk_level === filters.riskLevel);
    }

    if (filters.minAmount) {
      result = result.filter((t) => t.amount >= parseFloat(filters.minAmount));
    }

    if (filters.maxAmount) {
      result = result.filter((t) => t.amount <= parseFloat(filters.maxAmount));
    }

    if (filters.dateFrom) {
      result = result.filter((t) => new Date(t.created_at) >= new Date(filters.dateFrom));
    }

    if (filters.dateTo) {
      result = result.filter((t) => new Date(t.created_at) <= new Date(filters.dateTo));
    }

    // Apply sorting
    result.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'created_at') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return result;
  }, [transactions, filters, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUpIcon className="h-4 w-4" />
    ) : (
      <ChevronDownIcon className="h-4 w-4" />
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="card !p-0 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Liste des transactions
          </h3>
          <p className="text-sm text-gray-500">
            {filteredTransactions.length} transaction(s) trouvee(s)
          </p>
        </div>
        <button
          onClick={refreshData}
          disabled={isLoading}
          className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowPathIcon className={clsx('h-5 w-5', isLoading && 'animate-spin')} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  <SortIcon field="created_at" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('beneficiary_name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Beneficiaire</span>
                  <SortIcon field="beneficiary_name" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center space-x-1">
                  <span>Montant</span>
                  <SortIcon field="amount" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedTransactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectTransaction(transaction)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(transaction.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-primary-600">
                    {transaction.transaction_id}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.beneficiary_name}
                    </p>
                    <p className="text-xs text-gray-500">{transaction.beneficiary_id}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatAmount(transaction.amount, transaction.currency)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span
                      className={clsx(
                        'px-2 py-1 text-xs font-medium rounded-full border',
                        riskConfig[transaction.risk_level].color
                      )}
                    >
                      {riskConfig[transaction.risk_level].label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(transaction.risk_score * 100).toFixed(0)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={clsx(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      statusConfig[transaction.status].color
                    )}
                  >
                    {statusConfig[transaction.status].label}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTransaction(transaction);
                      }}
                      className="p-1 text-gray-400 hover:text-primary-600 rounded"
                      title="Voir details"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    {transaction.status === 'pending' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Trigger analysis
                        }}
                        className="p-1 text-gray-400 hover:text-green-600 rounded"
                        title="Analyser"
                      >
                        <PlayIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Affichage {(currentPage - 1) * itemsPerPage + 1} -{' '}
            {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} sur{' '}
            {filteredTransactions.length}
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Precedent
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={clsx(
                  'px-3 py-1 text-sm rounded-lg',
                  currentPage === page
                    ? 'bg-primary-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                )}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
