'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { clsx } from 'clsx';

const mockData = [
  { date: '01/12', transactions: 1200, fraudes: 24, taux: 2.0 },
  { date: '02/12', transactions: 1350, fraudes: 31, taux: 2.3 },
  { date: '03/12', transactions: 1100, fraudes: 18, taux: 1.6 },
  { date: '04/12', transactions: 1450, fraudes: 35, taux: 2.4 },
  { date: '05/12', transactions: 1280, fraudes: 22, taux: 1.7 },
  { date: '06/12', transactions: 1520, fraudes: 28, taux: 1.8 },
  { date: '07/12', transactions: 1380, fraudes: 25, taux: 1.8 },
  { date: '08/12', transactions: 1600, fraudes: 32, taux: 2.0 },
  { date: '09/12', transactions: 1420, fraudes: 21, taux: 1.5 },
  { date: '10/12', transactions: 1550, fraudes: 29, taux: 1.9 },
  { date: '11/12', transactions: 1480, fraudes: 26, taux: 1.8 },
  { date: '12/12', transactions: 1620, fraudes: 30, taux: 1.9 },
];

type TimeRange = '7d' | '30d' | '90d';

export function FraudTrendChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: '7d', label: '7 jours' },
    { value: '30d', label: '30 jours' },
    { value: '90d', label: '90 jours' },
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Tendance des fraudes
          </h3>
          <p className="text-sm text-gray-500">
            Evolution des transactions et fraudes détectées
          </p>
        </div>
        <div className="flex space-x-2">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={clsx(
                'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                timeRange === range.value
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:bg-gray-100'
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
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
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="transactions"
              name="Transactions"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="fraudes"
              name="Fraudes"
              stroke="#EF4444"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
