'use client';

import { useMcpServers } from '@/hooks/useApi';
import {
  ServerStackIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface McpServer {
  server_id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  tools: string[];
  last_ping?: string;
}

export function McpServersCard() {
  const { data, isLoading } = useMcpServers();

  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  const mockServers: McpServer[] = [
    {
      server_id: 'database_server',
      name: 'Database MCP Server',
      status: 'connected',
      tools: ['query_transactions', 'query_entities', 'query_alerts'],
      last_ping: new Date().toISOString(),
    },
    {
      server_id: 'documents_server',
      name: 'Documents MCP Server',
      status: 'connected',
      tools: ['analyze_document', 'detect_tampering', 'extract_text'],
      last_ping: new Date().toISOString(),
    },
    {
      server_id: 'fraud_server',
      name: 'Fraud MCP Server',
      status: 'connected',
      tools: ['score_transaction', 'detect_patterns', 'calculate_risk'],
      last_ping: new Date().toISOString(),
    },
    {
      server_id: 'identity_server',
      name: 'Identity MCP Server',
      status: 'connected',
      tools: ['verify_rnipp', 'check_sanctions', 'validate_rib'],
      last_ping: new Date().toISOString(),
    },
  ];

  const servers = data?.servers || mockServers;
  const connectedCount = servers.filter((s) => s.status === 'connected').length;

  const statusConfig: Record<string, { color: string; bgColor: string; icon: typeof CheckCircleIcon }> = {
    connected: { color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircleIcon },
    active: { color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircleIcon },
    disconnected: { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: LinkIcon },
    inactive: { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: LinkIcon },
    error: { color: 'text-red-600', bgColor: 'bg-red-100', icon: ExclamationTriangleIcon },
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-100">
            <ServerStackIcon className="h-6 w-6 text-cyan-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Serveurs MCP</h3>
            <p className="text-sm text-gray-500">Model Context Protocol</p>
          </div>
        </div>
        <span className="text-sm text-gray-500">
          {connectedCount}/{servers.length} connectes
        </span>
      </div>

      <div className="space-y-2">
        {servers.map((server) => {
          const config = statusConfig[server.status] || statusConfig.disconnected;
          const StatusIcon = config.icon;

          return (
            <div
              key={server.server_id}
              className="bg-gray-50 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={clsx('p-1 rounded', config.bgColor)}>
                    <StatusIcon className={clsx('h-4 w-4', config.color)} />
                  </div>
                  <span className="font-medium text-gray-900 text-sm">{server.name}</span>
                </div>
                <span className={clsx(
                  'text-xs font-medium px-2 py-0.5 rounded-full',
                  config.bgColor,
                  config.color
                )}>
                  {server.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {server.tools.map((tool) => (
                  <span
                    key={tool}
                    className="px-2 py-0.5 bg-white border border-gray-200 text-gray-600 text-xs rounded"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
