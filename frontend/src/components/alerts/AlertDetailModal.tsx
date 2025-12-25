'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  XMarkIcon,
  BellAlertIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShieldExclamationIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  XCircleIcon,
  ArrowRightIcon,
  ChatBubbleLeftIcon,
  FlagIcon,
  MagnifyingGlassIcon,
  DocumentMagnifyingGlassIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { useUpdateAlertStatus, useAddAlertComment, useCreateInvestigationFromAlert } from '@/hooks/useApi';
import type { AlertDetails, AlertAction, AlertActionType, AlertSeverity, AlertStatus } from '@/lib/api';

interface AlertDetailModalProps {
  alert: AlertDetails | null;
  onClose: () => void;
  onAlertUpdated?: (alert: AlertDetails) => void;
}

const severityConfig: Record<AlertSeverity, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  info: { label: 'Information', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: InformationCircleIcon },
  warning: { label: 'Avertissement', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: ExclamationTriangleIcon },
  high: { label: 'Haute', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: BellAlertIcon },
  critical: { label: 'Critique', color: 'bg-red-100 text-red-800 border-red-200', icon: ShieldExclamationIcon },
};

const statusConfig: Record<AlertStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  new: { label: 'Nouvelle', color: 'bg-red-100 text-red-800', icon: BellAlertIcon },
  acknowledged: { label: 'Prise en compte', color: 'bg-blue-100 text-blue-800', icon: EyeIcon },
  investigating: { label: 'En investigation', color: 'bg-purple-100 text-purple-800', icon: MagnifyingGlassIcon },
  resolved: { label: 'Resolue', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
  dismissed: { label: 'Rejetee', color: 'bg-gray-100 text-gray-800', icon: XCircleIcon },
};

const actionTypeConfig: Record<AlertActionType, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  acknowledge: { label: 'Prise en compte', color: 'bg-blue-500', icon: EyeIcon },
  investigate: { label: 'Investigation', color: 'bg-purple-500', icon: MagnifyingGlassIcon },
  escalate: { label: 'Escalade', color: 'bg-orange-500', icon: FlagIcon },
  resolve: { label: 'Resolution', color: 'bg-green-500', icon: CheckCircleIcon },
  dismiss: { label: 'Rejet', color: 'bg-gray-500', icon: XCircleIcon },
  comment: { label: 'Commentaire', color: 'bg-blue-400', icon: ChatBubbleLeftIcon },
};

