'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition, Switch } from '@headlessui/react';
import {
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BoltIcon,
  CpuChipIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import type { AlertRule, AlertRuleType, AlertSeverity } from '@/lib/api';

interface AlertRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const typeConfig: Record<AlertRuleType, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  threshold: { label: 'Seuil', color: 'bg-blue-100 text-blue-800', icon: AdjustmentsHorizontalIcon },
  pattern: { label: 'Pattern', color: 'bg-purple-100 text-purple-800', icon: BoltIcon },
  ml: { label: 'Machine Learning', color: 'bg-green-100 text-green-800', icon: CpuChipIcon },
  composite: { label: 'Composite', color: 'bg-orange-100 text-orange-800', icon: SparklesIcon },
};

const severityConfig: Record<AlertSeverity, { label: string; color: string }> = {
  info: { label: 'Info', color: 'bg-blue-100 text-blue-800' },
  warning: { label: 'Attention', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'Haute', color: 'bg-orange-100 text-orange-800' },
  critical: { label: 'Critique', color: 'bg-red-100 text-red-800' },
};

const mockRules: AlertRule[] = [
  {
    id: '1',
    name: 'Seuil montant eleve',
    description: 'Declenche une alerte si le montant depasse 10 000 EUR',
    type: 'threshold',
    severity: 'high',
    enabled: true,
    conditions: 'amount > 10000',
    created_at: '2024-01-01T00:00:00Z',
    last_triggered: '2024-01-21T10:30:00Z',
    trigger_count: 156,
  },
  {
    id: '2',
    name: 'Detection anomalie ML',
    description: 'Modele de detection de fraude base sur le machine learning',
    type: 'ml',
    severity: 'critical',
    enabled: true,
    conditions: 'fraud_probability > 0.85',
    created_at: '2024-01-01T00:00:00Z',
    last_triggered: '2024-01-21T08:45:00Z',
    trigger_count: 89,
  },
  {
    id: '3',
    name: 'Pattern multi-beneficiaires',
    description: 'Detecte quand une meme IP est utilisee pour plusieurs beneficiaires',
    type: 'pattern',
    severity: 'high',
    enabled: true,
    conditions: 'same_ip_beneficiaries >= 3 within 24h',
    created_at: '2024-01-05T00:00:00Z',
    last_triggered: '2024-01-21T09:15:00Z',
    trigger_count: 45,
  },
  {
    id: '4',
    name: 'Seuil cumul journalier',
    description: 'Alerte si le cumul journalier pour un beneficiaire depasse 5000 EUR',
    type: 'threshold',
    severity: 'warning',
    enabled: true,
    conditions: 'daily_total > 5000',
    created_at: '2024-01-10T00:00:00Z',
    last_triggered: '2024-01-21T11:00:00Z',
    trigger_count: 234,
  },
  {
    id: '5',
    name: 'Verification signature',
    description: 'Verifie la conformite des signatures sur les documents',
    type: 'pattern',
    severity: 'warning',
    enabled: true,
    conditions: 'signature_match_score < 0.5',
    created_at: '2024-01-08T00:00:00Z',
    last_triggered: '2024-01-20T16:20:00Z',
    trigger_count: 78,
  },
  {
    id: '6',
    name: 'Reseau suspect',
    description: 'Detecte les reseaux de beneficiaires partageant des coordonnees',
    type: 'composite',
    severity: 'critical',
    enabled: true,
    conditions: 'shared_iban_count >= 5 OR shared_address_count >= 3',
    created_at: '2024-01-12T00:00:00Z',
    last_triggered: '2024-01-21T06:00:00Z',
    trigger_count: 23,
  },
  {
    id: '7',
    name: 'Tentatives connexion',
    description: 'Detecte les tentatives de connexion echouees repetees',
    type: 'threshold',
    severity: 'info',
    enabled: false,
    conditions: 'failed_logins >= 5 within 5min',
    created_at: '2024-01-15T00:00:00Z',
    trigger_count: 0,
  },
  {
    id: '8',
    name: 'Anomalie horaire',
    description: 'Detecte les transactions hors des heures normales',
    type: 'pattern',
    severity: 'info',
    enabled: true,
    conditions: 'transaction_hour < 6 OR transaction_hour > 22',
    created_at: '2024-01-18T00:00:00Z',
    last_triggered: '2024-01-20T23:45:00Z',
    trigger_count: 167,
  },
];

