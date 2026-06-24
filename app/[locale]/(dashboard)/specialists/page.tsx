import {
  Activity,
  Banknote,
  CalendarClock,
  CheckCircle2,
  Dumbbell,
  HandCoins,
  Percent,
  ReceiptText,
  SlidersHorizontal,
  Timer,
  UsersRound,
  WalletCards,
} from "lucide-react";
import type { BranchStatus, SpecialistContractModel, SpecialistSessionStatus } from "@prisma/client";

import { SpecialistActionDialogs } from "@/components/modules/specialists/specialist-action-dialogs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { moduleConfigs } from "@/data/modules";
import { requireApiContext } from "@/lib/api/context";
import { formatCurrency } from "@/lib/api/pagination";
import { getModuleSummary } from "@/lib/api/module-summary";
import { prisma } from "@/lib/db/prisma";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type SpecialistRow = {
  id: string;
  name: string;
  specialty: string;
  type: string;
  status: BranchStatus;
  branch: string;
  contractModel: SpecialistContractModel | "UNASSIGNED";
  services: number;
  sessions: number;
};

type SessionRow = {
  id: string;
  specialist: string;
  service: string;
  branch: string;
  status: SpecialistSessionStatus;
  scheduledAt: Date;
  price: string;
};

type SettlementRow = {
  id: string;
  specialist: string;
  grossAmount: string;
  rentAmount: string;
  commissionAmount: string;
  netPayout: string;
  status: string;
};

