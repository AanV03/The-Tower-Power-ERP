"use client"

import type React from "react"
import { useId, useState } from "react"
import { Edit, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

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
  const router = useRouter()
  
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const dialogOpen = open !== undefined ? open : isOpen
  const setDialogOpen = onOpenChange ? onOpenChange : setIsOpen

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const payload: Record<string, any> = {
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        positionName: formData.get("position") as string,
        contractType: formData.get("contractType") as string,
        status: formData.get("status") as string,
      }

      if (isEditing && employee) {
        payload.id = employee.id
      }

      const response = await fetch("/api/hr/employees", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || "Error al guardar el empleado")
      }

      toast.success(
        isEditing
          ? "Colaborador actualizado con éxito"
          : "Colaborador registrado con éxito"
      )
      setDialogOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Error al procesar la solicitud")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger ? (
        <DialogTrigger render={trigger} />
      ) : open === undefined ? (
        <DialogTrigger
          render={
            <Button size="sm">
              <Plus className="size-4" />
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

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium" htmlFor={`${formId}-first-name`}>
              Nombre
              <Input id={`${formId}-first-name`} name="firstName" defaultValue={employee?.name.split(" ")[0] ?? ""} placeholder="Nombre" required />
            </label>
            <label className="grid gap-2 text-sm font-medium" htmlFor={`${formId}-last-name`}>
              Apellidos
              <Input id={`${formId}-last-name`} name="lastName" defaultValue={employee?.name.split(" ").slice(1).join(" ") ?? ""} placeholder="Apellidos" required />
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
              <Select name="contractType" defaultValue={employee?.contract === "Sin contrato" ? "FULL_TIME" : employee?.contract.replaceAll(" ", "_")}>
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
              <Select name="status" defaultValue={employee?.status ?? "ACTIVE"}>
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
            <DialogClose render={<Button type="button" variant="outline" disabled={loading} />}>
              Cancelar
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : isEditing ? <Edit className="size-4" /> : <Plus className="size-4" />}
              {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear empleado"}
            </Button>
          </StandardDialogFooter>
        </form>
      </StandardDialogContent>
    </Dialog>
  )
}
