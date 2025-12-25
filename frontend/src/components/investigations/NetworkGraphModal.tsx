'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import type { Investigation, InvestigationEntity } from '@/app/investigations/page';

interface NetworkGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  investigation: Investigation | null;
}

interface Node {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  risk: number;
}

interface Edge {
  from: string;
  to: string;
  strength: number;
}

const typeColors = {
  beneficiary: '#3B82F6',
  address: '#10B981',
  bank_account: '#F59E0B',
  phone: '#8B5CF6',
  email: '#EC4899',
  document: '#6366F1',
  transaction: '#EF4444',
  investigation: '#1F2937',
};

export function NetworkGraphModal({ isOpen, onClose, investigation }: NetworkGraphModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 });

  // Update canvas size when container changes
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };

    // Delay to allow modal animation to complete
    const timer = setTimeout(updateSize, 100);
    window.addEventListener('resize', updateSize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateSize);
    };
  }, [isOpen, isFullscreen]);

  useEffect(() => {
    if (!investigation || !isOpen) return;

    // Generate nodes from investigation data
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;

    // Central investigation node
    newNodes.push({
      id: investigation.id,
      label: investigation.investigation_id,
      type: 'investigation',
      x: centerX,
      y: centerY,
      risk: investigation.risk_score,
    });

    // Entity nodes arranged in a circle
    const entityCount = investigation.entities.length;
    investigation.entities.forEach((entity, index) => {
      const angle = (2 * Math.PI * index) / entityCount;
      const radius = 150;
      newNodes.push({
        id: entity.id,
        label: entity.value.substring(0, 15) + (entity.value.length > 15 ? '...' : ''),
        type: entity.type,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        risk: entity.risk_score,
      });
      newEdges.push({
        from: investigation.id,
        to: entity.id,
        strength: entity.risk_score,
      });
    });

    // Transaction nodes
    const txnCount = investigation.transactions.length;
    investigation.transactions.forEach((txn, index) => {
      const angle = (2 * Math.PI * index) / txnCount + Math.PI / 4;
      const radius = 250;
      const nodeId = `txn-${txn}`;
      newNodes.push({
        id: nodeId,
        label: txn,
        type: 'transaction',
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        risk: Math.random() * 0.5 + 0.3,
      });
      newEdges.push({
        from: investigation.id,
        to: nodeId,
        strength: 0.5,
      });
    });

    // Add some inter-entity connections for realism
    if (investigation.entities.length > 1) {
      for (let i = 0; i < investigation.entities.length - 1; i++) {
        if (Math.random() > 0.5) {
          newEdges.push({
            from: investigation.entities[i].id,
            to: investigation.entities[i + 1].id,
            strength: Math.random() * 0.3 + 0.2,
          });
        }
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [investigation, isOpen, canvasSize]);

  useEffect(() => {
    if (!canvasRef.current || nodes.length === 0 || !isOpen) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize.width * dpr;
    canvas.height = canvasSize.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    // Apply zoom transformation
    ctx.save();
    ctx.translate(canvasSize.width / 2, canvasSize.height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-canvasSize.width / 2, -canvasSize.height / 2);

    // Draw edges
    edges.forEach((edge) => {
      const fromNode = nodes.find((n) => n.id === edge.from);
      const toNode = nodes.find((n) => n.id === edge.to);
      if (!fromNode || !toNode) return;

      ctx.beginPath();
      ctx.moveTo(fromNode.x, fromNode.y);
      ctx.lineTo(toNode.x, toNode.y);
      ctx.strokeStyle = `rgba(156, 163, 175, ${edge.strength})`;
      ctx.lineWidth = 1 + edge.strength * 2;
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach((node) => {
      const isSelected = selectedNode?.id === node.id;
      const radius = node.type === 'investigation' ? 30 : 20;
      const color = typeColors[node.type as keyof typeof typeColors] || '#6B7280';

      // Node shadow
      ctx.beginPath();
      ctx.arc(node.x + 2, node.y + 2, radius, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fill();

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      // Selection ring
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 5, 0, 2 * Math.PI);
        ctx.strokeStyle = '#FCD34D';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Risk indicator ring
      if (node.risk > 0.7) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 3, 0, 2 * Math.PI);
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Node label
      ctx.fillStyle = '#1F2937';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y + radius + 15);
    });

    ctx.restore();
  }, [nodes, edges, zoom, selectedNode, isOpen, canvasSize]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasSize.width / rect.width;
    const scaleY = canvasSize.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;
    const x = (clickX - canvasSize.width / 2) / zoom + canvasSize.width / 2;
    const y = (clickY - canvasSize.height / 2) / zoom + canvasSize.height / 2;

    // Find clicked node
    const clickedNode = nodes.find((node) => {
      const radius = node.type === 'investigation' ? 30 : 20;
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < radius;
    });

    setSelectedNode(clickedNode || null);
  };

  if (!investigation) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={clsx(
                  'transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all',
                  isFullscreen ? 'fixed inset-4' : 'w-full max-w-4xl'
                )}
              >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <Dialog.Title className="text-lg font-semibold text-gray-900">
                      Graphe de reseau - {investigation.investigation_id}
                    </Dialog.Title>
                    <p className="text-sm text-gray-500">
                      {nodes.length} noeuds - {edges.length} connexions
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      title="Zoom arriere"
                    >
                      <MagnifyingGlassMinusIcon className="h-5 w-5" />
                    </button>
                    <span className="text-sm text-gray-500 w-12 text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      onClick={() => setZoom((z) => Math.min(2, z + 0.25))}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      title="Zoom avant"
                    >
                      <MagnifyingGlassPlusIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      title={isFullscreen ? 'Reduire' : 'Plein ecran'}
                    >
                      {isFullscreen ? (
                        <ArrowsPointingInIcon className="h-5 w-5" />
                      ) : (
                        <ArrowsPointingOutIcon className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={onClose}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="flex">
                  {/* Canvas */}
                  <div
                    ref={containerRef}
                    className={clsx('flex-1 bg-gray-50', isFullscreen ? 'h-[calc(100vh-12rem)]' : 'h-[500px]')}
                  >
                    <canvas
                      ref={canvasRef}
                      style={{ width: canvasSize.width, height: canvasSize.height }}
                      onClick={handleCanvasClick}
                      className="cursor-pointer"
                    />
                  </div>

                  {/* Sidebar */}
                  <div className="w-64 border-l border-gray-200 p-4 overflow-y-auto">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Legende</h3>
                    <div className="space-y-2">
                      {Object.entries(typeColors).map(([type, color]) => (
                        <div key={type} className="flex items-center space-x-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-xs text-gray-600 capitalize">
                            {type.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>

                    {selectedNode && (
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                          Noeud selectionne
                        </h3>
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs text-gray-500">ID:</span>
                            <p className="text-sm font-medium text-gray-900">{selectedNode.label}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Type:</span>
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {selectedNode.type.replace('_', ' ')}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Score de risque:</span>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={clsx(
                                    'h-full rounded-full',
                                    selectedNode.risk > 0.7
                                      ? 'bg-red-500'
                                      : selectedNode.risk > 0.4
                                      ? 'bg-orange-500'
                                      : 'bg-green-500'
                                  )}
                                  style={{ width: `${selectedNode.risk * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">
                                {(selectedNode.risk * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Connexions:</span>
                            <p className="text-sm font-medium text-gray-900">
                              {edges.filter(
                                (e) => e.from === selectedNode.id || e.to === selectedNode.id
                              ).length}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Statistiques
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Entites:</span>
                          <span className="font-medium">{investigation.entities.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Transactions:</span>
                          <span className="font-medium">{investigation.transactions.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Risque moyen:</span>
                          <span className="font-medium">
                            {(investigation.risk_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
                  <div className="text-sm text-gray-500">
                    Cliquez sur un noeud pour voir les details
                  </div>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
