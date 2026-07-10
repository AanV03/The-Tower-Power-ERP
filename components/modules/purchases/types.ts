import type { Locale } from "@/lib/i18n";

export type PurchaseStatus = "draft" | "received" | "paid" | "overdue";

export interface Vendor {
  id: string;
  name: string;
  category: string;
  contact: string;
  taxId: string;
  history: string;
  otdRate: number; // e.g., 98.2 (representing 98.2%)
  activeIncidents: number;
  purchaseCount: number;
  paymentTerms: string;
  email: string;
  phone: string;
}

export interface PurchaseOrderItem {
  sku: string;
  item: string;
  ordered: number;
  received: number;
  unitPrice: number;
  status: "pending" | "partial" | "completed";
  impact: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  status: "draft" | "received" | "paid" | "overdue";
  date: string;
  itemsCount: number;
  totalAmount: number;
  items: PurchaseOrderItem[];
}

export interface PendingInvoice {
  id: string;
  vendorName: string;
  amount: number;
  due: string;
  status: PurchaseStatus;
}

export interface ReceivingQueueItem {
  id: string;
  label: string;
  detail: string;
}

export interface InventoryImpact {
  label: string;
  value: string;
}

export interface DashboardStats {
  upcomingInvoices: number;
  pendingReceipts: number;
  activeVendors: number;
  criticalReceipts: number;
}
