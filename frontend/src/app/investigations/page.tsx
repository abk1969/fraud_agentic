'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import {
  InvestigationList,
  InvestigationFilters,
  InvestigationStats,
  InvestigationDetailPanel,
  NetworkGraphModal,
  NewInvestigationModal,
} from '@/components/investigations';
import { PlusIcon } from '@heroicons/react/24/outline';

export interface Investigation {
  id: string;
  investigation_id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'pending_review' | 'closed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'fraud_ring' | 'identity_theft' | 'document_fraud' | 'benefit_fraud' | 'other';
  assigned_to: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  transactions: string[];
  entities: InvestigationEntity[];
  findings: Finding[];
  total_amount: number;
  risk_score: number;
}

export interface InvestigationEntity {
  id: string;
  type: 'beneficiary' | 'address' | 'bank_account' | 'phone' | 'email' | 'document';
  value: string;
  risk_score: number;
  connections: number;
}

export interface Finding {
  id: string;
  type: 'alert' | 'evidence' | 'note' | 'action';
  content: string;
  created_at: string;
  created_by: string;
  severity?: 'info' | 'warning' | 'critical';
}

export interface InvestigationFiltersState {
  search: string;
  status: string;
  priority: string;
  type: string;
  assignedTo: string;
  dateFrom: string;
  dateTo: string;
}

// Mock investigations for URL lookup
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
];

function InvestigationsPageContent() {
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedInvestigation, setSelectedInvestigation] = useState<Investigation | null>(null);
  const [showNetworkGraph, setShowNetworkGraph] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [filters, setFilters] = useState<InvestigationFiltersState>({
    search: '',
    status: '',
    priority: '',
    type: '',
    assignedTo: '',
    dateFrom: '',
    dateTo: '',
  });

  // Handle URL params for deep linking
  useEffect(() => {
    const invId = searchParams.get('id');
    if (invId) {
      const investigation = mockInvestigations.find(
        i => i.id === invId || i.investigation_id === invId
      );
      if (investigation) {
        setSelectedInvestigation(investigation);
      }
    }
  }, [searchParams]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* Main content */}
            <div className={`flex-1 overflow-y-auto p-6 ${selectedInvestigation ? 'lg:w-1/2' : 'w-full'}`}>
              <div className="space-y-6">
                {/* Page header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Investigations</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Gestion des enquetes de fraude
                    </p>
                  </div>
                  <button
                    onClick={() => setShowNewModal(true)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span>Nouvelle enquete</span>
                  </button>
                </div>

                {/* Stats */}
                <InvestigationStats />

                {/* Filters */}
                <InvestigationFilters filters={filters} onFiltersChange={setFilters} />

                {/* Investigation list */}
                <InvestigationList
                  filters={filters}
                  selectedId={selectedInvestigation?.id}
                  onSelectInvestigation={setSelectedInvestigation}
                />
              </div>
            </div>

            {/* Detail panel */}
            {selectedInvestigation && (
              <div className="hidden lg:block lg:w-1/2 border-l border-gray-200 overflow-y-auto">
                <InvestigationDetailPanel
                  investigation={selectedInvestigation}
                  onClose={() => setSelectedInvestigation(null)}
                  onShowNetwork={() => setShowNetworkGraph(true)}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <NewInvestigationModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
      />

      <NetworkGraphModal
        isOpen={showNetworkGraph}
        onClose={() => setShowNetworkGraph(false)}
        investigation={selectedInvestigation}
      />
    </div>
  );
}

function InvestigationsPageLoading() {
  return (
    <div className="flex h-screen bg-gray-50 items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  );
}

export default function InvestigationsPage() {
  return (
    <Suspense fallback={<InvestigationsPageLoading />}>
      <InvestigationsPageContent />
    </Suspense>
  );
}
