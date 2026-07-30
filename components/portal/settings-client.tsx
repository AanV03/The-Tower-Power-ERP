"use client";

import { useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Clock,
  HelpCircle,
  Moon,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

import type { PortalSettings } from "@/lib/portal/types";

type SettingsClientProps = {
  initialSettings: PortalSettings;
  locale: string;
  tenantSlug: string;
};

type SettingKey = keyof PortalSettings;

export default function SettingsClient({
  initialSettings,
  locale,
  tenantSlug,
}: SettingsClientProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [pendingKey, setPendingKey] = useState<SettingKey | null>(null);

  async function handleToggle(key: SettingKey, label: string) {
    const nextValue = !settings[key];
    setPendingKey(key);
    setSettings((current) => ({ ...current, [key]: nextValue }));

    try {
      const response = await fetch(
        `/api/client/settings?tenantSlug=${encodeURIComponent(tenantSlug)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [key]: nextValue }),
        },
      );
      if (!response.ok) {
        throw new Error("No fue posible guardar la preferencia.");
      }
      toast.success(`Ajuste actualizado: ${label}`);
    } catch (error) {
      setSettings((current) => ({ ...current, [key]: !nextValue }));
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible guardar la preferencia.",
      );
    } finally {
      setPendingKey(null);
    }
  }

  function Toggle({
    settingKey,
    label,
  }: {
    settingKey: SettingKey;
    label: string;
  }) {
    const enabled = settings[settingKey];
    return (
      <button
        type="button"
        disabled={pendingKey === settingKey}
        aria-label={label}
        aria-pressed={enabled}
        onClick={() => handleToggle(settingKey, label)}
        className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full outline-none transition-colors duration-250 ${
          enabled ? "bg-[var(--primary-color)]" : "bg-neutral-700"
        } disabled:opacity-50`}
      >
        <span
          className={`w-5 h-5 rounded-full bg-white absolute top-0.5 left-0.5 transition-transform duration-250 ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/portal/${tenantSlug}` as Route} className="shrink-0 rounded-full bg-[var(--surface-color)]/50 p-2 transition-colors hover:bg-[var(--surface-color)]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight">Configuracion</h2>
          <p className="text-xs text-[var(--text-color)] opacity-60">
            Personaliza la app y notificaciones
          </p>
        </div>
      </div>

      <div className="bg-[var(--surface-color)]/30 border border-[var(--surface-color)]/40 rounded-xl p-4 flex flex-col gap-4 text-left">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-color)] opacity-50 mb-1">
          Preferencias
        </h4>
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Bell className="w-4 h-4 text-[var(--primary-color)]" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">Notificaciones Push</p>
              <p className="text-[10px] text-[var(--text-color)] opacity-50">
                Alertas de rutinas y reservas
              </p>
            </div>
          </div>
          <Toggle settingKey="pushNotifications" label="Notificaciones Push" />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Clock className="w-4 h-4 text-[var(--primary-color)]" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">Recordatorios</p>
              <p className="text-[10px] text-[var(--text-color)] opacity-50">
                Avisarme antes de entrenar
              </p>
            </div>
          </div>
          <Toggle settingKey="reminders" label="Recordatorios" />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Moon className="w-4 h-4 text-[var(--primary-color)]" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">Forzar Modo Oscuro</p>
              <p className="text-[10px] text-[var(--text-color)] opacity-50">
                Ahorro de bateria en pantallas OLED
              </p>
            </div>
          </div>
          <Toggle settingKey="darkMode" label="Modo Oscuro" />
        </div>
      </div>

      <div className="bg-[var(--surface-color)]/30 border border-[var(--surface-color)]/40 rounded-xl p-4 flex flex-col gap-3.5 text-left">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-color)] opacity-50 mb-1">
          Soporte & Legal
        </h4>
        <Link
          href={`/${locale}/legal/privacy` as Route}
          className="w-full flex items-center justify-between text-sm py-1.5 hover:text-[var(--primary-color)] transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-[var(--primary-color)]" />
            <span>Privacidad y Seguridad</span>
          </div>
          <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </Link>
        <a
          href="mailto:support@gerpy.com"
          className="w-full flex items-center justify-between text-sm py-1.5 hover:text-[var(--primary-color)] transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="w-4 h-4 text-[var(--primary-color)]" />
            <span>Centro de Ayuda</span>
          </div>
          <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </a>
      </div>

      <div className="text-center text-[10px] text-[var(--text-color)] opacity-40 flex flex-col gap-0.5 mt-2">
        <p>Gerpy PWA Socio v1.0.0</p>
        <p>2026 Gerpy ERP. Todos los derechos reservados.</p>
      </div>
    </div>
  );
}
