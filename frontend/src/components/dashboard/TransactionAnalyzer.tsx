'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface AnalysisResult {
  decision: 'approve' | 'review' | 'reject';
  confidence: number;
  riskScore: number;
  factors: string[];
  recommendation: string;
}

export function TransactionAnalyzer() {
  const [transactionId, setTransactionId] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!transactionId.trim()) return;

    setIsAnalyzing(true);
    setResult(null);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock result
    const mockResults: AnalysisResult[] = [
      {
        decision: 'approve',
        confidence: 0.92,
        riskScore: 0.15,
        factors: ['Historique cohérent', 'Montant habituel', 'Bénéficiaire vérifié'],
        recommendation: 'Transaction conforme aux patterns habituels du bénéficiaire.',
      },
      {
        decision: 'review',
        confidence: 0.78,
        riskScore: 0.45,
        factors: ['Montant supérieur à la moyenne', 'Nouveau bénéficiaire', 'Adresse non vérifiée'],
        recommendation: 'Vérification manuelle recommandée avant validation.',
      },
      {
        decision: 'reject',
        confidence: 0.95,
        riskScore: 0.89,
        factors: ['Incohérence documentaire', 'Réseau frauduleux identifié', 'Usurpation suspectée'],
        recommendation: 'Blocage immédiat et investigation approfondie requise.',
      },
    ];

    setResult(mockResults[Math.floor(Math.random() * mockResults.length)]);
    setIsAnalyzing(false);
  };

  const decisionConfig = {
    approve: {
      icon: CheckCircleIcon,
      label: 'Approuvé',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      iconColor: 'text-green-500',
    },
    review: {
      icon: ExclamationTriangleIcon,
      label: 'À examiner',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-700',
      iconColor: 'text-amber-500',
    },
    reject: {
      icon: XCircleIcon,
      label: 'Rejeté',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      iconColor: 'text-red-500',
    },
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Analyse rapide de transaction
      </h3>

      <div className="flex space-x-3">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Entrez l'ID de transaction (ex: TXN-2024-1234)"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            />
          </div>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !transactionId.trim()}
          className={clsx(
            'px-4 py-2.5 rounded-lg font-medium flex items-center space-x-2 transition-colors',
            isAnalyzing || !transactionId.trim()
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          )}
        >
          {isAnalyzing ? (
            <>
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
              <span>Analyse...</span>
            </>
          ) : (
            <>
              <MagnifyingGlassIcon className="h-5 w-5" />
              <span>Analyser</span>
            </>
          )}
        </button>
      </div>

      {result && (
        <div
          className={clsx(
            'mt-4 p-4 rounded-lg border',
            decisionConfig[result.decision].bgColor,
            decisionConfig[result.decision].borderColor
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {(() => {
                const Icon = decisionConfig[result.decision].icon;
                return (
                  <Icon
                    className={clsx('h-6 w-6', decisionConfig[result.decision].iconColor)}
                  />
                );
              })()}
              <span
                className={clsx(
                  'text-lg font-semibold',
                  decisionConfig[result.decision].textColor
                )}
              >
                {decisionConfig[result.decision].label}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Score de risque</p>
              <p
                className={clsx(
                  'text-xl font-bold',
                  result.riskScore > 0.7
                    ? 'text-red-600'
                    : result.riskScore > 0.4
                    ? 'text-amber-600'
                    : 'text-green-600'
                )}
              >
                {(result.riskScore * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Facteurs identifiés:</p>
            <div className="flex flex-wrap gap-2">
              {result.factors.map((factor, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-white rounded text-xs text-gray-600 border border-gray-200"
                >
                  {factor}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Recommandation:</span> {result.recommendation}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Confiance du modèle: {(result.confidence * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
