import { CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type PayrollPeriodRow = {
  id: string;
  label: string;
  range: string;
  status: "DRAFT" | "APPROVED" | "PAID";
  employees: number;
  net: string;
};

const statusText = {
  DRAFT: "Borrador",
  APPROVED: "Aprobado",
  PAID: "Pagado",
};

export function PayrollPeriods({ periods, activePeriodId }: { periods: PayrollPeriodRow[]; activePeriodId?: string }) {
  return (
    <Card className="rounded-lg">
      <CardHeader className="border-b pb-4">
        <CardTitle>Periodos</CardTitle>
        <p className="text-sm text-muted-foreground">Ciclos recientes y estado operativo.</p>
      </CardHeader>
      <CardContent className="p-0">
        {periods.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <CalendarDays className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="font-medium text-foreground">Sin periodos creados</p>
            <p className="mt-1 text-sm text-muted-foreground">Crea un periodo para preparar la nomina.</p>
          </div>
        ) : (
          <div className="divide-y">
            {periods.map((period) => (
              <div
                key={period.id}
                className={period.id === activePeriodId ? "bg-muted/60 p-4" : "p-4"}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{period.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{period.range}</p>
                  </div>
                  <Badge variant={period.status === "PAID" ? "secondary" : period.status === "APPROVED" ? "outline" : "destructive"}>
                    {statusText[period.status]}
                  </Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Empleados</p>
                    <p className="font-medium">{period.employees}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Neto</p>
                    <p className="font-medium">{period.net}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
