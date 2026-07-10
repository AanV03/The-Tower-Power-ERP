"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardGridSkeleton } from "@/components/skeletons";
import { EmptyState } from "@/components/empty-state";
import { 
  Search, 
  Phone, 
  Mail, 
  FileText, 
  History, 
  TrendingUp, 
  AlertTriangle, 
  Building2,
  Calendar,
  X
} from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { Vendor } from "./types";
import { toast } from "sonner";

interface VendorsViewProps {
  locale: Locale;
  vendors: Vendor[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedVendorId: string | null;
  onSelectVendor: (id: string | null) => void;
  isLoading?: boolean;
}

export function VendorsView({
  locale,
  vendors,
  searchQuery,
  onSearchChange,
  selectedVendorId,
  onSelectVendor,
  isLoading = false,
}: VendorsViewProps) {
  const dictionary = {
    es: {
      title: "Catálogo de Proveedores",
      subtitle: "Búsqueda y gestión de proveedores activos, datos de facturación y OTD.",
      searchPlaceholder: "Buscar por nombre, RFC, categoría o contacto...",
      taxIdLabel: "RFC",
      otdLabel: "Cumplimiento (OTD)",
      incidentsLabel: "Incidencias activas",
      purchasesLabel: "Compras realizadas",
      contactLabel: "Contacto",
      historyLabel: "Historial y Contabilidad",
      selectVendor: "Seleccionar",
      selected: "Seleccionado",
      viewProfile: "Ver Perfil",
      activeFilters: "Filtros activos",
      clearSearch: "Limpiar búsqueda",
      noResultsTitle: "No se encontraron proveedores",
      noResultsDesc: "Intenta modificar el término de búsqueda o registra un nuevo proveedor.",
      profileTitle: "Perfil del Proveedor",
      profileDesc: "Trazabilidad completa e historial de abastecimiento.",
      details: "Detalles del Proveedor",
      paymentTerms: "Condiciones de pago",
      close: "Cerrar",
    },
    en: {
      title: "Vendor Directory",
      subtitle: "Search and manage active vendors, tax details, and OTD performance.",
      searchPlaceholder: "Search by name, tax ID, category, or contact...",
      taxIdLabel: "Tax ID",
      otdLabel: "On-Time Delivery",
      incidentsLabel: "Active incidents",
      purchasesLabel: "Total purchases",
      contactLabel: "Contact",
      historyLabel: "History & Accounting",
      selectVendor: "Select",
      selected: "Selected",
      viewProfile: "View Profile",
      activeFilters: "Active filters",
      clearSearch: "Clear search",
      noResultsTitle: "No vendors found",
      noResultsDesc: "Try modifying the search query or register a new vendor.",
      profileTitle: "Vendor Profile",
      profileDesc: "Complete traceability and sourcing history.",
      details: "Vendor Details",
      paymentTerms: "Payment terms",
      close: "Close",
    },
    fr: {
      title: "Catalogue Fournisseurs",
      subtitle: "Recherche et gestion des fournisseurs actifs, informations fiscales et OTD.",
      searchPlaceholder: "Rechercher par nom, numéro fiscal, catégorie...",
      taxIdLabel: "N° fiscal",
      otdLabel: "Livraison à temps",
      incidentsLabel: "Incidents actifs",
      purchasesLabel: "Achats réalisés",
      contactLabel: "Contact",
      historyLabel: "Historique & Comptabilité",
      selectVendor: "Sélectionner",
      selected: "Sélectionné",
      viewProfile: "Voir Profil",
      activeFilters: "Filtres actifs",
      clearSearch: "Effacer la recherche",
      noResultsTitle: "Aucun fournisseur trouvé",
      noResultsDesc: "Essayez de modifier votre recherche ou ajoutez un nouveau fournisseur.",
      profileTitle: "Profil Fournisseur",
      profileDesc: "Traçabilité complète et historique d'approvisionnement.",
      details: "Détails du Fournisseur",
      paymentTerms: "Conditions de paiement",
      close: "Fermer",
    },
  };

  const t = dictionary[locale] || dictionary.es;

  // Filter vendors locally based on the search query
  const filteredVendors = vendors.filter((vendor) => {
    const query = searchQuery.toLowerCase();
    return (
      vendor.name.toLowerCase().includes(query) ||
      vendor.taxId.toLowerCase().includes(query) ||
      vendor.category.toLowerCase().includes(query) ||
      vendor.contact.toLowerCase().includes(query) ||
      vendor.email.toLowerCase().includes(query)
    );
  });

  const selectedVendor = vendors.find((v) => v.id === selectedVendorId) || null;

  const handleSelectVendor = (id: string) => {
    const isSelected = selectedVendorId === id;
    onSelectVendor(isSelected ? null : id);
    toast.success(isSelected ? "Proveedor deseleccionado" : "Proveedor seleccionado para la compra");
  };

  return (
    <div className="space-y-6">
      {/* Page header and Search Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-foreground">{t.title}</h2>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] items-start">
        {/* Left column: Search and Vendors Grid */}
        <div className="space-y-4">
          <Card className="border-border/60 bg-card/65 glass-effect">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                <Input
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 pr-4 bg-background/50 border-border/70"
                />
              </div>

              {searchQuery && (
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="text-xs text-muted-foreground">{t.activeFilters}:</span>
                  <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                    "{searchQuery}"
                    <button onClick={() => onSearchChange("")} className="cursor-pointer">
                      <X className="size-3" />
                    </button>
                  </Badge>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => onSearchChange("")}
                    className="text-xs text-primary h-auto p-0 cursor-pointer"
                  >
                    {t.clearSearch}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {isLoading ? (
            <CardGridSkeleton count={4} columns={2} />
          ) : filteredVendors.length === 0 ? (
            <EmptyState
              variant="search"
              title={t.noResultsTitle}
              description={t.noResultsDesc}
              action={{
                label: t.clearSearch,
                onClick: () => onSearchChange(""),
              }}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredVendors.map((vendor) => {
                const isSelected = selectedVendorId === vendor.id;
                return (
                  <article
                    key={vendor.id}
                    className={`relative overflow-hidden rounded-2xl border transition-all duration-300 p-5 bg-card/85 glass-effect ${
                      isSelected 
                        ? "border-primary shadow-md ring-1 ring-primary/30" 
                        : "border-border/70 hover:border-primary/40 hover:bg-muted/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-foreground line-clamp-1">{vendor.name}</h4>
                        <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                          {vendor.category}
                        </Badge>
                      </div>
                      <Badge variant={isSelected ? "default" : "outline"} className="text-xs shrink-0">
                        {isSelected ? t.selected : t.taxIdLabel}
                      </Badge>
                    </div>

                    <div className="mt-4 space-y-2 text-xs text-muted-foreground border-t border-border/30 pt-3">
                      <div className="flex items-center gap-2">
                        <FileText className="size-3.5 shrink-0 text-primary/70" />
                        <span className="font-semibold text-foreground">{vendor.taxId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="size-3.5 shrink-0 text-primary/70" />
                        <span className="truncate">{vendor.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="size-3.5 shrink-0 text-primary/70" />
                        <span>{vendor.phone}</span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 bg-background/30 rounded-xl p-2.5 text-center border border-border/30">
                      <div>
                        <dt className="text-[9px] uppercase tracking-wider text-muted-foreground">{t.otdLabel}</dt>
                        <dd className={`mt-0.5 text-xs font-bold ${vendor.otdRate >= 95 ? "text-emerald-500" : "text-amber-500"}`}>
                          {vendor.otdRate}%
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[9px] uppercase tracking-wider text-muted-foreground">{t.incidentsLabel}</dt>
                        <dd className={`mt-0.5 text-xs font-bold ${vendor.activeIncidents > 0 ? "text-rose-500" : "text-emerald-500"}`}>
                          {vendor.activeIncidents}
                        </dd>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        variant={isSelected ? "default" : "outline"}
                        className="flex-1 text-xs font-semibold cursor-pointer"
                        onClick={() => handleSelectVendor(vendor.id)}
                      >
                        {isSelected ? t.selected : t.selectVendor}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs font-semibold hover:bg-muted/40 cursor-pointer"
                        onClick={() => onSelectVendor(vendor.id)}
                      >
                        {t.viewProfile}
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: Selected Vendor Details / Interactive Profile */}
        <aside className="space-y-4 xl:sticky xl:top-6">
          <Card className="border-border/60 bg-card/65 glass-effect shadow-md">
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg font-semibold tracking-tight">{t.profileTitle}</CardTitle>
              <CardDescription>{t.profileDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedVendor ? (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4 relative">
                    {selectedVendorId && (
                      <button
                        onClick={() => onSelectVendor(null)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <X className="size-4" />
                      </button>
                    )}
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Building2 className="size-4 text-primary" />
                      {selectedVendor.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{selectedVendor.category}</p>
                  </div>

                  <dl className="space-y-3.5 text-xs">
                    {/* Contabilidad */}
                    <div className="border-b border-border/30 pb-3">
                      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1 mb-2">
                        <History className="size-3.5 text-primary/70" />
                        {t.historyLabel}
                      </dt>
                      <dd className="grid grid-cols-2 gap-3 mt-1.5">
                        <div className="bg-background/40 rounded-xl p-3 border border-border/40 text-center">
                          <span className="text-[9px] uppercase text-muted-foreground">{t.purchasesLabel}</span>
                          <p className="text-sm font-bold text-foreground mt-0.5">{selectedVendor.purchaseCount}</p>
                        </div>
                        <div className="bg-background/40 rounded-xl p-3 border border-border/40 text-center">
                          <span className="text-[9px] uppercase text-muted-foreground">{t.paymentTerms}</span>
                          <p className="text-sm font-bold text-foreground mt-0.5">{selectedVendor.paymentTerms}</p>
                        </div>
                      </dd>
                    </div>

                    {/* Desempeño */}
                    <div className="border-b border-border/30 pb-3">
                      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1 mb-2">
                        <TrendingUp className="size-3.5 text-primary/70" />
                        Desempeño Operativo
                      </dt>
                      <dd className="space-y-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Tasa de entrega a tiempo</span>
                          <span className="font-bold text-emerald-500">{selectedVendor.otdRate}%</span>
                        </div>
                        <div className="w-full bg-muted/65 rounded-full h-1.5">
                          <div 
                            className="bg-emerald-500 h-1.5 rounded-full" 
                            style={{ width: `${selectedVendor.otdRate}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs mt-2.5">
                          <span className="text-muted-foreground">{t.incidentsLabel}</span>
                          <span className={`font-bold ${selectedVendor.activeIncidents > 0 ? "text-rose-500" : "text-emerald-500"}`}>
                            {selectedVendor.activeIncidents} incidencias
                          </span>
                        </div>
                      </dd>
                    </div>

                    {/* Detalles de Facturación */}
                    <div>
                      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1 mb-2">
                        <FileText className="size-3.5 text-primary/70" />
                        {t.details}
                      </dt>
                      <dd className="rounded-xl border border-border/40 bg-background/30 p-3 space-y-2 text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Contacto principal:</span>
                          <span className="text-foreground font-medium">{selectedVendor.contact}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Identificador Fiscal:</span>
                          <span className="text-foreground font-medium">{selectedVendor.taxId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Correo:</span>
                          <span className="text-foreground truncate max-w-[150px] font-medium">{selectedVendor.email}</span>
                        </div>
                      </dd>
                    </div>
                  </dl>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-muted-foreground border border-dashed border-border/70 rounded-2xl bg-muted/20">
                  Selecciona un proveedor de la lista para ver su perfil completo e incidencias contables.
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
