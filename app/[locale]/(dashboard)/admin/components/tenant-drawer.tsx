"use client";

import { useEffect, useState } from "react";
import { X, Shield, Settings, Check, Database, Cpu, Activity } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import type { Tenant } from "./tenant-table";
import type { Locale } from "@/lib/i18n";
import { navigationItems } from "@/data/navigation";
import { cn } from "@/lib/utils";

interface TenantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant | null;
  onSave: (tenant: Tenant) => void;
  locale: Locale;
  dict: any;
}

export function TenantDrawer({ isOpen, onClose, tenant, onSave, locale, dict }: TenantDrawerProps) {
  const [name, setName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [plan, setPlan] = useState<Tenant["plan"]>("Basic");
  const [status, setStatus] = useState<Tenant["status"]>("Active");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  useEffect(() => {
    if (tenant) {
      setName(tenant.name);
      setSubdomain(tenant.subdomain);
      setPlan(tenant.plan);
      setStatus(tenant.status);
      setSelectedModules(tenant.modules);
    } else {
      setName("");
      setSubdomain("");
      setPlan("Basic");
      setStatus("Trial");
      // By default enable first few modules
      setSelectedModules(["dashboard", "memberships", "access"]);
    }
  }, [tenant, isOpen]);

  const handleToggleModule = (moduleId: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((m) => m !== moduleId) : [...prev, moduleId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Tenant = {
      id: tenant?.id || Math.random().toString(36).substring(2, 9),
      name,
      subdomain: subdomain.toLowerCase().replace(/[^a-z0-9-]/g, ""),
      plan,
      status,
      modules: selectedModules,
      createdAt: tenant?.createdAt || new Date().toISOString().split("T")[0],
    };
    onSave(payload);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md border-l border-border bg-card p-0 flex flex-col h-full shadow-2xl">
        <SheetHeader className="p-5 border-b border-border bg-muted/40">
          <SheetTitle className="text-lg font-bold text-foreground">
            {tenant ? dict.adminSaas.editTenant : dict.adminSaas.addTenant}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            {tenant
              ? "Modifica los límites, módulos habilitados y estado de esta sucursal/inquilino."
              : "Registra un nuevo inquilino SaaS en el sistema y configura su alcance inicial."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Tenant Name */}
          <div className="space-y-2">
            <label htmlFor="tenant-name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {dict.adminSaas.tenantName}
            </label>
            <input
              id="tenant-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm text-foreground focus:border-[var(--sidebar-accent-active)] focus:outline-none focus:ring-1 focus:ring-[var(--sidebar-accent-active)] transition-colors"
              placeholder="Ej. Muscle Gym Studio"
            />
          </div>

          {/* Subdomain */}
          <div className="space-y-2">
            <label htmlFor="tenant-subdomain" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {dict.adminSaas.subdomain}
            </label>
            <div className="flex rounded-lg border border-input bg-background/50 overflow-hidden focus-within:border-[var(--sidebar-accent-active)] focus-within:ring-1 focus-within:ring-[var(--sidebar-accent-active)] transition-colors">
              <input
                id="tenant-subdomain"
                type="text"
                required
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none"
                placeholder="muscle-gym"
              />
              <span className="bg-muted px-3 py-2 text-xs text-muted-foreground border-l border-border flex items-center font-mono">
                .towerpower.com
              </span>
            </div>
          </div>

          {/* 2 Column Plan & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="tenant-plan" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {dict.adminSaas.plan}
              </label>
              <select
                id="tenant-plan"
                value={plan}
                onChange={(e) => setPlan(e.target.value as Tenant["plan"])}
                className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm text-foreground focus:border-[var(--sidebar-accent-active)] focus:outline-none focus:ring-1 focus:ring-[var(--sidebar-accent-active)] transition-colors cursor-pointer"
              >
                <option value="Basic">Basic</option>
                <option value="Pro">Pro</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="tenant-status" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {dict.adminSaas.status}
              </label>
              <select
                id="tenant-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Tenant["status"])}
                className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm text-foreground focus:border-[var(--sidebar-accent-active)] focus:outline-none focus:ring-1 focus:ring-[var(--sidebar-accent-active)] transition-colors cursor-pointer"
              >
                <option value="Active">{dict.adminSaas.statusActive}</option>
                <option value="Suspended">{dict.adminSaas.statusSuspended}</option>
                <option value="Trial">{dict.adminSaas.statusTrial}</option>
              </select>
            </div>
          </div>

          {/* Simulated Resource Consumption (Premium UI touch) */}
          {tenant && (
            <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" /> Consumo de Recursos
              </h4>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium"><Database className="w-3.5 h-3.5 text-blue-500" /> Almacenamiento</span>
                    <span className="text-muted-foreground">64% (3.2 / 5 GB)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "64%" }} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium"><Cpu className="w-3.5 h-3.5 text-emerald-500" /> CPU Promedio (7d)</span>
                    <span className="text-muted-foreground">32%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "32%" }} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium"><Activity className="w-3.5 h-3.5 text-orange-500" /> Límites de API</span>
                    <span className="text-muted-foreground font-semibold text-orange-500">89%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: "89%" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enabled Modules (Grid of check cards) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {dict.adminSaas.modulesConfig}
              </label>
              <span className="text-xs text-muted-foreground font-mono">
                {selectedModules.length} / 18
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1 border border-border/80 rounded-lg bg-muted/10">
              {navigationItems.map((item) => {
                const isSelected = selectedModules.includes(item.id);
                const IconComponent = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleToggleModule(item.id)}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all duration-200 select-none",
                      isSelected
                        ? "border-[var(--sidebar-accent-active)] bg-[var(--sidebar-accent-active)]/5 text-foreground font-semibold"
                        : "border-border bg-background/40 hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                        isSelected
                          ? "border-[var(--sidebar-accent-active)] bg-[var(--sidebar-accent-active)] text-white"
                          : "border-input bg-background"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <IconComponent className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.labels[locale]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {dict.adminSaas.close}
            </button>
            <button
              type="submit"
              className="rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 active:scale-95 bg-[var(--sidebar-accent-active)]"
            >
              {dict.adminSaas.saveChanges}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
