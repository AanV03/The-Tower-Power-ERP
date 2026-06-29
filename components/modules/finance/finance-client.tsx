"use client";

import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import type { Locale } from "@/lib/i18n";
import { cn, headerPrimaryActionClass } from "@/lib/utils";
import {
  Banknote,
  Plus,
  Trash2,
  Calendar,
  Search,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle2,
  PlusCircle,
  FileText,
  DollarSign,
  ArrowRightLeft,
  X,
  RefreshCw,
  Clock,
  Briefcase,
  User,
  ShieldCheck,
  FileSpreadsheet,
} from "lucide-react";

// shadcn/ui components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type InvoiceItem = {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total?: number;
};

type Invoice = {
  id: string;
  type: string; // "RECEIVABLE" | "PAYABLE"
  status: string; // "DRAFT" | "ISSUED" | "PAID" | "OVERDUE" | "CANCELLED"
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  dueDate: string | null;
  issuedAt: string | null;
  createdAt: string;
  customer: { id: string; name: string } | null;
  supplier: { id: string; name: string } | null;
  items: InvoiceItem[];
  payments: { id: string; amount: number; method: string; paidAt: string | null }[];
};

type Payment = {
  id: string;
  amount: number;
  currency: string;
  method: string; // "CASH" | "CARD" | "TRANSFER" | "GATEWAY"
  status: string; // "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED"
  provider: string | null;
  externalReference: string | null;
  paidAt: string | null;
  invoice: { id: string; type: string; total: number } | null;
  member: { id: string; name: string } | null;
};

type Member = {
  id: string;
  name: string;
  email: string;
};

type Supplier = {
  id: string;
  name: string;
  taxId: string;
};

type Branch = {
  id: string;
  name: string;
};

type MockBankTransaction = {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: "DEPOSIT" | "WITHDRAWAL";
  reconciled: boolean;
};

