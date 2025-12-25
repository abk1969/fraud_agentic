'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import {
  AlertStats,
  AlertFilters,
  AlertList,
  AlertDetailModal,
  AlertRulesModal,
  type AlertFiltersState,
} from '@/components/alerts';
import { Cog6ToothIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useQueryClient } from '@tanstack/react-query';
import { useAlerts } from '@/hooks/useApi';
import type { AlertDetails } from '@/lib/api';

function AlertsPageContent() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data: alertsData } = useAlerts();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AlertDetails | null>(null);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState<AlertFiltersState>({
    search: '',
    severity: '',
    status: '',
    type: '',
    entityType: '',
    dateFrom: '',
    dateTo: '',
  });

  // Handle URL params for deep linking - open alert from URL
  useEffect(() => {
    const alertId = searchParams.get('id');
    if (alertId && alertsData?.alerts) {
      const alert = alertsData.alerts.find(a => a.id === alertId || a.alert_id === alertId);
      if (alert) {
        setSelectedAlert(alert);
      }
    }
  }, [searchParams, alertsData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['alerts'] });
    await queryClient.invalidateQueries({ queryKey: ['alert-stats'] });
    setIsRefreshing(false);
  };

  const handleAlertUpdated = (updatedAlert: AlertDetails) => {
    setSelectedAlert(updatedAlert);
  };

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
                <h2 className="text-2xl font-bold text-gray-900">Alertes</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Surveillance et gestion des alertes de fraude en temps reel
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <ArrowPathIcon className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Actualiser</span>
                </button>
                <button
                  onClick={() => setShowRulesModal(true)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Cog6ToothIcon className="h-5 w-5" />
                  <span>Regles d'alerte</span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <AlertStats />

            {/* Filters */}
            <AlertFilters filters={filters} onFiltersChange={setFilters} />

            {/* Alert list */}
            <AlertList
              filters={filters}
              onSelectAlert={setSelectedAlert}
            />
          </div>
        </main>
      </div>

      {/* Modals */}
      <AlertDetailModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onAlertUpdated={handleAlertUpdated}
      />

      <AlertRulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />
    </div>
  );
}

function AlertsPageLoading() {
  return (
    <div className="flex h-screen bg-gray-50 items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  );
}

export default function AlertsPage() {
  return (
    <Suspense fallback={<AlertsPageLoading />}>
      <AlertsPageContent />
    </Suspense>
  );
}
