"use client"

import type React from "react"
import { useId } from "react"
import { Edit, Plus } from "lucide-react"

import type { HrEmployeeRow } from "@/components/modules/hr/employee-table"
import {
  StandardDialogContent,
  StandardDialogDescription,
  StandardDialogFooter,
  StandardDialogHeader,
  StandardDialogTitle,
} from "@/components/shared/standard-dialog"
import {
  StandardSelectContent,
  StandardSelectTrigger,
  StandardSelectValue,
} from "@/components/shared/standard-select"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectItem,
} from "@/components/ui/select"

export function EmployeeFormDialog({
  employee,
  mode = "create",
  trigger,
  open,
  onOpenChange,
}: {
  employee?: HrEmployeeRow
  mode?: "create" | "edit"
  trigger?: React.ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isEditing = mode === "edit"
  const formId = useId()

  return (
    <Dialog open={open} onOpenChange={onOpenChange ? (nextOpen) => onOpenChange(nextOpen) : undefined}>
      {trigger ? (
        <DialogTrigger render={trigger} />
      ) : open === undefined ? (
        <DialogTrigger
          render={
            <Button size="sm">
              <Plus />
              Alta empleado
            </Button>
          }
        />
      ) : null}
      <StandardDialogContent>
        <StandardDialogHeader>
          <StandardDialogTitle>{isEditing ? "Editar empleado" : "Alta de empleado"}</StandardDialogTitle>
          <StandardDialogDescription>
            Captura la informacion operativa del colaborador.
          </StandardDialogDescription>
        </StandardDialogHeader>

        <form className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium" htmlFor={`${formId}-first-name`}>
              Nombre
              <Input id={`${formId}-first-name`} name="firstName" defaultValue={employee?.name.split(" ")[0] ?? ""} placeholder="Nombre" />
            </label>
            <label className="grid gap-2 text-sm font-medium" htmlFor={`${formId}-last-name`}>
              Apellidos
              <Input id={`${formId}-last-name`} name="lastName" defaultValue={employee?.name.split(" ").slice(1).join(" ")} placeholder="Apellidos" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium" htmlFor={`${formId}-email`}>
              Correo
              <Input id={`${formId}-email`} name="email" type="email" defaultValue={employee?.email === "Sin correo" ? "" : employee?.email} placeholder="empleado@gerpy.mx" />
            </label>
            <label className="grid gap-2 text-sm font-medium" htmlFor={`${formId}-phone`}>
              Telefono
              <Input id={`${formId}-phone`} name="phone" type="tel" placeholder="+52 55 0000 0000" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="grid gap-2 text-sm font-medium" htmlFor={`${formId}-position`}>
              Puesto
              <Input id={`${formId}-position`} name="position" defaultValue={employee?.position === "Sin puesto" ? "" : employee?.position} placeholder="Puesto" />
            </label>
            <label className="grid gap-2 text-sm font-medium" htmlFor={`${formId}-contract-type`}>
              Contrato
              <Select id={`${formId}-contract-type`} name="contractType" defaultValue={employee?.contract === "Sin contrato" ? "FULL_TIME" : employee?.contract.replaceAll(" ", "_")}>
                <StandardSelectTrigger id={`${formId}-contract-type`}>
                  <StandardSelectValue placeholder="Tipo" />
                </StandardSelectTrigger>
                <StandardSelectContent>
                  <SelectItem value="FULL_TIME">Tiempo completo</SelectItem>
                  <SelectItem value="PART_TIME">Medio tiempo</SelectItem>
                  <SelectItem value="CONTRACTOR">Contratista</SelectItem>
                </StandardSelectContent>
              </Select>
            </label>
            <label className="grid gap-2 text-sm font-medium" htmlFor={`${formId}-status`}>
              Estado
              <Select id={`${formId}-status`} name="status" defaultValue={employee?.status ?? "ACTIVE"}>
                <StandardSelectTrigger id={`${formId}-status`}>
                  <StandardSelectValue placeholder="Estado" />
                </StandardSelectTrigger>
                <StandardSelectContent>
                  <SelectItem value="ACTIVE">Activo</SelectItem>
                  <SelectItem value="INACTIVE">Inactivo</SelectItem>
                </StandardSelectContent>
              </Select>
            </label>
          </div>

          <StandardDialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button type="button">
              {isEditing ? <Edit /> : <Plus />}
              {isEditing ? "Guardar cambios" : "Crear empleado"}
            </Button>
          </StandardDialogFooter>
        </form>
      </StandardDialogContent>
    </Dialog>
  )
}
