"use client";

import { useState } from "react";
import { Edit, Eye, MoreHorizontal, Search, UserX } from "lucide-react";

import { EmployeeFormDialog } from "@/components/modules/hr/employee-form-dialog";
import {
  StandardSelectContent,
  StandardSelectTrigger,
  StandardSelectValue,
} from "@/components/shared/standard-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type HrEmployeeRow = {
  id: string;
  name: string;
  email: string;
  position: string;
  branch: string;
  contract: string;
  status: "ACTIVE" | "INACTIVE";
  lastAttendance: string;
};

const statusLabel = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
};

export function EmployeeTable({ employees }: { employees: HrEmployeeRow[] }) {
  const [editingEmployee, setEditingEmployee] = useState<HrEmployeeRow | null>(null);

  function handleEmployeeAction(action: string | null, employee: HrEmployeeRow) {
    if (action === "edit") {
      setEditingEmployee(employee);
    }
  }

  return (
    <>
    <Card className="rounded-lg">
      <CardHeader className="gap-4 border-b pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Empleados</CardTitle>
            <p className="text-sm text-muted-foreground">Plantilla, puesto, contrato y ultimo registro.</p>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <div className="relative min-w-0 flex-1 sm:w-64">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-8" placeholder="Buscar empleado" aria-label="Buscar empleado" />
            </div>
            <div className="hidden w-36 sm:block">
              <Select defaultValue="all">
                <StandardSelectTrigger aria-label="Filtrar estado">
                  <StandardSelectValue placeholder="Estado" />
                </StandardSelectTrigger>
                <StandardSelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ACTIVE">Activos</SelectItem>
                  <SelectItem value="INACTIVE">Inactivos</SelectItem>
                </StandardSelectContent>
              </Select>
            </div>
            <Button variant="outline" size="icon-sm" aria-label="Mas filtros">
              <MoreHorizontal />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {employees.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-medium text-foreground">Sin empleados registrados</p>
            <p className="mt-1 text-sm text-muted-foreground">La plantilla aparecera aqui cuando exista informacion.</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Puesto</TableHead>
                    <TableHead>Sucursal</TableHead>
                    <TableHead>Contrato</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Ultimo registro</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{employee.name}</p>
                          <p className="text-xs text-muted-foreground">{employee.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>{employee.branch}</TableCell>
                      <TableCell>{employee.contract}</TableCell>
                      <TableCell>
                        <Badge variant={employee.status === "ACTIVE" ? "secondary" : "outline"}>
                          {statusLabel[employee.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>{employee.lastAttendance}</TableCell>
                      <TableCell>
                        <Select value={null} onValueChange={(action) => handleEmployeeAction(action, employee)}>
                          <StandardSelectTrigger className="h-8 w-32" aria-label={`Opciones de ${employee.name}`}>
                            <StandardSelectValue placeholder="Opciones" />
                          </StandardSelectTrigger>
                          <StandardSelectContent align="end">
                            <SelectItem value="view">
                              <Eye />
                              Ver expediente
                            </SelectItem>
                            <SelectItem value="edit">
                              <Edit />
                              Editar
                            </SelectItem>
                            <SelectItem value="deactivate">
                              <UserX />
                              Desactivar
                            </SelectItem>
                          </StandardSelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="divide-y md:hidden">
              {employees.map((employee) => (
                <div key={employee.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{employee.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{employee.position}</p>
                    </div>
                    <Badge variant={employee.status === "ACTIVE" ? "secondary" : "outline"}>
                      {statusLabel[employee.status]}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Sucursal</p>
                      <p className="truncate">{employee.branch}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Contrato</p>
                      <p className="truncate">{employee.contract}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Ultimo registro</p>
                      <p>{employee.lastAttendance}</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <EmployeeFormDialog
                      employee={employee}
                      mode="edit"
                      trigger={
                        <Button variant="outline" size="sm">
                          <Edit />
                          Editar
                        </Button>
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
    <EmployeeFormDialog
      employee={editingEmployee ?? undefined}
      mode="edit"
      open={Boolean(editingEmployee)}
      onOpenChange={(open) => {
        if (!open) setEditingEmployee(null);
      }}
    />
    </>
  );
}