const specialistLabels = {
  es: {
    eyebrow: "Motor de especialistas",
    title: "Liquidacion del periodo",
    subtitle:
      "Control de contratos, sesiones y payouts para especialistas internos, externos y clinicas asociadas.",
    period: "Junio 2026",
    generate: "Generar liquidacion",
    registerSession: "Registrar sesion",
    newSpecialist: "Nuevo empleado",
    sessionPurpose:
      "Registrar sesion captura una cita o servicio realizado por un especialista; despues alimenta agenda, comisiones y liquidaciones.",
    payout: "Payout estimado",
    activeSpecialists: "Especialistas activos",
    todaySessions: "Sesiones de hoy",
    draftSettlements: "Liquidaciones borrador",
    contractModels: "Modelos de contrato",
    contractDescription: "Distribucion operativa para renta fija, comision e hibridos.",
    timeline: "Agenda del dia",
    timelineDescription: "Sesiones que impactan comisiones y cierre del periodo.",
    settlements: "Liquidaciones pendientes",
    settlementsDescription: "Montos listos para revision antes de aprobar pago.",
    directory: "Directorio de especialistas",
    filters: "Filtros de especialistas",
    allBranches: "Todas las sucursales",
    allTypes: "Todos los tipos",
    allStatuses: "Todos los estados",
    allSpecialties: "Todas las especialidades",
    tableSpecialist: "Especialista",
    tableBranch: "Sucursal",
    tableModel: "Modelo",
    tableServices: "Servicios",
    tableSessions: "Sesiones",
    tableStatus: "Estado",
    noSessions: "No hay sesiones programadas hoy.",
    noSettlements: "No hay liquidaciones pendientes.",
    noSpecialists: "No hay especialistas registrados.",
    readiness: "Preparacion cierre",
    approved: "Validacion",
    pendingReview: "Revision",
    completed: "Completada",
    scheduled: "Programada",
    cancelled: "Cancelada",
    noShow: "No-show",
    active: "Activo",
    inactive: "Inactivo",
    suspended: "Suspendido",
    fixedRent: "Renta fija",
    commission: "Comision",
    hybrid: "Hibrido",
    unassigned: "Sin contrato",
  },
  en: {
    eyebrow: "Specialist engine",
    title: "Period settlement",
    subtitle:
      "Contract, session, and payout control for internal specialists, external partners, and clinics.",
    period: "June 2026",
    generate: "Generate settlement",
    registerSession: "Register session",
    newSpecialist: "New specialist",
    sessionPurpose:
      "Registering a session captures a specialist appointment or service; it then feeds agenda, commissions, and settlements.",
    payout: "Estimated payout",
    activeSpecialists: "Active specialists",
    todaySessions: "Today sessions",
    draftSettlements: "Draft settlements",
    contractModels: "Contract models",
    contractDescription: "Operational distribution for fixed rent, commission, and hybrid models.",
    timeline: "Daily agenda",
    timelineDescription: "Sessions that affect commissions and period close.",
    settlements: "Pending settlements",
    settlementsDescription: "Amounts ready for review before payout approval.",
    directory: "Specialist directory",
    filters: "Specialist filters",
    allBranches: "All branches",
    allTypes: "All types",
    allStatuses: "All statuses",
    allSpecialties: "All specialties",
    tableSpecialist: "Specialist",
    tableBranch: "Branch",
    tableModel: "Model",
    tableServices: "Services",
    tableSessions: "Sessions",
    tableStatus: "Status",
    noSessions: "No sessions scheduled today.",
    noSettlements: "No pending settlements.",
    noSpecialists: "No specialists registered.",
    readiness: "Close readiness",
    approved: "Validation",
    pendingReview: "Review",
    completed: "Completed",
    scheduled: "Scheduled",
    cancelled: "Cancelled",
    noShow: "No-show",
    active: "Active",
    inactive: "Inactive",
    suspended: "Suspended",
    fixedRent: "Fixed rent",
    commission: "Commission",
    hybrid: "Hybrid",
    unassigned: "Unassigned",
  },
  fr: {
    eyebrow: "Moteur specialistes",
    title: "Reglement de periode",
    subtitle:
      "Controle des contrats, seances et paiements pour specialistes internes, externes et cliniques.",
    period: "Juin 2026",
    generate: "Generer reglement",
    registerSession: "Enregistrer seance",
    newSpecialist: "Nouveau specialiste",
    sessionPurpose:
      "Enregistrer une seance capture un rendez-vous ou service de specialiste; elle alimente ensuite agenda, commissions et reglements.",
    payout: "Paiement estime",
    activeSpecialists: "Specialistes actifs",
    todaySessions: "Seances du jour",
    draftSettlements: "Reglements brouillon",
    contractModels: "Modeles de contrat",
    contractDescription: "Distribution operationnelle pour loyer fixe, commission et hybride.",
    timeline: "Agenda du jour",
    timelineDescription: "Seances qui affectent commissions et cloture.",
    settlements: "Reglements en attente",
    settlementsDescription: "Montants prets a reviser avant approbation.",
    directory: "Repertoire specialistes",
    filters: "Filtres specialistes",
    allBranches: "Toutes les succursales",
    allTypes: "Tous les types",
    allStatuses: "Tous les statuts",
    allSpecialties: "Toutes les specialites",
    tableSpecialist: "Specialiste",
    tableBranch: "Succursale",
    tableModel: "Modele",
    tableServices: "Services",
    tableSessions: "Seances",
    tableStatus: "Statut",
    noSessions: "Aucune seance programmee aujourd'hui.",
    noSettlements: "Aucun reglement en attente.",
    noSpecialists: "Aucun specialiste enregistre.",
    readiness: "Preparation cloture",
    approved: "Validation",
    pendingReview: "Revision",
    completed: "Terminee",
    scheduled: "Programmee",
    cancelled: "Annulee",
    noShow: "No-show",
    active: "Actif",
    inactive: "Inactif",
    suspended: "Suspendu",
    fixedRent: "Loyer fixe",
    commission: "Commission",
    hybrid: "Hybride",
    unassigned: "Sans contrat",
  },
} satisfies Record<Locale, Record<string, string>>;

const statusStyles: Record<string, string> = {
  ACTIVE: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  INACTIVE: "border-muted bg-muted text-muted-foreground",
  SUSPENDED: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  SCHEDULED: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  COMPLETED: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  CANCELLED: "border-muted bg-muted text-muted-foreground",
  NO_SHOW: "border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300",
  DRAFT: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  APPROVED: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  PAID: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
};

