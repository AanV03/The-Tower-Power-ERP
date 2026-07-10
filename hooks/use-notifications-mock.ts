"use client";

import { useEffect, useState } from "react";

export interface MockNotification {
  id: string;
  title: string;
  description: string;
  type: "info" | "warning" | "critical";
  module: "finance" | "access" | "memberships" | "system" | "hr" | "admin";
  createdAt: string;
  read: boolean;
  targetRole: string; // RBAC simulation
}

const DEFAULT_NOTIFICATIONS: MockNotification[] = [
  {
    id: "notif-1",
    title: "Pago de membresía rechazado",
    description: "El pago de suscripción mensual de Juan Pérez (Socio #1024) falló en la pasarela Stripe.",
    type: "critical",
    module: "finance",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    read: false,
    targetRole: "Finance Manager",
  },
  {
    id: "notif-2",
    title: "Intento de acceso denegado",
    description: "Torniquete Entrada A: Membresía de María Gómez vencida por más de 30 días.",
    type: "warning",
    module: "access",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    read: false,
    targetRole: "Receptionist",
  },
  {
    id: "notif-3",
    title: "Nueva solicitud de contrato de personal",
    description: "Se ha registrado un nuevo contrato para el instructor Carlos Vela que requiere aprobación.",
    type: "info",
    module: "hr",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    read: false,
    targetRole: "HR Manager",
  },
  {
    id: "notif-4",
    title: "Actualización de seguridad completada",
    description: "Se han aplicado los últimos parches de Base de Datos y reglas de RLS para Tenants.",
    type: "info",
    module: "system",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true,
    targetRole: "System Admin",
  },
  {
    id: "notif-5",
    title: "Inventario de suplementos crítico",
    description: "Quedan menos de 5 unidades de Proteína Whey de Fresa en el almacén de Sucursal Norte.",
    type: "warning",
    module: "admin",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5 days ago
    read: false,
    targetRole: "Branch Manager",
  },
  {
    id: "notif-6",
    title: "Suscripción Premium anual vendida",
    description: "Socio #1092 adquirió la Membresía Anual VIP. Factura #9812 generada.",
    type: "info",
    module: "finance",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    read: true,
    targetRole: "Finance Manager",
  }
];

const LOCAL_STORAGE_KEY = "gerpy_mock_notifications";
const SYNC_EVENT_NAME = "gerpy_notifications_sync";

export function useNotificationsMock() {
  const [notifications, setNotifications] = useState<MockNotification[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch {
        setNotifications(DEFAULT_NOTIFICATIONS);
      }
    } else {
      setNotifications(DEFAULT_NOTIFICATIONS);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
    }

    const handleSync = () => {
      const updated = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (updated) {
        try {
          setNotifications(JSON.parse(updated));
        } catch {}
      }
    };

    window.addEventListener(SYNC_EVENT_NAME, handleSync);
    window.addEventListener("storage", handleSync); // sync across tabs

    return () => {
      window.removeEventListener(SYNC_EVENT_NAME, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const saveNotifications = (newNotifications: MockNotification[]) => {
    setNotifications(newNotifications);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newNotifications));
    window.dispatchEvent(new CustomEvent(SYNC_EVENT_NAME));
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    saveNotifications(updated);
  };

  const clearAll = () => {
    saveNotifications([]);
  };

  const resetMock = () => {
    saveNotifications(DEFAULT_NOTIFICATIONS);
  };

  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    resetMock,
  };
}
