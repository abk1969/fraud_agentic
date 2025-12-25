'use client';

import { useState, Suspense } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import {
  AnalyticsStats,
  FraudTypeChart,
  StatisticsChart,
  RiskRankingTable,
  ModelPerformanceCard,
  ExportModal,
} from '@/components/analytics';
import {
  ArrowPathIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import { useQueryClient } from '@tanstack/react-query';
import { clsx } from 'clsx';

type Period = '7d' | '30d' | '90d' | '365d';

function AnalyticsPageContent() {
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [period, setPeriod] = useState<Period>('30d');
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  const periods: { value: Period; label: string }[] = [
    { value: '7d', label: '7 jours' },
    { value: '30d', label: '30 jours' },
    { value: '90d', label: '90 jours' },
    { value: '365d', label: '1 an' },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['analytics-dashboard'] }),
      queryClient.invalidateQueries({ queryKey: ['fraud-statistics'] }),
      queryClient.invalidateQueries({ queryKey: ['fraud-type-distribution'] }),
      queryClient.invalidateQueries({ queryKey: ['provider-risk-ranking'] }),
      queryClient.invalidateQueries({ queryKey: ['beneficiary-risk-ranking'] }),
      queryClient.invalidateQueries({ queryKey: ['model-performance'] }),
      queryClient.invalidateQueries({ queryKey: ['training-status'] }),
    ]);
    setIsRefreshing(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Page header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Analytique</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Metriques de performance, tendances et analyse detaillee
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {/* Period selector */}
                <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                  {periods.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setPeriod(p.value)}
                      className={clsx(
                        'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                        period === p.value
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-500 hover:bg-gray-100'
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Filters toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={clsx(
                    'btn-secondary flex items-center space-x-2',
                    showFilters && 'bg-primary-50 text-primary-700'
                  )}
                >
                  <AdjustmentsHorizontalIcon className="h-5 w-5" />
                  <span>Filtres</span>
                </button>

                {/* Refresh button */}
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <ArrowPathIcon className={clsx('h-5 w-5', isRefreshing && 'animate-spin')} />
                  <span>Actualiser</span>
                </button>

                {/* Export button */}
                <button
                  onClick={() => setShowExportModal(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <DocumentArrowDownIcon className="h-5 w-5" />
                  <span>Exporter</span>
                </button>
              </div>
            </div>

            {/* Filters panel */}
            {showFilters && (
              <div className="card">
                <div className="flex items-center space-x-4">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <div className="flex items-center space-x-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Date debut</label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <span className="text-gray-400">-</span>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Date fin</label>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setDateRange({ start: '', end: '' })}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Reinitialiser
                  </button>
                </div>
              </div>
            )}

            {/* Stats */}
            <AnalyticsStats period={period} />

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column - Charts */}
              <div className="lg:col-span-2 space-y-6">
                {/* Statistics chart */}
                <StatisticsChart
                  startDate={dateRange.start || undefined}
                  endDate={dateRange.end || undefined}
                />

                {/* Risk ranking */}
                <RiskRankingTable />
              </div>

              {/* Right column */}
              <div className="space-y-6">
                {/* Fraud type distribution */}
                <FraudTypeChart period={period} />

                {/* Model performance */}
                <ModelPerformanceCard period={period} />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
}

function AnalyticsPageLoading() {
  return (
    <div className="flex h-screen bg-gray-50 items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Chargement des analytiques...</p>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<AnalyticsPageLoading />}>
      <AnalyticsPageContent />
    </Suspense>
  );
}
