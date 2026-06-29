"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  Store,
  Clock,
  Search,
  Trash2,
  Plus,
  Minus,
  User,
  Banknote,
  CreditCard,
  ArrowRightLeft,
  Printer,
  X,
  AlertCircle,
  CheckCircle2,
  ShoppingBag,
  Inbox,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type Register = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  sku: string;
  name: string;
  categoryName: string;
  price: number;
  taxRate: number;
  stock: number;
};

type Member = {
  id: string;
  name: string;
  email: string;
};

type CartItem = {
  product: Product;
  quantity: number;
};

type ActiveSession = {
  id: string;
  branchId?: string;
  registerName: string;
  openingAmount: number;
  openedAt: string;
} | null;

const posLabels = {
  es: {
    title: "Punto de Venta",
    openSessionTitle: "Apertura de Caja",
    openSessionDesc: "Para comenzar a realizar ventas, debes abrir una sesión de caja.",
    selectRegister: "Seleccionar Caja Registradora",
    openingAmount: "Monto Inicial en Caja (MXN)",
    openSessionButton: "Abrir Sesión de Caja",
    activeSession: "Caja Activa",
    closeSessionButton: "Cerrar Caja",
    searchPlaceholder: "Buscar producto por nombre o SKU...",
    categoryAll: "Todos",
    addToCart: "Agregar",
    cartTitle: "Carrito de Compras",
    cartEmpty: "El carrito de compras está vacío.",
    clientCasual: "Público General (Sin Miembro)",
    selectClient: "Seleccionar Miembro (Opcional)",
    paymentMethod: "Método de Pago",
    cash: "Efectivo",
    card: "Tarjeta",
    transfer: "Transferencia",
    subtotal: "Subtotal (Antes de IVA)",
    tax: "Impuesto (16% IVA)",
    total: "Total a Pagar",
    checkoutButton: "Cobrar e Imprimir Ticket",
    checkoutSuccess: "Venta registrada con éxito.",
    receiptTitle: "Recibo de Venta",
    receiptNumber: "Folio",
    closeReceipt: "Cerrar Recibo",
    printReceipt: "Imprimir Ticket",
    outOfStock: "Stock insuficiente.",
    inStock: "En stock",
    lowStock: "Bajo stock",
    noStock: "Agotado",
    registerNameLabel: "Caja",
    openedAtLabel: "Abierta el",
    closeSessionTitle: "Cierre de Caja",
    closeSessionDesc: "Ingresa el monto final reportado en el arqueo de caja.",
    closingAmount: "Monto de Arqueo Final (MXN)",
    closeSessionSubmit: "Confirmar Arqueo y Cerrar",
    cancel: "Cancelar",
    productsHeader: "Productos de Catálogo",
    cartSummaryHeader: "Resumen de Cobro",
    quantity: "Cant",
    itemCount: "Artículos",
    searchButton: "Buscar",
    clearCart: "Vaciar Carrito",
    noProductsFound: "No se encontraron productos en esta categoría o búsqueda.",
    cashReceivedLabel: "Efectivo Recibido (MXN)",
    changeLabel: "Cambio a entregar",
    exactAmount: "Exacto",
    cardCommissionLabel: "Comisión Terminal (3.5%)",
    cardCommissionAbsorbed: "Absorbida por el Club",
    insufficientAmount: "Efectivo insuficiente",
  },
  en: {
    title: "Point of Sale",
    openSessionTitle: "Open Cash Register",
    openSessionDesc: "To start selling, you must open a cash session.",
    selectRegister: "Select Cash Register",
    openingAmount: "Opening Cash Amount (MXN)",
    openSessionButton: "Open Cash Session",
    activeSession: "Active Register",
    closeSessionButton: "Close Session",
    searchPlaceholder: "Search product by name or SKU...",
    categoryAll: "All",
    addToCart: "Add",
    cartTitle: "Shopping Cart",
    cartEmpty: "Shopping cart is currently empty.",
    clientCasual: "General Public (No Member)",
    selectClient: "Select Member (Optional)",
    paymentMethod: "Payment Method",
    cash: "Cash",
    card: "Card",
    transfer: "Transfer",
    subtotal: "Subtotal (Before VAT)",
    tax: "Tax (16% VAT)",
    total: "Total to Pay",
    checkoutButton: "Process and Print Ticket",
    checkoutSuccess: "Sale registered successfully.",
    receiptTitle: "Sales Receipt",
    receiptNumber: "Folio",
    closeReceipt: "Close Receipt",
    printReceipt: "Print Ticket",
    outOfStock: "Insufficient stock.",
    inStock: "In stock",
    lowStock: "Low stock",
    noStock: "Out of stock",
    registerNameLabel: "Register",
    openedAtLabel: "Opened on",
    closeSessionTitle: "Close Cash Register",
    closeSessionDesc: "Enter the final cash count amount from the register.",
    closingAmount: "Final Count Amount (MXN)",
    closeSessionSubmit: "Confirm Count and Close",
    cancel: "Cancel",
    productsHeader: "Catalog Products",
    cartSummaryHeader: "Checkout Summary",
    quantity: "Qty",
    itemCount: "Items",
    searchButton: "Search",
    clearCart: "Clear Cart",
    noProductsFound: "No products found matching your search or category.",
    cashReceivedLabel: "Cash Received (MXN)",
    changeLabel: "Change to return",
    exactAmount: "Exact",
    cardCommissionLabel: "Terminal Fee (3.5%)",
    cardCommissionAbsorbed: "Absorbed by the Club",
    insufficientAmount: "Insufficient cash",
  },
  fr: {
    title: "Point de Vente",
    openSessionTitle: "Ouverture de Caisse",
    openSessionDesc: "Pour commencer à vendre, vous devez ouvrir une session de caisse.",
    selectRegister: "Sélectionner la Caisse",
    openingAmount: "Montant d'Ouverture (MXN)",
    openSessionButton: "Ouvrir la Session",
    activeSession: "Caisse Active",
    closeSessionButton: "Fermer la Session",
    searchPlaceholder: "Rechercher un produit par nom ou SKU...",
    categoryAll: "Tout",
    addToCart: "Ajouter",
    cartTitle: "Panier d'Achat",
    cartEmpty: "Le panier d'achat est vide.",
    clientCasual: "Grand Public (Aucun Membre)",
    selectClient: "Sélectionner un Membre (Optionnel)",
    paymentMethod: "Mode de Paiement",
    cash: "Espèces",
    card: "Carte",
    transfer: "Virement",
    subtotal: "Sous-total (Hors TVA)",
    tax: "Taxe (16% TVA)",
    total: "Total à Payer",
    checkoutButton: "Encaisser et Imprimer",
    checkoutSuccess: "Vente enregistrée avec succès.",
    receiptTitle: "Reçu de Vente",
    receiptNumber: "Folio",
    closeReceipt: "Fermer le Reçu",
    printReceipt: "Imprimer le Ticket",
    outOfStock: "Stock insuffisant.",
    inStock: "En stock",
    lowStock: "Stock bas",
    noStock: "Épuisé",
    registerNameLabel: "Caisse",
    openedAtLabel: "Ouvert le",
    closeSessionTitle: "Clôture de Caisse",
    closeSessionDesc: "Saisissez le montant final lors du comptage de la caisse.",
    closingAmount: "Montant de Fermeture (MXN)",
    closeSessionSubmit: "Confirmer et Fermer",
    cancel: "Annuler",
    productsHeader: "Produits du Catalogue",
    cartSummaryHeader: "Résumé de Caisse",
    quantity: "Qté",
    itemCount: "Articles",
    searchButton: "Chercher",
    clearCart: "Vider le Panier",
    noProductsFound: "Aucun produit trouvé dans cette catégorie.",
    cashReceivedLabel: "Espèces reçues (MXN)",
    changeLabel: "Rendu de monnaie",
    exactAmount: "Exact",
    cardCommissionLabel: "Frais de Terminal (3.5%)",
    cardCommissionAbsorbed: "Absorbé par le Club",
    insufficientAmount: "Espèces insuffisantes",
  }
};