function numberValue(value: string | undefined) {
  if (!value) return 0;
  const numeric = Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function moneyFromString(value: string) {
  return formatCurrency(value || "0");
}

function metricValue(summary: Awaited<ReturnType<typeof getModuleSummary>>, key: string, fallback = "0") {
  return summary.metrics.find((metric) => metric.key === key)?.value ?? fallback;
}

function translateModel(model: SpecialistContractModel | "UNASSIGNED", labels: (typeof specialistLabels)[Locale]) {
  if (model === "FIXED_RENT") return labels.fixedRent;
  if (model === "COMMISSION") return labels.commission;
  if (model === "HYBRID") return labels.hybrid;
  return labels.unassigned;
}

function translateStatus(status: string, labels: (typeof specialistLabels)[Locale]) {
  if (status === "ACTIVE") return labels.active;
  if (status === "INACTIVE") return labels.inactive;
  if (status === "SUSPENDED") return labels.suspended;
  if (status === "SCHEDULED") return labels.scheduled;
  if (status === "COMPLETED") return labels.completed;
  if (status === "CANCELLED") return labels.cancelled;
  if (status === "NO_SHOW") return labels.noShow;
  if (status === "APPROVED" || status === "PAID") return labels.approved;
  return labels.pendingReview;
}

function MetricTile({
  label,
  value,
  helper,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  helper: string;
  icon: typeof Activity;
  tone?: "default" | "success" | "warning";
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 transition-colors hover:border-foreground/20">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold tracking-normal text-foreground">{value}</p>
        </div>
        <span
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-md border",
            tone === "success" && "border-emerald-500/25 bg-emerald-500/10 text-emerald-600",
            tone === "warning" && "border-amber-500/25 bg-amber-500/10 text-amber-600",
            tone === "default" && "border-border bg-muted text-muted-foreground",
          )}
        >
          <Icon className="size-3.5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{helper}</p>
    </div>
  );
}

