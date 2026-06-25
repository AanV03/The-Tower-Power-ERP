import { requireApiContext } from "@/lib/api/context";
import { prisma } from "@/lib/db/prisma";
import type { Locale } from "@/lib/i18n";
import { FinanceClient } from "@/components/modules/finance/finance-client";

export default async function FinancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const context = await requireApiContext({ moduleId: "finance" });

  const [invoices, payments, members, suppliers, branches] = await Promise.all([
    // 1. Fetch Invoices
    prisma.invoice.findMany({
      where: {
        tenantId: context.tenantId,
      },
      include: {
        items: true,
        customer: true,
        supplier: true,
        payments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    // 2. Fetch Payments
    prisma.payment.findMany({
      where: {
        tenantId: context.tenantId,
      },
      include: {
        invoice: true,
        member: true,
      },
      orderBy: {
        paidAt: "desc",
      },
      take: 100,
    }),
    // 3. Fetch Active Members for Customer selectors
    prisma.member.findMany({
      where: {
        tenantId: context.tenantId,
        status: "ACTIVE",
      },
      orderBy: {
        firstName: "asc",
      },
    }),
    // 4. Fetch Active Suppliers for Supplier selectors
    prisma.supplier.findMany({
      where: {
        tenantId: context.tenantId,
        status: "ACTIVE",
      },
      orderBy: {
        name: "asc",
      },
    }),
    // 5. Fetch Active Branches for registration
    prisma.branch.findMany({
      where: {
        tenantId: context.tenantId,
        status: "ACTIVE",
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  // Safe client serialization
  const serializedInvoices = invoices.map((inv) => ({
    id: inv.id,
    type: inv.type,
    status: inv.status,
    subtotal: inv.subtotal.toNumber(),
    tax: inv.tax.toNumber(),
    total: inv.total.toNumber(),
    currency: inv.currency,
    dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
    issuedAt: inv.issuedAt ? inv.issuedAt.toISOString() : null,
    createdAt: inv.createdAt.toISOString(),
    customer: inv.customer ? { id: inv.customer.id, name: `${inv.customer.firstName} ${inv.customer.lastName}` } : null,
    supplier: inv.supplier ? { id: inv.supplier.id, name: inv.supplier.name } : null,
    items: inv.items.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity.toNumber(),
      unitPrice: item.unitPrice.toNumber(),
      taxRate: item.taxRate.toNumber(),
      total: item.total.toNumber(),
    })),
    payments: inv.payments.map((p) => ({
      id: p.id,
      amount: p.amount.toNumber(),
      method: p.method,
      paidAt: p.paidAt ? p.paidAt.toISOString() : null,
    })),
  }));

  const serializedPayments = payments.map((p) => ({
    id: p.id,
    amount: p.amount.toNumber(),
    currency: p.currency,
    method: p.method,
    status: p.status,
    provider: p.provider ?? null,
    externalReference: p.externalReference ?? null,
    paidAt: p.paidAt ? p.paidAt.toISOString() : null,
    invoice: p.invoice ? { id: p.invoice.id, type: p.invoice.type, total: p.invoice.total.toNumber() } : null,
    member: p.member ? { id: p.member.id, name: `${p.member.firstName} ${p.member.lastName}` } : null,
  }));

  const serializedMembers = members.map((m) => ({
    id: m.id,
    name: `${m.firstName} ${m.lastName}`,
    email: m.email ?? "",
  }));

  const serializedSuppliers = suppliers.map((s) => ({
    id: s.id,
    name: s.name,
    taxId: s.taxId ?? "",
  }));

  const serializedBranches = branches.map((b) => ({
    id: b.id,
    name: b.name,
  }));

  return (
    <FinanceClient
      locale={locale as Locale}
      invoices={serializedInvoices}
      payments={serializedPayments}
      members={serializedMembers}
      suppliers={serializedSuppliers}
      branches={serializedBranches}
    />
  );
}
