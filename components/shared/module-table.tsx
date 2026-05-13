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

export function ModuleTable({
  rows,
  locale,
}: {
  rows: ModuleRow[];
  locale: Locale;
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
    },
    en: {
      title: "Recent activity",
      description: "Operational events ready to connect to future APIs.",
      item: "Item",
      branch: "Branch",
      status: "Status",
      amount: "Value",
      owner: "Owner",
    },
  }[locale];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.title}</CardTitle>
        <CardDescription>{labels.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{labels.item}</TableHead>
              <TableHead>{labels.branch}</TableHead>
              <TableHead>{labels.status}</TableHead>
              <TableHead>{labels.amount}</TableHead>
              <TableHead>{labels.owner}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={`${row.name}-${row.branch}`}>
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
      </CardContent>
    </Card>
  );
}
