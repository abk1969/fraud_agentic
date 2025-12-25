'use client';

import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { AlertFiltersState } from './AlertList';

interface AlertFiltersProps {
  filters: AlertFiltersState;
  onFiltersChange: (filters: AlertFiltersState) => void;
}

const severityOptions = [
  { value: '', label: 'Toutes les severites' },
  { value: 'info', label: 'Information' },
  { value: 'warning', label: 'Avertissement' },
  { value: 'high', label: 'Haute' },
  { value: 'critical', label: 'Critique' },
];

const statusOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: 'new', label: 'Nouvelle' },
  { value: 'acknowledged', label: 'Prise en compte' },
  { value: 'investigating', label: 'En investigation' },
  { value: 'resolved', label: 'Resolue' },
  { value: 'dismissed', label: 'Rejetee' },
];

const typeOptions = [
  { value: '', label: 'Tous les types' },
  { value: 'anomaly', label: 'Anomalie' },
  { value: 'threshold', label: 'Seuil depasse' },
  { value: 'pattern', label: 'Pattern detecte' },
  { value: 'ml_detection', label: 'Detection ML' },
  { value: 'rule_based', label: 'Regle metier' },
  { value: 'real_time', label: 'Temps reel' },
];

const entityTypeOptions = [
  { value: '', label: 'Toutes les entites' },
  { value: 'transaction', label: 'Transaction' },
  { value: 'beneficiary', label: 'Beneficiaire' },
  { value: 'document', label: 'Document' },
  { value: 'network', label: 'Reseau' },
  { value: 'system', label: 'Systeme' },
];

export function AlertFilters({ filters, onFiltersChange }: AlertFiltersProps) {
  const handleChange = (field: keyof AlertFiltersState, value: string) => {
    onFiltersChange({ ...filters, [field]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      severity: '',
      status: '',
      type: '',
      entityType: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filtres</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
          >
            <XMarkIcon className="h-4 w-4" />
            <span>Effacer</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par ID, titre, description..."
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Severity */}
        <div>
          <select
            value={filters.severity}
            onChange={(e) => handleChange('severity', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
          >
            {severityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div>
          <select
            value={filters.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
          >
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Entity Type */}
        <div>
          <select
            value={filters.entityType}
            onChange={(e) => handleChange('entityType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
          >
            {entityTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleChange('dateFrom', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Date To */}
        <div>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleChange('dateTo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>
    </div>
  );
}