function ContractModelPanel({
  labels,
  counts,
}: {
  labels: (typeof specialistLabels)[Locale];
  counts: Record<SpecialistContractModel, number>;
}) {
  const total = Math.max(counts.FIXED_RENT + counts.COMMISSION + counts.HYBRID, 1);
  const models = [
    { id: "FIXED_RENT" as const, label: labels.fixedRent, icon: Banknote, tone: "bg-orange-500", count: counts.FIXED_RENT },
    { id: "COMMISSION" as const, label: labels.commission, icon: Percent, tone: "bg-emerald-500", count: counts.COMMISSION },
    { id: "HYBRID" as const, label: labels.hybrid, icon: WalletCards, tone: "bg-sky-500", count: counts.HYBRID },
  ];

  return (
    <Card className="h-full rounded-lg">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-muted-foreground" aria-hidden="true" />
          {labels.contractModels}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{labels.contractDescription}</p>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {models.map((model) => {
          const percent = Math.round((model.count / total) * 100);
          const Icon = model.icon;

          return (
            <div key={model.id} className="rounded-md border border-border bg-background/60 p-2.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-7 items-center justify-center rounded-md border border-border bg-background">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="font-medium text-foreground">{model.label}</span>
                </div>
                <span className="text-muted-foreground">{model.count}</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-muted" aria-hidden="true">
                <div className={cn("h-full rounded-full", model.tone)} style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function SessionTimeline({
  labels,
  sessions,
}: {
  labels: (typeof specialistLabels)[Locale];
  sessions: SessionRow[];
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">{labels.timelineDescription}</p>
      </div>
        {sessions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
            {labels.noSessions}
          </div>
        ) : (
          <ol className="space-y-3" aria-label={labels.timeline}>
            {sessions.map((session) => (
              <li key={session.id} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                <span className="mt-1 inline-flex size-8 items-center justify-center rounded-md border border-border bg-muted">
                  <Timer className="size-4 text-muted-foreground" aria-hidden="true" />
                </span>
                <div className="min-w-0 rounded-lg border border-border bg-background p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{session.specialist}</p>
                      <p className="text-sm text-muted-foreground">{session.service}</p>
                    </div>
                    <Badge className={statusStyles[session.status]} variant="outline">
                      {translateStatus(session.status, labels)}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>{session.scheduledAt.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</span>
                    <span>{session.branch}</span>
                    <span>{moneyFromString(session.price)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
    </div>
  );
}

function SettlementsPanel({
  labels,
  settlements,
}: {
  labels: (typeof specialistLabels)[Locale];
  settlements: SettlementRow[];
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{labels.settlementsDescription}</p>
        {settlements.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
            {labels.noSettlements}
          </div>
        ) : (
          <div className="space-y-3">
            {settlements.map((settlement) => (
              <div key={settlement.id} className="rounded-lg border border-border bg-background p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{settlement.specialist}</p>
                    <p className="text-sm text-muted-foreground">{labels.readiness}</p>
                  </div>
                  <Badge className={statusStyles[settlement.status]} variant="outline">
                    {translateStatus(settlement.status, labels)}
                  </Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Gross</p>
                    <p className="font-medium">{moneyFromString(settlement.grossAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rent</p>
                    <p className="font-medium">{moneyFromString(settlement.rentAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Commission</p>
                    <p className="font-medium">{moneyFromString(settlement.commissionAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Net</p>
                    <p className="font-semibold text-emerald-600 dark:text-emerald-300">
                      {moneyFromString(settlement.netPayout)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

function SpecialistDirectory({
  labels,
  specialists,
}: {
  labels: (typeof specialistLabels)[Locale];
  specialists: SpecialistRow[];
}) {
  const branches = Array.from(new Set(specialists.map((specialist) => specialist.branch)));
  const types = Array.from(new Set(specialists.map((specialist) => specialist.type)));
  const specialties = Array.from(new Set(specialists.map((specialist) => specialist.specialty)));

  return (
    <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label={labels.filters}>
            <NativeSelect size="sm" aria-label={labels.allBranches}>
              <NativeSelectOption>{labels.allBranches}</NativeSelectOption>
              {branches.map((branch) => (
                <NativeSelectOption key={branch}>{branch}</NativeSelectOption>
              ))}
            </NativeSelect>
            <NativeSelect size="sm" aria-label={labels.allTypes}>
              <NativeSelectOption>{labels.allTypes}</NativeSelectOption>
              {types.map((type) => (
                <NativeSelectOption key={type}>{type}</NativeSelectOption>
              ))}
            </NativeSelect>
            <NativeSelect size="sm" aria-label={labels.allSpecialties}>
              <NativeSelectOption>{labels.allSpecialties}</NativeSelectOption>
              {specialties.map((specialty) => (
                <NativeSelectOption key={specialty}>{specialty}</NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        </div>
        {specialists.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
            {labels.noSpecialists}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{labels.tableSpecialist}</TableHead>
                  <TableHead>{labels.tableBranch}</TableHead>
                  <TableHead>{labels.tableModel}</TableHead>
                  <TableHead>{labels.tableServices}</TableHead>
                  <TableHead>{labels.tableSessions}</TableHead>
                  <TableHead>{labels.tableStatus}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {specialists.map((specialist) => (
                  <TableRow key={specialist.id} className="transition-colors hover:bg-muted/40">
                    <TableCell>
                      <div className="min-w-48">
                        <p className="font-medium text-foreground">{specialist.name}</p>
                        <p className="text-sm text-muted-foreground">{specialist.specialty}</p>
                      </div>
                    </TableCell>
                    <TableCell>{specialist.branch}</TableCell>
                    <TableCell>{translateModel(specialist.contractModel, labels)}</TableCell>
                    <TableCell>{specialist.services}</TableCell>
                    <TableCell>{specialist.sessions}</TableCell>
                    <TableCell>
                      <Badge className={statusStyles[specialist.status]} variant="outline">
                        {translateStatus(specialist.status, labels)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
    </div>
  );
}

function SpecialistWorkTabs({
  labels,
  sessions,
  settlements,
  specialists,
}: {
  labels: (typeof specialistLabels)[Locale];
  sessions: SessionRow[];
  settlements: SettlementRow[];
  specialists: SpecialistRow[];
}) {
  return (
    <Card className="rounded-lg">
      <Tabs defaultValue="agenda" className="flex flex-col gap-0">
        <CardHeader className="border-b border-border pb-4">
          <TabsList className="grid h-auto w-full grid-cols-3 gap-2 bg-muted/60 p-1" aria-label={labels.filters}>
            <TabsTrigger value="agenda" className="h-9 min-w-0 border-border px-2">
              <CalendarClock className="size-4" aria-hidden="true" />
              <span className="truncate">{labels.timeline}</span>
            </TabsTrigger>
            <TabsTrigger value="liquidaciones" className="h-9 min-w-0 border-border px-2">
              <ReceiptText className="size-4" aria-hidden="true" />
              <span className="truncate">{labels.settlements}</span>
            </TabsTrigger>
            <TabsTrigger value="directorio" className="h-9 min-w-0 border-border px-2">
              <UsersRound className="size-4" aria-hidden="true" />
              <span className="truncate">{labels.directory}</span>
            </TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent className="w-full pt-5">
          <TabsContent value="agenda">
            <SessionTimeline labels={labels} sessions={sessions} />
          </TabsContent>
          <TabsContent value="liquidaciones">
            <SettlementsPanel labels={labels} settlements={settlements} />
          </TabsContent>
          <TabsContent value="directorio">
            <SpecialistDirectory labels={labels} specialists={specialists} />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}

export default async function SpecialistsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  const labels = specialistLabels[locale] ?? specialistLabels.es;
  const config = moduleConfigs.specialists;
  const context = await requireApiContext({ moduleId: "specialists" });
  const summary = await getModuleSummary("specialists", context);
  const baseWhere = { tenantId: context.tenantId, ...(context.branchId ? { branchId: context.branchId } : {}) };
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [specialists, sessions, settlements, payout, branches] = await Promise.all([
    prisma.specialist.findMany({
      where: { ...baseWhere },
      include: {
        branch: true,
        contracts: { where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" }, take: 1 },
        services: true,
        sessions: { where: { scheduledAt: { gte: today } } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.specialistSession.findMany({
      where: { ...baseWhere, scheduledAt: { gte: today } },
      include: { specialist: true, service: true, branch: true },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    }),
    prisma.specialistSettlement.findMany({
      where: { tenantId: context.tenantId, status: "DRAFT" },
      include: { specialist: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.specialistSettlement.aggregate({
      where: { tenantId: context.tenantId, status: "DRAFT" },
      _sum: { netPayout: true },
    }),
    prisma.branch.findMany({
      where: { tenantId: context.tenantId, ...(context.branchId ? { id: context.branchId } : {}) },
      orderBy: { name: "asc" },
    }),
  ]);

  const specialistRows: SpecialistRow[] = specialists.map((specialist) => ({
    id: specialist.id,
    name: specialist.name,
    specialty: specialist.specialty,
    type: specialist.type,
    status: specialist.status,
    branch: specialist.branch?.name ?? "Consolidado",
    contractModel: specialist.contracts[0]?.model ?? "UNASSIGNED",
    services: specialist.services.length,
    sessions: specialist.sessions.length,
  }));

  const sessionRows: SessionRow[] = sessions.map((session) => ({
    id: session.id,
    specialist: session.specialist.name,
    service: session.service.name,
    branch: session.branch.name,
    status: session.status,
    scheduledAt: session.scheduledAt,
    price: session.price.toString(),
  }));

  const settlementRows: SettlementRow[] = settlements.map((settlement) => ({
    id: settlement.id,
    specialist: settlement.specialist.name,
    grossAmount: settlement.grossAmount.toString(),
    rentAmount: settlement.rentAmount.toString(),
    commissionAmount: settlement.commissionAmount.toString(),
    netPayout: settlement.netPayout.toString(),
    status: settlement.status,
  }));

  const contractCounts = specialistRows.reduce<Record<SpecialistContractModel, number>>(
    (counts, specialist) => {
      if (specialist.contractModel !== "UNASSIGNED") {
        counts[specialist.contractModel] += 1;
      }
      return counts;
    },
    { FIXED_RENT: 0, COMMISSION: 0, HYBRID: 0 },
  );

  const estimatedPayout = payout._sum.netPayout?.toString() ?? String(numberValue(metricValue(summary, "settlements")) * 12500);
  const closeProgress = Math.min(100, Math.max(12, 100 - numberValue(metricValue(summary, "settlements")) * 12));
  const specialistOptions = specialists.map((specialist) => ({
    id: specialist.id,
    label: specialist.name,
  }));
  const serviceOptions = specialists.flatMap((specialist) =>
    specialist.services.map((service) => ({
      id: service.id,
      specialistId: specialist.id,
      label: `${service.name} · ${specialist.name}`,
      price: service.price.toString(),
    })),
  );
  const branchOptions = branches.map((branch) => ({
    id: branch.id,
    label: branch.name,
  }));

  return (
    <section className="erp-section space-y-5" role="main" aria-label={config.title[locale]}>
      <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-orange-500/25 bg-orange-500/10 text-orange-700 dark:text-orange-300">
                <Dumbbell className="size-3" aria-hidden="true" />
                {labels.eyebrow}
              </Badge>
              <Badge variant="outline">{labels.period}</Badge>
            </div>
            <div className="max-w-3xl space-y-2">
              <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
                {labels.title}
              </h1>
              <p className="text-sm leading-6 text-muted-foreground sm:text-base">{labels.subtitle}</p>
            </div>
            <div className="space-y-2">
              <SpecialistActionDialogs
                locale={locale}
                labels={labels}
                specialists={specialistOptions}
                services={serviceOptions}
                branches={branchOptions}
              />
              <p className="max-w-2xl text-xs leading-5 text-muted-foreground">{labels.sessionPurpose}</p>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">{labels.payout}</p>
                <p className="mt-1 text-3xl font-semibold tracking-normal text-foreground">
                  {moneyFromString(estimatedPayout)}
                </p>
              </div>
              <span className="inline-flex size-11 items-center justify-center rounded-md border border-emerald-500/25 bg-emerald-500/10 text-emerald-600">
                <HandCoins className="size-5" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{labels.readiness}</span>
                <span>{closeProgress}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted" aria-hidden="true">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${closeProgress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 min-[1080px]:grid-cols-[minmax(300px,0.72fr)_minmax(0,1.28fr)]">
        <ContractModelPanel labels={labels} counts={contractCounts} />
        <div className="grid gap-3 sm:grid-cols-2 min-[1080px]:grid-cols-2">
          <MetricTile
            label={labels.activeSpecialists}
            value={metricValue(summary, "specialists")}
            helper={config.subtitle[locale]}
            icon={UsersRound}
          />
          <MetricTile
            label={labels.todaySessions}
            value={metricValue(summary, "sessions")}
            helper={labels.timeline}
            icon={CalendarClock}
            tone="success"
          />
          <MetricTile
            label={labels.draftSettlements}
            value={metricValue(summary, "settlements")}
            helper={labels.pendingReview}
            icon={ReceiptText}
            tone={numberValue(metricValue(summary, "settlements")) > 0 ? "warning" : "default"}
          />
          <MetricTile
            label={labels.approved}
            value={`${closeProgress}%`}
            helper={labels.readiness}
            icon={CheckCircle2}
            tone="success"
          />
        </div>
      </div>

      <SpecialistWorkTabs
        labels={labels}
        sessions={sessionRows}
        settlements={settlementRows}
        specialists={specialistRows}
      />
    </section>
  );
}
