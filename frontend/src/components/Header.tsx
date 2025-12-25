'use client';

import { Bars3Icon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '@/hooks/useNotifications';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { unreadCount } = useNotifications();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="ml-4 lg:ml-0">
            <h1 className="text-xl font-bold text-primary-600">FraudShield AI</h1>
            <p className="text-sm text-gray-500">Détection de fraude intelligente</p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100">
            <BellIcon className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* User menu */}
          <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
            <UserCircleIcon className="h-8 w-8 text-gray-400" />
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-700">Analyste</p>
              <p className="text-xs text-gray-500">analyste@fraudshield.fr</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
