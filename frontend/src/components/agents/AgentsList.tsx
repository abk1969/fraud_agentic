'use client';

import { useState } from 'react';
import { useAgentsList } from '@/hooks/useApi';
import {
  CpuChipIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { AgentDetailModal } from './AgentDetailModal';

interface AgentInfo {
  agent_id: string;
  agent_name: string;
  status: 'active' | 'busy' | 'idle' | 'error' | 'unknown';
  is_healthy: boolean;
  capabilities: string[];
  supported_tasks: string[];
  last_heartbeat?: string;
}

const statusConfig = {
  active: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'Actif' },
  busy: { color: 'bg-blue-100 text-blue-800', icon: ClockIcon, label: 'Occupé' },
  idle: { color: 'bg-gray-100 text-gray-800', icon: EllipsisHorizontalIcon, label: 'Inactif' },
  error: { color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon, label: 'Erreur' },
  unknown: { color: 'bg-yellow-100 text-yellow-800', icon: ExclamationTriangleIcon, label: 'Inconnu' },
};

export function AgentsList() {
  const { data, isLoading, error } = useAgentsList();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  // Mock data for development
  const mockAgents: AgentInfo[] = [
    {
      agent_id: 'orchestrator',
      agent_name: 'FraudOrchestratorAgent',
      status: 'active',
      is_healthy: true,
      capabilities: ['orchestration', 'routing', 'decision'],
      supported_tasks: ['quick', 'standard', 'investigation', 'batch'],
    },
    {
      agent_id: 'document_analyst',
      agent_name: 'DocumentAnalystAgent',
      status: 'active',
      is_healthy: true,
      capabilities: ['ocr', 'tampering_detection', 'document_validation'],
      supported_tasks: ['document_analysis'],
    },
    {
      agent_id: 'transaction_analyst',
      agent_name: 'TransactionAnalystAgent',
      status: 'busy',
      is_healthy: true,
      capabilities: ['llm_scoring', 'rl_classification', 'risk_assessment'],
      supported_tasks: ['transaction_scoring'],
    },
    {
      agent_id: 'identity_verifier',
      agent_name: 'IdentityVerifierAgent',
      status: 'active',
      is_healthy: true,
      capabilities: ['rnipp_check', 'sanctions_check', 'rib_validation'],
      supported_tasks: ['identity_verification'],
    },
    {
      agent_id: 'pattern_detector',
      agent_name: 'PatternDetectorAgent',
      status: 'idle',
      is_healthy: true,
      capabilities: ['anomaly_detection', 'pattern_matching', 'behavioral_analysis'],
      supported_tasks: ['pattern_detection'],
    },
    {
      agent_id: 'network_analyzer',
      agent_name: 'NetworkAnalyzerAgent',
      status: 'active',
      is_healthy: true,
      capabilities: ['graph_analysis', 'fraud_ring_detection', 'link_analysis'],
      supported_tasks: ['network_analysis'],
    },
    {
      agent_id: 'explanation_generator',
      agent_name: 'ExplanationGeneratorAgent',
      status: 'active',
      is_healthy: true,
      capabilities: ['xai', 'report_generation', 'compliance_formatting'],
      supported_tasks: ['explanation_generation'],
    },
  ];

  const agents = data || mockAgents;

  return (
    <>
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary-100">
              <CpuChipIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Agents IA</h3>
              <p className="text-sm text-gray-500">Architecture hiérarchique ADK</p>
            </div>
          </div>
          <span className="text-sm text-gray-500">
            {agents.filter((a) => a.is_healthy).length}/{agents.length} sains
          </span>
        </div>

        <div className="space-y-2">
          {agents.map((agent) => {
            const config = statusConfig[agent.status] || statusConfig.unknown;
            const StatusIcon = config.icon;

            return (
              <div
                key={agent.agent_id}
                onClick={() => setSelectedAgent(agent.agent_id)}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={clsx(
                    'w-2 h-2 rounded-full',
                    agent.is_healthy ? 'bg-green-500' : 'bg-red-500'
                  )} />
                  <div>
                    <p className="font-medium text-gray-900">{agent.agent_name}</p>
                    <p className="text-xs text-gray-500">
                      {agent.capabilities.slice(0, 3).join(', ')}
                      {agent.capabilities.length > 3 && '...'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={clsx(
                    'flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    config.color
                  )}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {config.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedAgent && (
        <AgentDetailModal
          agentId={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </>
  );
}
