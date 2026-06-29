import { Clock, Filter } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/native-select";

export type HrAttendanceRow = {
  id: string;
  employee: string;
  branch: string;
  clockIn: string;
  clockOut: string;
  source: string;
  status: "OPEN" | "CLOSED";
};

export function AttendancePanel({ records }: { records: HrAttendanceRow[] }) {
  return (
    <Card className="rounded-lg">
      <CardHeader className="gap-4 border-b pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Asistencia</CardTitle>
            <p className="text-sm text-muted-foreground">Entradas, salidas y registros abiertos del dia.</p>
          </div>
          <div className="flex items-center gap-2">
            <NativeSelect aria-label="Filtro de asistencia" defaultValue="today" size="sm">
              <option value="today">Hoy</option>
              <option value="open">Abiertas</option>
              <option value="closed">Cerradas</option>
            </NativeSelect>
            <Button variant="outline" size="icon-sm" aria-label="Filtrar asistencia" disabled>
              <Filter />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {records.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Clock className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="font-medium text-foreground">Sin asistencias recientes</p>
            <p className="mt-1 text-sm text-muted-foreground">Los registros de entrada y salida apareceran aqui.</p>
          </div>
        ) : (
          <div className="divide-y">
            {records.map((record) => (
              <div key={record.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{record.employee}</p>
                    <Badge variant={record.status === "OPEN" ? "destructive" : "secondary"}>
                      {record.status === "OPEN" ? "Abierta" : "Cerrada"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{record.branch} · {record.source}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm sm:min-w-56">
                  <div>
                    <p className="text-xs text-muted-foreground">Entrada</p>
                    <p className="font-medium">{record.clockIn}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Salida</p>
                    <p className="font-medium">{record.clockOut}</p>
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
