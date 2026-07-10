"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bell, Moon, Clock, Shield, HelpCircle, ChevronRight } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export default function SettingsPage() {
  const params = useParams();
  const tenantSlug = params?.tenantSlug as string || "gym";
  const locale = params?.locale as string || "es";

  const [pushNotifications, setPushNotifications] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const handleToggle = (setting: string, val: boolean, setFn: React.Dispatch<React.SetStateAction<boolean>>) => {
    setFn(!val);
    toast.success(`Ajuste actualizado: ${setting}`);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header local */}
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/portal/${tenantSlug}` as any} className="p-2 rounded-full bg-[var(--surface-color)]/50 hover:bg-[var(--surface-color)] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Configuración</h2>
          <p className="text-xs text-[var(--text-color)] opacity-60">Personaliza la app y notificaciones</p>
        </div>
      </div>

      {/* Preferencias de la App */}
      <div className="bg-[var(--surface-color)]/30 border border-[var(--surface-color)]/40 rounded-xl p-4 flex flex-col gap-4 text-left">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-color)] opacity-50 mb-1">Preferencias</h4>
        
        {/* Switch Notificaciones */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-[var(--primary-color)]" />
            <div>
              <p className="text-sm font-semibold">Notificaciones Push</p>
              <p className="text-[10px] text-[var(--text-color)] opacity-50">Alertas de rutinas y reservas</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle("Notificaciones Push", pushNotifications, setPushNotifications)}
            className={`w-11 h-6 rounded-full transition-colors duration-250 relative outline-none cursor-pointer ${
              pushNotifications ? "bg-[var(--primary-color)]" : "bg-neutral-700"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full bg-white absolute top-0.5 left-0.5 transition-transform duration-250 ${
                pushNotifications ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Switch Recordatorio de Entrenamiento */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-[var(--primary-color)]" />
            <div>
              <p className="text-sm font-semibold">Recordatorios</p>
              <p className="text-[10px] text-[var(--text-color)] opacity-50">Avisarme 1 hora antes de entrenar</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle("Recordatorios", reminders, setReminders)}
            className={`w-11 h-6 rounded-full transition-colors duration-250 relative outline-none cursor-pointer ${
              reminders ? "bg-[var(--primary-color)]" : "bg-neutral-700"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full bg-white absolute top-0.5 left-0.5 transition-transform duration-250 ${
                reminders ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Switch Modo Oscuro (PWA force) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon className="w-4 h-4 text-[var(--primary-color)]" />
            <div>
              <p className="text-sm font-semibold">Forzar Modo Oscuro</p>
              <p className="text-[10px] text-[var(--text-color)] opacity-50">Ahorro de batería en pantallas OLED</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle("Modo Oscuro", darkMode, setDarkMode)}
            className={`w-11 h-6 rounded-full transition-colors duration-250 relative outline-none cursor-pointer ${
              darkMode ? "bg-[var(--primary-color)]" : "bg-neutral-700"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full bg-white absolute top-0.5 left-0.5 transition-transform duration-250 ${
                darkMode ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Seguridad & Legal */}
      <div className="bg-[var(--surface-color)]/30 border border-[var(--surface-color)]/40 rounded-xl p-4 flex flex-col gap-3.5 text-left">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-color)] opacity-50 mb-1">Soporte & Legal</h4>

        <button
          onClick={() => toast.info("Política de Privacidad de Gerpy ERP.")}
          className="w-full flex items-center justify-between text-sm py-1.5 hover:text-[var(--primary-color)] transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-[var(--primary-color)]" />
            <span>Privacidad y Seguridad</span>
          </div>
          <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </button>

        <button
          onClick={() => toast.info("Centro de soporte deshabilitado en modo demo.")}
          className="w-full flex items-center justify-between text-sm py-1.5 hover:text-[var(--primary-color)] transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="w-4 h-4 text-[var(--primary-color)]" />
            <span>Centro de Ayuda</span>
          </div>
          <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      {/* Info de Versión PWA */}
      <div className="text-center text-[10px] text-[var(--text-color)] opacity-40 flex flex-col gap-0.5 mt-2">
        <p>Gerpy PWA Socio v1.0.0 (Prototipo)</p>
        <p>© 2026 Gerpy ERP. Todos los derechos reservados.</p>
      </div>
    </div>
  );
}
