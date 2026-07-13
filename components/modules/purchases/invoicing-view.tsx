"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/skeletons";
import { EmptyState } from "@/components/empty-state";
import { 
  FileText, 
  Scale, 
  AlertCircle,
  ShieldCheck,
  Coins
} from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { PendingInvoice } from "./types";
import { toast } from "sonner";

interface InvoicingViewProps {
  locale: Locale;
  invoices: PendingInvoice[];
  subtotal: number;
  taxRate: number; // e.g. 0.16 for 16%
  discounts: number;
  withholdings: number;
  onApproveInvoice: (id: string) => void;
  onRegisterPayment: (id: string) => void;
  isLoading?: boolean;
}

export function InvoicingView({
  locale,
  invoices,
  subtotal,
  taxRate,
  discounts,
  withholdings,
  onApproveInvoice,
  onRegisterPayment,
  isLoading = false,
}: InvoicingViewProps) {
  const dictionary = {
    es: {
      title: "Facturación y Cuentas por Pagar (CxP)",
      subtitle: "Registro contable de facturas de proveedores, conciliación de subtotales e impuestos.",
      summaryTitle: "Resumen de Facturación",
      summaryDesc: "Desglose financiero calculado en tiempo real para conciliación contable.",
      subtotalLabel: "Subtotal base",
      taxLabel: "Impuestos (IVA {rate}%)",
      discountLabel: "Descuentos",
      withholdingLabel: "Retenciones fiscales",
      grandTotalLabel: "Total a Pagar",
      apStatusTitle: "Estatus de CxP",
      apStatusDesc: "Facturas pendientes de conciliación y autorización financiera.",
      colVendor: "Proveedor",
      colAmount: "Monto",
      colDue: "Vencimiento",
      colStatus: "Estado",
      colActions: "Acciones",
      btnApprove: "Aprobar para Pago",
      btnPay: "Registrar Pago",
      btnReport: "Reportar Discrepancia",
      invoiceTitle: "Factura",
      calendarTitle: "Calendario de Egresos",
      noInvoices: "No hay facturas registradas en Cuentas por Pagar",
      approvedMsg: "Factura de '{vendor}' aprobada y programada en tesorería.",
      paidMsg: "Pago de '{vendor}' registrado en el flujo de caja.",
    },
    en: {
      title: "Invoicing & Accounts Payable (AP)",
      subtitle: "Accounting records of vendor invoices, reconciliation of subtotals and taxes.",
      summaryTitle: "Billing Summary",
      summaryDesc: "Financial breakdown calculated in real-time for audit purposes.",
      subtotalLabel: "Base subtotal",
      taxLabel: "Taxes (VAT {rate}%)",
      discountLabel: "Discounts",
      withholdingLabel: "Tax withholdings",
      grandTotalLabel: "Grand Total",
      apStatusTitle: "AP Status",
      apStatusDesc: "Invoices pending reconciliation and financial clearance.",
      colVendor: "Vendor",
      colAmount: "Amount",
      colDue: "Due Date",
      colStatus: "Status",
      colActions: "Actions",
      btnApprove: "Approve for Payment",
      btnPay: "Register Payment",
      btnReport: "Report Discrepancy",
      invoiceTitle: "Invoice",
      calendarTitle: "Cash Flow Outflow",
      noInvoices: "No invoices registered in Accounts Payable",
      approvedMsg: "Invoice for '{vendor}' approved and scheduled in treasury.",
      paidMsg: "Payment for '{vendor}' recorded in cash flow.",
    },
    fr: {
      title: "Facturation & Comptes Fournisseurs (Dettes)",
      subtitle: "Enregistrement comptable des factures fournisseurs, rapprochement des totaux et taxes.",
      summaryTitle: "Synthèse de Facturation",
      summaryDesc: "Détails financiers calculés en temps réel pour validation de compte.",
      subtotalLabel: "Sous-total de base",
      taxLabel: "Taxes (TVA {rate}%)",
      discountLabel: "Remises",
      withholdingLabel: "Retenues d'impôt",
      grandTotalLabel: "Total à Payer",
      apStatusTitle: "Statut des Dettes",
      apStatusDesc: "Factures en attente de rapprochement et d'autorisation de trésorerie.",
      colVendor: "Fournisseur",
      colAmount: "Montant",
      colDue: "Échéance",
      colStatus: "Statut",
      colActions: "Actions",
      btnApprove: "Approuver pour Paiement",
      btnPay: "Enregistrer Paiement",
      btnReport: "Signaler un Écart",
      invoiceTitle: "Facture",
      calendarTitle: "Calendrier de Paiement",
      noInvoices: "Aucune facture enregistrée dans les comptes fournisseurs",
      approvedMsg: "Facture de '{vendor}' approuvée et planifiée en trésorerie.",
      paidMsg: "Paiement pour '{vendor}' enregistré dans les flux de trésorerie.",
    },
  };

  const t = dictionary[locale] || dictionary.es;

  // Real-time calculations based on props
  const taxValue = subtotal * taxRate;
  const grandTotal = subtotal + taxValue - discounts + withholdings;

  const handleApprove = (invoice: PendingInvoice) => {
    toast.success(t.approvedMsg.replace("{vendor}", invoice.vendorName));
    onApproveInvoice(invoice.id);
  };

  const handlePay = (invoice: PendingInvoice) => {
    toast.success(t.paidMsg.replace("{vendor}", invoice.vendorName));
    onRegisterPayment(invoice.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold tracking-tight text-foreground">{t.title}</h2>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] items-start">
        {/* Left Column: Accounts Payable Table */}
        <div className="space-y-4">
          <Card className="border-border/60 bg-card/65 glass-effect overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="text-sm font-semibold">{t.apStatusTitle}</CardTitle>
              <CardDescription>{t.apStatusDesc}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <TableSkeleton rows={4} columns={5} />
              ) : invoices.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    variant="no-data"
                    title={t.noInvoices}
                    description="Registra una nueva orden de compra o asocia una factura XML para iniciar el proceso de cuentas por pagar."
                    icon={<FileText className="size-12 text-primary" />}
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead>{t.colVendor}</TableHead>
                        <TableHead className="text-right">{t.colAmount}</TableHead>
                        <TableHead>{t.colDue}</TableHead>
                        <TableHead className="text-center">{t.colStatus}</TableHead>
                        <TableHead className="text-right p-4">{t.colActions}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id} className="hover:bg-muted/10">
                          <TableCell className="font-semibold text-foreground">{invoice.vendorName}</TableCell>
                          <TableCell className="text-right font-bold text-foreground">
                            {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(invoice.amount)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground font-medium">{invoice.due}</TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              variant={
                                invoice.status === "overdue" 
                                  ? "destructive" 
                                  : invoice.status === "paid" 
                                  ? "default" 
                                  : invoice.status === "received" 
                                  ? "secondary" 
                                  : "outline"
                              }
                              className="text-[10px]"
                            >
                              {invoice.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right p-2 flex gap-1.5 justify-end">
                            {invoice.status === "draft" || invoice.status === "received" ? (
                              <Button
                                size="xs"
                                variant="outline"
                                className="text-[10px] h-7 font-bold border-primary/40 hover:bg-primary/5 text-primary cursor-pointer"
                                onClick={() => handleApprove(invoice)}
                              >
                                {t.btnApprove}
                              </Button>
                            ) : invoice.status === "overdue" ? (
                              <Button
                                size="xs"
                                variant="default"
                                className="text-[10px] h-7 font-bold cursor-pointer"
                                onClick={() => handlePay(invoice)}
                              >
                                {t.btnPay}
                              </Button>
                            ) : (
                              <span className="text-[11px] text-muted-foreground mr-2 font-medium flex items-center gap-1">
                                <ShieldCheck className="size-3.5 text-emerald-500" />
                                Conciliada
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Calculations Breakdown & Reconciliation Actions */}
        <aside className="space-y-4 xl:sticky xl:top-6">
          {/* Financial Breakdown Card */}
          <Card className="border-border/60 bg-card/65 glass-effect shadow-md">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="text-lg font-semibold tracking-tight flex items-center gap-1.5">
                <Scale className="size-5 text-primary" />
                {t.summaryTitle}
              </CardTitle>
              <CardDescription className="text-xs">{t.summaryDesc}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2.5 text-xs text-muted-foreground border-b border-border/30 pb-4">
                {/* Subtotal */}
                <div className="flex justify-between items-center">
                  <span>{t.subtotalLabel}</span>
                  <span className="font-semibold text-foreground">
                    {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(subtotal)}
                  </span>
                </div>
                {/* Taxes */}
                <div className="flex justify-between items-center">
                  <span>{t.taxLabel.replace("{rate}", (taxRate * 100).toFixed(0))}</span>
                  <span className="font-semibold text-foreground">
                    {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(taxValue)}
                  </span>
                </div>
                {/* Discounts */}
                <div className="flex justify-between items-center text-emerald-500 font-medium">
                  <span>{t.discountLabel}</span>
                  <span>
                    -{new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(discounts)}
                  </span>
                </div>
                {/* Withholdings */}
                <div className="flex justify-between items-center text-amber-500 font-medium">
                  <span>{t.withholdingLabel}</span>
                  <span>
                    +{new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(withholdings)}
                  </span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-center font-bold text-foreground py-2 border-b border-border/30">
                <span className="text-sm">{t.grandTotalLabel}</span>
                <span className="text-lg text-primary">
                  {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(grandTotal)}
                </span>
              </div>

              {/* Actions panel */}
              <div className="space-y-2 pt-2">
                <Button 
                  className="w-full text-xs font-semibold cursor-pointer"
                  onClick={() => toast.success("Borrador contable de egreso guardado correctamente.")}
                >
                  Guardar Borrador
                </Button>
                <Button 
                  variant="outline"
                  className="w-full text-xs font-semibold border-rose-500/50 hover:bg-rose-500/10 text-rose-500 cursor-pointer"
                  onClick={() => toast.error("Reporte de incidencia enviado a auditoría contable.")}
                >
                  <AlertCircle className="mr-2 size-4" />
                  {t.btnReport}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cashflow forecast card */}
          <Card className="border-border/60 bg-card/65 glass-effect">
            <CardHeader className="p-4">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
                <Coins className="size-4 text-primary" />
                {t.calendarTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 space-y-2 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-background/40 px-3 py-2 border border-border/40">
                <span className="text-muted-foreground">Próximos 7 días</span>
                <span className="font-bold text-foreground">$147,680.00</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-background/40 px-3 py-2 border border-border/40">
                <span className="text-muted-foreground">Próximos 30 días</span>
                <span className="font-bold text-foreground">$339,410.00</span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
