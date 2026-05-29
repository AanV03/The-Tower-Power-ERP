import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { formatCurrency } from "@/lib/api/pagination";
import type { TenantContext } from "@/lib/auth/rbac";
import type { MetricTone, ModuleMetric, ModuleRow } from "@/data/modules";

export type ApiModuleMetric = Omit<ModuleMetric, "label"> & {
  key: string;
  label: string;
};

export type ApiModuleSummary = {
  moduleId: string;
  metrics: ApiModuleMetric[];
  chart: { label: string; value: number }[];
  rows: ModuleRow[];
};

function metric(key: string, label: string, value: string, change = "Live", tone: MetricTone = "default") {
  return { key, label, value, change, tone };
}

function row(name: string, branch: string, status: ModuleRow["status"], amount: string, owner: string): ModuleRow {
  return { name, branch, status, amount, owner };
}

function tenantWhere(context: TenantContext) {
  return { tenantId: context.tenantId };
}

function branchWhere(context: TenantContext) {
  return context.branchId ? { tenantId: context.tenantId, branchId: context.branchId } : tenantWhere(context);
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function sumDecimal(value: Prisma.Decimal | null | undefined) {
  return value?.toString() ?? "0";
}

async function dashboardSummary(context: TenantContext): Promise<ApiModuleSummary> {
  const [activeMembers, activeSubscriptions, revenue, lowStock] = await Promise.all([
    prisma.member.count({ where: { ...branchWhere(context), status: "ACTIVE" } }),
    prisma.subscription.count({ where: { ...tenantWhere(context), status: "ACTIVE" } }),
    prisma.payment.aggregate({
      where: { ...branchWhere(context), status: "SUCCEEDED" },
      _sum: { amount: true },
    }),
    prisma.inventoryItem.count({
      where: {
        tenantId: context.tenantId,
        quantityOnHand: { lte: prisma.inventoryItem.fields.reorderPoint },
      },
    }),
  ]);

  return {
    moduleId: "dashboard",
    metrics: [
      metric("revenue", "Revenue", formatCurrency(sumDecimal(revenue._sum.amount)), "Succeeded", "success"),
      metric("members", "Active members", String(activeMembers), "Current", "default"),
      metric("subscriptions", "Active subscriptions", String(activeSubscriptions), "Current", "success"),
      metric("lowStock", "Low stock SKUs", String(lowStock), "Reorder", lowStock > 0 ? "warning" : "success"),
    ],
    chart: [
      { label: "Members", value: activeMembers },
      { label: "Subscriptions", value: activeSubscriptions },
      { label: "Low stock", value: lowStock },
    ],
    rows: [
      row("Active members", context.branchId ?? "Consolidated", "active", String(activeMembers), "Memberships"),
      row("Collected revenue", context.branchId ?? "Consolidated", "active", formatCurrency(sumDecimal(revenue._sum.amount)), "Finance"),
      row("Low stock SKUs", context.branchId ?? "Consolidated", lowStock > 0 ? "warning" : "active", String(lowStock), "Inventory"),
    ],
  };
}

async function membershipsSummary(context: TenantContext): Promise<ApiModuleSummary> {
  const [members, plans, activeSubscriptions, pastDue] = await Promise.all([
    prisma.member.count({ where: { ...branchWhere(context), status: "ACTIVE" } }),
    prisma.membershipPlan.count({ where: { ...tenantWhere(context), status: "ACTIVE" } }),
    prisma.subscription.count({ where: { ...tenantWhere(context), status: "ACTIVE" } }),
    prisma.subscription.count({ where: { ...tenantWhere(context), status: "PAST_DUE" } }),
  ]);

  return {
    moduleId: "memberships",
    metrics: [
      metric("members", "Active members", String(members), "Current", "success"),
      metric("plans", "Active plans", String(plans), "Current", "default"),
      metric("subscriptions", "Active subscriptions", String(activeSubscriptions), "Current", "success"),
      metric("pastDue", "Past due", String(pastDue), "Needs action", pastDue > 0 ? "warning" : "success"),
    ],
    chart: [
      { label: "Members", value: members },
      { label: "Plans", value: plans },
      { label: "Active", value: activeSubscriptions },
      { label: "Past due", value: pastDue },
    ],
    rows: [
      row("Active members", context.branchId ?? "Consolidated", "active", String(members), "Memberships"),
      row("Past due subscriptions", "Tenant", pastDue > 0 ? "warning" : "active", String(pastDue), "Billing"),
    ],
  };
}

async function accessSummary(context: TenantContext): Promise<ApiModuleSummary> {
  const [devices, online, maintenance] = await Promise.all([
    prisma.accessDevice.count({ where: branchWhere(context) }),
    prisma.accessDevice.count({ where: { ...branchWhere(context), status: "ONLINE" } }),
    prisma.accessDevice.count({ where: { ...branchWhere(context), status: "MAINTENANCE" } }),
  ]);

  return {
    moduleId: "access",
    metrics: [
      metric("devices", "Devices", String(devices), "Registered"),
      metric("online", "Online", String(online), "Live", online === devices ? "success" : "warning"),
      metric("maintenance", "Maintenance", String(maintenance), "Review", maintenance > 0 ? "warning" : "success"),
    ],
    chart: [
      { label: "Online", value: online },
      { label: "Maintenance", value: maintenance },
      { label: "Offline", value: Math.max(devices - online - maintenance, 0) },
    ],
    rows: [row("Access devices", context.branchId ?? "Consolidated", online === devices ? "active" : "warning", `${online}/${devices}`, "Access")],
  };
}

async function financeSummary(context: TenantContext): Promise<ApiModuleSummary> {
  const [receivable, payable, succeededPayments, overdueInvoices] = await Promise.all([
    prisma.invoice.aggregate({ where: { ...branchWhere(context), type: "RECEIVABLE" }, _sum: { total: true } }),
    prisma.invoice.aggregate({ where: { ...branchWhere(context), type: "PAYABLE" }, _sum: { total: true } }),
    prisma.payment.aggregate({ where: { ...branchWhere(context), status: "SUCCEEDED" }, _sum: { amount: true } }),
    prisma.invoice.count({ where: { ...branchWhere(context), status: "OVERDUE" } }),
  ]);

  return {
    moduleId: "finance",
    metrics: [
      metric("receivable", "Receivable", formatCurrency(sumDecimal(receivable._sum.total)), "Open", "default"),
      metric("payable", "Payable", formatCurrency(sumDecimal(payable._sum.total)), "Open", "warning"),
      metric("payments", "Collected", formatCurrency(sumDecimal(succeededPayments._sum.amount)), "Succeeded", "success"),
      metric("overdue", "Overdue invoices", String(overdueInvoices), "Review", overdueInvoices > 0 ? "danger" : "success"),
    ],
    chart: [
      { label: "AR", value: Number(sumDecimal(receivable._sum.total)) },
      { label: "AP", value: Number(sumDecimal(payable._sum.total)) },
      { label: "Paid", value: Number(sumDecimal(succeededPayments._sum.amount)) },
    ],
    rows: [row("Overdue invoices", context.branchId ?? "Consolidated", overdueInvoices > 0 ? "critical" : "active", String(overdueInvoices), "Finance")],
  };
}

async function posSummary(context: TenantContext): Promise<ApiModuleSummary> {
  const today = startOfToday();
  const [sales, tickets, registers, openSessions] = await Promise.all([
    prisma.sale.aggregate({ where: { ...branchWhere(context), status: "PAID", paidAt: { gte: today } }, _sum: { total: true } }),
    prisma.sale.count({ where: { ...branchWhere(context), status: "PAID", paidAt: { gte: today } } }),
    prisma.posRegister.count({ where: branchWhere(context) }),
    prisma.cashSession.count({ where: { ...tenantWhere(context), status: "OPEN" } }),
  ]);

  return {
    moduleId: "pos",
    metrics: [
      metric("sales", "Sales today", formatCurrency(sumDecimal(sales._sum.total)), "Today", "success"),
      metric("tickets", "Tickets", String(tickets), "Today"),
      metric("registers", "Registers", String(registers), "Available"),
      metric("openSessions", "Open cash sessions", String(openSessions), "Live", openSessions > 0 ? "warning" : "default"),
    ],
    chart: [
      { label: "Sales", value: Number(sumDecimal(sales._sum.total)) },
      { label: "Tickets", value: tickets },
      { label: "Registers", value: registers },
    ],
    rows: [row("Open cash sessions", context.branchId ?? "Consolidated", openSessions > 0 ? "warning" : "active", String(openSessions), "POS")],
  };
}

async function inventorySummary(context: TenantContext): Promise<ApiModuleSummary> {
  const [products, warehouses, lowStock, movements] = await Promise.all([
    prisma.product.count({ where: { ...tenantWhere(context), status: "ACTIVE" } }),
    prisma.warehouse.count({ where: branchWhere(context) }),
    prisma.inventoryItem.count({
      where: {
        tenantId: context.tenantId,
        quantityOnHand: { lte: prisma.inventoryItem.fields.reorderPoint },
      },
    }),
    prisma.inventoryMovement.count({ where: { ...tenantWhere(context), createdAt: { gte: startOfToday() } } }),
  ]);

  return {
    moduleId: "inventory",
    metrics: [
      metric("products", "Active SKUs", String(products), "Current"),
      metric("warehouses", "Warehouses", String(warehouses), "Branch scope"),
      metric("lowStock", "Low stock", String(lowStock), "Reorder", lowStock > 0 ? "warning" : "success"),
      metric("movements", "Movements today", String(movements), "Today"),
    ],
    chart: [
      { label: "SKUs", value: products },
      { label: "Warehouses", value: warehouses },
      { label: "Low", value: lowStock },
    ],
    rows: [row("Low stock SKUs", context.branchId ?? "Consolidated", lowStock > 0 ? "warning" : "active", String(lowStock), "Inventory")],
  };
}

async function hrSummary(context: TenantContext): Promise<ApiModuleSummary> {
  const [employees, attendanceToday, payrollPeriods] = await Promise.all([
    prisma.employee.count({ where: { ...branchWhere(context), status: "ACTIVE" } }),
    prisma.attendanceRecord.count({ where: { ...branchWhere(context), clockIn: { gte: startOfToday() } } }),
    prisma.payrollPeriod.count({ where: { ...tenantWhere(context), status: "DRAFT" } }),
  ]);

  return {
    moduleId: "hr",
    metrics: [
      metric("employees", "Active staff", String(employees), "Current"),
      metric("attendance", "Attendance today", String(attendanceToday), "Today", "success"),
      metric("payrollDrafts", "Draft payrolls", String(payrollPeriods), "Review", payrollPeriods > 0 ? "warning" : "default"),
    ],
    chart: [
      { label: "Staff", value: employees },
      { label: "Attendance", value: attendanceToday },
      { label: "Payroll", value: payrollPeriods },
    ],
    rows: [row("Attendance records today", context.branchId ?? "Consolidated", "active", String(attendanceToday), "HR")],
  };
}

async function marketingSummary(context: TenantContext): Promise<ApiModuleSummary> {
  const [members, activeSubscriptions, overduePayments] = await Promise.all([
    prisma.member.count({ where: branchWhere(context) }),
    prisma.subscription.count({ where: { ...tenantWhere(context), status: "ACTIVE" } }),
    prisma.payment.count({ where: { ...branchWhere(context), status: "FAILED" } }),
  ]);

  return {
    moduleId: "marketing",
    metrics: [
      metric("audience", "Audience", String(members), "Members"),
      metric("active", "Active customers", String(activeSubscriptions), "Subscriptions", "success"),
      metric("paymentSignals", "Payment risk signals", String(overduePayments), "Failed payments", overduePayments > 0 ? "warning" : "success"),
    ],
    chart: [
      { label: "Audience", value: members },
      { label: "Active", value: activeSubscriptions },
      { label: "Risk", value: overduePayments },
    ],
    rows: [row("CRM audience from SQL members", context.branchId ?? "Consolidated", "active", String(members), "Marketing")],
  };
}

async function specialistsSummary(context: TenantContext): Promise<ApiModuleSummary> {
  const [specialists, sessionsToday, draftSettlements] = await Promise.all([
    prisma.specialist.count({ where: { ...branchWhere(context), status: "ACTIVE" } }),
    prisma.specialistSession.count({ where: { ...branchWhere(context), scheduledAt: { gte: startOfToday() } } }),
    prisma.specialistSettlement.count({ where: { ...tenantWhere(context), status: "DRAFT" } }),
  ]);

  return {
    moduleId: "specialists",
    metrics: [
      metric("specialists", "Active specialists", String(specialists), "Current"),
      metric("sessions", "Sessions today", String(sessionsToday), "Today", "success"),
      metric("settlements", "Draft settlements", String(draftSettlements), "Review", draftSettlements > 0 ? "warning" : "default"),
    ],
    chart: [
      { label: "Specialists", value: specialists },
      { label: "Sessions", value: sessionsToday },
      { label: "Settlements", value: draftSettlements },
    ],
    rows: [row("Specialist sessions today", context.branchId ?? "Consolidated", "active", String(sessionsToday), "Specialists")],
  };
}

async function adminSummary(context: TenantContext): Promise<ApiModuleSummary> {
  const [branches, users, modules] = await Promise.all([
    prisma.branch.count({ where: tenantWhere(context) }),
    prisma.user.count({ where: tenantWhere(context) }),
    prisma.tenantModule.count({ where: { ...tenantWhere(context), enabled: true } }),
  ]);

  return {
    moduleId: "admin",
    metrics: [
      metric("branches", "Branches", String(branches), "Tenant"),
      metric("users", "Users", String(users), "Tenant"),
      metric("modules", "Enabled modules", String(modules), "Tenant", "success"),
    ],
    chart: [
      { label: "Branches", value: branches },
      { label: "Users", value: users },
      { label: "Modules", value: modules },
    ],
    rows: [row("Enabled tenant modules", "Tenant", "active", String(modules), "SaaS Admin")],
  };
}

export async function getModuleSummary(moduleId: string, context: TenantContext): Promise<ApiModuleSummary> {
  switch (moduleId) {
    case "dashboard":
      return dashboardSummary(context);
    case "memberships":
      return membershipsSummary(context);
    case "access":
      return accessSummary(context);
    case "finance":
      return financeSummary(context);
    case "pos":
      return posSummary(context);
    case "inventory":
      return inventorySummary(context);
    case "hr":
      return hrSummary(context);
    case "marketing":
      return marketingSummary(context);
    case "specialists":
      return specialistsSummary(context);
    case "admin":
      return adminSummary(context);
    default:
      throw new Error("MODULE_NOT_FOUND");
  }
}
