'use client';

import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface StatItem {
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
}

const stats: StatItem[] = [
  {
    label: 'Total aujourd\'hui',
    value: '1,247',
    change: '+18%',
    changeType: 'positive',
    icon: DocumentTextIcon,
    iconBg: 'bg-blue-500',
  },
  {
    label: 'En attente',
    value: '156',
    change: '-12%',
    changeType: 'positive',
    icon: ClockIcon,
    iconBg: 'bg-amber-500',
  },
  {
    label: 'Approuvees',
    value: '982',
    change: '+8%',
    changeType: 'positive',
    icon: CheckCircleIcon,
    iconBg: 'bg-green-500',
  },
  {
    label: 'Rejetees',
    value: '45',
    change: '-25%',
    changeType: 'positive',
    icon: XCircleIcon,
    iconBg: 'bg-red-500',
  },
  {
    label: 'A examiner',
    value: '64',
    change: '+5%',
    changeType: 'negative',
    icon: ExclamationTriangleIcon,
    iconBg: 'bg-purple-500',
  },
];

export function TransactionStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="card !p-4">
          <div className="flex items-center justify-between">
            <div className={clsx('p-2 rounded-lg', stat.iconBg)}>
              <stat.icon className="h-5 w-5 text-white" />
            </div>
            {stat.change && (
              <span
                className={clsx(
                  'text-xs font-medium',
                  stat.changeType === 'positive' && 'text-green-600',
                  stat.changeType === 'negative' && 'text-red-600',
                  stat.changeType === 'neutral' && 'text-gray-500'
                )}
              >
                {stat.change}
              </span>
            )}
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
