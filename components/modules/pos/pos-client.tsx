"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

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
    cartEmpty: "El carrito está de compras vacío.",
    clientCasual: "Público General (Sin Miembro)",
    selectClient: "Seleccionar Miembro (Opcional)",
    paymentMethod: "Método de Pago",
    cash: "Efectivo",
    card: "Tarjeta",
    transfer: "Transferencia",
    subtotal: "Subtotal",
    tax: "Impuesto (16% IVA)",
    total: "Total",
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
    subtotal: "Subtotal",
    tax: "Tax (16% VAT)",
    total: "Total",
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
    subtotal: "Sous-total",
    tax: "Taxe (16% TVA)",
    total: "Total",
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

  // Successful Sale Receipt State
  const [lastSaleReceipt, setLastSaleReceipt] = useState<{
    id: string;
    total: number;
    subtotal: number;
    tax: number;
    paidAt: string;
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
    return cartSubtotal * 0.16; // 16% standard IVA
  }, [cartSubtotal]);

  const cartTotal = useMemo(() => {
    return cartSubtotal + cartTax;
  }, [cartSubtotal, cartTax]);

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
    if (!openSessionForm.registerId) return;

    setIsOpeningSession(true);
    try {
      const res = await fetch("/api/pos/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registerId: openSessionForm.registerId,
          openingAmount: parseFloat(openSessionForm.openingAmount) || 0,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error al abrir la caja");

      setActiveSession({
        id: result.data.id,
        registerName: result.data.register.name,
        openingAmount: parseFloat(result.data.openingAmount),
        openedAt: result.data.openedAt,
      });
      toast.success(t.openSessionButton);
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
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsClosingSession(false);
    }
  };

  // Sale Checkout Handler
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error(t.cartEmpty);
      return;
    }
    if (!activeSession) {
      toast.error(t.openSessionDesc);
      return;
    }

    setIsCheckingOut(true);
    try {
      const res = await fetch("/api/pos/sales", {
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
        items: cart.map((c) => ({
          productName: c.product.name,
          qty: c.quantity,
          price: c.product.price,
          total: c.quantity * c.product.price,
        })),
      });

      // Clear Cart
      setCart([]);
      setSelectedMemberId("");

      // Modifying products local stock state immediately to mirror db decrement without reloading
      cart.forEach((c) => {
        const prod = products.find((p) => p.id === c.product.id);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - c.quantity);
        }
      });
    } catch (error: any) {
      toast.error(error.message || "Ocurrió un error al procesar el cobro.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Render open register screen if session is inactive
  if (!activeSession) {
    return (
      <div className="min-h-[calc(100vh-64px)] p-6 bg-background flex items-center justify-center">
        <div className="glass-panel w-full max-w-md p-6 rounded-lg border border-border shadow-xl">
          <div className="space-y-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{t.openSessionTitle}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{t.openSessionDesc}</p>
            </div>

            <form onSubmit={handleOpenSession} className="space-y-4 pt-4">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium" htmlFor="register-select">
                  {t.selectRegister}
                </label>
                <select
                  id="register-select"
                  className="glass-control w-full px-3 py-2 rounded-md border text-sm"
                  value={openSessionForm.registerId}
                  onChange={(e) =>
                    setOpenSessionForm((prev) => ({ ...prev, registerId: e.target.value }))
                  }
                  required
                >
                  {registers.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-medium" htmlFor="opening-amount">
                  {t.openingAmount}
                </label>
                <input
                  id="opening-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  className="glass-control w-full px-3 py-2 rounded-md border text-sm"
                  value={openSessionForm.openingAmount}
                  onChange={(e) =>
                    setOpenSessionForm((prev) => ({ ...prev, openingAmount: e.target.value }))
                  }
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isOpeningSession || registers.length === 0}
                className="w-full py-2.5 rounded-md bg-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/90 text-white font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {isOpeningSession ? "..." : t.openSessionButton}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] p-6 bg-background flex flex-col text-sm relative">
      {/* Header bar */}
      <header className="w-full flex flex-wrap items-center justify-between gap-4 p-4 glass-panel rounded-lg border border-border mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-foreground">{t.title}</h1>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            {t.activeSession}: {activeSession.registerName}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {t.openedAtLabel}: {new Date(activeSession.openedAt).toLocaleTimeString()}
          </span>
          <button
            onClick={() => setShowCloseModal(true)}
            className="px-3 py-1.5 rounded-md bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-semibold border border-destructive/20 transition-colors"
          >
            {t.closeSessionButton}
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* Left Side: Product catalog lookup & filters */}
        <section className="col-span-12 lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
          <div className="glass-panel p-4 rounded-lg border border-border flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                className="flex-1 glass-control px-3 py-2 rounded-md border focus:ring-2 focus:ring-ring text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="px-4 py-2 rounded-md bg-[var(--brand-orange)] text-white text-sm font-semibold hover:bg-[var(--brand-orange)]/90 transition-colors">
                {t.searchButton}
              </button>
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium border transition-colors",
                    selectedCategory === cat
                      ? "bg-[var(--brand-orange)] border-[var(--brand-orange)] text-white"
                      : "glass-control hover:bg-[var(--sidebar-accent-hover)]"
                  )}
                >
                  {cat === "All" ? t.categoryAll : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid list of products */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto max-h-[56vh] pr-1">
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
                    "glass-panel flex flex-col justify-between p-3 rounded-lg border cursor-pointer hover:border-foreground/20 transition-all select-none focus:outline-none focus:ring-2 focus:ring-ring",
                    outOfStock && "opacity-50 cursor-not-allowed hover:border-border"
                  )}
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                      {product.categoryName}
                    </span>
                    <h3 className="text-sm font-medium text-foreground line-clamp-2 min-h-[40px]">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/50 flex items-end justify-between">
                    <div>
                      <p className="text-lg font-bold text-foreground">
                        {formatMoney(product.price)}
                      </p>
                      <span
                        className={cn(
                          "text-[10px] font-medium",
                          outOfStock && "text-destructive",
                          lowStock && "text-amber-600",
                          !outOfStock && !lowStock && "text-emerald-600"
                        )}
                      >
                        {outOfStock ? t.noStock : lowStock ? `${t.lowStock}: ${product.stock}` : `${t.inStock}: ${product.stock}`}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={outOfStock}
                      className="size-8 rounded-md bg-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/90 text-white flex items-center justify-center text-lg font-bold transition-colors disabled:bg-muted disabled:text-muted-foreground"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Side: Sales Cart and Checkout panels */}
        <section className="col-span-12 lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
          <aside className="glass-panel flex flex-col gap-4 p-4 rounded-lg border border-border h-full max-h-[70vh] min-h-[500px]">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-base font-bold text-foreground">{t.cartTitle}</h2>
              <span className="text-xs font-semibold text-muted-foreground">
                {cart.length} {t.itemCount}
              </span>
            </div>

            {/* Cart List */}
            <div className="flex-1 overflow-y-auto divide-y divide-border/60">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                  <p className="text-sm font-medium">{t.cartEmpty}</p>
                </div>
              ) : (
                <ul className="divide-y divide-border/50">
                  {cart.map((item) => (
                    <li key={item.product.id} className="py-3 flex gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-foreground">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatMoney(item.product.price)} x {item.quantity}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-border rounded overflow-hidden">
                          <button
                            type="button"
                            className="size-7 flex items-center justify-center hover:bg-muted font-bold transition-colors"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-medium">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="size-7 flex items-center justify-center hover:bg-muted font-bold transition-colors"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Checkout Config Panel */}
            <div className="border-t pt-4 space-y-3">
              {/* Member Selector */}
              <div className="grid gap-1.5">
                <label htmlFor="member-select" className="text-xs font-medium text-muted-foreground">
                  {t.selectClient}
                </label>
                <select
                  id="member-select"
                  className="glass-control w-full px-2.5 py-1.5 rounded-md border text-xs"
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                >
                  <option value="">{t.clientCasual}</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.email || "Sin correo"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method Selector */}
              <div className="grid gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">{t.paymentMethod}</span>
                <div className="grid grid-cols-3 gap-2">
                  {(["CASH", "CARD", "TRANSFER"] as const).map((method) => {
                    const methodLabels = { CASH: t.cash, CARD: t.card, TRANSFER: t.transfer };

                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={cn(
                          "py-2 rounded-md text-xs font-medium border text-center transition-all",
                          paymentMethod === method
                            ? "bg-[var(--brand-orange)] border-[var(--brand-orange)] text-white"
                            : "glass-control hover:bg-[var(--sidebar-accent-hover)]"
                        )}
                      >
                        {methodLabels[method]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Calculations and Checkout button */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t.subtotal}</span>
                <span>{formatMoney(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t.tax}</span>
                <span>{formatMoney(cartTax)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-foreground border-t border-dashed pt-2">
                <span>{t.total}</span>
                <span>{formatMoney(cartTotal)}</span>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={isCheckingOut || cart.length === 0}
                className="w-full mt-2 py-3 rounded-lg bg-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/90 text-white font-bold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isCheckingOut ? "..." : t.checkoutButton}
              </button>
            </div>
          </aside>
        </section>
      </div>

      {/* Modal: Close Register Form */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-lg border border-border shadow-2xl">
            <h2 className="text-lg font-bold text-foreground mb-1">{t.closeSessionTitle}</h2>
            <p className="text-xs text-muted-foreground mb-4">{t.closeSessionDesc}</p>

            <form onSubmit={handleCloseSession} className="space-y-4">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium" htmlFor="closing-amount">
                  {t.closingAmount}
                </label>
                <input
                  id="closing-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  className="glass-control w-full px-3 py-2 rounded-md border text-sm"
                  value={closingAmount}
                  onChange={(e) => setClosingAmount(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="px-4 py-2 rounded-md border hover:bg-muted text-xs font-semibold transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isClosingSession}
                  className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {isClosingSession ? "..." : t.closeSessionSubmit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Sales Receipt Dialog */}
      {lastSaleReceipt && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-5 rounded-lg border border-border shadow-2xl space-y-4">
            <div className="text-center border-b pb-4">
              <h2 className="text-lg font-bold text-foreground">{t.receiptTitle}</h2>
              <p className="text-xs text-muted-foreground mt-1">
                {t.receiptNumber}: {lastSaleReceipt.id.slice(0, 10).toUpperCase()}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {new Date(lastSaleReceipt.paidAt).toLocaleString()}
              </p>
            </div>

            {/* Item list */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto">
              {lastSaleReceipt.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs text-foreground">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.productName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {item.qty} x {formatMoney(item.price)}
                    </p>
                  </div>
                  <span className="font-semibold">{formatMoney(item.total)}</span>
                </div>
              ))}
            </div>

            {/* Calculation details */}
            <div className="border-t border-dashed pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>{t.subtotal}</span>
                <span>{formatMoney(lastSaleReceipt.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{t.tax}</span>
                <span>{formatMoney(lastSaleReceipt.tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-foreground border-t pt-2 mt-2">
                <span>{t.total}</span>
                <span>{formatMoney(lastSaleReceipt.total)}</span>
              </div>
            </div>

            {/* Receipt actions */}
            <div className="flex justify-end gap-3 border-t pt-4">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-md bg-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/90 text-white text-xs font-semibold transition-colors"
              >
                {t.printReceipt}
              </button>
              <button
                type="button"
                onClick={() => setLastSaleReceipt(null)}
                className="px-4 py-2 rounded-md border hover:bg-muted text-xs font-semibold transition-colors text-foreground"
              >
                {t.closeReceipt}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
