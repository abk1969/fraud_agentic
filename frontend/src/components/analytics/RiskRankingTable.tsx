'use client';

import { useState } from 'react';
import { useProviderRiskRanking, useBeneficiaryRiskRanking } from '@/hooks/useApi';
import { clsx } from 'clsx';
import {
  BuildingOfficeIcon,
  UserIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

type RankingType = 'providers' | 'beneficiaries';

// Mock data for demo
const mockProviders = [
  { provider_id: 'PRO-001', provider_name: 'Cabinet Medical Alpha', risk_score: 0.89, total_transactions: 245, flagged_transactions: 42, total_amount: 156000, fraud_rate: 17.1 },
  { provider_id: 'PRO-002', provider_name: 'Clinique Beta', risk_score: 0.76, total_transactions: 189, flagged_transactions: 28, total_amount: 234000, fraud_rate: 14.8 },
  { provider_id: 'PRO-003', provider_name: 'Laboratoire Gamma', risk_score: 0.72, total_transactions: 312, flagged_transactions: 38, total_amount: 89000, fraud_rate: 12.2 },
  { provider_id: 'PRO-004', provider_name: 'Centre Dentaire Delta', risk_score: 0.68, total_transactions: 156, flagged_transactions: 18, total_amount: 178000, fraud_rate: 11.5 },
  { provider_id: 'PRO-005', provider_name: 'Pharmacie Epsilon', risk_score: 0.65, total_transactions: 423, flagged_transactions: 45, total_amount: 67000, fraud_rate: 10.6 },
  { provider_id: 'PRO-006', provider_name: 'Hopital Zeta', risk_score: 0.58, total_transactions: 567, flagged_transactions: 52, total_amount: 456000, fraud_rate: 9.2 },
  { provider_id: 'PRO-007', provider_name: 'Cabinet Optique Eta', risk_score: 0.54, total_transactions: 234, flagged_transactions: 19, total_amount: 123000, fraud_rate: 8.1 },
  { provider_id: 'PRO-008', provider_name: 'Centre Kine Theta', risk_score: 0.48, total_transactions: 178, flagged_transactions: 12, total_amount: 89000, fraud_rate: 6.7 },
];

const mockBeneficiaries = [
  { beneficiary_id: 'BEN-001', beneficiary_name: 'Jean Dupont', risk_score: 0.92, total_transactions: 34, flagged_transactions: 12, total_amount: 45000, fraud_rate: 35.3 },
  { beneficiary_id: 'BEN-002', beneficiary_name: 'Marie Martin', risk_score: 0.85, total_transactions: 28, flagged_transactions: 9, total_amount: 38000, fraud_rate: 32.1 },
  { beneficiary_id: 'BEN-003', beneficiary_name: 'Pierre Bernard', risk_score: 0.78, total_transactions: 42, flagged_transactions: 11, total_amount: 52000, fraud_rate: 26.2 },
  { beneficiary_id: 'BEN-004', beneficiary_name: 'Sophie Leroy', risk_score: 0.71, total_transactions: 19, flagged_transactions: 4, total_amount: 23000, fraud_rate: 21.1 },
  { beneficiary_id: 'BEN-005', beneficiary_name: 'Luc Moreau', risk_score: 0.68, total_transactions: 56, flagged_transactions: 10, total_amount: 67000, fraud_rate: 17.9 },
  { beneficiary_id: 'BEN-006', beneficiary_name: 'Claire Simon', risk_score: 0.62, total_transactions: 31, flagged_transactions: 5, total_amount: 34000, fraud_rate: 16.1 },
  { beneficiary_id: 'BEN-007', beneficiary_name: 'Antoine Laurent', risk_score: 0.55, total_transactions: 45, flagged_transactions: 6, total_amount: 48000, fraud_rate: 13.3 },
  { beneficiary_id: 'BEN-008', beneficiary_name: 'Emma Petit', risk_score: 0.49, total_transactions: 23, flagged_transactions: 2, total_amount: 19000, fraud_rate: 8.7 },
];

function getRiskBadgeColor(score: number): string {
  if (score >= 0.8) return 'bg-red-100 text-red-700';
  if (score >= 0.6) return 'bg-orange-100 text-orange-700';
  if (score >= 0.4) return 'bg-yellow-100 text-yellow-700';
  return 'bg-green-100 text-green-700';
}

export function RiskRankingTable() {
  const [rankingType, setRankingType] = useState<RankingType>('providers');
  const [limit, setLimit] = useState(10);

  const { data: providersData, isLoading: providersLoading } = useProviderRiskRanking(limit);
  const { data: beneficiariesData, isLoading: beneficiariesLoading } = useBeneficiaryRiskRanking(limit);

  const isLoading = rankingType === 'providers' ? providersLoading : beneficiariesLoading;

  // Use mock data if API returns empty
  const providers = (providersData?.ranking && providersData.ranking.length > 0)
    ? providersData.ranking
    : mockProviders;

  const beneficiaries = (beneficiariesData?.ranking && beneficiariesData.ranking.length > 0)
    ? beneficiariesData.ranking
    : mockBeneficiaries;

  const data = rankingType === 'providers' ? providers : beneficiaries;

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Classement par risque</h3>
          <p className="text-sm text-gray-500">Entites a surveiller en priorite</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Type selector */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setRankingType('providers')}
              className={clsx(
                'flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                rankingType === 'providers'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <BuildingOfficeIcon className="h-4 w-4" />
              <span>Prestataires</span>
            </button>
            <button
              onClick={() => setRankingType('beneficiaries')}
              className={clsx(
                'flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                rankingType === 'beneficiaries'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <UserIcon className="h-4 w-4" />
              <span>Beneficiaires</span>
            </button>
          </div>
          {/* Limit selector */}
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Rang</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                {rankingType === 'providers' ? 'Prestataire' : 'Beneficiaire'}
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Score risque</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Transactions</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Signalees</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Taux fraude</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Montant</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, limit).map((item, index) => {
              const name = rankingType === 'providers'
                ? (item as typeof mockProviders[0]).provider_name
                : (item as typeof mockBeneficiaries[0]).beneficiary_name;
              const id = rankingType === 'providers'
                ? (item as typeof mockProviders[0]).provider_id
                : (item as typeof mockBeneficiaries[0]).beneficiary_id;

              return (
                <tr key={id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className={clsx(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                      index === 0 ? 'bg-red-100 text-red-700' :
                      index === 1 ? 'bg-orange-100 text-orange-700' :
                      index === 2 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    )}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{name}</p>
                      <p className="text-sm text-gray-500">{id}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={clsx(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium',
                      getRiskBadgeColor(item.risk_score)
                    )}>
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      {(item.risk_score * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900">
                    {item.total_transactions.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-red-600 font-medium">
                      {item.flagged_transactions.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <ArrowTrendingUpIcon className="h-4 w-4 text-red-500" />
                      <span className="text-red-600 font-medium">{item.fraud_rate.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900">
                    {(item.total_amount / 1000).toFixed(0)}K
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
