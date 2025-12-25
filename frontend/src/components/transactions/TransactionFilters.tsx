'use client';

import { useState } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import type { TransactionFiltersState } from '@/app/transactions/page';

interface TransactionFiltersProps {
  filters: TransactionFiltersState;
  onFiltersChange: (filters: TransactionFiltersState) => void;
}

const statusOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'approved', label: 'Approuvee' },
  { value: 'rejected', label: 'Rejetee' },
  { value: 'review', label: 'A examiner' },
  { value: 'investigating', label: 'Investigation' },
];

const riskLevelOptions = [
  { value: '', label: 'Tous les niveaux' },
  { value: 'low', label: 'Faible' },
  { value: 'medium', label: 'Moyen' },
  { value: 'high', label: 'Eleve' },
  { value: 'critical', label: 'Critique' },
];

export function TransactionFilters({ filters, onFiltersChange }: TransactionFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof TransactionFiltersState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: '',
      riskLevel: '',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  return (
    <div className="card !p-4 space-y-4">
      {/* Main filters row */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par ID, beneficiaire..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Status */}
        <div className="w-full md:w-48">
          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Risk Level */}
        <div className="w-full md:w-48">
          <select
            value={filters.riskLevel}
            onChange={(e) => updateFilter('riskLevel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
          >
            {riskLevelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Advanced toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={clsx(
            'flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors',
            showAdvanced
              ? 'bg-primary-50 border-primary-200 text-primary-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          )}
        >
          <FunnelIcon className="h-5 w-5" />
          <span>Filtres</span>
          <ChevronDownIcon
            className={clsx(
              'h-4 w-4 transition-transform',
              showAdvanced && 'rotate-180'
            )}
          />
        </button>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
            <span>Effacer</span>
          </button>
        )}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          {/* Date from */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date debut
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Date to */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date fin
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Min amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant min (EUR)
            </label>
            <input
              type="number"
              placeholder="0"
              value={filters.minAmount}
              onChange={(e) => updateFilter('minAmount', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Max amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant max (EUR)
            </label>
            <input
              type="number"
              placeholder="100000"
              value={filters.maxAmount}
              onChange={(e) => updateFilter('maxAmount', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
