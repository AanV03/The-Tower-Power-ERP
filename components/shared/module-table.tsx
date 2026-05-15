import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ModuleRow } from "@/data/modules";
import type { Locale } from "@/lib/i18n";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableSkeleton } from "@/components/skeletons";
import { NoDataEmpty } from "@/components/empty-state";

export function ModuleTable({
  rows,
  locale,
  isLoading = false,
}: {
  rows: ModuleRow[];
  locale: Locale;
  isLoading?: boolean;
}) {
  const labels = {
    es: {
      title: "Actividad reciente",
      description: "Eventos operativos listos para conectarse a APIs futuras.",
      item: "Concepto",
      branch: "Sucursal",
      status: "Estado",
      amount: "Valor",
      owner: "Responsable",
      noData: "Sin actividad reciente",
      noDataDesc: "No hay eventos para mostrar.",
    },
    en: {
      title: "Recent activity",
      description: "Operational events ready to connect to future APIs.",
      item: "Item",
      branch: "Branch",
      status: "Status",
      amount: "Value",
      owner: "Owner",
      noData: "No recent activity",
      noDataDesc: "There are no events to show.",
    },
    fr: {
      title: "Activité récente",
      description: "Événements opérationnels prêts à se connecter aux API futures.",
      item: "Élément",
      branch: "Succursale",
      status: "Statut",
      amount: "Valeur",
      owner: "Responsable",
      noData: "Pas d'activité récente",
      noDataDesc: "Il n'y a pas d'événements à afficher.",
    },
  }[locale];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{labels.title}</CardTitle>
          <CardDescription>{labels.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <TableSkeleton rows={5} columns={5} />
        </CardContent>
      </Card>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{labels.title}</CardTitle>
          <CardDescription>{labels.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <NoDataEmpty title={labels.noData} description={labels.noDataDesc} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.title}</CardTitle>
        <CardDescription>{labels.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead aria-sort="none">{labels.item}</TableHead>
                <TableHead aria-sort="none">{labels.branch}</TableHead>
                <TableHead aria-sort="none">{labels.status}</TableHead>
                <TableHead aria-sort="none">{labels.amount}</TableHead>
                <TableHead aria-sort="none">{labels.owner}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, idx) => (
                <TableRow 
                  key={`${row.name}-${row.branch}-${idx}`}
                  className="focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.branch}</TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} locale={locale} />
                  </TableCell>
                  <TableCell>{row.amount}</TableCell>
                  <TableCell className="text-muted-foreground">{row.owner}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