export function AlertDetailModal({ alert, onClose, onAlertUpdated }: AlertDetailModalProps) {
  const router = useRouter();
  const [comment, setComment] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'actions' | 'related'>('details');

  const updateStatus = useUpdateAlertStatus();
  const addComment = useAddAlertComment();
  const createInvestigation = useCreateInvestigationFromAlert();

  if (!alert) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const SeverityIcon = severityConfig[alert.severity].icon;
  const StatusIcon = statusConfig[alert.status].icon;

  const handleAction = async (action: AlertActionType) => {
    try {
      const result = await updateStatus.mutateAsync({
        alertId: alert.id,
        action,
        comment: comment || undefined,
      });

      const actionLabels: Record<AlertActionType, string> = {
        acknowledge: 'Alerte prise en compte',
        investigate: 'Investigation demarree',
        escalate: 'Alerte escaladee',
        resolve: 'Alerte resolue',
        dismiss: 'Alerte rejetee',
        comment: 'Commentaire ajoute',
      };

      toast.success(actionLabels[action]);
      setComment('');

      if (onAlertUpdated) {
        onAlertUpdated(result);
      }

      // Close modal on resolve or dismiss
      if (action === 'resolve' || action === 'dismiss') {
        onClose();
      }
    } catch (error) {
      toast.error('Erreur lors de la mise a jour de l\'alerte');
      console.error('Error updating alert:', error);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    try {
      await addComment.mutateAsync({
        alertId: alert.id,
        comment: comment.trim(),
      });
      toast.success('Commentaire ajoute');
      setComment('');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du commentaire');
      console.error('Error adding comment:', error);
    }
  };

  const handleCreateInvestigation = async () => {
    try {
      const result = await createInvestigation.mutateAsync({
        alertId: alert.id,
        reason: `Investigation creee depuis l'alerte ${alert.alert_id}: ${alert.title}`,
      });
      toast.success('Investigation creee avec succes');
      onClose();
      router.push(`/investigations?id=${result.investigation_id}`);
    } catch (error) {
      toast.error('Erreur lors de la creation de l\'investigation');
      console.error('Error creating investigation:', error);
    }
  };

  const handleViewTransaction = (txnId: string) => {
    router.push(`/transactions?id=${txnId}`);
    onClose();
  };

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'actions', label: `Actions (${alert.actions_taken.length})` },
    { id: 'related', label: `Transactions (${alert.related_transactions.length})` },
  ];

  const isProcessing = updateStatus.isPending || addComment.isPending || createInvestigation.isPending;

  return (
    <Transition appear show={!!alert} as={Fragment}>
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
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={clsx(
                        'p-3 rounded-lg',
                        alert.severity === 'critical' ? 'bg-red-100' :
                        alert.severity === 'high' ? 'bg-orange-100' :
                        alert.severity === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                      )}>
                        <SeverityIcon className={clsx(
                          'h-6 w-6',
                          alert.severity === 'critical' ? 'text-red-600' :
                          alert.severity === 'high' ? 'text-orange-600' :
                          alert.severity === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                        )} />
                      </div>
                      <div>
                        <Dialog.Title className="text-lg font-semibold text-gray-900">
                          {alert.alert_id}
                        </Dialog.Title>
                        <p className="text-sm text-gray-500 mt-1">{alert.title}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={clsx(
                            'px-2 py-1 text-xs font-medium rounded-full',
                            severityConfig[alert.severity].color
                          )}>
                            {severityConfig[alert.severity].label}
                          </span>
                          <span className={clsx(
                            'px-2 py-1 text-xs font-medium rounded-full inline-flex items-center',
                            statusConfig[alert.status].color
                          )}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[alert.status].label}
                          </span>
                        </div>
                      </div>
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

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                  {activeTab === 'details' && (
                    <div className="space-y-6">
                      {/* Risk Score */}
                      <div className={clsx(
                        'p-4 rounded-lg border',
                        alert.risk_score > 0.7
                          ? 'bg-red-50 border-red-200'
                          : alert.risk_score > 0.4
                          ? 'bg-orange-50 border-orange-200'
                          : 'bg-green-50 border-green-200'
                      )}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Score de risque</p>
                            <p className={clsx(
                              'text-2xl font-bold',
                              alert.risk_score > 0.7
                                ? 'text-red-600'
                                : alert.risk_score > 0.4
                                ? 'text-orange-600'
                                : 'text-green-600'
                            )}>
                              {(alert.risk_score * 100).toFixed(0)}%
                            </p>
                          </div>
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={clsx(
                                'h-full rounded-full',
                                alert.risk_score > 0.7
                                  ? 'bg-red-500'
                                  : alert.risk_score > 0.4
                                  ? 'bg-orange-500'
                                  : 'bg-green-500'
                              )}
                              style={{ width: `${alert.risk_score * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                          {alert.description}
                        </p>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-xs font-medium text-gray-500 uppercase">Source</p>
                          <p className="text-sm font-medium text-gray-900 mt-1">{alert.source}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-xs font-medium text-gray-500 uppercase">Type</p>
                          <p className="text-sm font-medium text-gray-900 mt-1 capitalize">
                            {alert.type.replace('_', ' ')}
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-xs font-medium text-gray-500 uppercase">Entite</p>
                          <p className="text-sm font-medium text-gray-900 mt-1 capitalize">
                            {alert.entity_type}
                          </p>
                          <p className="text-xs text-gray-500">{alert.entity_id}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-xs font-medium text-gray-500 uppercase">Creee le</p>
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            {formatDate(alert.created_at)}
                          </p>
                        </div>
                      </div>

                      {/* Acknowledged/Resolved info */}
                      {(alert.acknowledged_by || alert.resolved_by) && (
                        <div className="grid grid-cols-2 gap-4">
                          {alert.acknowledged_by && (
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-xs font-medium text-blue-600 uppercase">Prise en compte par</p>
                              <p className="text-sm font-medium text-gray-900 mt-1">{alert.acknowledged_by}</p>
                              {alert.acknowledged_at && (
                                <p className="text-xs text-gray-500">{formatDate(alert.acknowledged_at)}</p>
                              )}
                            </div>
                          )}
                          {alert.resolved_by && (
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                              <p className="text-xs font-medium text-green-600 uppercase">Resolue par</p>
                              <p className="text-sm font-medium text-gray-900 mt-1">{alert.resolved_by}</p>
                              {alert.resolved_at && (
                                <p className="text-xs text-gray-500">{formatDate(alert.resolved_at)}</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Metadata */}
                      {Object.keys(alert.metadata).length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Donnees supplementaires</h4>
                          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            {Object.entries(alert.metadata).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-sm">
                                <span className="text-gray-500 capitalize">{key.replace('_', ' ')}:</span>
                                <span className="font-medium text-gray-900">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'actions' && (
                    <div className="space-y-4">
                      {alert.actions_taken.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          Aucune action enregistree pour cette alerte
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                          {alert.actions_taken.map((action, index) => {
                            const config = actionTypeConfig[action.action_type];
                            const Icon = config.icon;
                            return (
                              <div key={action.id} className="relative flex items-start space-x-4 pb-6">
                                <div className={clsx(
                                  'z-10 w-8 h-8 rounded-full flex items-center justify-center',
                                  config.color
                                )}>
                                  <Icon className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex-1 bg-gray-50 rounded-lg p-4">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-900">
                                      {config.label}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {formatDate(action.performed_at)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                                  <p className="text-xs text-gray-500 mt-2">Par {action.performed_by}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Add Comment */}
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Ajouter un commentaire</h4>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Votre commentaire..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            disabled={isProcessing}
                          />
                          <button
                            onClick={handleAddComment}
                            disabled={!comment.trim() || isProcessing}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {addComment.isPending ? 'Envoi...' : 'Envoyer'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'related' && (
                    <div className="space-y-4">
                      {alert.related_transactions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          Aucune transaction liee a cette alerte
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {alert.related_transactions.map((txn) => (
                            <div
                              key={txn}
                              onClick={() => handleViewTransaction(txn)}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors group"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white rounded-lg border group-hover:border-primary-300">
                                  <ClockIcon className="h-5 w-5 text-gray-400 group-hover:text-primary-500" />
                                </div>
                                <span className="text-sm font-medium text-gray-900">{txn}</span>
                              </div>
                              <ArrowTopRightOnSquareIcon className="h-5 w-5 text-gray-400 group-hover:text-primary-500" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex justify-between">
                    <div className="flex space-x-2">
                      {alert.status === 'new' && (
                        <button
                          onClick={() => handleAction('acknowledge')}
                          disabled={isProcessing}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
                        >
                          {updateStatus.isPending ? 'Traitement...' : 'Prendre en compte'}
                        </button>
                      )}
                      {(alert.status === 'new' || alert.status === 'acknowledged') && (
                        <>
                          <button
                            onClick={() => handleAction('investigate')}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm disabled:opacity-50"
                          >
                            Investiguer
                          </button>
                          <button
                            onClick={handleCreateInvestigation}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm disabled:opacity-50 flex items-center space-x-1"
                          >
                            <DocumentMagnifyingGlassIcon className="h-4 w-4" />
                            <span>{createInvestigation.isPending ? 'Creation...' : 'Creer Investigation'}</span>
                          </button>
                        </>
                      )}
                      {alert.status !== 'resolved' && alert.status !== 'dismissed' && (
                        <>
                          <button
                            onClick={() => handleAction('escalate')}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm disabled:opacity-50"
                          >
                            Escalader
                          </button>
                          <button
                            onClick={() => handleAction('resolve')}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                          >
                            Resoudre
                          </button>
                          <button
                            onClick={() => handleAction('dismiss')}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm disabled:opacity-50"
                          >
                            Rejeter
                          </button>
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
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
