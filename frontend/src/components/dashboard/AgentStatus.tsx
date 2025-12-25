'use client';

import { clsx } from 'clsx';
import {
  CpuChipIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface Agent {
  id: string;
  name: string;
  status: 'active' | 'busy' | 'error' | 'idle';
  lastActivity: string;
  tasksCompleted: number;
}

const agents: Agent[] = [
  {
    id: 'orchestrator',
    name: 'Orchestrateur',
    status: 'active',
    lastActivity: 'En cours',
    tasksCompleted: 1247,
  },
  {
    id: 'document-analyst',
    name: 'Analyste Documents',
    status: 'busy',
    lastActivity: 'Analyse en cours',
    tasksCompleted: 892,
  },
  {
    id: 'transaction-analyst',
    name: 'Analyste Transactions',
    status: 'active',
    lastActivity: 'Il y a 2 min',
    tasksCompleted: 2341,
  },
  {
    id: 'identity-verifier',
    name: 'Vérificateur Identité',
    status: 'active',
    lastActivity: 'Il y a 5 min',
    tasksCompleted: 1567,
  },
  {
    id: 'pattern-detector',
    name: 'Détecteur Patterns',
    status: 'idle',
    lastActivity: 'Il y a 15 min',
    tasksCompleted: 456,
  },
  {
    id: 'network-analyzer',
    name: 'Analyseur Réseau',
    status: 'active',
    lastActivity: 'Il y a 8 min',
    tasksCompleted: 234,
  },
  {
    id: 'explanation-generator',
    name: 'Générateur Explications',
    status: 'busy',
    lastActivity: 'Génération en cours',
    tasksCompleted: 1890,
  },
];

const statusConfig = {
  active: {
    color: 'bg-green-500',
    label: 'Actif',
    icon: CheckCircleIcon,
  },
  busy: {
    color: 'bg-blue-500',
    label: 'Occupé',
    icon: ArrowPathIcon,
  },
  error: {
    color: 'bg-red-500',
    label: 'Erreur',
    icon: ExclamationCircleIcon,
  },
  idle: {
    color: 'bg-gray-400',
    label: 'Inactif',
    icon: CpuChipIcon,
  },
};

export function AgentStatus() {
  const activeCount = agents.filter((a) => a.status === 'active' || a.status === 'busy').length;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Agents IA</h3>
        <span className="text-sm text-gray-500">
          {activeCount}/{agents.length} actifs
        </span>
      </div>

      <div className="space-y-3">
        {agents.map((agent) => {
          const config = statusConfig[agent.status];
          const StatusIcon = config.icon;

          return (
            <div
              key={agent.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <CpuChipIcon className="h-5 w-5 text-gray-400" />
                  <div
                    className={clsx(
                      'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white',
                      config.color,
                      agent.status === 'busy' && 'animate-pulse'
                    )}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                  <p className="text-xs text-gray-500">{agent.lastActivity}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">{agent.tasksCompleted.toLocaleString()} tâches</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
