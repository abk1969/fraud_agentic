'use client';

import { useAnalyticsDashboard } from '@/hooks/useApi';
import {
  ChartBarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CurrencyEuroIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: number;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

function StatCard({ title, value, subtitle, icon: Icon, trend, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className={clsx('p-3 rounded-xl', colorClasses[color])}>
          <Icon className="h-6 w-6" />
        </div>
        {trend !== undefined && (
          <span
            className={clsx(
              'text-sm font-medium px-2 py-1 rounded-full',
              trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            )}
          >
            {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}

interface AnalyticsStatsProps {
  period: string;
}

export function AnalyticsStats({ period }: AnalyticsStatsProps) {
  const { data, isLoading } = useAnalyticsDashboard(period);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-12 w-12 bg-gray-200 rounded-xl" />
            <div className="mt-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Transactions analysees',
      value: data?.summary.total_transactions.toLocaleString() || '0',
      icon: ChartBarIcon,
      color: 'blue' as const,
    },
    {
      title: 'Fraudes confirmees',
      value: data?.summary.confirmed_fraud.toLocaleString() || '0',
      subtitle: `${(data?.metrics?.detection_rate ?? 0).toFixed(1)}% taux detection`,
      icon: ShieldCheckIcon,
      color: 'green' as const,
    },
    {
      title: 'En attente de revue',
      value: data?.summary.pending_review.toLocaleString() || '0',
      icon: ClockIcon,
      color: 'yellow' as const,
    },
    {
      title: 'Faux positifs',
      value: data?.summary.false_positives.toLocaleString() || '0',
      subtitle: `${(data?.metrics?.false_positive_rate ?? 0).toFixed(1)}% taux FP`,
      icon: ExclamationTriangleIcon,
      color: 'red' as const,
    },
    {
      title: 'Precision',
      value: `${((data?.metrics?.precision ?? 0) * 100).toFixed(1)}%`,
      subtitle: `Recall: ${((data?.metrics?.recall ?? 0) * 100).toFixed(1)}%`,
      icon: CheckCircleIcon,
      color: 'purple' as const,
    },
    {
      title: 'Montant protege',
      value: `${((data?.summary.total_amount_saved || 0) / 1000).toFixed(0)}K`,
      subtitle: 'EUR economises',
      icon: CurrencyEuroIcon,
      color: 'green' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