const financeLabels = {
  es: {
    title: "Módulo Financiero",
    subtitle: "Control de flujo de caja, cuentas por cobrar (CxC), cuentas por pagar (CxP) y conciliación bancaria.",
    revenueCollected: "Ingresos Cobrados",
    accountsReceivable: "Cuentas por Cobrar (CxC)",
    accountsPayable: "Cuentas por Pagar (CxP)",
    netCashFlow: "Flujo Neto de Caja",
    tabInvoices: "Facturas y Cuentas",
    tabTransactions: "Bitácora de Pagos",
    tabConciliation: "Conciliador Bancario",
    newInvoiceButton: "Crear Factura",
    newInvoiceTitle: "Nueva Factura",
    newInvoiceDesc: "Genera una factura de ingresos (CxC) o egresos (CxP) para registrar cuentas pendientes.",
    invoiceType: "Tipo de Operación",
    receivable: "Cobro / Ingreso (CxC)",
    payable: "Pago / Egreso (CxP)",
    selectCustomer: "Seleccionar Miembro (Cliente)",
    selectSupplier: "Seleccionar Proveedor",
    selectBranch: "Seleccionar Sucursal",
    dueDate: "Fecha de Vencimiento",
    items: "Detalle de Conceptos",
    addItem: "Agregar Concepto",
    description: "Descripción",
    qty: "Cant",
    price: "Precio Unitario",
    taxRate: "Tasa IVA (%)",
    subtotal: "Subtotal",
    tax: "Impuesto (IVA)",
    total: "Total",
    save: "Crear Factura",
    cancel: "Cancelar",
    searchPlaceholder: "Buscar factura por cliente, proveedor o folio...",
    all: "Todos",
    statusDraft: "Borrador",
    statusIssued: "Emitida",
    statusPaid: "Pagada",
    statusOverdue: "Vencida",
    statusCancelled: "Cancelada",
    registerPaymentButton: "Registrar Pago",
    registerPaymentTitle: "Registrar Pago a Factura",
    registerPaymentDesc: "Registra un abono o liquidación total para esta cuenta.",
    paymentAmount: "Monto del Pago (MXN)",
    paymentMethod: "Método de Pago",
    cash: "Efectivo",
    card: "Tarjeta",
    transfer: "Transferencia",
    gateway: "Pasarela Digital",
    paymentReference: "Referencia / Proveedor de Terminal",
    paymentReferencePlaceholder: "Ej: SPEI Banamex, Terminal Clip, etc.",
    savePayment: "Registrar Transacción",
    noInvoices: "No se encontraron facturas.",
    noPayments: "No hay transacciones registradas.",
    detailsTitle: "Conceptos Desglosados",
    amountPaid: "Pagado",
    amountPending: "Pendiente",
    paymentAdded: "Pago registrado con éxito.",
    invoiceCreated: "Factura creada con éxito.",
    invoiceDeleted: "Factura eliminada.",
    statusUpdated: "Factura actualizada.",
    bankConcilationTitle: "Conciliación de Cuentas Bancarias",
    bankConcilationDesc: "Sube o genera transacciones bancarias para cotejarlas directamente con las facturas del ERP.",
    loadMockBank: "Cargar Estado de Cuenta Bancario (Simulación)",
    dropFileText: "Arrastra y suelta el archivo Excel/CSV del banco aquí",
    bankTransactionsHeader: "Movimientos del Banco",
    matchedInvoice: "Emparejado con",
    reconciledText: "Conciliado",
    reconcileAction: "Cotejar y Conciliar",
    noBankData: "Carga transacciones de ejemplo para iniciar el ejercicio de conciliación bancaria.",
  },
  en: {
    title: "Finance Module",
    subtitle: "Management of cash flow, accounts receivable (CxC), accounts payable (CxP), and bank reconciliation.",
    revenueCollected: "Revenue Collected",
    accountsReceivable: "Accounts Receivable",
    accountsPayable: "Accounts Payable",
    netCashFlow: "Net Cash Flow",
    tabInvoices: "Invoices & Billing",
    tabTransactions: "Transaction Log",
    tabConciliation: "Bank Reconciliation",
    newInvoiceButton: "Create Invoice",
    newInvoiceTitle: "New Invoice",
    newInvoiceDesc: "Create an income invoice (receivable) or expense invoice (payable) to track pending bills.",
    invoiceType: "Invoice Type",
    receivable: "Receivable (Income)",
    payable: "Payable (Expense)",
    selectCustomer: "Select Member (Customer)",
    selectSupplier: "Select Supplier",
    selectBranch: "Select Branch",
    dueDate: "Due Date",
    items: "Invoice Items",
    addItem: "Add Item",
    description: "Description",
    qty: "Qty",
    price: "Unit Price",
    taxRate: "Tax Rate (%)",
    subtotal: "Subtotal",
    tax: "Tax (VAT)",
    total: "Total",
    save: "Create Invoice",
    cancel: "Cancel",
    searchPlaceholder: "Search invoice by customer, supplier or ID...",
    all: "All",
    statusDraft: "Draft",
    statusIssued: "Issued",
    statusPaid: "Paid",
    statusOverdue: "Overdue",
    statusCancelled: "Cancelled",
    registerPaymentButton: "Record Payment",
    registerPaymentTitle: "Record Payment for Invoice",
    registerPaymentDesc: "Record an installment or full settlement for this invoice.",
    paymentAmount: "Payment Amount (MXN)",
    paymentMethod: "Payment Method",
    cash: "Cash",
    card: "Card",
    transfer: "Transfer",
    gateway: "Gateway",
    paymentReference: "Reference / Provider",
    paymentReferencePlaceholder: "e.g. SPEI, Clip terminal, etc.",
    savePayment: "Record Transaction",
    noInvoices: "No invoices found.",
    noPayments: "No registered transactions.",
    detailsTitle: "Itemized Details",
    amountPaid: "Paid",
    amountPending: "Pending",
    paymentAdded: "Payment registered successfully.",
    invoiceCreated: "Invoice created successfully.",
    invoiceDeleted: "Invoice deleted.",
    statusUpdated: "Invoice updated.",
    bankConcilationTitle: "Bank Accounts Reconciliation",
    bankConcilationDesc: "Upload or simulate bank statement entries to match directly with ERP invoices.",
    loadMockBank: "Load Bank Statement (Simulation)",
    dropFileText: "Drag and drop bank Excel/CSV file here",
    bankTransactionsHeader: "Bank Statements Transactions",
    matchedInvoice: "Matched with",
    reconciledText: "Reconciled",
    reconcileAction: "Match & Reconcile",
    noBankData: "Load simulation data to start bank reconciliation.",
  },
  fr: {
    title: "Module Financier",
    subtitle: "Contrôle du flux de trésorerie, comptes clients (CxC), comptes fournisseurs (CxP) et rapprochement bancaire.",
    revenueCollected: "Revenus Encaissés",
    accountsReceivable: "Comptes Clients (CxC)",
    accountsPayable: "Comptes Fournisseurs (CxP)",
    netCashFlow: "Trésorerie Nette",
    tabInvoices: "Factures et Comptes",
    tabTransactions: "Journal des Paiements",
    tabConciliation: "Rapprochement Bancaire",
    newInvoiceButton: "Créer une Facture",
    newInvoiceTitle: "Nouvelle Facture",
    newInvoiceDesc: "Générer une facture de revenus (recevable) ou de dépenses (payable) pour enregistrer les comptes.",
    invoiceType: "Type d'Opération",
    receivable: "Facture Client (Revenus)",
    payable: "Facture Fournisseur (Dépenses)",
    selectCustomer: "Sélectionner un Membre (Client)",
    selectSupplier: "Sélectionner un Fournisseur",
    selectBranch: "Sélectionner une Succursale",
    dueDate: "Date d'Échéance",
    items: "Détails des Articles",
    addItem: "Ajouter un Concept",
    description: "Description",
    qty: "Qté",
    price: "Prix Unitaire",
    taxRate: "Taux de Taxe (%)",
    subtotal: "Sous-total",
    tax: "Taxe (TVA)",
    total: "Total",
    save: "Créer la Facture",
    cancel: "Annuler",
    searchPlaceholder: "Rechercher une facture par client, fournisseur...",
    all: "Tout",
    statusDraft: "Brouillon",
    statusIssued: "Émise",
    statusPaid: "Payée",
    statusOverdue: "Échue",
    statusCancelled: "Annulée",
    registerPaymentButton: "Enregistrer le Paiement",
    registerPaymentTitle: "Enregistrer le Paiement",
    registerPaymentDesc: "Enregistrer un acompte ou le paiement total de cette facture.",
    paymentAmount: "Montant (MXN)",
    paymentMethod: "Mode de Paiement",
    cash: "Espèces",
    card: "Carte",
    transfer: "Virement",
    gateway: "Passerelle",
    paymentReference: "Référence / Fournisseur",
    paymentReferencePlaceholder: "Ex: Virement, terminal Clip, etc.",
    savePayment: "Enregistrer la Transaction",
    noInvoices: "Aucune facture trouvée.",
    noPayments: "Aucun paiement enregistré.",
    detailsTitle: "Détails Facture",
    amountPaid: "Payé",
    amountPending: "Restant",
    paymentAdded: "Paiement enregistré avec succès.",
    invoiceCreated: "Facture créée avec succès.",
    invoiceDeleted: "Facture supprimée.",
    statusUpdated: "Facture mise à jour.",
    bankConcilationTitle: "Rapprochement des Comptes Bancaires",
    bankConcilationDesc: "Téléchargez ou simulez des entrées bancaires pour les faire correspondre aux factures.",
    loadMockBank: "Charger le Relevé Bancaire (Simulation)",
    dropFileText: "Déposer le fichier bancaire Excel/CSV ici",
    bankTransactionsHeader: "Transactions Bancaires",
    matchedInvoice: "Correspond avec",
    reconciledText: "Rapproché",
    reconcileAction: "Rapprocher et Valider",
    noBankData: "Chargez des données de relevé de compte de démonstration pour commencer le rapprochement.",
  }
};

const statusColors: Record<string, string> = {
  DRAFT: "border-slate-500/25 bg-slate-500/10 text-slate-700 dark:text-slate-400",
  ISSUED: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  PAID: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  OVERDUE: "border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-400",
  CANCELLED: "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-400",
};