export function PosClient({
  locale,
  initialActiveSession,
  registers,
  products,
  members,
}: {
  locale: Locale;
  initialActiveSession: ActiveSession;
  registers: Register[];
  products: Product[];
  members: Member[];
}) {
  const t = posLabels[locale] ?? posLabels.es;
  const router = useRouter();

  // Active Session State
  const [activeSession, setActiveSession] = useState<ActiveSession>(initialActiveSession);
  const [openSessionForm, setOpenSessionForm] = useState({
    registerId: registers[0]?.id ?? "",
    openingAmount: "1500",
  });
  const [isOpeningSession, setIsOpeningSession] = useState(false);

  // Close Session Modal State
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closingAmount, setClosingAmount] = useState("");
  const [isClosingSession, setIsClosingSession] = useState(false);

  // Catalog / Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "TRANSFER">("CASH");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Cash Received Input State (Operational cash change calculation)
  const [cashReceived, setCashReceived] = useState<string>("");

  // Successful Sale Receipt State (augmented with cash change calculations & terminal fee)
  const [lastSaleReceipt, setLastSaleReceipt] = useState<{
    id: string;
    total: number;
    subtotal: number;
    tax: number;
    paidAt: string;
    paymentMethod: "CASH" | "CARD" | "TRANSFER";
    cashReceived: number | null;
    cashChange: number | null;
    cardCommission: number | null;
    items: { productName: string; qty: number; price: number; total: number }[];
  } | null>(null);

  // Unique Categories computed from product list
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.categoryName));
    return ["All", ...Array.from(cats)];
  }, [products]);

  // Filtered Products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || p.categoryName === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Totals computed from cart state
  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cart]);

  const cartTax = useMemo(() => {
    return cart.reduce((acc, item) => {
      return acc + item.product.price * item.quantity * (item.product.taxRate / 100);
    }, 0);
  }, [cart]);

  const cartTotal = useMemo(() => {
    return cartSubtotal + cartTax;
  }, [cartSubtotal, cartTax]);

  // Operational Cash Change computation
  const cashChange = useMemo(() => {
    const received = parseFloat(cashReceived);
    if (isNaN(received) || received < cartTotal) return 0;
    return received - cartTotal;
  }, [cashReceived, cartTotal]);

  // Credit Card Terminal Fee computation (3.5% fee absorbed by the gym)
  const cardCommission = useMemo(() => {
    if (paymentMethod !== "CARD") return 0;
    return cartTotal * 0.035;
  }, [paymentMethod, cartTotal]);

  // Add Item to Cart
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error(t.noStock);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error(`${t.outOfStock} (Stock: ${product.stock})`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  // Change Quantity in Cart
  const updateQuantity = (productId: string, qty: number) => {
    const parsedQty = Math.max(0, qty);
    const product = products.find((p) => p.id === productId);

    if (!product) return;

    if (parsedQty === 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }

    if (parsedQty > product.stock) {
      toast.error(`${t.outOfStock} (Stock: ${product.stock})`);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: parsedQty } : item
      )
    );
  };

  // Format Currency
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat(locale === "es" ? "es-MX" : "en-US", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  // Open Register Session Handler
  const handleOpenSession = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsOpeningSession(true);
    try {
      const res = await fetch("/api/pos/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registerId: openSessionForm.registerId || undefined,
          openingAmount: parseFloat(openSessionForm.openingAmount) || 0,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error al abrir la caja");

      setActiveSession({
        id: result.data.id,
        branchId: result.data.register.branchId,
        registerName: result.data.register.name,
        openingAmount: parseFloat(result.data.openingAmount),
        openedAt: result.data.openedAt,
      });
      toast.success(t.openSessionButton);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsOpeningSession(false);
    }
  };

  // Close Register Session Handler
  const handleCloseSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;

    setIsClosingSession(true);
    try {
      const res = await fetch("/api/pos/sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cashSessionId: activeSession.id,
          closingAmount: parseFloat(closingAmount) || 0,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error al cerrar la caja");

      setActiveSession(null);
      setShowCloseModal(false);
      setClosingAmount("");
      setCart([]);
      toast.success(t.closeSessionTitle);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsClosingSession(false);
    }
  };

  // Sale Checkout Handler (with cash amount validation)
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error(t.cartEmpty);
      return;
    }
    if (!activeSession) {
      toast.error(t.openSessionDesc);
      return;
    }

    if (paymentMethod === "CASH") {
      const received = parseFloat(cashReceived);
      if (isNaN(received) || received < cartTotal) {
        toast.error(t.insufficientAmount);
        return;
      }
    }

    setIsCheckingOut(true);
    try {
      const res = await fetch("/api/pos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cashSessionId: activeSession.id,
          memberId: selectedMemberId || undefined,
          paymentMethod,
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.product.price,
          })),
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || result.message || "Error en checkout");

      toast.success(t.checkoutSuccess);

      // Create Receipt Details
      setLastSaleReceipt({
        id: result.data.id,
        total: result.data.total,
        subtotal: result.data.subtotal,
        tax: result.data.tax,
        paidAt: result.data.paidAt,
        paymentMethod,
        cashReceived: paymentMethod === "CASH" ? parseFloat(cashReceived) : null,
        cashChange: paymentMethod === "CASH" ? cashChange : null,
        cardCommission: paymentMethod === "CARD" ? cardCommission : null,
        items: cart.map((c) => ({
          productName: c.product.name,
          qty: c.quantity,
          price: c.product.price,
          total: c.quantity * c.product.price,
        })),
      });

      setCart([]);
      setSelectedMemberId("");
      setCashReceived("");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Ocurrió un error al procesar el cobro.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Render open register screen if session is inactive
  if (!activeSession) {
    return (
      <div className="min-h-[calc(100vh-64px)] p-4 sm:p-6 bg-background/30 flex items-center justify-center">
        <div className="glass-panel-strong w-full max-w-md p-6 sm:p-8 rounded-xl border border-border shadow-2xl transition-all duration-300">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto size-14 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse">
                <Store className="size-7" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{t.openSessionTitle}</h1>
              <p className="text-sm text-muted-foreground dark:text-slate-300">{t.openSessionDesc}</p>
            </div>

            <form onSubmit={handleOpenSession} className="space-y-4 pt-2">
              <div className="grid gap-2">
                <label className="text-xs font-semibold text-muted-foreground dark:text-slate-300 uppercase tracking-wider" htmlFor="register-select">
                  {t.selectRegister}
                </label>
                <select
                  id="register-select"
                  className="glass-control w-full px-3.5 py-2.5 rounded-lg border text-sm text-foreground bg-card"
                  value={openSessionForm.registerId}
                  onChange={(e) =>
                    setOpenSessionForm((prev) => ({ ...prev, registerId: e.target.value }))
                  }
                >
                  {registers.length === 0 ? (
                    <option value="" className="text-foreground bg-background">
                      Caja Principal - Generada
                    </option>
                  ) : (
                    registers.map((r) => (
                      <option key={r.id} value={r.id} className="text-foreground bg-background">
                        {r.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-semibold text-muted-foreground dark:text-slate-300 uppercase tracking-wider" htmlFor="opening-amount">
                  {t.openingAmount}
                </label>
                <Input
                  id="opening-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:text-white"
                  value={openSessionForm.openingAmount}
                  onChange={(e) =>
                    setOpenSessionForm((prev) => ({ ...prev, openingAmount: e.target.value }))
                  }
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isOpeningSession}
                className="w-full py-6 rounded-lg bg-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/90 text-white font-bold text-sm transition-all duration-200 shadow-lg hover:shadow-primary/20 cursor-pointer disabled:opacity-50"
              >
                {isOpeningSession ? "..." : t.openSessionButton}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- Cart Panel UI Fragment (Re-used for both Desktop Right panel and Mobile Sheet) ---
  const CartContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header (Static top) */}
      <div className="flex items-center justify-between border-b border-border pb-3 mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingBag className="size-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">{t.cartTitle}</h2>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-2 py-0.5 text-xs font-semibold text-muted-foreground dark:text-slate-300 border-border bg-muted/40">
            {cart.length} {t.itemCount}
          </Badge>
          {cart.length > 0 && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setCart([])}
              className="text-destructive hover:bg-destructive/10 text-xs font-semibold gap-1 cursor-pointer"
            >
              <Trash2 className="size-3.5" />
              {t.clearCart}
            </Button>
          )}
        </div>
      </div>

      {/* Mid body (Scrollable) */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 select-none min-h-0">
        {/* Cart List */}
        <div>
          {cart.length === 0 ? (
            <div className="min-h-[120px] flex flex-col items-center justify-center text-muted-foreground p-6 text-center space-y-2">
              <div className="size-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground">
                <ShoppingBag className="size-5" />
              </div>
              <p className="text-sm font-medium text-muted-foreground dark:text-slate-300">{t.cartEmpty}</p>
            </div>
          ) : (
            <ul className="divide-y divide-border/40">
              {cart.map((item) => (
                <li key={item.product.id} className="py-3 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-right-1 duration-200">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-foreground">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground dark:text-slate-400 font-medium mt-0.5">
                      {formatMoney(item.product.price)} c/u
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold text-foreground min-w-[70px] text-right">
                      {formatMoney(item.product.price * item.quantity)}
                    </span>
                    
                    {/* Quantity controls */}
                    <div className="flex items-center border border-border bg-muted/20 rounded-lg overflow-hidden shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="size-7 hover:bg-muted font-bold transition-colors cursor-pointer"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-8 text-center text-xs font-bold text-foreground">
                        {item.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="size-7 hover:bg-muted font-bold transition-colors cursor-pointer"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Checkout Config Panel */}
        <div className="border-t border-border/60 pt-4 space-y-4">
          {/* Member Selector */}
          <div className="grid gap-1.5">
            <label htmlFor="member-select" className="text-xs font-bold text-muted-foreground dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <User className="size-3.5 text-muted-foreground dark:text-slate-300" />
              {t.selectClient}
            </label>
            <select
              id="member-select"
              className="glass-control w-full px-3 py-2 rounded-lg border text-xs text-foreground bg-card"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
            >
              <option value="" className="text-foreground bg-background">{t.clientCasual}</option>
              {members.map((m) => (
                <option key={m.id} value={m.id} className="text-foreground bg-background">
                  {m.name} ({m.email || "Sin correo"})
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Selector */}
          <div className="grid gap-2">
            <span className="text-xs font-bold text-muted-foreground dark:text-slate-300 uppercase tracking-wider">{t.paymentMethod}</span>
            <div className="grid grid-cols-3 gap-2">
              {(["CASH", "CARD", "TRANSFER"] as const).map((method) => {
                const methodInfo = {
                  CASH: { label: t.cash, icon: Banknote },
                  CARD: { label: t.card, icon: CreditCard },
                  TRANSFER: { label: t.transfer, icon: ArrowRightLeft },
                };
                const Info = methodInfo[method];
                const Icon = Info.icon;
                const isSelected = paymentMethod === method;

                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={cn(
                      "flex flex-col items-center justify-center py-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer gap-1 select-none",
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground shadow-md scale-[1.03]"
                        : "glass-control hover:bg-[var(--sidebar-accent-hover)] hover:text-foreground"
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span>{Info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash payment specific fields: amount received and change */}
          {paymentMethod === "CASH" && cartTotal > 0 && (
            <div className="grid gap-3 p-3 bg-muted/40 dark:bg-muted/10 border border-border/50 rounded-lg animate-in slide-in-from-top-2 duration-200">
              <div className="grid gap-1.5">
                <label htmlFor="cash-received" className="text-xs font-bold text-muted-foreground dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Banknote className="size-3.5 text-primary" />
                  {t.cashReceivedLabel}
                </label>
                <div className="flex gap-2">
                  <Input
                    id="cash-received"
                    type="number"
                    step="1"
                    min={cartTotal}
                    placeholder="0.00"
                    className="glass-control text-sm font-semibold h-9 shrink-0 flex-1"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 font-bold text-xs text-foreground cursor-pointer"
                    onClick={() => setCashReceived(Math.ceil(cartTotal).toString())}
                  >
                    {t.exactAmount}
                  </Button>
                </div>
              </div>

              {/* Quick cash shortcut buttons */}
              <div className="flex flex-wrap gap-1.5">
                {[50, 100, 200, 500, 1000].map((amount) => {
                  if (amount < cartTotal && amount * 2 < cartTotal) return null;
                  return (
                    <Button
                      key={amount}
                      type="button"
                      variant="ghost"
                      size="xs"
                      className="px-2 py-1 text-[10px] font-bold border border-border/40 hover:bg-muted cursor-pointer text-foreground"
                      onClick={() => setCashReceived(amount.toString())}
                    >
                      ${amount}
                    </Button>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-1.5 border-t border-border/40 font-mono text-xs">
                <span className="font-bold text-muted-foreground dark:text-slate-300 uppercase tracking-wider">{t.changeLabel}:</span>
                {parseFloat(cashReceived) >= cartTotal ? (
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatMoney(cashChange)}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {t.insufficientAmount}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calculations and Checkout button (Static bottom) */}
      <div className="border-t border-border pt-3 mt-3 space-y-2.5 shrink-0">
        <div className="flex justify-between text-xs text-muted-foreground dark:text-slate-300 font-medium">
          <span>{t.subtotal}</span>
          <span>{formatMoney(cartSubtotal)}</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground dark:text-slate-300 font-medium">
          <span>{t.tax}</span>
          <span>{formatMoney(cartTax)}</span>
        </div>

        {/* Credit Card Terminal Fee (absorbed by gym) */}
        {paymentMethod === "CARD" && cartTotal > 0 && (
          <div className="flex justify-between text-xs text-muted-foreground dark:text-slate-400 font-medium italic animate-in fade-in">
            <span className="flex items-center gap-1">
              {t.cardCommissionLabel}
              <span className="text-[9px] px-1 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold font-sans tracking-wide">
                {t.cardCommissionAbsorbed}
              </span>
            </span>
            <span>{formatMoney(cardCommission)}</span>
          </div>
        )}

        <div className="flex justify-between text-base font-bold text-foreground border-t border-dashed border-border/80 pt-2 flex-wrap items-center">
          <span>{t.total}</span>
          <span className="text-base sm:text-lg text-primary font-extrabold">{formatMoney(cartTotal)}</span>
        </div>

        <Button
          type="button"
          onClick={handleCheckout}
          disabled={isCheckingOut || cart.length === 0 || (paymentMethod === "CASH" && (parseFloat(cashReceived) < cartTotal || isNaN(parseFloat(cashReceived))))}
          className="w-full mt-1.5 py-5 sm:py-6 rounded-lg bg-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/90 text-white font-bold text-sm sm:text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-primary/20 cursor-pointer"
        >
          {isCheckingOut ? "..." : t.checkoutButton}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-64px)] p-4 sm:p-6 bg-background flex flex-col text-sm relative overflow-hidden">
      {/* Header bar */}
      <header className="w-full flex items-center justify-between gap-4 p-4 glass-panel rounded-xl border border-border/60 mb-6 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary animate-in zoom-in-50 duration-300">
            <Store className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-foreground">{t.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-muted-foreground dark:text-slate-300">
                {t.activeSession}: <span className="text-foreground font-medium">{activeSession.registerName}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground dark:text-slate-300 font-medium bg-muted/40 border border-border/40 px-3 py-1.5 rounded-lg">
            <Clock className="size-3.5 text-muted-foreground dark:text-slate-350" />
            <span>
              {t.openedAtLabel}: {new Date(activeSession.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <Button
            onClick={() => setShowCloseModal(true)}
            variant="outline"
            className="border-destructive/30 hover:bg-destructive/10 text-destructive dark:text-red-400 font-bold text-xs px-4 rounded-lg cursor-pointer"
          >
            {t.closeSessionButton}
          </Button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 overflow-hidden">
        {/* Left Side: Product catalog lookup & filters */}
        <section className="col-span-12 lg:col-span-7 xl:col-span-8 flex flex-col gap-4 min-h-0 overflow-hidden">
          <div className="glass-panel p-4 rounded-xl border border-border/60 flex flex-col gap-4 shrink-0 shadow-sm">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t.searchPlaceholder}
                className="flex-1 glass-control pl-10 pr-4 py-5 rounded-lg border focus:ring-2 focus:ring-ring text-sm text-foreground bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar select-none scroll-smooth">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer whitespace-nowrap shadow-xs",
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground scale-[1.03] shadow-md"
                        : "glass-control hover:bg-[var(--sidebar-accent-hover)] hover:text-foreground"
                    )}
                  >
                    {cat === "All" ? t.categoryAll : cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid list of products (Scrollable) */}
          <div className="flex-1 overflow-y-auto pr-1 pb-16 lg:pb-0 min-h-0">
            {filteredProducts.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground p-8 text-center space-y-3 animate-in fade-in duration-300">
                <div className="size-12 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground">
                  <Inbox className="size-6" />
                </div>
                <p className="text-sm font-medium text-muted-foreground dark:text-slate-350 max-w-xs">{t.noProductsFound}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => {
                  const outOfStock = product.stock <= 0;
                  const lowStock = product.stock > 0 && product.stock <= 5;

                  return (
                    <div
                      role="button"
                      tabIndex={0}
                      key={product.id}
                      onClick={() => !outOfStock && addToCart(product)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          !outOfStock && addToCart(product);
                        }
                      }}
                      className={cn(
                        "group glass-panel flex flex-col justify-between p-4 rounded-xl border border-border/60 cursor-pointer transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-ring hover:-translate-y-0.5 hover:shadow-lg",
                        outOfStock
                          ? "opacity-40 cursor-not-allowed hover:border-border hover:translate-y-0 hover:shadow-xs"
                          : "hover:border-primary/45"
                      )}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground dark:text-slate-400 font-mono truncate max-w-[70%]">
                            {product.categoryName}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[9px] font-bold px-1.5 py-0 rounded-md uppercase tracking-wide border-transparent shrink-0",
                              outOfStock && "bg-destructive/10 text-destructive border-destructive/10",
                              lowStock && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/10",
                              !outOfStock && !lowStock && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10"
                            )}
                          >
                            {outOfStock ? t.noStock : lowStock ? `${t.lowStock}: ${product.stock}` : `${t.inStock}: ${product.stock}`}
                          </Badge>
                        </div>
                        <h3 className="text-sm font-semibold text-foreground line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-[11px] text-muted-foreground dark:text-slate-450 font-mono">SKU: {product.sku}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/45 flex items-center justify-between shrink-0">
                        <p className="text-base font-extrabold text-foreground">
                          {formatMoney(product.price)}
                        </p>

                        <div
                          className={cn(
                            "size-8 rounded-lg flex items-center justify-center text-lg font-bold transition-all duration-200 shadow-xs",
                            outOfStock
                              ? "bg-muted text-muted-foreground"
                              : "bg-primary text-primary-foreground group-hover:scale-110 shadow-primary/10 group-hover:shadow-md"
                          )}
                        >
                          <Plus className="size-4" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Right Side: Sales Cart and Checkout panels (Visible ONLY on LG screens) */}
        <section className="hidden lg:flex lg:col-span-5 xl:col-span-4 flex-col gap-4 min-h-0 overflow-hidden">
          <aside className="glass-panel flex flex-col p-5 rounded-xl border border-border/60 h-full overflow-hidden shadow-md">
            <CartContent />
          </aside>
        </section>
      </div>

      {/* --- Mobile Float Cart FAB Button (Visible ONLY on Mobile/Tablet) --- */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <Sheet>
          <SheetTrigger
            render={
              <Button
                className="size-14 rounded-full bg-primary hover:bg-primary/95 text-primary-foreground shadow-2xl flex items-center justify-center cursor-pointer border border-primary/20 relative"
                size="icon"
              />
            }
          >
            <ShoppingBag className="size-6 animate-in zoom-in duration-300" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 size-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background animate-bounce">
                {cart.length}
              </span>
            )}
          </SheetTrigger>
          <SheetContent side="right" className="w-[90%] sm:max-w-md p-5 border-l border-border bg-popover/95 backdrop-blur-md">
            <SheetHeader className="p-0 mb-2">
              <SheetTitle className="sr-only">{t.cartTitle}</SheetTitle>
            </SheetHeader>
            <div className="h-full mt-4">
              <CartContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Dialog: Close Register Form (shadcn/ui Dialog) */}
      <Dialog open={showCloseModal} onOpenChange={setShowCloseModal}>
        <DialogContent className="glass-panel-strong max-w-md border border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">{t.closeSessionTitle}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground dark:text-slate-350">
              {t.closeSessionDesc}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCloseSession} className="space-y-4 pt-2">
            <div className="grid gap-2">
              <label className="text-xs font-semibold text-muted-foreground dark:text-slate-300 uppercase tracking-wider" htmlFor="closing-amount">
                {t.closingAmount}
              </label>
              <Input
                id="closing-amount"
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:text-white"
                value={closingAmount}
                onChange={(e) => setClosingAmount(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCloseModal(false)}
                className="font-semibold text-xs py-5 rounded-lg cursor-pointer text-foreground"
              >
                {t.cancel}
              </Button>
              <Button
                type="submit"
                disabled={isClosingSession}
                className="font-bold text-xs py-5 px-5 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg cursor-pointer"
              >
                {isClosingSession ? "..." : t.closeSessionSubmit}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Sales Receipt Dialog (shadcn/ui Dialog) */}
      <Dialog open={!!lastSaleReceipt} onOpenChange={(open) => !open && setLastSaleReceipt(null)}>
        <DialogContent className="glass-panel-strong max-w-sm border border-border shadow-2xl p-0 overflow-hidden select-none">
          {/* Simulated Physical Ticket Wrapper */}
          <div className="relative bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-6 flex flex-col font-sans">
            {/* Cut-line top decoration */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-b from-zinc-300 dark:from-zinc-800 to-transparent opacity-50" />
            
            <div className="text-center border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-4 mt-2">
              <div className="mx-auto size-11 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
                <CheckCircle2 className="size-6" />
              </div>
              <h2 className="text-base font-extrabold uppercase tracking-wide">{t.receiptTitle}</h2>
              <p className="text-[10px] text-zinc-500 font-mono mt-1">
                {t.receiptNumber}: <span className="font-bold text-zinc-700 dark:text-zinc-300">{lastSaleReceipt?.id.slice(0, 10).toUpperCase()}</span>
              </p>
              <p className="text-[9px] text-zinc-400 font-mono mt-0.5">
                {lastSaleReceipt && new Date(lastSaleReceipt.paidAt).toLocaleString()}
              </p>
            </div>

            {/* Item list */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1 font-mono text-[11px] mb-4">
              {lastSaleReceipt?.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-zinc-800 dark:text-zinc-200 truncate">{item.productName}</p>
                    <p className="text-[9px] text-zinc-400 font-medium">
                      {item.qty} x {formatMoney(item.price)}
                    </p>
                  </div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 shrink-0">{formatMoney(item.total)}</span>
                </div>
              ))}
            </div>

            {/* Calculation details */}
            <div className="border-t border-dashed border-zinc-300 dark:border-zinc-700 pt-3 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-zinc-500">
                <span>{t.subtotal}</span>
                <span>{lastSaleReceipt && formatMoney(lastSaleReceipt.subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>{t.tax}</span>
                <span>{lastSaleReceipt && formatMoney(lastSaleReceipt.tax)}</span>
              </div>

              {/* Cash change details in receipt */}
              {lastSaleReceipt?.paymentMethod === "CASH" && lastSaleReceipt.cashReceived !== null && (
                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-1.5 space-y-1 text-zinc-500 animate-in fade-in">
                  <div className="flex justify-between">
                    <span>{t.cashReceivedLabel}:</span>
                    <span>{formatMoney(lastSaleReceipt.cashReceived)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-zinc-800 dark:text-zinc-200">
                    <span>{t.changeLabel}:</span>
                    <span>{formatMoney(lastSaleReceipt.cashChange ?? 0)}</span>
                  </div>
                </div>
              )}

              {/* Credit Card Fee Details in receipt (informative) */}
              {lastSaleReceipt?.paymentMethod === "CARD" && lastSaleReceipt.cardCommission !== null && (
                <div className="flex justify-between text-zinc-400 italic text-[10px] animate-in fade-in">
                  <span>{t.cardCommissionLabel} ({t.cardCommissionAbsorbed}):</span>
                  <span>{formatMoney(lastSaleReceipt.cardCommission)}</span>
                </div>
              )}

              <div className="flex justify-between font-extrabold text-sm text-zinc-900 dark:text-zinc-50 border-t border-zinc-200 dark:border-zinc-800 pt-2.5 mt-2">
                <span>{t.total}</span>
                <span className="text-primary">{lastSaleReceipt && formatMoney(lastSaleReceipt.total)}</span>
              </div>
            </div>

            {/* Receipt actions (Not visible when printing) */}
            <div className="flex gap-2.5 border-t border-zinc-200 dark:border-zinc-800 pt-5 mt-5 print:hidden">
              <Button
                type="button"
                onClick={() => window.print()}
                className="flex-1 font-bold text-xs py-5 rounded-lg bg-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/90 text-white cursor-pointer gap-1.5 shadow-md"
              >
                <Printer className="size-3.5" />
                {t.printReceipt}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLastSaleReceipt(null)}
                className="flex-1 font-semibold text-xs py-5 rounded-lg border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer"
              >
                {t.closeReceipt}
              </Button>
            </div>

            {/* Cut-line bottom decoration */}
            <div className="absolute bottom-0 inset-x-0 h-1 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-zinc-300 dark:from-zinc-800 via-transparent to-transparent opacity-50" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
