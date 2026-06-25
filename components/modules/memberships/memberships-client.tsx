"use client";

import { useId, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  StandardDialogContent,
  StandardDialogDescription,
  StandardDialogFooter,
  StandardDialogHeader,
  StandardDialogTitle,
} from "@/components/shared/standard-dialog";
import {
  StandardSelectContent,
  StandardSelectTrigger,
  StandardSelectValue,
} from "@/components/shared/standard-select";
import { Select, SelectItem } from "@/components/ui/select";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { CheckCircle2, User, Users, ClipboardList, Laptop, ShieldAlert, KeyRound, Loader2, Play } from "lucide-react";

type Member = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string | null;
  status: string;
  branchId: string;
  branchName: string;
};

type Plan = {
  id: string;
  name: string;
  price: number;
  billingPeriod: "MONTHLY" | "QUARTERLY" | "ANNUAL";
  status: string;
};

type Subscription = {
  id: string;
  memberId: string;
  memberName: string;
  planId: string;
  planName: string;
  status: string;
  startDate: string;
  endDate: string | null;
  autoRenew: boolean;
};

type Device = {
  id: string;
  name: string;
  code: string;
  status: string;
};

type Branch = {
  id: string;
  name: string;
};

const membershipsLabels = {
  es: {
    title: "Gestión de Membresías",
    membersTab: "Miembros",
    plansTab: "Planes de Cobro",
    subscriptionsTab: "Suscripciones",
    simulatorTab: "Simulador de Molinete",
    searchPlaceholder: "Buscar...",
    addMember: "Nuevo Miembro",
    addPlan: "Nuevo Plan",
    addSubscription: "Nueva Suscripción",
    firstName: "Nombre",
    lastName: "Apellidos",
    email: "Correo electrónico",
    phone: "Teléfono",
    birthDate: "Fecha de nacimiento",
    branch: "Sucursal",
    planName: "Nombre del Plan",
    billingPeriod: "Periodo de Cobro",
    price: "Precio (MXN)",
    status: "Estado",
    member: "Miembro",
    plan: "Plan de membresía",
    autoRenew: "Renovación automática",
    startDate: "Fecha de inicio",
    endDate: "Fecha de vencimiento",
    active: "Activo",
    inactive: "Inactivo",
    paused: "Pausado",
    cancelled: "Cancelado",
    actions: "Acciones",
    pauseButton: "Pausar",
    cancelButton: "Cancelar",
    reactivateButton: "Reactivar",
    submit: "Guardar",
    cancelForm: "Cerrar",
    successCreateMember: "Miembro registrado con éxito.",
    successCreatePlan: "Plan creado con éxito.",
    successCreateSub: "Suscripción activada con éxito.",
    successPauseSub: "Suscripción pausada con éxito.",
    successCancelSub: "Suscripción cancelada con éxito.",
    successReactivateSub: "Suscripción reactivada con éxito.",
    simSelectMember: "Seleccionar Miembro para escanear",
    simSelectDevice: "Dispositivo de Entrada / Lector",
    simSubmit: "Escanear Código / Simular Entrada",
    accessAllowed: "ACCESO PERMITIDO",
    accessDenied: "ACCESO DENEGADO",
    authorized: "Autorizado",
    denied: "Rechazado",
    deviceOffline: "Lector fuera de línea",
    turnstileUnlocked: "¡Molinete desbloqueado! Puede pasar.",
    turnstileLocked: "Molinete bloqueado. Acceso denegado.",
    monthly: "Mensual",
    quarterly: "Trimestral",
    annual: "Anual",
    membersCount: "Miembros registrados",
    plansCount: "Planes activos",
    subsCount: "Suscripciones activas",
  },
  en: {
    title: "Memberships Management",
    membersTab: "Members",
    plansTab: "Billing Plans",
    subscriptionsTab: "Subscriptions",
    simulatorTab: "Access Simulator",
    searchPlaceholder: "Search...",
    addMember: "New Member",
    addPlan: "New Plan",
    addSubscription: "New Subscription",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email Address",
    phone: "Phone Number",
    birthDate: "Birth Date",
    branch: "Branch",
    planName: "Plan Name",
    billingPeriod: "Billing Period",
    price: "Price (MXN)",
    status: "Status",
    member: "Member",
    plan: "Membership Plan",
    autoRenew: "Auto Renew",
    startDate: "Start Date",
    endDate: "End Date",
    active: "Active",
    inactive: "Inactive",
    paused: "Paused",
    cancelled: "Cancelled",
    actions: "Actions",
    pauseButton: "Pause",
    cancelButton: "Cancel",
    reactivateButton: "Reactivate",
    submit: "Save",
    cancelForm: "Close",
    successCreateMember: "Member registered successfully.",
    successCreatePlan: "Plan created successfully.",
    successCreateSub: "Subscription activated successfully.",
    successPauseSub: "Subscription paused successfully.",
    successCancelSub: "Subscription cancelled successfully.",
    successReactivateSub: "Subscription reactivated successfully.",
    simSelectMember: "Select Member to scan",
    simSelectDevice: "Input Device / Reader",
    simSubmit: "Scan Code / Simulate Entrance",
    accessAllowed: "ACCESS ALLOWED",
    accessDenied: "ACCESS DENIED",
    authorized: "Authorized",
    denied: "Denied",
    deviceOffline: "Reader offline",
    turnstileUnlocked: "Turnstile unlocked! You may pass.",
    turnstileLocked: "Turnstile locked. Access denied.",
    monthly: "Monthly",
    quarterly: "Quarterly",
    annual: "Annual",
    membersCount: "Registered members",
    plansCount: "Active plans",
    subsCount: "Active subscriptions",
  },
  fr: {
    title: "Gestion des Abonnements",
    membersTab: "Membres",
    plansTab: "Grille Tarifaire",
    subscriptionsTab: "Abonnements",
    simulatorTab: "Simulateur d'Accès",
    searchPlaceholder: "Rechercher...",
    addMember: "Nouveau Membre",
    addPlan: "Nouveau Plan",
    addSubscription: "Nouvel Abonnement",
    firstName: "Prénom",
    lastName: "Nom",
    email: "Adresse e-mail",
    phone: "Téléphone",
    birthDate: "Date de naissance",
    branch: "Succursale",
    planName: "Nom du Plan",
    billingPeriod: "Période de Cobro",
    price: "Prix (MXN)",
    status: "Statut",
    member: "Membre",
    plan: "Plan d'abonnement",
    autoRenew: "Renouvellement auto",
    startDate: "Date de début",
    endDate: "Date de fin",
    active: "Actif",
    inactive: "Inactif",
    paused: "Suspendu",
    cancelled: "Annulé",
    actions: "Actions",
    pauseButton: "Suspendre",
    cancelButton: "Annuler",
    reactivateButton: "Réactiver",
    submit: "Enregistrer",
    cancelForm: "Fermer",
    successCreateMember: "Membre enregistré avec succès.",
    successCreatePlan: "Plan créé avec succès.",
    successCreateSub: "Abonnement activé avec succès.",
    successPauseSub: "Abonnement suspendu avec succès.",
    successCancelSub: "Abonnement annulé avec succès.",
    successReactivateSub: "Abonnement réactivé avec succès.",
    simSelectMember: "Sélectionner le membre à scanner",
    simSelectDevice: "Lecteur d'Entrée",
    simSubmit: "Scanner le code / Entrée Simulée",
    accessAllowed: "ACCÈS AUTORISÉ",
    accessDenied: "ACCÈS REFUSÉ",
    authorized: "Autorisé",
    denied: "Refusé",
    deviceOffline: "Lecteur hors ligne",
    turnstileUnlocked: "Molinete déverrouillé! Vous pouvez passer.",
    turnstileLocked: "Molinete verrouillé. Accès refusé.",
    monthly: "Mensuel",
    quarterly: "Trimestriel",
    annual: "Annuel",
    membersCount: "Membres enregistrés",
    plansCount: "Plans actifs",
    subsCount: "Abonnements actifs",
  }
};