export function AlertRulesModal({ isOpen, onClose }: AlertRulesModalProps) {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchRules = async () => {
        try {
          const response = await fetch('http://localhost:8000/api/v1/alerts/rules');
          if (response.ok) {
            const data = await response.json();
            setRules(data.rules || data || mockRules);
          } else {
            setRules(mockRules);
          }
        } catch {
          setRules(mockRules);
        }
        setLoading(false);
      };

      fetchRules();
    }
  }, [isOpen]);

  const handleToggleRule = async (ruleId: string) => {
    setRules(rules.map(rule =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Jamais';
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredRules = rules.filter(rule =>
    rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const enabledCount = rules.filter(r => r.enabled).length;
  const totalTriggers = rules.reduce((sum, r) => sum + r.trigger_count, 0);

  return (
    <Transition appear show={isOpen} as={Fragment}>
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-gray-900">
                        Regles d'alerte
                      </Dialog.Title>
                      <p className="text-sm text-gray-500 mt-1">
                        Configurez les regles de detection des alertes
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 uppercase">Total regles</p>
                      <p className="text-xl font-bold text-gray-900">{rules.length}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 uppercase">Regles actives</p>
                      <p className="text-xl font-bold text-green-600">{enabledCount}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 uppercase">Declenchements</p>
                      <p className="text-xl font-bold text-blue-600">{totalTriggers}</p>
                    </div>
                  </div>

                  {/* Search and Add */}
                  <div className="flex items-center space-x-4 mt-4">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Rechercher une regle..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2">
                      <PlusIcon className="h-5 w-5" />
                      <span>Nouvelle regle</span>
                    </button>
                  </div>
                </div>

                {/* Rules List */}
                <div className="p-6 max-h-[50vh] overflow-y-auto">
                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : filteredRules.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Aucune regle trouvee
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredRules.map((rule) => {
                        const TypeIcon = typeConfig[rule.type].icon;
                        return (
                          <div
                            key={rule.id}
                            className={clsx(
                              'border rounded-lg p-4 transition-colors',
                              rule.enabled
                                ? 'border-gray-200 bg-white'
                                : 'border-gray-100 bg-gray-50'
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4">
                                <div className={clsx(
                                  'p-2 rounded-lg',
                                  typeConfig[rule.type].color
                                )}>
                                  <TypeIcon className="h-5 w-5" />
                                </div>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <h4 className={clsx(
                                      'text-sm font-medium',
                                      rule.enabled ? 'text-gray-900' : 'text-gray-500'
                                    )}>
                                      {rule.name}
                                    </h4>
                                    <span className={clsx(
                                      'px-2 py-0.5 text-xs font-medium rounded-full',
                                      severityConfig[rule.severity].color
                                    )}>
                                      {severityConfig[rule.severity].label}
                                    </span>
                                    <span className={clsx(
                                      'px-2 py-0.5 text-xs font-medium rounded-full',
                                      typeConfig[rule.type].color
                                    )}>
                                      {typeConfig[rule.type].label}
                                    </span>
                                  </div>
                                  <p className={clsx(
                                    'text-sm mt-1',
                                    rule.enabled ? 'text-gray-600' : 'text-gray-400'
                                  )}>
                                    {rule.description}
                                  </p>
                                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                    <span>Condition: <code className="bg-gray-100 px-1 rounded">{rule.conditions}</code></span>
                                  </div>
                                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                    <span>Dernier declenchement: {formatDate(rule.last_triggered)}</span>
                                    <span>|</span>
                                    <span>{rule.trigger_count} declenchement(s)</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <Switch
                                  checked={rule.enabled}
                                  onChange={() => handleToggleRule(rule.id)}
                                  className={clsx(
                                    rule.enabled ? 'bg-primary-600' : 'bg-gray-200',
                                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
                                  )}
                                >
                                  <span
                                    className={clsx(
                                      rule.enabled ? 'translate-x-5' : 'translate-x-0',
                                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                                    )}
                                  />
                                </Switch>
                                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
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
