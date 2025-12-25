'use client';

import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { InvestigationFiltersState } from '@/app/investigations/page';

interface InvestigationFiltersProps {
  filters: InvestigationFiltersState;
  onFiltersChange: (filters: InvestigationFiltersState) => void;
}

const statusOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: 'open', label: 'Ouvert' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'pending_review', label: 'En attente de revision' },
  { value: 'closed', label: 'Cloture' },
  { value: 'escalated', label: 'Escalade' },
];

const priorityOptions = [
  { value: '', label: 'Toutes les priorites' },
  { value: 'low', label: 'Faible' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'high', label: 'Haute' },
  { value: 'critical', label: 'Critique' },
];

const typeOptions = [
  { value: '', label: 'Tous les types' },
  { value: 'fraud_ring', label: 'Reseau de fraude' },
  { value: 'identity_theft', label: 'Vol d\'identite' },
  { value: 'document_fraud', label: 'Fraude documentaire' },
  { value: 'benefit_fraud', label: 'Fraude aux prestations' },
  { value: 'other', label: 'Autre' },
];

const assigneeOptions = [
  { value: '', label: 'Tous les enqueteurs' },
  { value: 'marie.dupont', label: 'Marie Dupont' },
  { value: 'jean.martin', label: 'Jean Martin' },
  { value: 'sophie.bernard', label: 'Sophie Bernard' },
  { value: 'pierre.durand', label: 'Pierre Durand' },
];

export function InvestigationFilters({ filters, onFiltersChange }: InvestigationFiltersProps) {
  const handleChange = (field: keyof InvestigationFiltersState, value: string) => {
    onFiltersChange({ ...filters, [field]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: '',
      priority: '',
      type: '',
      assignedTo: '',
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

        {/* Priority */}
        <div>
          <select
            value={filters.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
          >
            {priorityOptions.map((opt) => (
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

        {/* Assigned To */}
        <div>
          <select
            value={filters.assignedTo}
            onChange={(e) => handleChange('assignedTo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
          >
            {assigneeOptions.map((opt) => (
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
            placeholder="Date debut"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Date To */}
        <div>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleChange('dateTo', e.target.value)}
            placeholder="Date fin"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>
    </div>
  );
}
