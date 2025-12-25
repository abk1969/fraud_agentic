'use client';

import { StatsCards } from './dashboard/StatsCards';
import { FraudTrendChart } from './dashboard/FraudTrendChart';
import { RecentAlerts } from './dashboard/RecentAlerts';
import { RiskDistribution } from './dashboard/RiskDistribution';
import { AgentStatus } from './dashboard/AgentStatus';
import { TransactionAnalyzer } from './dashboard/TransactionAnalyzer';

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tableau de bord</h2>
        <p className="mt-1 text-sm text-gray-500">
          Vue d'ensemble de la détection de fraude
        </p>
      </div>

      {/* Stats cards */}
      <StatsCards />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Fraud trend chart */}
          <FraudTrendChart />

          {/* Transaction analyzer */}
          <TransactionAnalyzer />
        </div>

        {/* Right column - Alerts and status */}
        <div className="space-y-6">
          {/* Recent alerts */}
          <RecentAlerts />

          {/* Risk distribution */}
          <RiskDistribution />

          {/* Agent status */}
          <AgentStatus />
        </div>
      </div>
    </div>
  );
}
