'use client';

import { useState } from 'react';
import { useFraudStatistics } from '@/hooks/useApi';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { clsx } from 'clsx';

type ChartType = 'area' | 'bar';
type GroupBy = 'day' | 'week' | 'month';

// Mock data for demo
const mockData = [
  { date: '01/12', transactions: 1200, flagged: 24, confirmed_fraud: 18, amount: 245000, flagged_amount: 45000 },
  { date: '02/12', transactions: 1350, flagged: 31, confirmed_fraud: 22, amount: 278000, flagged_amount: 52000 },
  { date: '03/12', transactions: 1100, flagged: 18, confirmed_fraud: 14, amount: 198000, flagged_amount: 28000 },
  { date: '04/12', transactions: 1450, flagged: 35, confirmed_fraud: 28, amount: 312000, flagged_amount: 67000 },
  { date: '05/12', transactions: 1280, flagged: 22, confirmed_fraud: 17, amount: 256000, flagged_amount: 38000 },
  { date: '06/12', transactions: 1520, flagged: 28, confirmed_fraud: 21, amount: 334000, flagged_amount: 48000 },
  { date: '07/12', transactions: 1380, flagged: 25, confirmed_fraud: 19, amount: 289000, flagged_amount: 42000 },
  { date: '08/12', transactions: 1600, flagged: 32, confirmed_fraud: 25, amount: 356000, flagged_amount: 58000 },
  { date: '09/12', transactions: 1420, flagged: 21, confirmed_fraud: 16, amount: 298000, flagged_amount: 36000 },
  { date: '10/12', transactions: 1550, flagged: 29, confirmed_fraud: 22, amount: 342000, flagged_amount: 52000 },
  { date: '11/12', transactions: 1480, flagged: 26, confirmed_fraud: 20, amount: 318000, flagged_amount: 45000 },
  { date: '12/12', transactions: 1620, flagged: 30, confirmed_fraud: 24, amount: 378000, flagged_amount: 54000 },
];

interface StatisticsChartProps {
  startDate?: string;
  endDate?: string;
}

export function StatisticsChart({ startDate, endDate }: StatisticsChartProps) {
  const [chartType, setChartType] = useState<ChartType>('area');
  const [groupBy, setGroupBy] = useState<GroupBy>('day');

  const { data, isLoading } = useFraudStatistics({ start_date: startDate, end_date: endDate, group_by: groupBy });

  // Use mock data if API returns empty
  const chartData = (data?.statistics && data.statistics.length > 0)
    ? data.statistics.map(item => ({
        date: item.date,
        transactions: item.transactions,
        flagged: item.flagged,
        confirmed: item.confirmed_fraud,
      }))
    : mockData.map(item => ({
        date: item.date,
        transactions: item.transactions,
        flagged: item.flagged,
        confirmed: item.confirmed_fraud,
      }));

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
          <div className="h-80 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Statistiques detaillees</h3>
          <p className="text-sm text-gray-500">Evolution des transactions et fraudes</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Group by selector */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {(['day', 'week', 'month'] as GroupBy[]).map((group) => (
              <button
                key={group}
                onClick={() => setGroupBy(group)}
                className={clsx(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  groupBy === group
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {group === 'day' ? 'Jour' : group === 'week' ? 'Semaine' : 'Mois'}
              </button>
            ))}
          </div>
          {/* Chart type selector */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {(['area', 'bar'] as ChartType[]).map((type) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={clsx(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  chartType === type
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {type === 'area' ? 'Aire' : 'Barres'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="transactions"
                name="Transactions"
                stackId="1"
                stroke="#3B82F6"
                fill="#93C5FD"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="flagged"
                name="Signalees"
                stackId="2"
                stroke="#F59E0B"
                fill="#FCD34D"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="confirmed"
                name="Confirmees"
                stackId="3"
                stroke="#EF4444"
                fill="#FCA5A5"
                fillOpacity={0.6}
              />
            </AreaChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend />
              <Bar dataKey="transactions" name="Transactions" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="flagged" name="Signalees" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="confirmed" name="Confirmees" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Totals */}
      {data?.totals && (
        <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total transactions</p>
            <p className="text-lg font-semibold text-gray-900">{data.totals.total_transactions.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total signalees</p>
            <p className="text-lg font-semibold text-yellow-600">{data.totals.total_flagged.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Montant total</p>
            <p className="text-lg font-semibold text-gray-900">{(data.totals.total_amount / 1000).toFixed(0)}K EUR</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Montant signale</p>
            <p className="text-lg font-semibold text-red-600">{(data.totals.flagged_amount / 1000).toFixed(0)}K EUR</p>
          </div>
        </div>
      )}
    </div>
  );
}
