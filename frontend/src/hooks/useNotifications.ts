'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Notification {
  id: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  transactionId?: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Simulate initial notifications
  useEffect(() => {
    const initialNotifications: Notification[] = [
      {
        id: '1',
        type: 'alert',
        title: 'Fraude détectée',
        message: 'Transaction suspecte de 15,000€ identifiée',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
        transactionId: 'TXN-2024-001',
        riskLevel: 'critical',
      },
      {
        id: '2',
        type: 'warning',
        title: 'Risque élevé',
        message: 'Bénéficiaire avec comportement atypique',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: false,
        transactionId: 'TXN-2024-002',
        riskLevel: 'high',
      },
      {
        id: '3',
        type: 'info',
        title: 'Analyse terminée',
        message: 'Lot de 500 transactions analysé',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: true,
      },
    ];
    setNotifications(initialNotifications);
    setUnreadCount(initialNotifications.filter((n) => !n.read).length);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
  };
}
