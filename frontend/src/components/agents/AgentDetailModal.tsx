'use client';

import { useAgentDetails } from '@/hooks/useApi';
import {
  XMarkIcon,
  CpuChipIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  BoltIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface AgentDetailModalProps {
  agentId: string;
  onClose: () => void;
}

export function AgentDetailModal({ agentId, onClose }: AgentDetailModalProps) {
  const { data, isLoading } = useAgentDetails(agentId);

  // Mock data for development
  const mockAgentDetails: Record<string, any> = {
    orchestrator: {
      agent_id: 'orchestrator',
      agent_name: 'FraudOrchestratorAgent',
      description: 'Agent principal d\'orchestration qui coordonne tous les sous-agents pour l\'analyse de fraude.',
      status: 'active',
      is_healthy: true,
      capabilities: ['orchestration', 'routing', 'decision', 'workflow_management'],
      supported_tasks: ['quick', 'standard', 'investigation', 'batch'],
      sub_agents: ['document_analyst', 'transaction_analyst', 'identity_verifier', 'pattern_detector', 'network_analyzer', 'explanation_generator'],
      last_heartbeat: new Date().toISOString(),
      metrics: {
        tasks_processed: 1542,
        average_response_time_ms: 850,
        success_rate: 0.98,
        error_count: 12,
      },
    },
    document_analyst: {
      agent_id: 'document_analyst',
      agent_name: 'DocumentAnalystAgent',
      description: 'Analyse les documents soumis pour détecter les falsifications et extraire les informations.',
      status: 'active',
      is_healthy: true,
      capabilities: ['ocr', 'tampering_detection', 'document_validation', 'metadata_extraction'],
      supported_tasks: ['document_analysis'],
      sub_agents: [],
      last_heartbeat: new Date().toISOString(),
      metrics: {
        tasks_processed: 890,
        average_response_time_ms: 1200,
        success_rate: 0.97,
        error_count: 8,
      },
    },
    transaction_analyst: {
      agent_id: 'transaction_analyst',
      agent_name: 'TransactionAnalystAgent',
      description: 'Analyse les transactions avec l\'architecture hybride LLM+RL pour le scoring de risque.',
      status: 'busy',
      is_healthy: true,
      capabilities: ['llm_scoring', 'rl_classification', 'risk_assessment', 'embedding_generation'],
      supported_tasks: ['transaction_scoring'],
      sub_agents: [],
      last_heartbeat: new Date().toISOString(),
      metrics: {
        tasks_processed: 2341,
        average_response_time_ms: 450,
        success_rate: 0.99,
        error_count: 3,
      },
    },
    identity_verifier: {
      agent_id: 'identity_verifier',
      agent_name: 'IdentityVerifierAgent',
      description: 'Vérifie l\'identité des entités via RNIPP, listes de sanctions et validation RIB.',
      status: 'active',
      is_healthy: true,
      capabilities: ['rnipp_check', 'sanctions_check', 'rib_validation', 'pep_screening'],
      supported_tasks: ['identity_verification'],
      sub_agents: [],
      last_heartbeat: new Date().toISOString(),
      metrics: {
        tasks_processed: 1120,
        average_response_time_ms: 320,
        success_rate: 0.995,
        error_count: 2,
      },
    },
    pattern_detector: {
      agent_id: 'pattern_detector',
      agent_name: 'PatternDetectorAgent',
      description: 'Détecte les patterns de fraude connus et les comportements anormaux.',
      status: 'idle',
      is_healthy: true,
      capabilities: ['anomaly_detection', 'pattern_matching', 'behavioral_analysis', 'velocity_check'],
      supported_tasks: ['pattern_detection'],
      sub_agents: [],
      last_heartbeat: new Date().toISOString(),
      metrics: {
        tasks_processed: 1890,
        average_response_time_ms: 180,
        success_rate: 0.96,
        error_count: 15,
      },
    },
    network_analyzer: {
      agent_id: 'network_analyzer',
      agent_name: 'NetworkAnalyzerAgent',
      description: 'Analyse les réseaux de relations pour détecter les anneaux de fraude.',
      status: 'active',
      is_healthy: true,
      capabilities: ['graph_analysis', 'fraud_ring_detection', 'link_analysis', 'community_detection'],
      supported_tasks: ['network_analysis'],
      sub_agents: [],
      last_heartbeat: new Date().toISOString(),
      metrics: {
        tasks_processed: 456,
        average_response_time_ms: 2100,
        success_rate: 0.94,
        error_count: 6,
      },
    },
    explanation_generator: {
      agent_id: 'explanation_generator',
      agent_name: 'ExplanationGeneratorAgent',
      description: 'Génère des explications conformes RGPD et des rapports d\'investigation.',
      status: 'active',
      is_healthy: true,
      capabilities: ['xai', 'report_generation', 'compliance_formatting', 'audit_trail'],
      supported_tasks: ['explanation_generation'],
      sub_agents: [],
      last_heartbeat: new Date().toISOString(),
      metrics: {
        tasks_processed: 1245,
        average_response_time_ms: 650,
        success_rate: 0.99,
        error_count: 4,
      },
    },
  };

  const agent = data || mockAgentDetails[agentId];

  const statusConfig = {
    active: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'Actif' },
    busy: { color: 'bg-blue-100 text-blue-800', icon: ClockIcon, label: 'Occupé' },
    idle: { color: 'bg-gray-100 text-gray-800', icon: ClockIcon, label: 'Inactif' },
    error: { color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon, label: 'Erreur' },
  };

  const config = agent ? (statusConfig[agent.status as keyof typeof statusConfig] || statusConfig.idle) : statusConfig.idle;
  const StatusIcon = config.icon;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('fr-FR');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose} />
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {isLoading ? (
            <div className="p-6 animate-pulse">
              <div className="h-8 w-48 bg-gray-200 rounded mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          ) : agent ? (
            <>
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <CpuChipIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{agent.agent_name}</h3>
                      <p className="text-sm text-white/80">{agent.agent_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={clsx(
                      'flex items-center px-3 py-1 rounded-full text-sm font-medium',
                      config.color
                    )}>
                      <StatusIcon className="h-4 w-4 mr-1" />
                      {config.label}
                    </span>
                    <button
                      onClick={onClose}
                      className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4">
                {agent.description && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">{agent.description}</p>
                  </div>
                )}

                {/* Metrics */}
                {agent.metrics && (
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-gray-900">{agent.metrics.tasks_processed}</p>
                      <p className="text-xs text-gray-500">Taches traitees</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-gray-900">{agent.metrics.average_response_time_ms}ms</p>
                      <p className="text-xs text-gray-500">Temps moyen</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-green-600">
                        {((agent.metrics.success_rate || 0) * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500">Taux succes</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-red-600">{agent.metrics.error_count}</p>
                      <p className="text-xs text-gray-500">Erreurs</p>
                    </div>
                  </div>
                )}

                {/* Capabilities */}
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <BoltIcon className="h-4 w-4 text-gray-500 mr-2" />
                    <p className="text-xs font-medium text-gray-500 uppercase">Capacites</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {agent.capabilities?.map((cap: string) => (
                      <span
                        key={cap}
                        className="px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-lg"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Supported Tasks */}
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <DocumentTextIcon className="h-4 w-4 text-gray-500 mr-2" />
                    <p className="text-xs font-medium text-gray-500 uppercase">Taches supportees</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {agent.supported_tasks?.map((task: string) => (
                      <span
                        key={task}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg"
                      >
                        {task}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sub-agents */}
                {agent.sub_agents && agent.sub_agents.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <CpuChipIcon className="h-4 w-4 text-gray-500 mr-2" />
                      <p className="text-xs font-medium text-gray-500 uppercase">Sous-agents</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {agent.sub_agents.map((subAgent: string) => (
                        <span
                          key={subAgent}
                          className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg"
                        >
                          {subAgent}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Health info */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className={clsx(
                        'w-2 h-2 rounded-full',
                        agent.is_healthy ? 'bg-green-500' : 'bg-red-500'
                      )} />
                      <span className="text-gray-600">
                        {agent.is_healthy ? 'Agent en bonne sante' : 'Agent en erreur'}
                      </span>
                    </div>
                    <span className="text-gray-500">
                      Dernier heartbeat: {formatDate(agent.last_heartbeat)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-3 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Fermer
                </button>
              </div>
            </>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500">Agent non trouve</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
