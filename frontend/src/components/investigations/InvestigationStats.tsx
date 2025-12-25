'use client';

import { useState, useEffect } from 'react';
import {
  FolderOpenIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface StatItem {
  name: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export function InvestigationStats() {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/investigations/stats');
        if (response.ok) {
          const data = await response.json();
          setStats([
            {
              name: 'Enquetes ouvertes',
              value: data.open?.toString() || '24',
              change: '+3 cette semaine',
              changeType: 'neutral',
              icon: FolderOpenIcon,
              color: 'bg-blue-500',
            },
            {
              name: 'En cours',
              value: data.in_progress?.toString() || '12',
              change: '+2 depuis hier',
              changeType: 'neutral',
              icon: ClockIcon,
              color: 'bg-amber-500',
            },
            {
              name: 'Resolues ce mois',
              value: data.resolved?.toString() || '45',
              change: '+15%',
              changeType: 'positive',
              icon: CheckCircleIcon,
              color: 'bg-green-500',
            },
            {
              name: 'Escaladees',
              value: data.escalated?.toString() || '3',
              change: '-2',
              changeType: 'positive',
              icon: ExclamationTriangleIcon,
              color: 'bg-red-500',
            },
          ]);
        } else {
          loadMockStats();
        }
      } catch {
        loadMockStats();
      }
      setLoading(false);
    };

    const loadMockStats = () => {
      setStats([
        {
          name: 'Enquetes ouvertes',
          value: '24',
          change: '+3 cette semaine',
          changeType: 'neutral',
          icon: FolderOpenIcon,
          color: 'bg-blue-500',
        },
        {
          name: 'En cours',
          value: '12',
          change: '+2 depuis hier',
          changeType: 'neutral',
          icon: ClockIcon,
          color: 'bg-amber-500',
        },
        {
          name: 'Resolues ce mois',
          value: '45',
          change: '+15%',
          changeType: 'positive',
          icon: CheckCircleIcon,
          color: 'bg-green-500',
        },
        {
          name: 'Escaladees',
          value: '3',
          change: '-2',
          changeType: 'positive',
          icon: ExclamationTriangleIcon,
          color: 'bg-red-500',
        },
      ]);
    };

    fetchStats();
  }, []);

  if (loading) {
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