const statusStyles: Record<string, string> = {
  ACTIVE: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  INACTIVE: "border-muted bg-muted text-muted-foreground",
  PAUSED: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  CANCELLED: "border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300",
};

export function MembershipsClient({
  locale,
  initialMembers,
  initialPlans,
  initialSubscriptions,
  devices,
  branches,
}: {
  locale: Locale;
  initialMembers: Member[];
  initialPlans: Plan[];
  initialSubscriptions: Subscription[];
  devices: Device[];
  branches: Branch[];
}) {
  const t = membershipsLabels[locale] ?? membershipsLabels.es;
  const formId = useId();

  // State lists
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions);

  // Search & Navigation States
  const [activeTab, setActiveTab] = useState("members");
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog States
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [subDialogOpen, setSubDialogOpen] = useState(false);

  // Form states
  const [memberForm, setMemberForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    branchId: branches[0]?.id ?? "",
  });
  const [isSavingMember, setIsSavingMember] = useState(false);

  const [planForm, setPlanForm] = useState({
    name: "",
    billingPeriod: "MONTHLY" as const,
    price: "",
  });
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  const [subForm, setSubForm] = useState({
    memberId: members[0]?.id ?? "",
    planId: plans[0]?.id ?? "",
    autoRenew: true,
  });
  const [isSavingSub, setIsSavingSub] = useState(false);

  // Simulator States
  const [simMemberId, setSimMemberId] = useState(members[0]?.id ?? "");
  const [simDeviceCode, setSimDeviceCode] = useState(devices[0]?.code ?? "TURN-CENTRO-01");
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState<{
    processed: boolean;
    allowed: boolean;
    memberName?: string;
    planName?: string;
    message?: string;
  } | null>(null);

  // Filter lists based on search
  const filteredMembers = useMemo(() => {
    return members.filter((m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [members, searchQuery]);

  const filteredPlans = useMemo(() => {
    return plans.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [plans, searchQuery]);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((s) =>
      s.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.planName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [subscriptions, searchQuery]);

  // Actions for Subscriptions (Pause, Cancel, Reactivate)
  const handleSubscriptionAction = async (subscriptionId: string, action: "pause" | "cancel" | "reactivate") => {
    try {
      const res = await fetch("/api/memberships/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId, action }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error al actualizar la suscripción");

      setSubscriptions((prev) =>
        prev.map((s) => (s.id === subscriptionId ? { ...s, status: result.data.status } : s))
      );

      const successMessages = {
        pause: t.successPauseSub,
        cancel: t.successCancelSub,
        reactivate: t.successReactivateSub,
      };
      toast.success(successMessages[action]);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Submit Member Form
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMember(true);
    try {
      const res = await fetch("/api/memberships/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...memberForm,
          birthDate: memberForm.birthDate ? new Date(memberForm.birthDate).toISOString() : undefined,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error al crear miembro");

      const newMember: Member = {
        id: result.data.id,
        firstName: result.data.firstName,
        lastName: result.data.lastName,
        name: `${result.data.firstName} ${result.data.lastName}`,
        email: result.data.email ?? "",
        phone: result.data.phone ?? "",
        birthDate: result.data.birthDate,
        status: result.data.status,
        branchId: result.data.branchId,
        branchName: branches.find((b) => b.id === result.data.branchId)?.name ?? "Consolidada",
      };

      setMembers((prev) => [newMember, ...prev]);
      // Update simulator defaults if empty
      if (!simMemberId) setSimMemberId(newMember.id);
      if (!subForm.memberId) setSubForm((prev) => ({ ...prev, memberId: newMember.id }));

      setMemberDialogOpen(false);
      setMemberForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        birthDate: "",
        branchId: branches[0]?.id ?? "",
      });
      toast.success(t.successCreateMember);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSavingMember(false);
    }
  };

  // Submit Plan Form
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPlan(true);
    try {
      const res = await fetch("/api/memberships/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...planForm,
          price: parseFloat(planForm.price) || 0,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error al crear plan");

      const newPlan: Plan = {
        id: result.data.id,
        name: result.data.name,
        price: parseFloat(result.data.price),
        billingPeriod: result.data.billingPeriod,
        status: result.data.status,
      };

      setPlans((prev) => [newPlan, ...prev]);
      if (!subForm.planId) setSubForm((prev) => ({ ...prev, planId: newPlan.id }));

      setPlanDialogOpen(false);
      setPlanForm({ name: "", billingPeriod: "MONTHLY", price: "" });
      toast.success(t.successCreatePlan);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSavingPlan(false);
    }
  };

  // Submit Subscription Form
  const handleSaveSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subForm.memberId || !subForm.planId) return;

    setIsSavingSub(true);
    try {
      const res = await fetch("/api/memberships/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subForm),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error al activar suscripción");

      const newSub: Subscription = {
        id: result.data.id,
        memberId: result.data.memberId,
        memberName: `${result.data.member.firstName} ${result.data.member.lastName}`,
        planId: result.data.planId,
        planName: result.data.plan.name,
        status: result.data.status,
        startDate: result.data.startDate,
        endDate: result.data.endDate,
        autoRenew: result.data.autoRenew,
      };

      setSubscriptions((prev) => [newSub, ...prev]);
      setSubDialogOpen(false);
      toast.success(t.successCreateSub);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSavingSub(false);
    }
  };

  // Run Access Check Simulator
  const handleSimulateAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simMemberId) return;

    setSimLoading(true);
    setSimResult(null);
    try {
      const res = await fetch("/api/access/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: simMemberId,
          deviceCode: simDeviceCode,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error al simular acceso");

      setSimResult({
        processed: true,
        allowed: result.data.allowed,
        memberName: result.data.memberName,
        planName: result.data.planName,
        message: result.data.message,
      });

      if (result.data.allowed) {
        toast.success(t.accessAllowed);
      } else {
        toast.error(t.accessDenied);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSimLoading(false);
    }
  };

  const translatePeriod = (p: Plan["billingPeriod"]) => {
    if (p === "MONTHLY") return t.monthly;
    if (p === "QUARTERLY") return t.quarterly;
    return t.annual;
  };

  const activeSubscriptionsCount = subscriptions.filter((s) => s.status === "ACTIVE").length;

  return (
    <section className="erp-section space-y-6" role="main" aria-label={t.title}>
      {/* Title block */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-normal text-foreground">{t.title}</h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            Control integrado de expedientes, cobros recurrentes de planes y validaciones de entradas de torniquetes.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="erp-page-grid">
        <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/20">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.membersTab}</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">{members.length}</p>
            </div>
            <span className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
              <Users className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{t.membersCount}</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/20">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.plansTab}</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">{plans.length}</p>
            </div>
            <span className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
              <ClipboardList className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{t.plansCount}</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/20">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.subscriptionsTab}</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">{activeSubscriptionsCount}</p>
            </div>
            <span className="inline-flex size-9 items-center justify-center rounded-md border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
              <CheckCircle2 className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{t.subsCount}</p>
        </div>
      </div>

      {/* Main Tabs layout */}
      <Card className="rounded-lg">
        <Tabs value={activeTab} onValueChange={(next) => { setActiveTab(next); setSearchQuery(""); }} className="flex flex-col gap-0">
          <div className="border-b border-border pb-4 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <TabsList className="grid h-auto w-full sm:w-auto grid-cols-4 gap-2 bg-muted/60 p-1">
              <TabsTrigger value="members" className="h-9 px-3 text-xs sm:text-sm">
                <Users className="size-4 mr-1.5" />
                <span>{t.membersTab}</span>
              </TabsTrigger>
              <TabsTrigger value="plans" className="h-9 px-3 text-xs sm:text-sm">
                <ClipboardList className="size-4 mr-1.5" />
                <span>{t.plansTab}</span>
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="h-9 px-3 text-xs sm:text-sm">
                <CheckCircle2 className="size-4 mr-1.5" />
                <span>{t.subscriptionsTab}</span>
              </TabsTrigger>
              <TabsTrigger value="simulator" className="h-9 px-3 text-xs sm:text-sm">
                <Laptop className="size-4 mr-1.5" />
                <span>{t.simulatorTab}</span>
              </TabsTrigger>
            </TabsList>

            {/* Quick Actions Search or buttons depending on tab */}
            {activeTab !== "simulator" && (
              <div className="w-full sm:w-auto flex items-center gap-3">
                <Input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  className="w-full sm:w-60 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                {activeTab === "members" && (
                  <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
                    <DialogTrigger render={<Button size="sm">{t.addMember}</Button>} />
                    <StandardDialogContent>
                      <StandardDialogHeader>
                        <StandardDialogTitle>{t.addMember}</StandardDialogTitle>
                        <StandardDialogDescription>
                          Alta del miembro en la sucursal.
                        </StandardDialogDescription>
                      </StandardDialogHeader>
                      <form onSubmit={handleSaveMember} className="grid gap-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="grid gap-2 text-sm font-medium" htmlFor={`${formId}-first-name`}>
                            {t.firstName}
                            <Input
                              id={`${formId}-first-name`}
                              value={memberForm.firstName}
                              onChange={(e) => setMemberForm((prev) => ({ ...prev, firstName: e.target.value }))}
                              required
                            />
                          </label>
                          <label className="grid gap-2 text-sm font-medium" htmlFor={`${formId}-last-name`}>
                            {t.lastName}
                            <Input
                              id={`${formId}-last-name`}
                              value={memberForm.lastName}
                              onChange={(e) => setMemberForm((prev) => ({ ...prev, lastName: e.target.value }))}
                              required
                            />
                          </label>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="grid gap-2 text-sm font-medium" htmlFor={`${formId}-email`}>
                            {t.email}
                            <Input
                              id={`${formId}-email`}
                              type="email"
                              value={memberForm.email}
                              onChange={(e) => setMemberForm((prev) => ({ ...prev, email: e.target.value }))}
                            />
                          </label>
                          <label className="grid gap-2 text-sm font-medium" htmlFor={`${formId}-phone`}>
                            {t.phone}
                            <Input
                              id={`${formId}-phone`}
                              type="tel"
                              value={memberForm.phone}
                              onChange={(e) => setMemberForm((prev) => ({ ...prev, phone: e.target.value }))}
                            />
                          </label>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="grid gap-2 text-sm font-medium" htmlFor={`${formId}-birth`}>
                            {t.birthDate}
                            <Input
                              id={`${formId}-birth`}
                              type="date"
                              value={memberForm.birthDate}
                              onChange={(e) => setMemberForm((prev) => ({ ...prev, birthDate: e.target.value }))}
                            />
                          </label>
                          <label className="grid gap-2 text-sm font-medium" htmlFor={`${formId}-branch`}>
                            {t.branch}
                            <Select
                              id={`${formId}-branch`}
                              value={memberForm.branchId}
                              onValueChange={(val) => setMemberForm((prev) => ({ ...prev, branchId: val ?? "" }))}
                            >
                              <StandardSelectTrigger id={`${formId}-branch`}>
                                <StandardSelectValue />
                              </StandardSelectTrigger>
                              <StandardSelectContent>
                                {branches.map((b) => (
                                  <SelectItem key={b.id} value={b.id}>
                                    {b.name}
                                  </SelectItem>
                                ))}
                              </StandardSelectContent>
                            </Select>
                          </label>
                        </div>
                        <StandardDialogFooter>
                          <DialogClose render={<Button type="button" variant="outline" />}>
                            {t.cancelForm}
                          </DialogClose>
                          <Button type="submit" disabled={isSavingMember}>
                            {isSavingMember ? <Loader2 className="animate-spin" /> : null}
                            {t.submit}
                          </Button>
                        </StandardDialogFooter>
                      </form>
                    </StandardDialogContent>
                  </Dialog>
                )}

                {activeTab === "plans" && (
                  <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
                    <DialogTrigger render={<Button size="sm">{t.addPlan}</Button>} />
                    <StandardDialogContent>
                      <StandardDialogHeader>
                        <StandardDialogTitle>{t.addPlan}</StandardDialogTitle>
                        <StandardDialogDescription>
                          Creación del plan de cobro recurrente.
                        </StandardDialogDescription>
                      </StandardDialogHeader>
                      <form onSubmit={handleSavePlan} className="grid gap-4">
                        <label className="grid gap-2 text-sm font-medium" htmlFor={`${formId}-plan-name`}>
                          {t.planName}
                          <Input
                            id={`${formId}-plan-name`}
                            value={planForm.name}
                            onChange={(e) => setPlanForm((prev) => ({ ...prev, name: e.target.value }))}
                            required
                          />
                        </label>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="grid gap-2 text-sm font-medium" htmlFor={`${formId}-billing`}>
                            {t.billingPeriod}
                            <Select
                              id={`${formId}-billing`}
                              value={planForm.billingPeriod}
                              onValueChange={(val: any) => setPlanForm((prev) => ({ ...prev, billingPeriod: val }))}
                            >
                              <StandardSelectTrigger id={`${formId}-billing`}>
                                <StandardSelectValue />
                              </StandardSelectTrigger>
                              <StandardSelectContent>
                                <SelectItem value="MONTHLY">{t.monthly}</SelectItem>
                                <SelectItem value="QUARTERLY">{t.quarterly}</SelectItem>
                                <SelectItem value="ANNUAL">{t.annual}</SelectItem>
                              </StandardSelectContent>
                            </Select>
                          </label>
                          <label className="grid gap-2 text-sm font-medium" htmlFor={`${formId}-price`}>
                            {t.price}
                            <Input
                              id={`${formId}-price`}
                              type="number"
                              step="0.01"
                              min="0"
                              value={planForm.price}
                              onChange={(e) => setPlanForm((prev) => ({ ...prev, price: e.target.value }))}
                              required
                            />
                          </label>
                        </div>
                        <StandardDialogFooter>
                          <DialogClose render={<Button type="button" variant="outline" />}>
                            {t.cancelForm}
                          </DialogClose>
                          <Button type="submit" disabled={isSavingPlan}>
                            {isSavingPlan ? <Loader2 className="animate-spin" /> : null}
                            {t.submit}
                          </Button>
                        </StandardDialogFooter>
                      </form>
                    </StandardDialogContent>
                  </Dialog>
                )}

                {activeTab === "subscriptions" && (
                  <Dialog open={subDialogOpen} onOpenChange={setSubDialogOpen}>
                    <DialogTrigger render={<Button size="sm">{t.addSubscription}</Button>} />
                    <StandardDialogContent>
                      <StandardDialogHeader>
                        <StandardDialogTitle>{t.addSubscription}</StandardDialogTitle>
                        <StandardDialogDescription>
                          Vincular suscripción activa a un miembro.
                        </StandardDialogDescription>
                      </StandardDialogHeader>
                      <form onSubmit={handleSaveSub} className="grid gap-4">
                        <label className="grid gap-2 text-sm font-medium" htmlFor={`${formId}-sub-member`}>
                          {t.member}
                          <Select
                            id={`${formId}-sub-member`}
                            value={subForm.memberId}
                            onValueChange={(val) => setSubForm((prev) => ({ ...prev, memberId: val ?? "" }))}
                          >
                            <StandardSelectTrigger id={`${formId}-sub-member`}>
                              <StandardSelectValue />
                            </StandardSelectTrigger>
                            <StandardSelectContent>
                              {members.map((m) => (
                                <SelectItem key={m.id} value={m.id}>
                                  {m.name} ({m.email || "Sin correo"})
                                </SelectItem>
                              ))}
                            </StandardSelectContent>
                          </Select>
                        </label>

                        <label className="grid gap-2 text-sm font-medium" htmlFor={`${formId}-sub-plan`}>
                          {t.plan}
                          <Select
                            id={`${formId}-sub-plan`}
                            value={subForm.planId}
                            onValueChange={(val) => setSubForm((prev) => ({ ...prev, planId: val ?? "" }))}
                          >
                            <StandardSelectTrigger id={`${formId}-sub-plan`}>
                              <StandardSelectValue />
                            </StandardSelectTrigger>
                            <StandardSelectContent>
                              {plans.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.name} — {new Intl.NumberFormat(locale === "es" ? "es-MX" : "en-US", { style: "currency", currency: "MXN" }).format(p.price)}
                                </SelectItem>
                              ))}
                            </StandardSelectContent>
                          </Select>
                        </label>

                        <StandardDialogFooter>
                          <DialogClose render={<Button type="button" variant="outline" />}>
                            {t.cancelForm}
                          </DialogClose>
                          <Button type="submit" disabled={isSavingSub || members.length === 0 || plans.length === 0}>
                            {isSavingSub ? <Loader2 className="animate-spin" /> : null}
                            {t.submit}
                          </Button>
                        </StandardDialogFooter>
                      </form>
                    </StandardDialogContent>
                  </Dialog>
                )}
              </div>
            )}
          </div>

          {/* Tab Contents */}
          <div className="p-4 pt-0">
            {/* Members tab content */}
            <TabsContent value="members">
              {filteredMembers.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground border border-dashed rounded-md">
                  No se encontraron miembros.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.member}</TableHead>
                        <TableHead>{t.email}</TableHead>
                        <TableHead>{t.phone}</TableHead>
                        <TableHead>{t.branch}</TableHead>
                        <TableHead>{t.status}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMembers.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell className="font-semibold text-foreground">{m.name}</TableCell>
                          <TableCell>{m.email || "-"}</TableCell>
                          <TableCell>{m.phone || "-"}</TableCell>
                          <TableCell>{m.branchName}</TableCell>
                          <TableCell>
                            <Badge className={statusStyles[m.status]} variant="outline">
                              {m.status === "ACTIVE" ? t.active : t.inactive}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Plans tab content */}
            <TabsContent value="plans">
              {filteredPlans.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground border border-dashed rounded-md">
                  No se encontraron planes creados.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.planName}</TableHead>
                        <TableHead>{t.billingPeriod}</TableHead>
                        <TableHead>{t.price}</TableHead>
                        <TableHead>{t.status}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPlans.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-semibold text-foreground">{p.name}</TableCell>
                          <TableCell>{translatePeriod(p.billingPeriod)}</TableCell>
                          <TableCell>
                            {new Intl.NumberFormat(locale === "es" ? "es-MX" : "en-US", { style: "currency", currency: "MXN" }).format(p.price)}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusStyles[p.status]} variant="outline">
                              {p.status === "ACTIVE" ? t.active : t.inactive}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Subscriptions tab content */}
            <TabsContent value="subscriptions">
              {filteredSubscriptions.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground border border-dashed rounded-md">
                  No hay suscripciones registradas.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.member}</TableHead>
                        <TableHead>{t.plan}</TableHead>
                        <TableHead>{t.startDate}</TableHead>
                        <TableHead>{t.endDate}</TableHead>
                        <TableHead>{t.status}</TableHead>
                        <TableHead>{t.actions}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubscriptions.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-semibold text-foreground">{s.memberName}</TableCell>
                          <TableCell>{s.planName}</TableCell>
                          <TableCell>{new Date(s.startDate).toLocaleDateString()}</TableCell>
                          <TableCell>{s.endDate ? new Date(s.endDate).toLocaleDateString() : "-"}</TableCell>
                          <TableCell>
                            <Badge className={statusStyles[s.status]} variant="outline">
                              {s.status === "ACTIVE"
                                ? t.active
                                : s.status === "PAUSED"
                                ? t.paused
                                : t.cancelled}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {s.status === "ACTIVE" ? (
                                <>
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    onClick={() => handleSubscriptionAction(s.id, "pause")}
                                    className="border-amber-500/25 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20"
                                  >
                                    {t.pauseButton}
                                  </Button>
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    onClick={() => handleSubscriptionAction(s.id, "cancel")}
                                    className="border-red-500/25 bg-red-500/10 text-red-700 hover:bg-red-500/20"
                                  >
                                    {t.cancelButton}
                                  </Button>
                                </>
                              ) : s.status === "PAUSED" ? (
                                <Button
                                  size="xs"
                                  variant="outline"
                                  onClick={() => handleSubscriptionAction(s.id, "reactivate")}
                                  className="border-emerald-500/25 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20"
                                >
                                  {t.reactivateButton}
                                </Button>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Turnstile / QR Scanner simulator tab content */}
            <TabsContent value="simulator">
              <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] mt-2">
                {/* Simulator controls */}
                <div className="glass-panel p-5 rounded-lg border border-border space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-foreground">Molinetes de Recepción</h3>
                    <p className="text-xs text-muted-foreground">
                      Herramienta para simular el escaneo de accesos y checar autorizaciones físicas.
                    </p>
                  </div>

                  <form onSubmit={handleSimulateAccess} className="space-y-4 pt-2">
                    <div className="grid gap-1.5">
                      <label className="text-sm font-medium" htmlFor="sim-member">
                        {t.simSelectMember}
                      </label>
                      <select
                        id="sim-member"
                        className="glass-control w-full px-3 py-2 rounded-md border text-sm"
                        value={simMemberId}
                        onChange={(e) => setSimMemberId(e.target.value)}
                        required
                      >
                        <option value="" disabled>Selecciona un miembro...</option>
                        {members.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.status === "ACTIVE" ? "Activo" : "Inactivo"})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid gap-1.5">
                      <label className="text-sm font-medium" htmlFor="sim-device">
                        {t.simSelectDevice}
                      </label>
                      <select
                        id="sim-device"
                        className="glass-control w-full px-3 py-2 rounded-md border text-sm"
                        value={simDeviceCode}
                        onChange={(e) => setSimDeviceCode(e.target.value)}
                        required
                      >
                        {devices.map((d) => (
                          <option key={d.id} value={d.code}>
                            {d.name} ({d.code})
                          </option>
                        ))}
                        {devices.length === 0 && (
                          <option value="TURN-CENTRO-01">Torniquete Recepción Centro (TURN-CENTRO-01)</option>
                        )}
                      </select>
                    </div>

                    <Button type="submit" disabled={simLoading || members.length === 0} className="w-full">
                      {simLoading ? <Loader2 className="animate-spin mr-1.5" /> : <Play className="size-4 mr-1.5" />}
                      {t.simSubmit}
                    </Button>
                  </form>
                </div>

                {/* Animated turnstile representation */}
                <div className="flex flex-col items-center justify-center">
                  {simResult ? (
                    <div
                      className={cn(
                        "w-full h-full min-h-[220px] rounded-lg border flex flex-col items-center justify-center p-6 text-center space-y-4 transition-all duration-300",
                        simResult.allowed
                          ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]"
                          : "border-red-500/20 bg-red-500/5 text-red-700 dark:text-red-300 shadow-[0_0_15px_-3px_rgba(239,68,68,0.2)]"
                      )}
                    >
                      <div
                        className={cn(
                          "size-16 rounded-full border flex items-center justify-center transition-all duration-500",
                          simResult.allowed
                            ? "border-emerald-500 bg-emerald-500/10 animate-bounce"
                            : "border-red-500 bg-red-500/10 animate-shake"
                        )}
                      >
                        {simResult.allowed ? (
                          <KeyRound className="size-8 text-emerald-500" />
                        ) : (
                          <ShieldAlert className="size-8 text-red-500" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xl font-bold tracking-tight">
                          {simResult.allowed ? t.accessAllowed : t.accessDenied}
                        </h4>
                        <p className="text-sm font-semibold">{simResult.memberName}</p>
                        {simResult.planName && (
                          <p className="text-xs text-muted-foreground">{t.plan}: {simResult.planName}</p>
                        )}
                        <p className="text-xs font-medium mt-2">{simResult.message}</p>
                      </div>

                      <div className="pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {simResult.allowed ? t.turnstileUnlocked : t.turnstileLocked}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full min-h-[220px] rounded-lg border border-dashed border-border flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                      <KeyRound className="size-12 opacity-40 mb-3" />
                      <p className="text-sm font-medium">Lector en espera...</p>
                      <p className="text-xs">Selecciona un miembro y haz clic en escanear.</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </section>
  );
}
