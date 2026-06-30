"use client";

import { useMemo, useState, useEffect } from "react";
import { Plus, Search, UsersRound, Clock, FileText, CalendarClock, Edit, AlertTriangle } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { headerPrimaryActionClass } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricCard } from "@/components/shared/metric-card";
import { BranchScopeSelector } from "@/components/shared/branch-scope-selector";

import { EmployeeTable, type HrEmployeeRow } from "@/components/modules/hr/employee-table";
import { AttendancePanel, type HrAttendanceRow } from "@/components/modules/hr/attendance-panel";
import { ContractSummary, type HrContractRow } from "@/components/modules/hr/contract-summary";
import { EmployeeFormDialog } from "@/components/modules/hr/employee-form-dialog";
import { HrExportButton } from "@/components/modules/hr/hr-export-button";
import { TimeClockDialog, type TimeClockEmployeeOption } from "@/components/modules/hr/time-clock-dialog";

const hrLabels = {
  es: {
    title: "RH y asistencia",
    subtitle: "Plantilla, contratos y asistencia diaria con una vista operativa para sucursales.",
    employeesTab: "Empleados",
    attendanceTab: "Asistencia",
    contractsTab: "Contratos",
    searchPlaceholder: "Buscar...",
    addEmployee: "Alta empleado",
    registerAttendance: "Asistencia",
    exportHr: "Exportar RH",
    activeStaff: "Personal activo",
    presentToday: "Presentes hoy",
    incidents: "Incidencias",
    openAttendances: "Asistencias abiertas",
    employee: "Empleado",
    position: "Puesto",
    contract: "Contrato",
    status: "Estado",
    lastAttendance: "Último registro",
    clockIn: "Entrada",
    clockOut: "Salida",
    compensation: "Compensación",
    startDate: "Fecha de inicio",
    actions: "Acciones",
    edit: "Editar",
    previous: "Anterior",
    next: "Siguiente",
    pageOf: "Página {page} de {total}",
    emptyEmployees: "Sin empleados registrados.",
    emptyAttendance: "Sin asistencias recientes.",
    emptyContracts: "Sin contratos visibles.",
    active: "Activo",
    inactive: "Inactivo",
    branch: "Sucursal",
  },
  en: {
    title: "HR & Attendance",
    subtitle: "Staff directory, contracts, and daily attendance with an operational branch view.",
    employeesTab: "Employees",
    attendanceTab: "Attendance",
    contractsTab: "Contracts",
    searchPlaceholder: "Search...",
    addEmployee: "Add Employee",
    registerAttendance: "Attendance",
    exportHr: "Export HR",
    activeStaff: "Active Staff",
    presentToday: "Present Today",
    incidents: "Incidents",
    openAttendances: "Open Attendances",
    employee: "Employee",
    position: "Position",
    contract: "Contract",
    status: "Status",
    lastAttendance: "Last Attendance",
    clockIn: "Clock In",
    clockOut: "Clock Out",
    compensation: "Compensation",
    startDate: "Start Date",
    actions: "Actions",
    edit: "Edit",
    previous: "Previous",
    next: "Next",
    pageOf: "Page {page} of {total}",
    emptyEmployees: "No registered employees.",
    emptyAttendance: "No recent attendance records.",
    emptyContracts: "No contracts found.",
    active: "Active",
    inactive: "Inactive",
    branch: "Branch",
  },
  fr: {
    title: "RH & Présences",
    subtitle: "Répertoire du personnel, contrats et présences quotidiennes avec vue opérationnelle.",
    employeesTab: "Employés",
    attendanceTab: "Présence",
    contractsTab: "Contrats",
    searchPlaceholder: "Rechercher...",
    addEmployee: "Ajouter employé",
    registerAttendance: "Présence",
    exportHr: "Exporter RH",
    activeStaff: "Personnel actif",
    presentToday: "Présents aujourd'hui",
    incidents: "Incidents",
    openAttendances: "Présences ouvertes",
    employee: "Employé",
    position: "Poste",
    contract: "Contrat",
    status: "Statut",
    lastAttendance: "Dernière présence",
    clockIn: "Entrée",
    clockOut: "Sortie",
    compensation: "Rémunération",
    startDate: "Date de début",
    actions: "Actions",
    edit: "Modifier",
    previous: "Précédent",
    next: "Suivant",
    pageOf: "Page {page} sur {total}",
    emptyEmployees: "Aucun employé enregistré.",
    emptyAttendance: "Aucun enregistrement de présence récent.",
    emptyContracts: "Aucun contrat visible.",
    active: "Actif",
    inactive: "Inactif",
    branch: "Succursale",
  }
};