export function FinanceClient({
  locale,
  invoices: initialInvoices,
  payments: initialPayments,
  members,
  suppliers,
  branches,
}: {
  locale: Locale;
  invoices: Invoice[];
  payments: Payment[];
  members: Member[];
  suppliers: Supplier[];
  branches: Branch[];
}) {
  const t = financeLabels[locale] ?? financeLabels.es;

  // Local state
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "RECEIVABLE" | "PAYABLE">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "PAID">("ALL");

  // Mobile pagination state
  const [invoicePage, setInvoicePage] = useState(1);
  const [paymentPage, setPaymentPage] = useState(1);

  // Reset mobile pagination on filter changes
  useEffect(() => {
    setInvoicePage(1);
  }, [searchQuery, typeFilter, statusFilter]);

  // Modals state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [isSavingInvoice, setIsSavingInvoice] = useState(false);
  const [newInvoiceForm, setNewInvoiceForm] = useState({
    type: "RECEIVABLE" as "RECEIVABLE" | "PAYABLE",
    customerId: "",
    supplierId: "",
    branchId: branches[0]?.id ?? "",
    currency: "MXN",
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // +15 days default
    items: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 16 }] as InvoiceItem[],
  });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [activeInvoiceForPayment, setActiveInvoiceForPayment] = useState<Invoice | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "TRANSFER" as "CASH" | "CARD" | "TRANSFER" | "GATEWAY",
    provider: "",
    externalReference: "",
  });

  // Mock Bank Statement simulation state
  const [bankTransactions, setBankTransactions] = useState<MockBankTransaction[]>([]);
  const [isReconcilingId, setIsReconcilingId] = useState<string | null>(null);

  // Expanded Invoice Row state
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);

  // Formatter for currency
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat(locale === "es" ? "es-MX" : "en-US", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return "-";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(locale === "es" ? "es-MX" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  // KPIs
  const stats = useMemo(() => {
    let revenue = 0; // Invoices of type RECEIVABLE that are PAID
    let cxc = 0; // RECEIVABLE invoices that are ISSUED or OVERDUE or DRAFT
    let cxp = 0; // PAYABLE invoices that are ISSUED or OVERDUE or DRAFT
    let expenses = 0; // PAYABLE invoices that are PAID

    invoices.forEach((inv) => {
      if (inv.status === "CANCELLED") return;

      const totalPaid = inv.payments.reduce((acc, p) => acc + p.amount, 0);
      const remaining = Math.max(0, inv.total - totalPaid);

      if (inv.type === "RECEIVABLE") {
        revenue += totalPaid;
        if (inv.status !== "PAID") {
          cxc += remaining;
        }
      } else if (inv.type === "PAYABLE") {
        expenses += totalPaid;
        if (inv.status !== "PAID") {
          cxp += remaining;
        }
      }
    });

    const netFlow = revenue - expenses;

    return { revenue, cxc, cxp, netFlow };
  }, [invoices]);

  // Filtered invoices list
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const entityName = (inv.customer?.name || inv.supplier?.name || "").toLowerCase();
      const idMatches = inv.id.toLowerCase().includes(searchQuery.toLowerCase());
      const queryMatches = entityName.includes(searchQuery.toLowerCase()) || idMatches;

      const matchesType = typeFilter === "ALL" || inv.type === typeFilter;

      let matchesStatus = true;
      if (statusFilter === "PENDING") {
        matchesStatus = inv.status === "ISSUED" || inv.status === "OVERDUE" || inv.status === "DRAFT";
      } else if (statusFilter === "PAID") {
        matchesStatus = inv.status === "PAID";
      }

      return queryMatches && matchesType && matchesStatus;
    });
  }, [invoices, searchQuery, typeFilter, statusFilter]);

  // Mobile Pagination for Invoices
  const ITEMS_PER_PAGE = 5;
  const totalInvoicePages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
  const paginatedInvoices = useMemo(() => {
    const startIndex = (invoicePage - 1) * ITEMS_PER_PAGE;
    return filteredInvoices.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredInvoices, invoicePage]);

  // Mobile Pagination for Payments
  const totalPaymentPages = Math.ceil(payments.length / ITEMS_PER_PAGE);
  const paginatedPayments = useMemo(() => {
    const startIndex = (paymentPage - 1) * ITEMS_PER_PAGE;
    return payments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [payments, paymentPage]);

  // Invoice creation calculations
  const invoiceTotals = useMemo(() => {
    const subtotal = newInvoiceForm.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = newInvoiceForm.items.reduce((sum, item) => {
      const itemSub = item.quantity * item.unitPrice;
      return sum + (itemSub * (item.taxRate / 100));
    }, 0);
    const total = subtotal + tax;

    return { subtotal, tax, total };
  }, [newInvoiceForm.items]);

  // Handle invoice item row change
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...newInvoiceForm.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    setNewInvoiceForm((prev) => ({ ...prev, items: updatedItems }));
  };

  // Add Item Row to form
  const addItemRow = () => {
    setNewInvoiceForm((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, unitPrice: 0, taxRate: 16 }],
    }));
  };

  // Remove Item Row from form
  const removeItemRow = (index: number) => {
    if (newInvoiceForm.items.length <= 1) return;
    const updatedItems = newInvoiceForm.items.filter((_, i) => i !== index);
    setNewInvoiceForm((prev) => ({ ...prev, items: updatedItems }));
  };

  // Create Invoice Submission
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (newInvoiceForm.type === "RECEIVABLE" && !newInvoiceForm.customerId) {
      toast.error("Debe seleccionar un cliente (Miembro).");
      return;
    }
    if (newInvoiceForm.type === "PAYABLE" && !newInvoiceForm.supplierId) {
      toast.error("Debe seleccionar un proveedor.");
      return;
    }

    const hasEmptyDesc = newInvoiceForm.items.some((item) => !item.description.trim());
    if (hasEmptyDesc) {
      toast.error("Complete la descripción de todos los conceptos.");
      return;
    }

    setIsSavingInvoice(true);
    try {
      const res = await fetch("/api/finance/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId: newInvoiceForm.branchId,
          customerId: newInvoiceForm.type === "RECEIVABLE" ? newInvoiceForm.customerId : undefined,
          supplierId: newInvoiceForm.type === "PAYABLE" ? newInvoiceForm.supplierId : undefined,
          type: newInvoiceForm.type,
          currency: newInvoiceForm.currency,
          dueDate: new Date(newInvoiceForm.dueDate).toISOString(),
          items: newInvoiceForm.items,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || result.message || "Error al crear factura.");

      // Re-map response data for safe client visualization
      const createdInv = result.data;
      const formattedInv: Invoice = {
        id: createdInv.id,
        type: createdInv.type,
        status: createdInv.status,
        subtotal: parseFloat(createdInv.subtotal),
        tax: parseFloat(createdInv.tax),
        total: parseFloat(createdInv.total),
        currency: createdInv.currency,
        dueDate: createdInv.dueDate,
        issuedAt: createdInv.issuedAt,
        createdAt: createdInv.createdAt,
        customer: newInvoiceForm.type === "RECEIVABLE" ? {
          id: newInvoiceForm.customerId,
          name: members.find((m) => m.id === newInvoiceForm.customerId)?.name || "Cliente",
        } : null,
        supplier: newInvoiceForm.type === "PAYABLE" ? {
          id: newInvoiceForm.supplierId,
          name: suppliers.find((s) => s.id === newInvoiceForm.supplierId)?.name || "Proveedor",
        } : null,
        items: createdInv.items.map((i: any) => ({
          id: i.id,
          description: i.description,
          quantity: parseFloat(i.quantity),
          unitPrice: parseFloat(i.unitPrice),
          taxRate: parseFloat(i.taxRate),
          total: parseFloat(i.total),
        })),
        payments: [],
      };

      setInvoices((prev) => [formattedInv, ...prev]);
      toast.success(t.invoiceCreated);
      setShowInvoiceModal(false);
      setNewInvoiceForm({
        type: "RECEIVABLE",
        customerId: "",
        supplierId: "",
        branchId: branches[0]?.id ?? "",
        currency: "MXN",
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        items: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 16 }],
      });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSavingInvoice(false);
    }
  };

  // Record Payment Submission
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInvoiceForPayment) return;

    const amount = parseFloat(paymentForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("El monto debe ser mayor a 0.");
      return;
    }

    const totalPaid = activeInvoiceForPayment.payments.reduce((acc, p) => acc + p.amount, 0);
    const balance = activeInvoiceForPayment.total - totalPaid;
    if (amount > balance + 0.01) {
      toast.error(`El monto no puede exceder el saldo pendiente de ${formatMoney(balance)}.`);
      return;
    }

    setIsSavingPayment(true);
    try {
      const res = await fetch("/api/finance/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId: activeInvoiceForPayment.payments[0]?.id ? undefined : branches[0]?.id,
          invoiceId: activeInvoiceForPayment.id,
          memberId: activeInvoiceForPayment.customer?.id || undefined,
          amount,
          method: paymentForm.method,
          provider: paymentForm.provider || undefined,
          externalReference: paymentForm.externalReference || undefined,
          status: "SUCCEEDED",
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || result.message || "Error al crear el pago.");

      // Check if new balance will cover the total invoice amount
      const isPaidFully = Math.abs(balance - amount) < 0.05;
      const targetStatus = isPaidFully ? "PAID" : "ISSUED";

      // Call invoice status patch to sync status in the DB
      if (activeInvoiceForPayment.status !== targetStatus) {
        await fetch(`/api/finance/invoices/${activeInvoiceForPayment.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: targetStatus }),
        });
      }

      // Update Local Invoices State
      const newPayment = {
        id: result.data.id,
        amount: parseFloat(result.data.amount),
        method: result.data.method,
        paidAt: result.data.paidAt,
      };

      setInvoices((prev) =>
        prev.map((inv) => {
          if (inv.id === activeInvoiceForPayment.id) {
            return {
              ...inv,
              status: targetStatus,
              payments: [...inv.payments, newPayment],
            };
          }
          return inv;
        })
      );

      // Prepend to payments list
      const formattedPayment: Payment = {
        id: result.data.id,
        amount: parseFloat(result.data.amount),
        currency: result.data.currency,
        method: result.data.method,
        status: result.data.status,
        provider: result.data.provider ?? null,
        externalReference: result.data.externalReference ?? null,
        paidAt: result.data.paidAt,
        invoice: {
          id: activeInvoiceForPayment.id,
          type: activeInvoiceForPayment.type,
          total: activeInvoiceForPayment.total,
        },
        member: activeInvoiceForPayment.customer ? {
          id: activeInvoiceForPayment.customer.id,
          name: activeInvoiceForPayment.customer.name,
        } : null,
      };

      setPayments((prev) => [formattedPayment, ...prev]);

      toast.success(t.paymentAdded);
      setShowPaymentModal(false);
      setPaymentForm({
        amount: "",
        method: "TRANSFER",
        provider: "",
        externalReference: "",
      });
      setActiveInvoiceForPayment(null);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSavingPayment(false);
    }
  };

  // Delete Invoice Handler
  const handleDeleteInvoice = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar esta factura?")) return;

    try {
      const res = await fetch(`/api/finance/invoices/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || result.message || "Error al eliminar.");

      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      toast.success(t.invoiceDeleted);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Generate Bank Statement simulation movements
  const loadMockBankStatement = () => {
    const list: MockBankTransaction[] = [
      {
        id: "tx-bank-01",
        description: "SPEI RECIBIDO - ALBERTO GOMEZ SANCHEZ - REF: PAGO CUOTA - MXN",
        amount: 1160,
        date: new Date().toISOString(),
        type: "DEPOSIT",
        reconciled: false,
      },
      {
        id: "tx-bank-02",
        description: "DEPOSITO EN EFECTIVO REGISTRADORA POS MATUTINO",
        amount: 450,
        date: new Date().toISOString(),
        type: "DEPOSIT",
        reconciled: false,
      },
      {
        id: "tx-bank-03",
        description: "PAGO PROVEEDOR - DISTRIBUIDORA DE SUPLEMENTOS DEPORTIVOS SA",
        amount: 3480,
        date: new Date().toISOString(),
        type: "WITHDRAWAL",
        reconciled: false,
      },
    ];
    setBankTransactions(list);
    toast.success("Estado de cuenta bancario cargado. Movimientos disponibles para conciliar.");
  };

  // Bank Statement Conciliation Action
  const handleBankReconcile = async (bankTx: MockBankTransaction) => {
    setIsReconcilingId(bankTx.id);

    try {
      // Find a matching invoice in local state based on amount
      // We will look for an unpaid invoice where total matches bankTx.amount +/- 1.00
      const matched = invoices.find((inv) => {
        const totalPaid = inv.payments.reduce((acc, p) => acc + p.amount, 0);
        const balance = inv.total - totalPaid;
        const correctDirection = (inv.type === "RECEIVABLE" && bankTx.type === "DEPOSIT") ||
                                 (inv.type === "PAYABLE" && bankTx.type === "WITHDRAWAL");
        return correctDirection && Math.abs(balance - bankTx.amount) < 1.05 && inv.status !== "PAID";
      });

      if (!matched) {
        toast.info(
          `No se encontró un balance exacto de ${formatMoney(bankTx.amount)} en las facturas abiertas del ERP. Se creará una transacción manual.`
        );
        setIsReconcilingId(null);
        return;
      }

      // Record payment automatically matching this invoice!
      const res = await fetch("/api/finance/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId: branches[0]?.id,
          invoiceId: matched.id,
          memberId: matched.customer?.id || undefined,
          amount: bankTx.amount,
          method: "TRANSFER",
          provider: "Banco Sistema",
          externalReference: bankTx.description.substring(0, 100),
          status: "SUCCEEDED",
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || result.message);

      // Reconcile and change invoice status to PAID
      await fetch(`/api/finance/invoices/${matched.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID" }),
      });

      const newPayment = {
        id: result.data.id,
        amount: parseFloat(result.data.amount),
        method: result.data.method,
        paidAt: result.data.paidAt,
      };

      // Sync local invoices
      setInvoices((prev) =>
        prev.map((inv) => {
          if (inv.id === matched.id) {
            return {
              ...inv,
              status: "PAID",
              payments: [...inv.payments, newPayment],
            };
          }
          return inv;
        })
      );

      // Sync payments log
      const formattedPayment: Payment = {
        id: result.data.id,
        amount: parseFloat(result.data.amount),
        currency: result.data.currency,
        method: result.data.method,
        status: result.data.status,
        provider: result.data.provider,
        externalReference: result.data.externalReference,
        paidAt: result.data.paidAt,
        invoice: { id: matched.id, type: matched.type, total: matched.total },
        member: matched.customer ? { id: matched.customer.id, name: matched.customer.name } : null,
      };
      setPayments((prev) => [formattedPayment, ...prev]);

      // Reconcile in simulated bank statements array
      setBankTransactions((prev) =>
        prev.map((tx) => (tx.id === bankTx.id ? { ...tx, reconciled: true } : tx))
      );

      toast.success(
        `Movimiento concilidado con éxito. Factura #${matched.id.substring(0, 8)} de ${matched.customer?.name || matched.supplier?.name} marcada como PAGADA.`
      );
    } catch (err: any) {
      toast.error(`Error al conciliar: ${err.message}`);
    } finally {
      setIsReconcilingId(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] p-4 sm:p-6 bg-background/30 flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <DollarSign className="size-7 text-primary" />
            {t.title}
          </h1>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
        <Button
          onClick={() => setShowInvoiceModal(true)}
          className={cn(headerPrimaryActionClass, "shrink-0 cursor-pointer px-4 py-4 text-xs")}
        >
          <Plus className="size-4 mr-2" />
          {t.newInvoiceButton}
        </Button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 select-none shrink-0">
        <div className="glass-panel p-4 rounded-xl border border-border flex flex-col justify-between">
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{t.revenueCollected}</p>
          <p className="text-2xl font-bold text-foreground mt-2">{formatMoney(stats.revenue)}</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-border flex flex-col justify-between">
          <p className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">{t.accountsReceivable}</p>
          <p className="text-2xl font-bold text-foreground mt-2">{formatMoney(stats.cxc)}</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-border flex flex-col justify-between">
          <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">{t.accountsPayable}</p>
          <p className="text-2xl font-bold text-foreground mt-2">{formatMoney(stats.cxp)}</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-border flex flex-col justify-between">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t.netCashFlow}</p>
          <div className="flex items-center gap-2 mt-2">
            <p className={cn(
              "text-2xl font-bold",
              stats.netFlow >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            )}>
              {formatMoney(stats.netFlow)}
            </p>
            {stats.netFlow >= 0 ? (
              <TrendingUp className="size-5 text-emerald-500" />
            ) : (
              <TrendingDown className="size-5 text-rose-500" />
            )}
          </div>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="flex-1 min-h-[480px] flex flex-col glass-panel rounded-xl border border-border overflow-hidden">
        <Tabs defaultValue="invoices" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 pt-3 pb-3 md:pb-0 border-b border-border flex items-center justify-between shrink-0">
            <TabsList className="w-full grid grid-cols-1 md:grid-cols-3 !h-auto md:!h-10 bg-muted/50 p-1 rounded-lg border gap-1 md:gap-0">
              <TabsTrigger value="invoices" className="text-xs font-semibold w-full !h-9 md:!h-full py-2 md:py-0 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer">
                {t.tabInvoices}
              </TabsTrigger>
              <TabsTrigger value="transactions" className="text-xs font-semibold w-full !h-9 md:!h-full py-2 md:py-0 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer">
                {t.tabTransactions} ({payments.length})
              </TabsTrigger>
              <TabsTrigger value="conciliation" className="text-xs font-semibold w-full !h-9 md:!h-full py-2 md:py-0 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer">
                {t.tabConciliation}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="flex-1 overflow-y-auto p-4 flex flex-col min-h-0">
            {/* Filters Row */}
            <div className="flex flex-col md:flex-row gap-3 mb-4 shrink-0 select-none">
              <div className="relative flex-1">
                <Search className="size-4 text-muted-foreground absolute left-3 top-2.5" />
                <Input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  className="glass-control pl-9 text-sm text-foreground placeholder:text-muted-foreground"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="glass-control text-xs font-semibold px-3 py-2 rounded-lg border text-foreground bg-card"
                >
                  <option value="ALL" className="text-foreground bg-background">{t.all} ({t.invoiceType})</option>
                  <option value="RECEIVABLE" className="text-foreground bg-background">{t.receivable}</option>
                  <option value="PAYABLE" className="text-foreground bg-background">{t.payable}</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="glass-control text-xs font-semibold px-3 py-2 rounded-lg border text-foreground bg-card"
                >
                  <option value="ALL" className="text-foreground bg-background">{t.all} (Estados)</option>
                  <option value="PENDING" className="text-foreground bg-background">Pendientes / Abiertas</option>
                  <option value="PAID" className="text-foreground bg-background">{t.statusPaid}</option>
                </select>
              </div>
            </div>

            {/* Table / Cards */}
            {filteredInvoices.length === 0 ? (
              <div className="flex-1 min-h-[250px] flex flex-col items-center justify-center text-muted-foreground p-6 text-center space-y-3 select-none">
                <FileText className="size-12 text-slate-400 animate-pulse" />
                <p className="text-sm font-semibold">{t.noInvoices}</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-4">
                {/* Desktop View Table */}
                <div className="hidden md:block overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse select-none">
                    <thead>
                      <tr className="border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="pb-3 pr-2">Folio</th>
                        <th className="pb-3 pr-2">Tipo</th>
                        <th className="pb-3 pr-2">Contacto / Enlace</th>
                        <th className="pb-3 pr-2">Vencimiento</th>
                        <th className="pb-3 pr-2 text-right">Total</th>
                        <th className="pb-3 pr-2 text-right">Pendiente</th>
                        <th className="pb-3 pr-2">Estado</th>
                        <th className="pb-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {filteredInvoices.map((inv) => {
                        const totalPaid = inv.payments.reduce((acc, p) => acc + p.amount, 0);
                        const balance = Math.max(0, inv.total - totalPaid);
                        const isExpanded = expandedInvoiceId === inv.id;

                        return (
                          <tr key={inv.id} className="text-sm font-medium hover:bg-muted/10 transition-colors">
                            <td className="py-3.5 pr-2">
                              <button
                                type="button"
                                onClick={() => setExpandedInvoiceId(isExpanded ? null : inv.id)}
                                className="text-xs text-primary font-mono font-semibold hover:underline cursor-pointer"
                              >
                                #{inv.id.substring(0, 8).toUpperCase()}
                              </button>
                            </td>
                            <td className="py-3.5 pr-2">
                              {inv.type === "RECEIVABLE" ? (
                                <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] hover:bg-emerald-500/10 font-bold">CxC</Badge>
                              ) : (
                                <Badge className="bg-rose-500/10 text-rose-700 dark:text-rose-400 text-[10px] hover:bg-rose-500/10 font-bold">CxP</Badge>
                              )}
                            </td>
                            <td className="py-3.5 pr-2 text-foreground font-semibold">
                              {inv.customer?.name || inv.supplier?.name || "Público General"}
                            </td>
                            <td className="py-3.5 pr-2 text-xs font-semibold text-muted-foreground">{formatDate(inv.dueDate)}</td>
                            <td className="py-3.5 pr-2 text-right font-bold text-foreground">{formatMoney(inv.total)}</td>
                            <td className="py-3.5 pr-2 text-right text-xs font-bold text-muted-foreground">
                              {balance === 0 ? (
                                <span className="text-emerald-500">Liquidada</span>
                              ) : (
                                formatMoney(balance)
                              )}
                            </td>
                            <td className="py-3.5 pr-2">
                              <Badge className={cn("text-[10px] font-bold py-0.5", statusColors[inv.status])} variant="outline">
                                {inv.status === "PAID" ? t.statusPaid : inv.status === "OVERDUE" ? t.statusOverdue : inv.status === "ISSUED" ? t.statusIssued : inv.status}
                              </Badge>
                            </td>
                            <td className="py-3.5 text-right flex items-center justify-end gap-2">
                              {inv.status !== "PAID" && inv.status !== "CANCELLED" && (
                                <Button
                                  size="xs"
                                  variant="outline"
                                  onClick={() => {
                                    setActiveInvoiceForPayment(inv);
                                    setPaymentForm((prev) => ({ ...prev, amount: balance.toString() }));
                                    setShowPaymentModal(true);
                                  }}
                                  className="text-[10px] font-bold px-2 py-1 h-7 text-foreground cursor-pointer"
                                >
                                  {t.registerPaymentButton}
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => handleDeleteInvoice(inv.id)}
                                className="text-destructive hover:bg-destructive/10 h-7 w-7 cursor-pointer"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View: Grid of cards */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                  {paginatedInvoices.map((inv) => {
                    const totalPaid = inv.payments.reduce((acc, p) => acc + p.amount, 0);
                    const balance = Math.max(0, inv.total - totalPaid);

                    return (
                      <div key={inv.id} className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-mono font-bold text-primary">
                            #{inv.id.substring(0, 8).toUpperCase()}
                          </span>
                          <div className="flex gap-1.5">
                            {inv.type === "RECEIVABLE" ? (
                              <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] hover:bg-emerald-500/10 font-bold">CxC</Badge>
                            ) : (
                              <Badge className="bg-rose-500/10 text-rose-700 dark:text-rose-400 text-[10px] hover:bg-rose-500/10 font-bold">CxP</Badge>
                            )}
                            <Badge className={cn("text-[10px] font-bold py-0.5", statusColors[inv.status])} variant="outline">
                              {inv.status === "PAID" ? t.statusPaid : inv.status === "OVERDUE" ? t.statusOverdue : inv.status === "ISSUED" ? t.statusIssued : inv.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Contacto / Enlace</p>
                          <p className="text-sm font-semibold text-foreground">
                            {inv.customer?.name || inv.supplier?.name || "Público General"}
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-border/40 text-xs">
                          <div>
                            <p className="text-[10px] text-muted-foreground font-bold">Total</p>
                            <p className="font-bold text-foreground mt-0.5">{formatMoney(inv.total)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground font-bold">Pagado</p>
                            <p className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">{formatMoney(totalPaid)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground font-bold">Pendiente</p>
                            <p className="font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                              {balance === 0 ? "Liquidado" : formatMoney(balance)}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs pt-1">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="size-3.5" />
                            {formatDate(inv.dueDate)}
                          </span>
                          <div className="flex gap-2">
                            {inv.status !== "PAID" && inv.status !== "CANCELLED" && (
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => {
                                  setActiveInvoiceForPayment(inv);
                                  setPaymentForm((prev) => ({ ...prev, amount: balance.toString() }));
                                  setShowPaymentModal(true);
                                }}
                                className="text-[10px] font-bold px-2 py-1 h-7 text-foreground cursor-pointer"
                              >
                                {t.registerPaymentButton}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleDeleteInvoice(inv.id)}
                              className="text-destructive hover:bg-destructive/10 h-7 w-7 cursor-pointer"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Pagination controls */}
                  {totalInvoicePages > 1 && (
                    <div className="flex items-center justify-between pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={invoicePage === 1}
                        onClick={() => setInvoicePage((p) => Math.max(1, p - 1))}
                        className="text-xs text-foreground cursor-pointer"
                      >
                        Anterior
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        Página {invoicePage} de {totalInvoicePages}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={invoicePage === totalInvoicePages}
                        onClick={() => setInvoicePage((p) => Math.min(totalInvoicePages, p + 1))}
                        className="text-xs text-foreground cursor-pointer"
                      >
                        Siguiente
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Transactions Log Tab */}
          <TabsContent value="transactions" className="flex-1 overflow-y-auto p-4 min-h-0 flex flex-col">
            {payments.length === 0 ? (
              <div className="flex-1 min-h-[250px] flex flex-col items-center justify-center text-muted-foreground p-6 text-center space-y-3 select-none">
                <Banknote className="size-12 text-slate-400" />
                <p className="text-sm font-semibold">{t.noPayments}</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-4">
                {/* Desktop View Table */}
                <div className="hidden md:block overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse select-none">
                    <thead>
                      <tr className="border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="pb-3 pr-2">ID Transacción</th>
                        <th className="pb-3 pr-2">Fecha</th>
                        <th className="pb-3 pr-2">Contacto</th>
                        <th className="pb-3 pr-2">Método</th>
                        <th className="pb-3 pr-2">Referencia</th>
                        <th className="pb-3 pr-2">Factura Asoc.</th>
                        <th className="pb-3 text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {payments.map((p) => (
                        <tr key={p.id} className="text-sm font-medium hover:bg-muted/10 transition-colors">
                          <td className="py-3.5 pr-2 font-mono text-xs text-muted-foreground">#{p.id.substring(0, 8).toUpperCase()}</td>
                          <td className="py-3.5 pr-2 text-xs font-semibold text-muted-foreground">{formatDate(p.paidAt)}</td>
                          <td className="py-3.5 pr-2 text-foreground font-semibold">{p.member?.name || "Proveedor / General"}</td>
                          <td className="py-3.5 pr-2 text-xs text-foreground uppercase tracking-wider font-bold">
                            {p.method === "CASH" ? t.cash : p.method === "CARD" ? t.card : p.method === "TRANSFER" ? t.transfer : p.method}
                          </td>
                          <td className="py-3.5 pr-2 text-xs text-muted-foreground max-w-[150px] truncate">{p.externalReference || p.provider || "-"}</td>
                          <td className="py-3.5 pr-2">
                            {p.invoice ? (
                              <Badge variant="outline" className="text-[10px] font-mono border-primary/20 bg-primary/5 text-primary">
                                #{p.invoice.id.substring(0, 6).toUpperCase()}
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="py-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400">{formatMoney(p.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View: Grid of cards */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                  {paginatedPayments.map((p) => (
                    <div key={p.id} className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3 animate-in fade-in duration-200">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono font-bold text-muted-foreground">
                          #{p.id.substring(0, 8).toUpperCase()}
                        </span>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {formatMoney(p.amount)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-[10px] text-muted-foreground font-bold">Contacto</p>
                          <p className="font-semibold text-foreground mt-0.5">{p.member?.name || "Proveedor / General"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground font-bold">Método</p>
                          <p className="font-bold text-foreground mt-0.5 uppercase tracking-wider text-xs">
                            {p.method === "CASH" ? t.cash : p.method === "CARD" ? t.card : p.method === "TRANSFER" ? t.transfer : p.method}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border/40">
                        <div>
                          <p className="text-[10px] text-muted-foreground font-bold">Referencia</p>
                          <p className="text-muted-foreground mt-0.5 truncate max-w-[120px]">{p.externalReference || p.provider || "-"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground font-bold">Factura</p>
                          <div className="mt-0.5">
                            {p.invoice ? (
                              <Badge variant="outline" className="text-[10px] font-mono border-primary/20 bg-primary/5 text-primary py-0">
                                #{p.invoice.id.substring(0, 6).toUpperCase()}
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right text-[10px] text-muted-foreground flex items-center justify-end gap-1 pt-1">
                        <Calendar className="size-3" />
                        {formatDate(p.paidAt)}
                      </div>
                    </div>
                  ))}

                  {/* Pagination controls */}
                  {totalPaymentPages > 1 && (
                    <div className="flex items-center justify-between pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={paymentPage === 1}
                        onClick={() => setPaymentPage((p) => Math.max(1, p - 1))}
                        className="text-xs text-foreground cursor-pointer"
                      >
                        Anterior
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        Página {paymentPage} de {totalPaymentPages}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={paymentPage === totalPaymentPages}
                        onClick={() => setPaymentPage((p) => Math.min(totalPaymentPages, p + 1))}
                        className="text-xs text-foreground cursor-pointer"
                      >
                        Siguiente
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Conciliation Tab */}
          <TabsContent value="conciliation" className="flex-1 overflow-y-auto p-4 min-h-0 flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border border-border rounded-xl bg-card">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <FileSpreadsheet className="size-4 text-emerald-500" />
                  {t.bankConcilationTitle}
                </h3>
                <p className="text-xs text-muted-foreground">{t.bankConcilationDesc}</p>
              </div>
              <Button
                onClick={loadMockBankStatement}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-3 px-4 shadow cursor-pointer shrink-0"
              >
                <RefreshCw className="size-3.5 mr-2" />
                {t.loadMockBank}
              </Button>
            </div>

            {bankTransactions.length === 0 ? (
              <div className="flex-1 min-h-[220px] border border-dashed border-border rounded-xl flex flex-col items-center justify-center p-6 text-center text-muted-foreground select-none space-y-2">
                <FileSpreadsheet className="size-10 text-muted-foreground/60 animate-bounce" />
                <p className="text-sm font-semibold">{t.dropFileText}</p>
                <p className="text-xs opacity-75">{t.noBankData}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t.bankTransactionsHeader}</h4>
                <div className="space-y-2.5">
                  {bankTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className={cn(
                        "p-4 rounded-xl border flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all animate-in fade-in slide-in-from-top-1 duration-200",
                        tx.reconciled
                          ? "border-emerald-500/20 bg-emerald-500/[0.03]"
                          : "border-border bg-card"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "size-8 rounded-full flex items-center justify-center shrink-0",
                          tx.type === "DEPOSIT" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                        )}>
                          {tx.type === "DEPOSIT" ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{tx.description}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{formatDate(tx.date)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-4">
                        <span className={cn(
                          "text-base font-bold",
                          tx.type === "DEPOSIT" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                        )}>
                          {tx.type === "DEPOSIT" ? "+" : "-"}{formatMoney(tx.amount)}
                        </span>

                        {tx.reconciled ? (
                          <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-bold gap-1 text-[10px] py-0.5">
                            <ShieldCheck className="size-3.5" />
                            {t.reconciledText}
                          </Badge>
                        ) : (
                          <Button
                            size="xs"
                            disabled={isReconcilingId === tx.id}
                            onClick={() => handleBankReconcile(tx)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3 py-1 cursor-pointer"
                          >
                            {isReconcilingId === tx.id ? "..." : t.reconcileAction}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Nueva Factura Modal */}
      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className="sm:max-w-[650px] p-0 !overflow-hidden flex flex-col max-h-[85vh]">
          <form onSubmit={handleCreateInvoice} className="flex flex-col flex-1 min-h-0 !overflow-hidden">
            <DialogHeader className="p-6 pb-2 shrink-0">
              <DialogTitle className="text-lg font-bold text-foreground">{t.newInvoiceTitle}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">{t.newInvoiceDesc}</DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
              {/* Type Select */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="inv-type">
                    {t.invoiceType}
                  </label>
                  <select
                    id="inv-type"
                    className="glass-control w-full px-3 py-2 rounded-lg border text-sm text-foreground bg-card"
                    value={newInvoiceForm.type}
                    onChange={(e) =>
                      setNewInvoiceForm((prev: any) => ({
                        ...prev,
                        type: e.target.value,
                        customerId: "",
                        supplierId: "",
                      }))
                    }
                  >
                    <option value="RECEIVABLE" className="text-foreground bg-background">{t.receivable}</option>
                    <option value="PAYABLE" className="text-foreground bg-background">{t.payable}</option>
                  </select>
                </div>

                <div className="grid gap-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="inv-branch">
                    {t.selectBranch}
                  </label>
                  <select
                    id="inv-branch"
                    className="glass-control w-full px-3 py-2 rounded-lg border text-sm text-foreground bg-card"
                    value={newInvoiceForm.branchId}
                    onChange={(e) => setNewInvoiceForm((prev) => ({ ...prev, branchId: e.target.value }))}
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id} className="text-foreground bg-background">
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Entity Select (Member vs Supplier) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1">
                  {newInvoiceForm.type === "RECEIVABLE" ? (
                    <>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="inv-customer">
                        {t.selectCustomer} *
                      </label>
                      <select
                        id="inv-customer"
                        className="glass-control w-full px-3 py-2 rounded-lg border text-sm text-foreground bg-card"
                        value={newInvoiceForm.customerId}
                        onChange={(e) => setNewInvoiceForm((prev) => ({ ...prev, customerId: e.target.value }))}
                        required
                      >
                        <option value="" className="text-muted-foreground bg-background">Seleccionar cliente...</option>
                        {members.map((m) => (
                          <option key={m.id} value={m.id} className="text-foreground bg-background">
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="inv-supplier">
                        {t.selectSupplier} *
                      </label>
                      <select
                        id="inv-supplier"
                        className="glass-control w-full px-3 py-2 rounded-lg border text-sm text-foreground bg-card"
                        value={newInvoiceForm.supplierId}
                        onChange={(e) => setNewInvoiceForm((prev) => ({ ...prev, supplierId: e.target.value }))}
                        required
                      >
                        <option value="" className="text-muted-foreground bg-background">Seleccionar proveedor...</option>
                        {suppliers.map((s) => (
                          <option key={s.id} value={s.id} className="text-foreground bg-background">
                            {s.name} ({s.taxId})
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                </div>

                <div className="grid gap-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="inv-due-date">
                    {t.dueDate}
                  </label>
                  <Input
                    id="inv-due-date"
                    type="date"
                    required
                    className="glass-control text-foreground text-sm px-3.5 py-2 bg-card"
                    value={newInvoiceForm.dueDate}
                    onChange={(e) => setNewInvoiceForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>

              {/* Items Desglose */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b pb-1 select-none">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t.items}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={addItemRow}
                    className="text-xs font-semibold text-primary hover:bg-primary/10 px-2 py-1 h-7 cursor-pointer"
                  >
                    <PlusCircle className="size-3.5 mr-1" />
                    {t.addItem}
                  </Button>
                </div>

                <div className="space-y-3">
                  {newInvoiceForm.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5 grid gap-1">
                        <Input
                          type="text"
                          placeholder={t.description}
                          required
                          className="glass-control text-foreground text-xs px-2.5 py-1.5 bg-card"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, "description", e.target.value)}
                        />
                      </div>
                      <div className="col-span-2 grid gap-1">
                        <Input
                          type="number"
                          placeholder={t.qty}
                          min="1"
                          required
                          className="glass-control text-foreground text-xs px-2.5 py-1.5 bg-card"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="col-span-3 grid gap-1">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder={t.price}
                          required
                          className="glass-control text-foreground text-xs px-2.5 py-1.5 bg-card"
                          value={item.unitPrice || ""}
                          onChange={(e) => handleItemChange(index, "unitPrice", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-1.5 grid gap-1">
                        <select
                          className="glass-control text-xs px-2 py-1.5 rounded-lg border text-foreground bg-card"
                          value={item.taxRate}
                          onChange={(e) => handleItemChange(index, "taxRate", parseInt(e.target.value) || 0)}
                        >
                          <option value="16" className="text-foreground bg-background">16%</option>
                          <option value="8" className="text-foreground bg-background">8%</option>
                          <option value="0" className="text-foreground bg-background">0%</option>
                        </select>
                      </div>
                      <div className="col-span-0.5 text-right pb-1.5">
                        <button
                          type="button"
                          disabled={newInvoiceForm.items.length <= 1}
                          onClick={() => removeItemRow(index)}
                          className="text-destructive hover:bg-destructive/10 p-1 rounded cursor-pointer disabled:opacity-30"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Summary */}
              <div className="border-t border-border pt-4 select-none">
                <div className="w-52 ml-auto space-y-1.5 text-sm font-semibold text-right">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t.subtotal}:</span>
                    <span>{formatMoney(invoiceTotals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t.tax}:</span>
                    <span>{formatMoney(invoiceTotals.tax)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-foreground border-t pt-1.5">
                    <span>{t.total}:</span>
                    <span>{formatMoney(invoiceTotals.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 p-6 pt-2 border-t bg-muted/20 shrink-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowInvoiceModal(false)}
                className="text-xs font-semibold cursor-pointer"
              >
                {t.cancel}
              </Button>
              <Button
                type="submit"
                disabled={isSavingInvoice}
                className="bg-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/90 text-white font-bold text-xs px-4 py-2 cursor-pointer"
              >
                {isSavingInvoice ? "..." : t.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Registrar Pago Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-[450px]">
          <form onSubmit={handleRecordPayment}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-foreground">{t.registerPaymentTitle}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">{t.registerPaymentDesc}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {activeInvoiceForPayment && (
                <div className="p-3 bg-muted/40 border rounded-lg select-none">
                  <p className="text-xs font-bold text-foreground">
                    Factura: <span className="font-mono">#{activeInvoiceForPayment.id.substring(0, 8).toUpperCase()}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Enlace: {activeInvoiceForPayment.customer?.name || activeInvoiceForPayment.supplier?.name}
                  </p>
                  <p className="text-sm font-extrabold text-primary mt-1">
                    Total Facturado: {formatMoney(activeInvoiceForPayment.total)}
                  </p>
                </div>
              )}

              <div className="grid gap-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="pay-amount">
                  {t.paymentAmount} *
                </label>
                <Input
                  id="pay-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  className="glass-control text-foreground text-sm px-3.5 py-2 bg-card"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="pay-method">
                    {t.paymentMethod}
                  </label>
                  <select
                    id="pay-method"
                    className="glass-control w-full px-3 py-2 rounded-lg border text-sm text-foreground bg-card"
                    value={paymentForm.method}
                    onChange={(e) => setPaymentForm((prev) => ({ ...prev, method: e.target.value as any }))}
                  >
                    <option value="TRANSFER" className="text-foreground bg-background">{t.transfer}</option>
                    <option value="CASH" className="text-foreground bg-background">{t.cash}</option>
                    <option value="CARD" className="text-foreground bg-background">{t.card}</option>
                    <option value="GATEWAY" className="text-foreground bg-background">{t.gateway}</option>
                  </select>
                </div>

                <div className="grid gap-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="pay-ref">
                    {t.paymentReference}
                  </label>
                  <Input
                    id="pay-ref"
                    type="text"
                    placeholder={t.paymentReferencePlaceholder}
                    className="glass-control text-foreground text-sm px-3.5 py-2 bg-card"
                    value={paymentForm.provider}
                    onChange={(e) => setPaymentForm((prev) => ({ ...prev, provider: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowPaymentModal(false)}
                className="text-xs font-semibold cursor-pointer"
              >
                {t.cancel}
              </Button>
              <Button
                type="submit"
                disabled={isSavingPayment}
                className="bg-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/90 text-white font-bold text-xs px-4 py-2 cursor-pointer"
              >
                {isSavingPayment ? "..." : t.savePayment}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
