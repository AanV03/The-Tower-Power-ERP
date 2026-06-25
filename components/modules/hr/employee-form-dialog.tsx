"use client"

import type React from "react"
import { useId, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Edit, Plus } from "lucide-react"
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
  const [internalOpen, setInternalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const resolvedOpen = open ?? internalOpen

  function handleOpenChange(nextOpen: boolean) {
    if (onOpenChange) {
      onOpenChange(nextOpen)
    } else {
      setInternalOpen(nextOpen)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const endpoint = isEditing && employee?.id ? `/api/hr/employees/${employee.id}` : "/api/hr/employees"

    setIsSubmitting(true)
    try {
      const response = await fetch(endpoint, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          positionName: formData.get("positionName"),
          contractType: formData.get("contractType"),
          status: formData.get("status"),
        }),
      })
      const result = await response.json()

      if (!response.ok || !result.ok) {
        const issue = Array.isArray(result.issues) ? result.issues[0]?.message : undefined
        throw new Error(issue ?? result.message ?? "No se pudo guardar el empleado.")
      }

      toast.success(isEditing ? "Empleado actualizado correctamente." : "Empleado creado correctamente.")
      handleOpenChange(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el empleado.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={resolvedOpen} onOpenChange={handleOpenChange}>
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
      <StandardDialogContent className="border-white/10 bg-background/85 shadow-2xl backdrop-blur-xl dark:bg-zinc-950/85">
        <StandardDialogHeader>
          <StandardDialogTitle>{isEditing ? "Editar empleado" : "Alta de empleado"}</StandardDialogTitle>
          <StandardDialogDescription>
            Captura la informacion operativa del colaborador.
          </StandardDialogDescription>
        </StandardDialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium" htmlFor={`${formId}-first-name`}>
              Nombre
              <Input id={`${formId}-first-name`} name="firstName" defaultValue={employee?.name.split(" ")[0] ?? ""} placeholder="Nombre" disabled={isSubmitting} required />
            </label>
            <label className="grid gap-2 text-sm font-medium" htmlFor={`${formId}-last-name`}>
              Apellidos
              <Input id={`${formId}-last-name`} name="lastName" defaultValue={employee?.name.split(" ").slice(1).join(" ")} placeholder="Apellidos" disabled={isSubmitting} required />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium" htmlFor={`${formId}-email`}>
              Correo
              <Input id={`${formId}-email`} name="email" type="email" defaultValue={employee?.email === "Sin correo" ? "" : employee?.email} placeholder="empleado@gerpy.mx" disabled={isSubmitting} />
            </label>
            <label className="grid gap-2 text-sm font-medium" htmlFor={`${formId}-phone`}>
              Telefono
              <Input id={`${formId}-phone`} name="phone" type="tel" placeholder="+52 55 0000 0000" disabled={isSubmitting} />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="grid gap-2 text-sm font-medium" htmlFor={`${formId}-position`}>
              Puesto
              <Input id={`${formId}-position`} name="positionName" defaultValue={employee?.position === "Sin puesto" ? "" : employee?.position} placeholder="Puesto" disabled={isSubmitting} />
            </label>
            <label className="grid gap-2 text-sm font-medium" htmlFor={`${formId}-contract-type`}>
              Contrato
              <Select id={`${formId}-contract-type`} name="contractType" defaultValue={employee?.contract === "Sin contrato" ? "FULL_TIME" : employee?.contract.replaceAll(" ", "_")} disabled={isSubmitting}>
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
              <Select id={`${formId}-status`} name="status" defaultValue={employee?.status ?? "ACTIVE"} disabled={isSubmitting}>
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
            <DialogClose render={<Button type="button" variant="outline" disabled={isSubmitting} />}>
              Cancelar
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? null : isEditing ? <Edit className="size-4" /> : <Plus className="size-4" />}
              {isSubmitting ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear empleado"}
            </Button>
          </StandardDialogFooter>
        </form>
      </StandardDialogContent>
    </Dialog>
  )
}
