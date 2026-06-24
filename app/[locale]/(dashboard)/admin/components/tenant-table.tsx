"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, Plus, Edit2, ShieldAlert, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  plan: "Basic" | "Pro" | "Enterprise";
  status: "Active" | "Suspended" | "Trial";
  createdAt: string;
  modules: string[];
}

interface TenantTableProps {
  tenants: Tenant[];
  onEdit: (tenant: Tenant) => void;
  onAdd: () => void;
  locale: Locale;
  dict: any;
}

export function TenantTable({ tenants, onEdit, onAdd, locale, dict }: TenantTableProps) {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(search.toLowerCase()) ||
      tenant.subdomain.toLowerCase().includes(search.toLowerCase());

    const matchesPlan = planFilter === "ALL" || tenant.plan === planFilter;
    const matchesStatus = statusFilter === "ALL" || tenant.status === statusFilter;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  const getStatusBadge = (status: Tenant["status"]) => {
    switch (status) {
      case "Active":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-md py-0.5 px-2 text-xs font-semibold hover:bg-emerald-500/20">
            {dict.adminSaas.statusActive}
          </Badge>
        );
      case "Suspended":
        return (
          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-md py-0.5 px-2 text-xs font-semibold hover:bg-rose-500/20">
            {dict.adminSaas.statusSuspended}
          </Badge>
        );
      case "Trial":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-md py-0.5 px-2 text-xs font-semibold hover:bg-amber-500/20">
            {dict.adminSaas.statusTrial}
          </Badge>
        );
    }
  };

  const getPlanBadge = (plan: Tenant["plan"]) => {
    switch (plan) {
      case "Enterprise":
        return (
          <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-md py-0.5 px-2 text-xs font-semibold hover:bg-indigo-500/20">
            ⚡ Enterprise
          </Badge>
        );
      case "Pro":
        return (
          <Badge className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 rounded-md py-0.5 px-2 text-xs font-semibold hover:bg-sky-500/20">
            ⭐ Pro
          </Badge>
        );
      case "Basic":
        return (
          <Badge className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 rounded-md py-0.5 px-2 text-xs font-semibold hover:bg-slate-500/20">
            Basic
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters and Controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between bg-muted/20 p-3 rounded-xl border border-border">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={dict.adminSaas.searchTenant}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-input bg-background/50 placeholder:text-muted-foreground focus:border-[var(--sidebar-accent-active)] focus:outline-none focus:ring-1 focus:ring-[var(--sidebar-accent-active)] transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Plan Filter */}
          <div className="flex items-center gap-1 bg-background/50 border border-input rounded-lg px-2 py-1 text-xs">
            <span className="text-muted-foreground mr-1">Plan:</span>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="bg-transparent font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todos</option>
              <option value="Basic">Basic</option>
              <option value="Pro">Pro</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-background/50 border border-input rounded-lg px-2 py-1 text-xs">
            <span className="text-muted-foreground mr-1">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todos</option>
              <option value="Active">{dict.adminSaas.statusActive}</option>
              <option value="Suspended">{dict.adminSaas.statusSuspended}</option>
              <option value="Trial">{dict.adminSaas.statusTrial}</option>
            </select>
          </div>

          {/* Add Tenant Button */}
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-all hover:opacity-90 active:scale-95 bg-[var(--sidebar-accent-active)]"
          >
            <Plus className="h-3.5 w-3.5" />
            {dict.adminSaas.addTenant}
          </button>
        </div>
      </div>

      {/* High Density SaaS Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">{dict.adminSaas.tenantName}</th>
                <th className="px-4 py-3">{dict.adminSaas.subdomain}</th>
                <th className="px-4 py-3">{dict.adminSaas.plan}</th>
                <th className="px-4 py-3">{dict.adminSaas.status}</th>
                <th className="px-4 py-3">{dict.adminSaas.modulesConfig}</th>
                <th className="px-4 py-3">{dict.adminSaas.creationDate}</th>
                <th className="px-4 py-3 text-right">{dict.adminSaas.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredTenants.length > 0 ? (
                filteredTenants.map((tenant) => (
                  <tr
                    key={tenant.id}
                    className="hover:bg-muted/30 transition-colors group cursor-pointer"
                    onClick={() => onEdit(tenant)}
                  >
                    <td className="px-4 py-3.5 font-semibold text-foreground flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[var(--sidebar-accent-active)] opacity-0 group-hover:opacity-100 transition-opacity" />
                      {tenant.name}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5" />
                        {tenant.subdomain}.gerpy.com
                      </span>
                    </td>
                    <td className="px-4 py-3.5">{getPlanBadge(tenant.plan)}</td>
                    <td className="px-4 py-3.5">{getStatusBadge(tenant.status)}</td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground font-medium">
                      <span className="bg-muted px-2 py-0.5 rounded border border-border">
                        {tenant.modules.length} / 18 módulos
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {tenant.createdAt}
                    </td>
                    <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onEdit(tenant)}
                        className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
                        title={dict.adminSaas.editTenant}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShieldAlert className="h-8 w-8 text-muted-foreground/60" />
                      <p className="font-medium text-sm">{dict.emptyState.noResults}</p>
                      <p className="text-xs text-muted-foreground/80">
                        {dict.emptyState.noDataDescription}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
