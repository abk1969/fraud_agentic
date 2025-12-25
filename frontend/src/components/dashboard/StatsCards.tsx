'use client';

import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentMagnifyingGlassIcon,
  CurrencyEuroIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
}

function StatCard({ title, value, change, changeType, icon: Icon, iconBg }: StatCardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              {changeType === 'positive' ? (
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
              ) : changeType === 'negative' ? (
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
              ) : null}
              <span
                className={clsx(
                  'ml-1 text-sm',
                  changeType === 'positive' && 'text-green-600',
                  changeType === 'negative' && 'text-red-600',
                  changeType === 'neutral' && 'text-gray-500'
                )}
              >
                {change}
              </span>
            </div>
          )}
        </div>
        <div className={clsx('p-3 rounded-lg', iconBg)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export function StatsCards() {
  const stats = [
    {
      title: 'Transactions analysées',
      value: '12,847',
      change: '+12% ce mois',
      changeType: 'positive' as const,
      icon: DocumentMagnifyingGlassIcon,
      iconBg: 'bg-primary-500',
    },
    {
      title: 'Fraudes détectées',
      value: '234',
      change: '-8% ce mois',
      changeType: 'positive' as const,
      icon: ExclamationTriangleIcon,
      iconBg: 'bg-amber-500',
    },
    {
      title: 'Taux de détection',
      value: '95.2%',
      change: '+2.1% ce mois',
      changeType: 'positive' as const,
      icon: CheckCircleIcon,
      iconBg: 'bg-green-500',
    },
    {
      title: 'Montant économisé',
      value: '€847K',
      change: '+23% ce mois',
      changeType: 'positive' as const,
      icon: CurrencyEuroIcon,
      iconBg: 'bg-purple-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
