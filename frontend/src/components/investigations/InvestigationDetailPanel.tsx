'use client';

import { useState } from 'react';
import {
  XMarkIcon,
  UserIcon,
  DocumentTextIcon,
  CalendarIcon,
  CurrencyEuroIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  PlusIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import type { Investigation, Finding } from '@/app/investigations/page';

interface InvestigationDetailPanelProps {
  investigation: Investigation;
  onClose: () => void;
  onShowNetwork: () => void;
}

const statusConfig = {
  open: { label: 'Ouvert', color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'En cours', color: 'bg-amber-100 text-amber-800' },
  pending_review: { label: 'En revision', color: 'bg-purple-100 text-purple-800' },
  closed: { label: 'Cloture', color: 'bg-green-100 text-green-800' },
  escalated: { label: 'Escalade', color: 'bg-red-100 text-red-800' },
};

const priorityConfig = {
  low: { label: 'Faible', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  medium: { label: 'Moyenne', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  high: { label: 'Haute', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  critical: { label: 'Critique', color: 'text-red-600', bgColor: 'bg-red-100' },
};

const typeLabels = {
  fraud_ring: 'Reseau de fraude',
  identity_theft: 'Vol d\'identite',
  document_fraud: 'Fraude documentaire',
  benefit_fraud: 'Fraude aux prestations',
  other: 'Autre',
};

const entityTypeIcons = {
  beneficiary: UserIcon,
  address: DocumentTextIcon,
  bank_account: CurrencyEuroIcon,
  phone: DocumentTextIcon,
  email: DocumentTextIcon,
  document: DocumentTextIcon,
};

const findingTypeConfig = {
  alert: { label: 'Alerte', color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon },
  evidence: { label: 'Preuve', color: 'bg-blue-100 text-blue-800', icon: DocumentTextIcon },
  note: { label: 'Note', color: 'bg-gray-100 text-gray-800', icon: DocumentTextIcon },
  action: { label: 'Action', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
};

export function InvestigationDetailPanel({
  investigation,
  onClose,
  onShowNetwork,
}: InvestigationDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'entities' | 'findings' | 'timeline'>('overview');
  const [newNote, setNewNote] = useState('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    // In a real app, this would call the API
    console.log('Adding note:', newNote);
    setNewNote('');
  };

  const tabs = [
    { id: 'overview', label: 'Apercu' },
    { id: 'entities', label: `Entites (${investigation.entities.length})` },
    { id: 'findings', label: `Constatations (${investigation.findings.length})` },
    { id: 'timeline', label: 'Historique' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold text-gray-900">
                {investigation.investigation_id}
              </h2>
              <span className={clsx('px-2 py-1 text-xs font-medium rounded-full', statusConfig[investigation.status].color)}>
                {statusConfig[investigation.status].label}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{investigation.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mt-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={clsx(
                'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                activeTab === tab.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Risk Score */}
            <div className={clsx(
              'p-4 rounded-lg border',
              investigation.risk_score > 0.7
                ? 'bg-red-50 border-red-200'
                : investigation.risk_score > 0.4
                ? 'bg-orange-50 border-orange-200'
                : 'bg-green-50 border-green-200'
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ShieldCheckIcon className={clsx(
                    'h-8 w-8',
                    investigation.risk_score > 0.7
                      ? 'text-red-600'
                      : investigation.risk_score > 0.4
                      ? 'text-orange-600'
                      : 'text-green-600'
                  )} />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Score de risque</p>
                    <p className={clsx(
                      'text-2xl font-bold',
                      investigation.risk_score > 0.7
                        ? 'text-red-600'
                        : investigation.risk_score > 0.4
                        ? 'text-orange-600'
                        : 'text-green-600'
                    )}>
                      {(investigation.risk_score * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
                <button
                  onClick={onShowNetwork}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                >
                  <ChartBarIcon className="h-5 w-5" />
                  <span>Voir le reseau</span>
                </button>
              </div>
              <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={clsx(
                    'h-full rounded-full transition-all',
                    investigation.risk_score > 0.7
                      ? 'bg-red-500'
                      : investigation.risk_score > 0.4
                      ? 'bg-orange-500'
                      : 'bg-green-500'
                  )}
                  style={{ width: `${investigation.risk_score * 100}%` }}
                />
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-500 mb-1">
                  <DocumentTextIcon className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase">Type</span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {typeLabels[investigation.type]}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-500 mb-1">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase">Priorite</span>
                </div>
                <span className={clsx(
                  'px-2 py-1 text-xs font-medium rounded-full',
                  priorityConfig[investigation.priority].bgColor,
                  priorityConfig[investigation.priority].color
                )}>
                  {priorityConfig[investigation.priority].label}
                </span>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-500 mb-1">
                  <UserIcon className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase">Assigne a</span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {investigation.assigned_to}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-500 mb-1">
                  <CurrencyEuroIcon className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase">Montant total</span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {formatAmount(investigation.total_amount)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-500 mb-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase">Creee le</span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(investigation.created_at)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-500 mb-1">
                  <ClockIcon className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase">Mise a jour</span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(investigation.updated_at)}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                {investigation.description}
              </p>
            </div>

            {/* Transactions */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Transactions liees ({investigation.transactions.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {investigation.transactions.map((txn) => (
                  <span
                    key={txn}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 cursor-pointer"
                  >
                    {txn}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'entities' && (
          <div className="space-y-4">
            {investigation.entities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucune entite liee a cette enquete
              </div>
            ) : (
              investigation.entities.map((entity) => {
                const Icon = entityTypeIcons[entity.type] || DocumentTextIcon;
                return (
                  <div
                    key={entity.id}
                    className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Icon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{entity.value}</p>
                          <p className="text-xs text-gray-500 capitalize">{entity.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={clsx(
                                'h-2 rounded-full',
                                entity.risk_score > 0.7
                                  ? 'bg-red-500'
                                  : entity.risk_score > 0.4
                                  ? 'bg-orange-500'
                                  : 'bg-green-500'
                              )}
                              style={{ width: `${entity.risk_score * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {(entity.risk_score * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {entity.connections} connexion(s)
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'findings' && (
          <div className="space-y-4">
            {/* Add Note */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Ajouter une note ou constatation..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>

            {investigation.findings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucune constatation enregistree
              </div>
            ) : (
              investigation.findings.map((finding) => {
                const config = findingTypeConfig[finding.type];
                const Icon = config.icon;
                return (
                  <div
                    key={finding.id}
                    className="p-4 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={clsx('p-2 rounded-lg', config.color)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={clsx('px-2 py-0.5 text-xs font-medium rounded-full', config.color)}>
                            {config.label}
                          </span>
                          {finding.severity && (
                            <span className={clsx(
                              'px-2 py-0.5 text-xs font-medium rounded-full',
                              finding.severity === 'critical'
                                ? 'bg-red-100 text-red-800'
                                : finding.severity === 'warning'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            )}>
                              {finding.severity === 'critical' ? 'Critique' : finding.severity === 'warning' ? 'Attention' : 'Info'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-900 mt-2">{finding.content}</p>
                        <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                          <span>{finding.created_by}</span>
                          <span>-</span>
                          <span>{formatDate(finding.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

              {/* Creation */}
              <div className="relative flex items-start space-x-4 pb-6">
                <div className="z-10 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <PlusIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Enquete creee</p>
                  <p className="text-xs text-gray-500">{formatDate(investigation.created_at)}</p>
                </div>
              </div>

              {/* Status changes */}
              {investigation.status !== 'open' && (
                <div className="relative flex items-start space-x-4 pb-6">
                  <div className="z-10 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                    <ArrowPathIcon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Statut change: {statusConfig[investigation.status].label}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(investigation.updated_at)}</p>
                  </div>
                </div>
              )}

              {/* Findings timeline */}
              {investigation.findings.map((finding) => {
                const config = findingTypeConfig[finding.type];
                return (
                  <div key={finding.id} className="relative flex items-start space-x-4 pb-6">
                    <div className={clsx(
                      'z-10 w-8 h-8 rounded-full flex items-center justify-center',
                      finding.type === 'alert' ? 'bg-red-500' :
                      finding.type === 'evidence' ? 'bg-blue-500' :
                      finding.type === 'action' ? 'bg-green-500' : 'bg-gray-500'
                    )}>
                      <config.icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{finding.content}</p>
                      <p className="text-xs text-gray-500">
                        {finding.created_by} - {formatDate(finding.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Closed */}
              {investigation.closed_at && (
                <div className="relative flex items-start space-x-4">
                  <div className="z-10 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Enquete cloturee</p>
                    <p className="text-xs text-gray-500">{formatDate(investigation.closed_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0">
        <div className="flex justify-between">
          <div className="flex space-x-2">
            {investigation.status !== 'closed' && (
              <>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                  Cloturer
                </button>
                {investigation.status !== 'escalated' && (
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                    Escalader
                  </button>
                )}
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
