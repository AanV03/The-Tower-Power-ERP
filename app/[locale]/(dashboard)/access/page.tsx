import { requireApiContext } from "@/lib/api/context";
import { prisma } from "@/lib/db/prisma";
import type { Locale } from "@/lib/i18n";
import { moduleConfigs } from "@/data/modules";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, Laptop, ShieldCheck, RefreshCw } from "lucide-react";
import Link from "next/link";

const accessLabels = {
  es: {
    title: "Control de Acceso",
    subtitle: "Gestión de hardware de acceso físico y telemetrías de torniquetes por sucursal.",
    statsHeader: "Estado de Dispositivos",
    totalDevices: "Total de Dispositivos",
    devicesOnline: "Lectores Online",
    devicesOffline: "Lectores Offline",
    simulatorPrompt: "Simular escaneo de accesos",
    simulatorDesc: "Dado que no dispones de hardware físico conectado, puedes usar nuestro simulador interactivo.",
    goToSimulator: "Abrir Simulador de Molinete",
    tableName: "Dispositivo",
    tableCode: "Código de Identificación",
    tableType: "Tipo de Entrada",
    tableStatus: "Estado Operativo",
    active: "En Línea",
    offline: "Fuera de Línea",
    maintenance: "Mantenimiento",
  },
  en: {
    title: "Access Control",
    subtitle: "Management of physical access hardware and turnstile telemetries by branch.",
    statsHeader: "Device Status Overview",
    totalDevices: "Total Devices",
    devicesOnline: "Readers Online",
    devicesOffline: "Readers Offline",
    simulatorPrompt: "Simulate Access Scans",
    simulatorDesc: "Since you do not have physical hardware connected, you can use our interactive scanner simulator.",
    goToSimulator: "Open Turnstile Simulator",
    tableName: "Device Name",
    tableCode: "Identification Code",
    tableType: "Entry Type",
    tableStatus: "Operational Status",
    active: "Online",
    offline: "Offline",
    maintenance: "Maintenance",
  },
  fr: {
    title: "Contrôle d'Accès",
    subtitle: "Gestion du matériel d'accès physique et télémétries des molinets par succursale.",
    statsHeader: "Statut des Dispositifs",
    totalDevices: "Total des Dispositifs",
    devicesOnline: "Lecteurs En Ligne",
    devicesOffline: "Lecteurs Hors Ligne",
    simulatorPrompt: "Simuler les Scans d'Accès",
    simulatorDesc: "Puisque vous n'avez pas de matériel physique connecté, vous pouvez utiliser notre simulateur de scanneur.",
    goToSimulator: "Ouvrir le Simulateur de Molinete",
    tableName: "Nom du Dispositif",
    tableCode: "Code d'Identification",
    tableType: "Type d'Entrée",
    tableStatus: "Statut Opérationnel",
    active: "En Ligne",
    offline: "Hors Ligne",
    maintenance: "Maintenance",
  }
};

const statusStyles: Record<string, string> = {
  ONLINE: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  OFFLINE: "border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300",
  MAINTENANCE: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
};

export default async function AccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  const t = accessLabels[locale] ?? accessLabels.es;

  const context = await requireApiContext({ moduleId: "access" });

  const devices = await prisma.accessDevice.findMany({
    where: {
      tenantId: context.tenantId,
      branchId: context.branchId ?? undefined,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalCount = devices.length;
  const onlineCount = devices.filter((d) => d.status === "ONLINE").length;
  const offlineCount = totalCount - onlineCount;

  return (
    <section className="erp-section space-y-6" role="main" aria-label={t.title}>
      {/* Title Block */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-normal text-foreground">{t.title}</h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* Overview stats and prompt */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.totalDevices}</p>
          <p className="text-2xl font-bold tracking-tight text-foreground mt-1">{totalCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-300">{t.devicesOnline}</p>
          <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-300 mt-1">{onlineCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-300">{t.devicesOffline}</p>
          <p className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-300 mt-1">{offlineCount}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        {/* Devices List Table */}
        <Card className="rounded-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Activity className="size-4 text-muted-foreground" />
              {t.statsHeader}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {devices.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground border border-dashed rounded-md">
                No hay dispositivos registrados en esta sucursal.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.tableName}</TableHead>
                    <TableHead>{t.tableCode}</TableHead>
                    <TableHead>{t.tableType}</TableHead>
                    <TableHead>{t.tableStatus}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="font-semibold text-foreground">{device.name}</TableCell>
                      <TableCell className="font-mono text-xs">{device.code}</TableCell>
                      <TableCell className="text-xs">{device.type}</TableCell>
                      <TableCell>
                        <Badge className={statusStyles[device.status]} variant="outline">
                          {device.status === "ONLINE" ? t.active : device.status === "OFFLINE" ? t.offline : t.maintenance}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Simulator CTA panel */}
        <aside className="space-y-4">
          <Card className="rounded-lg border-orange-500/20 bg-orange-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Laptop className="size-4 text-orange-600" />
                {t.simulatorPrompt}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs leading-5 text-muted-foreground">
                {t.simulatorDesc}
              </p>
              <Link href={`/${locale}/memberships`} className="inline-flex w-full items-center justify-center rounded-md bg-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/90 text-white font-semibold text-xs py-2 px-3 transition-colors shadow-sm">
                <ShieldCheck className="size-3.5 mr-1.5" />
                {t.goToSimulator}
              </Link>
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  );
}
