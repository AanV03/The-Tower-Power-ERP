"use client";

import { useState } from "react";
import { ShieldCheck, Server, Settings, Terminal, Activity, Globe, Users } from "lucide-react";
import { getDictionary, type Locale } from "@/lib/i18n";
import { TenantTable, type Tenant } from "./tenant-table";
import { TenantDrawer } from "./tenant-drawer";
import { AuditLogsConsole } from "./audit-logs-console";
import { BrandingPanel } from "@/components/branding/branding-panel";
import { toast } from "sonner";

// Initial seed data matching existing options in the platform
const SEED_TENANTS: Tenant[] = [
  {
    id: "gerpy-hq",
    name: "Gerpy HQ",
    subdomain: "gerpy-hq",
    plan: "Enterprise",
    status: "Active",
    createdAt: "2025-06-01",
    modules: [
      "dashboard",
      "memberships",
      "access",
      "finance",
      "pos",
      "inventory",
      "hr",
      "marketing",
      "specialists",
      "admin",
      "catalog",
      "purchases",
      "warehouse",
      "accounting",
      "payroll",
      "analytics",
      "integrations",
      "maintenance",
    ],
  },
  {
    id: "fitlab-pro",
    name: "FitLab Pro",
    subdomain: "fitlab-pro",
    plan: "Pro",
    status: "Active",
    createdAt: "2025-11-15",
    modules: [
      "dashboard",
      "memberships",
      "access",
      "finance",
      "pos",
      "inventory",
      "catalog",
      "purchases",
      "warehouse",
      "hr",
      "analytics",
      "integrations",
    ],
  },
  {
    id: "urban-gym",
    name: "Urban Gym",
    subdomain: "urban-gym",
    plan: "Basic",
    status: "Trial",
    createdAt: "2026-03-10",
    modules: ["dashboard", "memberships", "access", "pos", "catalog"],
  },
];

interface AdminPanelClientProps {
  locale: Locale;
}

type TabType = "tenants" | "branding" | "logs";

export function AdminPanelClient({ locale }: AdminPanelClientProps) {
  const dict = getDictionary(locale);
  const [activeTab, setActiveTab] = useState<TabType>("tenants");
  const [tenants, setTenants] = useState<Tenant[]>(SEED_TENANTS);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleEditTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsDrawerOpen(true);
  };

  const handleAddTenant = () => {
    setSelectedTenant(null);
    setIsDrawerOpen(true);
  };

  const handleSaveTenant = (updatedTenant: Tenant) => {
    setTenants((prev) => {
      const exists = prev.some((t) => t.id === updatedTenant.id);
      if (exists) {
        return prev.map((t) => (t.id === updatedTenant.id ? updatedTenant : t));
      } else {
        return [...prev, updatedTenant];
      }
    });
    setIsDrawerOpen(false);
    toast.success(dict.adminSaas.saveSuccess);
  };

  // Metrics summary
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t) => t.status === "Active").length;
  const enterprisePlans = tenants.filter((t) => t.plan === "Enterprise").length;

  return (
    <section className="erp-section space-y-6" role="main" aria-label={dict.modules.admin}>
      {/* Premium Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center justify-between border-b border-border/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-[var(--sidebar-accent-active)]" />
            {dict.modules.admin}
          </h1>
          <p className="text-xs text-muted-foreground">
            Consola central de operaciones y administración global de inquilinos SaaS.
          </p>
        </div>

        {/* Small stats badges */}
        <div className="flex items-center gap-3 mt-2 md:mt-0 font-mono text-xs">
          <span className="flex items-center gap-1 bg-muted px-2.5 py-1 rounded-lg border border-border">
            <Server className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Tenants: <strong className="text-foreground">{totalTenants}</strong></span>
          </span>
          <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            <Activity className="h-3.5 w-3.5" />
            <span>Activos: <strong>{activeTenants}</strong></span>
          </span>
          <span className="flex items-center gap-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-lg border border-indigo-500/20">
            <Globe className="h-3.5 w-3.5" />
            <span>Enterprise: <strong>{enterprisePlans}</strong></span>
          </span>
        </div>
      </div>

      {/* Tabs navigation - Glass styled switcher */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("tenants")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all duration-200 ${
            activeTab === "tenants"
              ? "border-[var(--sidebar-accent-active)] text-foreground bg-muted/20"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/10"
          }`}
        >
          <Users className="h-4 w-4" />
          {dict.adminSaas.tenantsTab}
        </button>

        <button
          onClick={() => setActiveTab("branding")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all duration-200 ${
            activeTab === "branding"
              ? "border-[var(--sidebar-accent-active)] text-foreground bg-muted/20"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/10"
          }`}
        >
          <Settings className="h-4 w-4" />
          {dict.adminSaas.brandingTab}
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all duration-200 ${
            activeTab === "logs"
              ? "border-[var(--sidebar-accent-active)] text-foreground bg-muted/20"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/10"
          }`}
        >
          <Terminal className="h-4 w-4" />
          {dict.adminSaas.logsTab}
        </button>
      </div>

      {/* Tab Panels */}
      <div className="mt-4">
        {activeTab === "tenants" && (
          <TenantTable
            tenants={tenants}
            onEdit={handleEditTenant}
            onAdd={handleAddTenant}
            locale={locale}
            dict={dict}
          />
        )}

        {activeTab === "branding" && (
          <div className="w-full">
            <BrandingPanel locale={locale} />
          </div>
        )}

        {activeTab === "logs" && (
          <AuditLogsConsole dict={dict} />
        )}
      </div>

      {/* Slide-out Drawer */}
      <TenantDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        tenant={selectedTenant}
        onSave={handleSaveTenant}
        locale={locale}
        dict={dict}
      />
    </section>
  );
}
