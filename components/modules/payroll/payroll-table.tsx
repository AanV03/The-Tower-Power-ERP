import { FileText, MoreHorizontal, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type PayrollItemRow = {
  id: string;
  employee: string;
  position: string;
  base: string;
  overtime: string;
  commissions: string;
  deductions: string;
  net: string;
  status: "DRAFT" | "APPROVED" | "PAID";
};

export function PayrollTable({ items }: { items: PayrollItemRow[] }) {
  return (
    <Card className="rounded-lg">
      <CardHeader className="gap-4 border-b pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Recibos del periodo</CardTitle>
            <p className="text-sm text-muted-foreground">Base, variables, deducciones y neto por empleado.</p>
          </div>
          <div className="relative min-w-0 sm:w-72">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-8" placeholder="Buscar empleado" aria-label="Buscar recibo por empleado" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FileText className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="font-medium text-foreground">Sin recibos en el periodo</p>
            <p className="mt-1 text-sm text-muted-foreground">Genera una vista previa para incluir empleados.</p>
          </div>
        ) : (
          <>
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead className="text-right">Base</TableHead>
                    <TableHead className="text-right">Horas extra</TableHead>
                    <TableHead className="text-right">Comisiones</TableHead>
                    <TableHead className="text-right">Deducciones</TableHead>
                    <TableHead className="text-right">Neto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{item.employee}</p>
                          <p className="text-xs text-muted-foreground">{item.position}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{item.base}</TableCell>
                      <TableCell className="text-right">{item.overtime}</TableCell>
                      <TableCell className="text-right">{item.commissions}</TableCell>
                      <TableCell className="text-right">{item.deductions}</TableCell>
                      <TableCell className="text-right font-medium">{item.net}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === "PAID" ? "secondary" : item.status === "APPROVED" ? "outline" : "destructive"}>
                          {item.status === "PAID" ? "Pagado" : item.status === "APPROVED" ? "Aprobado" : "Borrador"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon-sm" aria-label={`Acciones de recibo de ${item.employee}`}>
                          <MoreHorizontal />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="divide-y lg:hidden">
              {items.map((item) => (
                <div key={item.id} className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{item.employee}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.position}</p>
                    </div>
                    <Badge variant={item.status === "PAID" ? "secondary" : item.status === "APPROVED" ? "outline" : "destructive"}>
                      {item.status === "PAID" ? "Pagado" : item.status === "APPROVED" ? "Aprobado" : "Borrador"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-xs text-muted-foreground">Base</p><p>{item.base}</p></div>
                    <div><p className="text-xs text-muted-foreground">Horas extra</p><p>{item.overtime}</p></div>
                    <div><p className="text-xs text-muted-foreground">Comisiones</p><p>{item.commissions}</p></div>
                    <div><p className="text-xs text-muted-foreground">Deducciones</p><p>{item.deductions}</p></div>
                    <div className="col-span-2"><p className="text-xs text-muted-foreground">Neto</p><p className="font-medium">{item.net}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
