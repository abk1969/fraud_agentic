'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'Faible', value: 8547, color: '#10B981' },
  { name: 'Moyen', value: 2341, color: '#F59E0B' },
  { name: 'Élevé', value: 1245, color: '#F97316' },
  { name: 'Critique', value: 714, color: '#EF4444' },
];

export function RiskDistribution() {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Distribution des risques
      </h3>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [
                `${value.toLocaleString()} (${((value / total) * 100).toFixed(1)}%)`,
                'Transactions',
              ]}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 space-y-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className="h-3 w-3 rounded-full mr-2"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-600">{item.name}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-gray-900">
                {item.value.toLocaleString()}
              </span>
              <span className="text-xs text-gray-500 ml-1">
                ({((item.value / total) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
