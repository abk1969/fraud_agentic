'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { TransactionStats } from '@/components/transactions/TransactionStats';
import { NewTransactionModal } from '@/components/transactions/NewTransactionModal';
import { TransactionDetailModal } from '@/components/transactions/TransactionDetailModal';
import { PlusIcon } from '@heroicons/react/24/outline';

export interface Transaction {
  id: string;
  transaction_id: string;
  beneficiary_name: string;
  beneficiary_id: string;
  amount: number;
  currency: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected' | 'review' | 'investigating';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  created_at: string;
  analyzed_at?: string;
  decision?: string;
  factors?: string[];
}

export interface TransactionFiltersState {
  search: string;
  status: string;
  riskLevel: string;
  dateFrom: string;
  dateTo: string;
  minAmount: string;
  maxAmount: string;
}

// Mock transactions for URL lookup
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
  },
  {
    id: '3',
    transaction_id: 'TXN-2024-0891',
    beneficiary_name: 'Pierre Bernard',
    beneficiary_id: 'BEN-009012',
    amount: 45000,
    currency: 'EUR',
    type: 'Indemnite journaliere',
    status: 'review',
    risk_level: 'critical',
    risk_score: 0.92,
    created_at: '2024-01-21T10:30:00Z',
  },
];

function TransactionsPageContent() {
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState<TransactionFiltersState>({
    search: '',
    status: '',
    riskLevel: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
  });

  // Handle URL params for deep linking
  useEffect(() => {
    const txnId = searchParams.get('id');
    if (txnId) {
      const transaction = mockTransactions.find(
        t => t.id === txnId || t.transaction_id === txnId
      );
      if (transaction) {
        setSelectedTransaction(transaction);
      }
    }
  }, [searchParams]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Page header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Transactions</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Analyse et gestion des transactions
                </p>
              </div>
              <button
                onClick={() => setIsNewModalOpen(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Nouvelle analyse</span>
              </button>
            </div>

            {/* Stats */}
            <TransactionStats />

            {/* Filters */}
            <TransactionFilters filters={filters} onFiltersChange={setFilters} />

            {/* Transaction list */}
            <TransactionList
              filters={filters}
              onSelectTransaction={setSelectedTransaction}
            />
          </div>
        </main>
      </div>

      {/* Modals */}
      <NewTransactionModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />

      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
}

function TransactionsPageLoading() {
  return (
    <div className="flex h-screen bg-gray-50 items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<TransactionsPageLoading />}>
      <TransactionsPageContent />
    </Suspense>
  );
}
