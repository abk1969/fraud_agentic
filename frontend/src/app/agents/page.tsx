'use client';

import { useState, Suspense } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import {
  SystemStatusCard,
  AgentsList,
  ModelInfoCard,
  AgentConfigCard,
  McpServersCard,
  A2AStatusCard,
} from '@/components/agents';
import {
  ArrowPathIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';
import { useQueryClient } from '@tanstack/react-query';
import { clsx } from 'clsx';

function AgentsPageContent() {
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['system-status'] }),
      queryClient.invalidateQueries({ queryKey: ['agents-list'] }),
      queryClient.invalidateQueries({ queryKey: ['model-info'] }),
      queryClient.invalidateQueries({ queryKey: ['agent-config'] }),
      queryClient.invalidateQueries({ queryKey: ['mcp-servers'] }),
      queryClient.invalidateQueries({ queryKey: ['a2a-status'] }),
    ]);
    setIsRefreshing(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Page header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <CpuChipIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Agents IA</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Architecture ADK hierarchique, protocoles MCP et A2A
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {/* Refresh button */}
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <ArrowPathIcon className={clsx('h-5 w-5', isRefreshing && 'animate-spin')} />
                  <span>Actualiser</span>
                </button>
              </div>
            </div>

            {/* System Status - Full width */}
            <SystemStatusCard />

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column - Agents list */}
              <div className="lg:col-span-2 space-y-6">
                <AgentsList />

                {/* A2A Status */}
                <A2AStatusCard />
              </div>

              {/* Right column */}
              <div className="space-y-6">
                {/* Model Info */}
                <ModelInfoCard />

                {/* Agent Config */}
                <AgentConfigCard />

                {/* MCP Servers */}
                <McpServersCard />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function AgentsPageLoading() {
  return (
    <div className="flex h-screen bg-gray-50 items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Chargement des agents...</p>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  return (
    <Suspense fallback={<AgentsPageLoading />}>
      <AgentsPageContent />
    </Suspense>
  );
}
