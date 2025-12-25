'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  UserIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import type { Transaction } from '@/app/transactions/page';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

const statusConfig = {
  pending: {
    label: 'En attente',
    color: 'bg-gray-100 text-gray-800',
    icon: ClockIcon,
  },
  approved: {
    label: 'Approuvee',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircleIcon,
  },
  rejected: {
    label: 'Rejetee',
    color: 'bg-red-100 text-red-800',
    icon: XCircleIcon,
  },
  review: {
    label: 'A examiner',
    color: 'bg-amber-100 text-amber-800',
    icon: ExclamationTriangleIcon,
  },
  investigating: {
    label: 'Investigation',
    color: 'bg-purple-100 text-purple-800',
    icon: MagnifyingGlassIcon,
  },
};

const riskConfig = {
  low: {
    label: 'Faible',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  medium: {
    label: 'Moyen',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  high: {
    label: 'Eleve',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  critical: {
    label: 'Critique',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
};

export function TransactionDetailModal({
  transaction,
  onClose,
}: TransactionDetailModalProps) {
  if (!transaction) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'long',
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

  const StatusIcon = statusConfig[transaction.status].icon;
  const riskInfo = riskConfig[transaction.risk_level];

  return (
    <Transition appear show={!!transaction} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <Dialog.Title className="text-lg font-semibold text-gray-900">
                      Transaction {transaction.transaction_id}
                    </Dialog.Title>
                    <p className="text-sm text-gray-500">
                      Creee le {formatDate(transaction.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={clsx(
                        'px-3 py-1 text-sm font-medium rounded-full flex items-center space-x-1',
                        statusConfig[transaction.status].color
                      )}
                    >
                      <StatusIcon className="h-4 w-4" />
                      <span>{statusConfig[transaction.status].label}</span>
                    </span>
                    <button
                      onClick={onClose}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Risk Score Banner */}
                  <div
                    className={clsx(
                      'p-4 rounded-lg border',
                      riskInfo.bgColor,
                      riskInfo.borderColor
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <ShieldCheckIcon className={clsx('h-8 w-8', riskInfo.color)} />
                        <div>
                          <p className={clsx('text-lg font-semibold', riskInfo.color)}>
                            Niveau de risque: {riskInfo.label}
                          </p>
                          <p className="text-sm text-gray-600">
                            Score de fraude: {(transaction.risk_score * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={clsx(
                            'text-4xl font-bold',
                            riskInfo.color
                          )}
                        >
                          {(transaction.risk_score * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    {/* Risk Progress Bar */}
                    <div className="mt-4">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={clsx(
                            'h-full rounded-full transition-all',
                            transaction.risk_score > 0.7
                              ? 'bg-red-500'
                              : transaction.risk_score > 0.4
                              ? 'bg-orange-500'
                              : transaction.risk_score > 0.2
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          )}
                          style={{ width: `${transaction.risk_score * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Main Info Grid */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Beneficiary Info */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                        Beneficiaire
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <UserIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {transaction.beneficiary_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {transaction.beneficiary_id}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Transaction Info */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                        Transaction
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <CurrencyEuroIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {formatAmount(transaction.amount, transaction.currency)}
                            </p>
                            <p className="text-xs text-gray-500">Montant</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {transaction.type}
                            </p>
                            <p className="text-xs text-gray-500">Type</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <CalendarIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {formatDate(transaction.created_at)}
                            </p>
                            <p className="text-xs text-gray-500">Date de creation</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Factors */}
                  {transaction.factors && transaction.factors.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                        Facteurs de risque identifies
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {transaction.factors.map((factor, idx) => (
                          <span
                            key={idx}
                            className={clsx(
                              'px-3 py-1 text-sm rounded-full border',
                              transaction.risk_level === 'critical' || transaction.risk_level === 'high'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : transaction.risk_level === 'medium'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-gray-50 text-gray-700 border-gray-200'
                            )}
                          >
                            <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />
                            {factor}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      Historique
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="h-2 w-2 mt-2 rounded-full bg-blue-500" />
                        <div>
                          <p className="text-sm text-gray-900">Transaction creee</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(transaction.created_at)}
                          </p>
                        </div>
                      </div>
                      {transaction.analyzed_at && (
                        <div className="flex items-start space-x-3">
                          <div className="h-2 w-2 mt-2 rounded-full bg-green-500" />
                          <div>
                            <p className="text-sm text-gray-900">Analyse terminee</p>
                            <p className="text-xs text-gray-500">
                              {formatDate(transaction.analyzed_at)}
                            </p>
                          </div>
                        </div>
                      )}
                      {transaction.decision && (
                        <div className="flex items-start space-x-3">
                          <div
                            className={clsx(
                              'h-2 w-2 mt-2 rounded-full',
                              transaction.decision === 'approve'
                                ? 'bg-green-500'
                                : transaction.decision === 'reject'
                                ? 'bg-red-500'
                                : 'bg-amber-500'
                            )}
                          />
                          <div>
                            <p className="text-sm text-gray-900">
                              Decision: {transaction.decision}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(transaction.analyzed_at || transaction.created_at)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
                  <div className="flex space-x-3">
                    {transaction.status === 'review' && (
                      <>
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          Approuver
                        </button>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                          Rejeter
                        </button>
                      </>
                    )}
                    {(transaction.status === 'review' || transaction.status === 'approved') && (
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        Lancer investigation
                      </button>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