const employeeStatusStyles: Record<string, string> = {
  ACTIVE: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  INACTIVE: "border-muted bg-muted text-muted-foreground",
};

const contractStatusStyles: Record<string, string> = {
  VIGENTE: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  VENCIDO: "border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300",
  SIN_CONTRATO: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
};

export function HrClient({
  locale,
  initialEmployees,
  initialAttendances,
  initialContracts,
  timeClockEmployees,
  metrics,
}: {
  locale: Locale;
  initialEmployees: HrEmployeeRow[];
  initialAttendances: HrAttendanceRow[];
  initialContracts: HrContractRow[];
  timeClockEmployees: TimeClockEmployeeOption[];
  metrics: {
    activeEmployees: number;
    attendanceToday: number;
    openAttendance: number;
  };
}) {
  const t = hrLabels[locale] ?? hrLabels.es;

  // Search & Navigation States
  const [activeTab, setActiveTab] = useState("employees");
  const [searchQuery, setSearchQuery] = useState("");

  // Mobile Pagination states
  const [employeePage, setEmployeePage] = useState(1);
  const [attendancePage, setAttendancePage] = useState(1);
  const [contractPage, setContractPage] = useState(1);

  // Reset pagination on search query or active tab change
  useEffect(() => {
    setEmployeePage(1);
    setAttendancePage(1);
    setContractPage(1);
  }, [searchQuery, activeTab]);

  // Filters based on search
  const filteredEmployees = useMemo(() => {
    return initialEmployees.filter(
      (e) =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.position.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [initialEmployees, searchQuery]);

  const filteredAttendances = useMemo(() => {
    return initialAttendances.filter(
      (a) =>
        a.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.source.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [initialAttendances, searchQuery]);

  const filteredContracts = useMemo(() => {
    return initialContracts.filter(
      (c) =>
        c.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [initialContracts, searchQuery]);

  // Mobile Pagination calculations
  const ITEMS_PER_PAGE = 5;

  const totalEmployeePages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const paginatedEmployees = useMemo(() => {
    const startIndex = (employeePage - 1) * ITEMS_PER_PAGE;
    return filteredEmployees.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredEmployees, employeePage]);

  const totalAttendancePages = Math.ceil(filteredAttendances.length / ITEMS_PER_PAGE);
  const paginatedAttendances = useMemo(() => {
    const startIndex = (attendancePage - 1) * ITEMS_PER_PAGE;
    return filteredAttendances.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAttendances, attendancePage]);

  const totalContractPages = Math.ceil(filteredContracts.length / ITEMS_PER_PAGE);
  const paginatedContracts = useMemo(() => {
    const startIndex = (contractPage - 1) * ITEMS_PER_PAGE;
    return filteredContracts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredContracts, contractPage]);

  return (
    <section className="erp-section space-y-6" role="main" aria-label={t.title}>
      {/* Title & Action Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground"><UsersRound className="size-7 text-primary" aria-hidden="true" />{t.title}</h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            {t.subtitle}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <BranchScopeSelector locale={locale} />
          <div className="flex gap-2">
            <EmployeeFormDialog
              trigger={
                <Button size="sm" className={headerPrimaryActionClass}>
                  <Plus className="mr-1.5 size-4" />
                  {t.addEmployee}
                </Button>
              }
            />
            <TimeClockDialog
              employees={timeClockEmployees}
              trigger={
                <Button size="sm" variant="outline">
                  <Clock className="size-4" />
                  {t.registerAttendance}
                </Button>
              }
            />
            <HrExportButton employees={initialEmployees} attendance={initialAttendances} contracts={initialContracts} />
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="erp-page-grid">
        <MetricCard label={t.activeStaff} value={String(metrics.activeEmployees)} change="Actual" locale={locale} />
        <MetricCard label={t.presentToday} value={String(metrics.attendanceToday)} change="Hoy" tone="success" locale={locale} />
        <MetricCard label={t.incidents} value={String(metrics.openAttendance)} change="Abiertas" tone={metrics.openAttendance > 0 ? "warning" : "success"} locale={locale} />
        <MetricCard label={t.openAttendances} value={String(metrics.openAttendance)} change="Clock" tone={metrics.openAttendance > 0 ? "warning" : "default"} locale={locale} />
      </div>

      {/* Main Tabs Layout */}
      <Card className="rounded-lg">
        <Tabs value={activeTab} onValueChange={(next) => { setActiveTab(next); setSearchQuery(""); }} className="flex flex-col gap-0">
          <div className="border-b border-border pb-4 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <TabsList className="w-full grid grid-cols-1 sm:grid-cols-3 !h-auto sm:!h-10 bg-muted/60 p-1 rounded-lg border gap-1 sm:gap-0">
              <TabsTrigger value="employees" className="text-xs sm:text-sm font-semibold w-full !h-9 sm:!h-full py-2 sm:py-0 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer">
                <UsersRound className="size-4 mr-1.5" />
                <span>{t.employeesTab}</span>
              </TabsTrigger>
              <TabsTrigger value="attendance" className="text-xs sm:text-sm font-semibold w-full !h-9 sm:!h-full py-2 sm:py-0 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer">
                <Clock className="size-4 mr-1.5" />
                <span>{t.attendanceTab}</span>
              </TabsTrigger>
              <TabsTrigger value="contracts" className="text-xs sm:text-sm font-semibold w-full !h-9 sm:!h-full py-2 sm:py-0 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer">
                <FileText className="size-4 mr-1.5" />
                <span>{t.contractsTab}</span>
              </TabsTrigger>
            </TabsList>

            {/* Quick Actions Search */}
            <div className="w-full sm:w-auto flex items-center gap-3">
              <div className="relative w-full sm:w-60">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-8 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Tab Contents */}
          <div className="p-4 pt-0">
            {/* Employees Tab */}
            <TabsContent value="employees">
              {filteredEmployees.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground border border-dashed rounded-md">
                  {t.emptyEmployees}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Desktop View Table */}
                  <div className="hidden md:block">
                    <EmployeeTable employees={filteredEmployees} />
                  </div>

                  {/* Mobile View: Grid of cards */}
                  <div className="grid grid-cols-1 gap-4 md:hidden">
                    {paginatedEmployees.map((e) => (
                      <div key={e.id} className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="min-w-0">
                            <p className="font-bold text-foreground text-sm truncate">{e.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{e.email}</p>
                          </div>
                          <Badge className={employeeStatusStyles[e.status]} variant="outline">
                            {e.status === "ACTIVE" ? t.active : t.inactive}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{t.position}</p>
                            <p className="font-medium text-foreground mt-0.5 break-all">{e.position}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{t.contract}</p>
                            <p className="font-medium text-foreground mt-0.5">{e.contract}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{t.branch}</p>
                            <p className="font-medium text-foreground mt-0.5">{e.branch}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{t.lastAttendance}</p>
                            <p className="font-medium text-foreground mt-0.5">{e.lastAttendance}</p>
                          </div>
                        </div>
                        <div className="flex justify-end pt-1">
                          <EmployeeFormDialog
                            employee={e}
                            mode="edit"
                            trigger={
                              <Button variant="outline" size="sm" className="h-7 text-xs px-3">
                                <Edit className="size-3 mr-1" />
                                {t.edit}
                              </Button>
                            }
                          />
                        </div>
                      </div>
                    ))}

                    {/* Pagination controls */}
                    {totalEmployeePages > 1 && (
                      <div className="flex items-center justify-between pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={employeePage === 1}
                          onClick={() => setEmployeePage((p) => Math.max(1, p - 1))}
                          className="text-xs text-foreground cursor-pointer"
                        >
                          {t.previous}
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          {t.pageOf.replace("{page}", String(employeePage)).replace("{total}", String(totalEmployeePages))}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={employeePage === totalEmployeePages}
                          onClick={() => setEmployeePage((p) => Math.min(totalEmployeePages, p + 1))}
                          className="text-xs text-foreground cursor-pointer"
                        >
                          {t.next}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Attendance Tab */}
            <TabsContent value="attendance">
              {filteredAttendances.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground border border-dashed rounded-md">
                  {t.emptyAttendance}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Desktop View Panel */}
                  <div className="hidden md:block">
                    <AttendancePanel records={filteredAttendances} />
                  </div>

                  {/* Mobile View: Grid of cards */}
                  <div className="grid grid-cols-1 gap-4 md:hidden">
                    {paginatedAttendances.map((a) => (
                      <div key={a.id} className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-foreground">{a.employee}</span>
                          <Badge variant={a.status === "OPEN" ? "destructive" : "secondary"}>
                            {a.status === "OPEN" ? "Abierta" : "Cerrada"}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <p>{a.branch} · {a.source}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{t.clockIn}</p>
                            <p className="font-medium text-foreground mt-0.5">{a.clockIn}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{t.clockOut}</p>
                            <p className="font-medium text-foreground mt-0.5">{a.clockOut}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Pagination controls */}
                    {totalAttendancePages > 1 && (
                      <div className="flex items-center justify-between pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={attendancePage === 1}
                          onClick={() => setAttendancePage((p) => Math.max(1, p - 1))}
                          className="text-xs text-foreground cursor-pointer"
                        >
                          {t.previous}
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          {t.pageOf.replace("{page}", String(attendancePage)).replace("{total}", String(totalAttendancePages))}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={attendancePage === totalAttendancePages}
                          onClick={() => setAttendancePage((p) => Math.min(totalAttendancePages, p + 1))}
                          className="text-xs text-foreground cursor-pointer"
                        >
                          {t.next}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Contracts Tab */}
            <TabsContent value="contracts">
              {filteredContracts.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground border border-dashed rounded-md">
                  {t.emptyContracts}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Desktop View Table */}
                  <div className="hidden md:block">
                    <ContractSummary contracts={filteredContracts} />
                  </div>

                  {/* Mobile View: Grid of cards */}
                  <div className="grid grid-cols-1 gap-4 md:hidden">
                    {paginatedContracts.map((c) => (
                      <div key={c.id} className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="min-w-0">
                            <p className="font-bold text-foreground text-sm truncate">{c.employee}</p>
                            <p className="text-xs text-muted-foreground truncate">{c.type}</p>
                          </div>
                          <Badge
                            className={contractStatusStyles[c.status]}
                            variant="outline"
                          >
                            {c.status !== "VIGENTE" && <AlertTriangle className="size-3 mr-1 inline shrink-0" />}
                            {c.status === "VIGENTE" ? "Vigente" : c.status === "VENCIDO" ? "Vencido" : "Sin contrato"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{t.compensation}</p>
                            <p className="font-bold text-foreground mt-0.5">{c.compensation}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{t.startDate}</p>
                            <p className="font-medium text-foreground mt-0.5">{c.startDate}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Pagination controls */}
                    {totalContractPages > 1 && (
                      <div className="flex items-center justify-between pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={contractPage === 1}
                          onClick={() => setContractPage((p) => Math.max(1, p - 1))}
                          className="text-xs text-foreground cursor-pointer"
                        >
                          {t.previous}
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          {t.pageOf.replace("{page}", String(contractPage)).replace("{total}", String(totalContractPages))}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={contractPage === totalContractPages}
                          onClick={() => setContractPage((p) => Math.min(totalContractPages, p + 1))}
                          className="text-xs text-foreground cursor-pointer"
                        >
                          {t.next}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </Card>

      <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        <CalendarClock className="size-4 shrink-0" />
        <span>Acciones de captura y exportación preparadas para integrarse con endpoints operativos.</span>
      </div>
    </section>
  );
}
