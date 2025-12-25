'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  HomeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ShieldExclamationIcon,
  MagnifyingGlassIcon,
  CogIcon,
  XMarkIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Tableau de bord', href: '/', icon: HomeIcon },
  { name: 'Transactions', href: '/transactions', icon: DocumentTextIcon },
  { name: 'Investigations', href: '/investigations', icon: MagnifyingGlassIcon },
  { name: 'Alertes', href: '/alerts', icon: ShieldExclamationIcon },
  { name: 'Analytique', href: '/analytics', icon: ChartBarIcon },
  { name: 'Agents IA', href: '/agents', icon: CpuChipIcon },
  { name: 'Paramètres', href: '/settings', icon: CogIcon },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shadow-none',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <ShieldExclamationIcon className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-lg font-bold text-gray-900">FraudShield</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon
                  className={clsx(
                    'h-5 w-5 mr-3',
                    isActive ? 'text-primary-600' : 'text-gray-400'
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Status footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
            <span className="ml-2 text-sm text-gray-600">Système actif</span>
          </div>
          <p className="mt-1 text-xs text-gray-400">7 agents en ligne</p>
        </div>
      </aside>
    </>
  );
}
