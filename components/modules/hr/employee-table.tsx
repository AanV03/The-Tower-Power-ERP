"use client";

import { useMemo, useState } from "react";
import { Edit, MoreHorizontal, Search } from "lucide-react";

import { EmployeeFormDialog } from "@/components/modules/hr/employee-form-dialog";
import {
  EMPLOYEE_TABLE_COLUMNS,
  HR_POSITION_OPTIONS,
  type EmployeeTableColumn,
  type HrSelectOption,
} from "@/components/modules/hr/hr-config";
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
  phone: string;
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

type StatusFilter = "ALL" | HrEmployeeRow["status"];

function isStatusFilter(value: string): value is StatusFilter {
  return value === "ALL" || value === "ACTIVE" || value === "INACTIVE";
}

export function EmployeeTable({
  employees,
  columns = EMPLOYEE_TABLE_COLUMNS,
  positionOptions = HR_POSITION_OPTIONS,
}: {
  employees: HrEmployeeRow[];
  columns?: EmployeeTableColumn[];
  positionOptions?: HrSelectOption[];
}) {
  const [editingEmployee, setEditingEmployee] = useState<HrEmployeeRow | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const filteredEmployees = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesStatus = statusFilter === "ALL" || employee.status === statusFilter;
      const matchesSearch =
        normalizedQuery.length === 0 ||
        [employee.name, employee.email, employee.phone, employee.position, employee.branch]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery));

      return matchesStatus && matchesSearch;
    });
  }, [employees, searchQuery, statusFilter]);

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
              <Input
                className="pl-8"
                placeholder="Buscar empleado"
                aria-label="Buscar empleado"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            <div className="hidden w-36 sm:block">
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  if (value && isStatusFilter(value)) setStatusFilter(value);
                }}
              >
                <StandardSelectTrigger aria-label="Filtrar estado">
                  <StandardSelectValue placeholder="Estado" />
                </StandardSelectTrigger>
                <StandardSelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="ACTIVE">Activos</SelectItem>
                  <SelectItem value="INACTIVE">Inactivos</SelectItem>
                </StandardSelectContent>
              </Select>
            </div>
            <Button variant="outline" size="icon-sm" aria-label="Mas filtros" disabled>
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
        ) : filteredEmployees.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-medium text-foreground">Sin resultados</p>
            <p className="mt-1 text-sm text-muted-foreground">Ajusta la busqueda o el filtro de estado.</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead key={column.key} className={column.className}>
                        {column.label}
                      </TableHead>
                    ))}
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      {columns.map((column) => (
                        <TableCell key={column.key}>
                          {column.key === "name" ? (
                            <div>
                              <p className="font-medium text-foreground">{employee.name}</p>
                              <p className="text-xs text-muted-foreground">{employee.email}</p>
                            </div>
                          ) : column.key === "status" ? (
                            <Badge variant={employee.status === "ACTIVE" ? "secondary" : "outline"}>
                              {statusLabel[employee.status]}
                            </Badge>
                          ) : (
                            employee[column.key]
                          )}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Select value={null} onValueChange={(action) => handleEmployeeAction(action, employee)}>
                          <StandardSelectTrigger className="h-8 w-32" aria-label={`Opciones de ${employee.name}`}>
                            <StandardSelectValue placeholder="Opciones" />
                          </StandardSelectTrigger>
                          <StandardSelectContent align="end">
                            <SelectItem value="edit">
                              <Edit />
                              Editar
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
              {filteredEmployees.map((employee) => (
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
                      <p className="text-xs text-muted-foreground">Telefono</p>
                      <p className="truncate">{employee.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Sucursal</p>
                      <p className="truncate">{employee.branch}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Contrato</p>
                      <p className="truncate">{employee.contract}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ultimo registro</p>
                      <p>{employee.lastAttendance}</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <EmployeeFormDialog
                      employee={employee}
                      mode="edit"
                      positionOptions={positionOptions}
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
      positionOptions={positionOptions}
      open={Boolean(editingEmployee)}
      onOpenChange={(open) => {
        if (!open) setEditingEmployee(null);
      }}
    />
    </>
  );
}
