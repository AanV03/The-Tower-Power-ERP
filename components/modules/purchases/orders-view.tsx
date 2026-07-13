"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/skeletons";
import { EmptyState } from "@/components/empty-state";
import { 
  PackageOpen, 
  AlertTriangle, 
  CheckCircle2, 
  Warehouse,
  Info
} from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { PurchaseOrder, InventoryImpact } from "./types";
import { toast } from "sonner";

interface OrdersViewProps {
  locale: Locale;
  orders: PurchaseOrder[];
  selectedOrderId: string | null;
  onSelectOrder: (id: string | null) => void;
  onItemReceivedQtyChange: (sku: string, qty: number) => void;
  onRegisterReceipt: () => void;
  stockImpact: InventoryImpact[];
  isLoading?: boolean;
}

export function OrdersView({
  locale,
  orders,
  selectedOrderId,
  onSelectOrder,
  onItemReceivedQtyChange,
  onRegisterReceipt,
  stockImpact,
  isLoading = false,
}: OrdersViewProps) {
  const dictionary = {
    es: {
      title: "Órdenes de Compra y Recepción",
      subtitle: "Gestión de pedidos de abastecimiento y validación física de entradas.",
      orderSelector: "Orden seleccionada",
      selectOrderDesc: "Escoge una orden para iniciar la verificación de almacén.",
      tableSku: "SKU",
      tableItem: "Ítem",
      tableOrdered: "Pedida",
      tableReceived: "Recibida",
      tableCost: "Costo Unit.",
      tableStatus: "Estado Línea",
      tableImpact: "Impacto",
      linePending: "Pendiente",
      linePartial: "Parcial",
      lineCompleted: "Completo",
      stockImpactTitle: "Impacto en Inventario",
      stockImpactDesc: "Ajustes previstos en existencias de sucursales.",
      btnRegister: "Registrar Entrada",
      btnReconcile: "Conciliar Diferencias",
      diffWarning: "Discrepancia detectada: Se solicitaron {ordered} uds. de '{name}' pero se marcan {received} recibidas.",
      noOrders: "No hay órdenes de compra registradas",
      noSelectedOrder: "Selecciona una orden de la lista para verificar existencias e impacto en inventario.",
      totalLines: "Líneas de Compra",
    },
    en: {
      title: "Purchase Orders & Receiving",
      subtitle: "Manage replenishment orders and physically validate warehouse entries.",
      orderSelector: "Selected Order",
      selectOrderDesc: "Choose an order to start the warehouse verification process.",
      tableSku: "SKU",
      tableItem: "Item",
      tableOrdered: "Ordered",
      tableReceived: "Received",
      tableCost: "Unit Cost",
      tableStatus: "Line Status",
      tableImpact: "Impact",
      linePending: "Pending",
      linePartial: "Partial",
      lineCompleted: "Completed",
      stockImpactTitle: "Inventory Impact",
      stockImpactDesc: "Predicted adjustments in branch stock.",
      btnRegister: "Register Ingress",
      btnReconcile: "Reconcile Variances",
      diffWarning: "Discrepancy detected: {ordered} units of '{name}' were ordered but only {received} are received.",
      noOrders: "No purchase orders registered",
      noSelectedOrder: "Select an order from the list to verify items and inventory impact.",
      totalLines: "Purchase Lines",
    },
    fr: {
      title: "Bons d'Achat & Réceptions",
      subtitle: "Gérer les commandes de réapprovisionnement et valider les entrées physiques.",
      orderSelector: "Commande Sélectionnée",
      selectOrderDesc: "Choisissez un bon pour commencer la vérification en magasin.",
      tableSku: "SKU",
      tableItem: "Article",
      tableOrdered: "Commandée",
      tableReceived: "Reçue",
      tableCost: "Coût Unit.",
      tableStatus: "Statut Ligne",
      tableImpact: "Impact",
      linePending: "En attente",
      linePartial: "Partiel",
      lineCompleted: "Complet",
      stockImpactTitle: "Impact sur le Stock",
      stockImpactDesc: "Ajustements prévus dans les magasins de succursales.",
      btnRegister: "Enregistrer Entrée",
      btnReconcile: "Rapprocher Écarts",
      diffWarning: "Écart détecté: {ordered} unités de '{name}' ont été commandées mais {received} sont reçues.",
      noOrders: "Aucun bon de commande enregistré",
      noSelectedOrder: "Sélectionnez une commande pour vérifier le matériel et l'impact stock.",
      totalLines: "Lignes de Commande",
    },
  };

  const t = dictionary[locale] || dictionary.es;

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || null;

  // Check if there are discrepancies between ordered and received quantities
  const discrepancies = selectedOrder
    ? selectedOrder.items.filter((item) => item.ordered !== item.received)
    : [];

  const handleQtyChange = (sku: string, valStr: string) => {
    const val = parseInt(valStr, 10);
    if (isNaN(val) || val < 0) return;
    onItemReceivedQtyChange(sku, val);
  };

  const handleRegisterReceipt = () => {
    toast.success("Recepción de material registrada exitosamente en inventario");
    onRegisterReceipt();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold tracking-tight text-foreground">{t.title}</h2>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] items-start">
        {/* Left Column: Purchase Orders & Active Items Verification */}
        <div className="space-y-4">
          {/* Order list selector */}
          <Card className="border-border/60 bg-card/65 glass-effect">
            <CardHeader className="p-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">{t.orderSelector}</CardTitle>
                <CardDescription className="text-[11px]">{t.selectOrderDesc}</CardDescription>
              </div>
              <div className="flex gap-2">
                {orders.map((o) => (
                  <Button
                    key={o.id}
                    variant={selectedOrderId === o.id ? "default" : "outline"}
                    size="sm"
                    className="text-xs font-semibold cursor-pointer"
                    onClick={() => onSelectOrder(o.id)}
                  >
                    {o.poNumber}
                  </Button>
                ))}
              </div>
            </CardHeader>
          </Card>

          {isLoading ? (
            <Card className="border-border/60 bg-card/65 glass-effect">
              <TableSkeleton rows={4} columns={6} />
            </Card>
          ) : !selectedOrder ? (
            <EmptyState
              variant="default"
              title={t.noSelectedOrder}
              description={t.selectOrderDesc}
              icon={<PackageOpen className="size-12 text-primary" />}
            />
          ) : (
            <Card className="border-border/60 bg-card/65 glass-effect overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold text-foreground">
                      {selectedOrder.poNumber} — {selectedOrder.vendorName}
                    </CardTitle>
                    <CardDescription>
                      {t.totalLines}: {selectedOrder.items.length} · {selectedOrder.date}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={selectedOrder.status === "received" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {selectedOrder.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>

              {/* Items Verification Table */}
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="w-[100px]">{t.tableSku}</TableHead>
                        <TableHead>{t.tableItem}</TableHead>
                        <TableHead className="w-[80px] text-center">{t.tableOrdered}</TableHead>
                        <TableHead className="w-[120px] text-center">{t.tableReceived}</TableHead>
                        <TableHead className="w-[100px] text-right">{t.tableCost}</TableHead>
                        <TableHead className="w-[120px] text-right">{t.tableStatus}</TableHead>
                        <TableHead className="w-[120px] text-right">{t.tableImpact}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item) => {
                        const hasDiff = item.ordered !== item.received;
                        return (
                          <TableRow 
                            key={item.sku}
                            className={`transition-colors ${hasDiff ? "bg-amber-500/5 hover:bg-amber-500/10" : "hover:bg-muted/10"}`}
                          >
                            <TableCell className="font-mono text-xs font-semibold text-foreground">{item.sku}</TableCell>
                            <TableCell className="font-medium text-foreground">{item.item}</TableCell>
                            <TableCell className="text-center font-semibold">{item.ordered}</TableCell>
                            <TableCell className="p-2">
                              <div className="flex items-center justify-center">
                                <Input
                                  type="number"
                                  min="0"
                                  value={item.received}
                                  onChange={(e) => handleQtyChange(item.sku, e.target.value)}
                                  className={`h-8 w-20 text-center font-bold border ${
                                    hasDiff 
                                      ? "border-amber-500/60 bg-amber-500/10 text-amber-600 dark:text-amber-400" 
                                      : "border-border/70"
                                  }`}
                                />
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-xs">
                              {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(item.unitPrice)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge 
                                variant={hasDiff ? "outline" : "secondary"}
                                className={`text-[10px] ${
                                  hasDiff 
                                    ? "text-amber-500 border-amber-500 bg-amber-500/5" 
                                    : "text-emerald-500 border-emerald-500 bg-emerald-500/5"
                                }`}
                              >
                                {hasDiff ? t.linePartial : t.lineCompleted}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono text-[10px] text-muted-foreground">
                              {hasDiff ? `+${item.received} stock` : item.impact}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>

              {/* Warnings and Discrepancies details */}
              {discrepancies.length > 0 && (
                <div className="p-4 border-t border-border/30 bg-amber-500/5 space-y-2">
                  <div className="flex items-start gap-2.5 text-xs text-amber-600 dark:text-amber-400 leading-normal font-medium">
                    <AlertTriangle className="size-4.5 shrink-0 mt-0.5 text-amber-500" />
                    <div className="space-y-1.5 flex-1">
                      {discrepancies.map((d) => (
                        <p key={d.sku}>
                          {t.diffWarning
                            .replace("{ordered}", d.ordered.toString())
                            .replace("{name}", d.item)
                            .replace("{received}", d.received.toString())}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Right Column: Inventory Impact Preview & Verification Actions */}
        <aside className="space-y-4 xl:sticky xl:top-6">
          <Card className="border-border/60 bg-card/65 glass-effect shadow-md">
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg font-semibold tracking-tight flex items-center gap-1.5">
                <Warehouse className="size-5 text-primary" />
                {t.stockImpactTitle}
              </CardTitle>
              <CardDescription>{t.stockImpactDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Warehouse stock allocations */}
              <div className="space-y-2.5">
                {stockImpact.map((item) => (
                  <div 
                    key={item.label}
                    className="flex items-center justify-between rounded-xl border border-border/50 bg-background/40 px-4 py-3 text-xs transition-all duration-200 hover:bg-background/80"
                  >
                    <span className="text-muted-foreground font-medium">{item.label}</span>
                    <span className="font-bold text-primary">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Informative notice */}
              <div className="rounded-xl border border-border/40 bg-background/30 p-3 flex gap-2 text-[11px] text-muted-foreground leading-normal">
                <Info className="size-4 shrink-0 mt-0.5 text-primary/70" />
                <p>Las cantidades verificadas afectarán inmediatamente el stock consolidado del ERP al procesar la entrada física.</p>
              </div>

              {/* Trigger actions */}
              {selectedOrder && (
                <div className="space-y-2 pt-2 border-t border-border/30">
                  <Button 
                    className="w-full text-xs font-semibold cursor-pointer"
                    onClick={handleRegisterReceipt}
                  >
                    <CheckCircle2 className="mr-2 size-4" />
                    {t.btnRegister}
                  </Button>
                  
                  {discrepancies.length > 0 && (
                    <Button 
                      variant="outline"
                      className="w-full text-xs font-semibold border-amber-500/50 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 cursor-pointer"
                      onClick={() => toast.info("Generando nota de crédito/incidencia para tesorería...")}
                    >
                      <AlertTriangle className="mr-2 size-4" />
                      {t.btnReconcile}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
