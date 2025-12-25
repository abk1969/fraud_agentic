'use client';

import { useFraudTypeDistribution } from '@/hooks/useApi';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899'];

const FRAUD_TYPE_LABELS: Record<string, string> = {
  surfacturation: 'Surfacturation',
  prestations_fictives: 'Prestations fictives',
  usurpation_identite: 'Usurpation d\'identite',
  falsification_documents: 'Falsification documents',
  collusion: 'Collusion',
  fraude_cotisations: 'Fraude cotisations',
};

// Mock data for demo
const mockData = [
  { type: 'surfacturation', count: 145, percentage: 28.5, amount: 234500 },
  { type: 'prestations_fictives', count: 98, percentage: 19.2, amount: 187200 },
  { type: 'usurpation_identite', count: 87, percentage: 17.1, amount: 156800 },
  { type: 'falsification_documents', count: 76, percentage: 14.9, amount: 98700 },
  { type: 'collusion', count: 54, percentage: 10.6, amount: 234100 },
  { type: 'fraude_cotisations', count: 49, percentage: 9.6, amount: 312400 },
];

interface FraudTypeChartProps {
  period: string;
}

export function FraudTypeChart({ period }: FraudTypeChartProps) {
  const { data, isLoading } = useFraudTypeDistribution(period);

  // Use mock data if API returns empty
  const chartData = (data?.distribution && data.distribution.length > 0)
    ? data.distribution.map(item => ({
        name: FRAUD_TYPE_LABELS[item.type] || item.type,
        value: item.count,
        percentage: item.percentage,
        amount: item.amount,
      }))
    : mockData.map(item => ({
        name: FRAUD_TYPE_LABELS[item.type] || item.type,
        value: item.count,
        percentage: item.percentage,
        amount: item.amount,
      }));

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
          <div className="h-64 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Types de fraude</h3>
        <p className="text-sm text-gray-500">Distribution par categorie</p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                      <p className="font-medium text-gray-900">{data.name}</p>
                      <p className="text-sm text-gray-600">{data.value} cas ({data.percentage.toFixed(1)}%)</p>
                      <p className="text-sm text-gray-600">{(data.amount / 1000).toFixed(1)}K EUR</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total cas</p>
            <p className="text-lg font-semibold text-gray-900">
              {chartData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Montant total</p>
            <p className="text-lg font-semibold text-gray-900">
              {(chartData.reduce((sum, item) => sum + item.amount, 0) / 1000).toFixed(0)}K EUR
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
