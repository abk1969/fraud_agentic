'use client';

import {
  BellAlertIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { useAlertStats } from '@/hooks/useApi';

interface StatItem {
  name: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const defaultStats: StatItem[] = [
  {
    name: 'Alertes actives',
    value: '47',
    change: '+12 aujourd\'hui',
    changeType: 'negative',
    icon: BellAlertIcon,
    color: 'bg-red-500',
  },
  {
    name: 'Alertes critiques',
    value: '8',
    change: '+3',
    changeType: 'negative',
    icon: ExclamationTriangleIcon,
    color: 'bg-orange-500',
  },
  {
    name: 'En investigation',
    value: '15',
    change: '+5 assignees',
    changeType: 'neutral',
    icon: ClockIcon,
    color: 'bg-amber-500',
  },
  {
    name: 'Resolues ce jour',
    value: '23',
    change: '+18%',
    changeType: 'positive',
    icon: CheckCircleIcon,
    color: 'bg-green-500',
  },
];

export function AlertStats() {
  const { data, isLoading, error } = useAlertStats();

  const stats: StatItem[] = data
    ? [
        {
          name: 'Alertes actives',
          value: data.active.toString(),
          change: `+${data.new_today} aujourd'hui`,
          changeType: data.new_today > 5 ? 'negative' : 'neutral',
          icon: BellAlertIcon,
          color: 'bg-red-500',
        },
        {
          name: 'Alertes critiques',
          value: data.critical.toString(),
          change: data.critical > 0 ? `${data.critical} en attente` : 'Aucune',
          changeType: data.critical > 3 ? 'negative' : data.critical > 0 ? 'neutral' : 'positive',
          icon: ExclamationTriangleIcon,
          color: 'bg-orange-500',
        },
        {
          name: 'En investigation',
          value: data.investigating.toString(),
          change: `${data.acknowledged} prises en compte`,
          changeType: 'neutral',
          icon: ClockIcon,
          color: 'bg-amber-500',
        },
        {
          name: 'Resolues ce jour',
          value: data.resolved_today.toString(),
          change: data.average_resolution_time > 0
            ? `Moy. ${Math.round(data.average_resolution_time / 60)}min`
            : 'N/A',
          changeType: 'positive',
          icon: CheckCircleIcon,
          color: 'bg-green-500',
        },
      ]
    : defaultStats;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
            <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4" />
            <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
            <div className="h-8 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.name}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className={clsx('p-3 rounded-lg', stat.color)}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div
                className={clsx(
                  'flex items-center text-sm font-medium',
                  stat.changeType === 'positive'
                    ? 'text-green-600'
                    : stat.changeType === 'negative'
                    ? 'text-red-600'
                    : 'text-gray-500'
                )}
              >
                {stat.changeType === 'positive' ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                ) : stat.changeType === 'negative' ? (
                  <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                ) : null}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
