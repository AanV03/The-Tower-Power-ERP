"use client";

import type React from "react";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import { toast } from "sonner";

import {
  StandardDialogContent,
  StandardDialogDescription,
  StandardDialogFooter,
  StandardDialogHeader,
  StandardDialogTitle,
} from "@/components/shared/standard-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

export type TimeClockEmployeeOption = {
  id: string;
  label: string;
  branchId: string;
  branchLabel: string;
};

export function TimeClockDialog({
  employees,
  trigger,
}: {
  employees: TimeClockEmployeeOption[];
  trigger: React.ReactElement;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const employee = employees.find((item) => item.id === formData.get("employeeId"));

    if (!employee) {
      toast.error("Selecciona un empleado valido.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/hr/time-clock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: employee.id,
          branchId: employee.branchId,
          action: formData.get("action"),
          source: formData.get("source"),
          notes: formData.get("notes") || undefined,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message ?? "No se pudo registrar la asistencia.");
      }

      toast.success("Asistencia registrada correctamente.");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo registrar la asistencia.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <StandardDialogContent>
        <StandardDialogHeader>
          <StandardDialogTitle>Reloj checador</StandardDialogTitle>
          <StandardDialogDescription>
            Registra entrada o salida del colaborador con control por sucursal.
          </StandardDialogDescription>
        </StandardDialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-medium">
            Empleado
            <NativeSelect name="employeeId" required className="w-full" disabled={isSubmitting}>
              <NativeSelectOption value="">Selecciona empleado</NativeSelectOption>
              {employees.map((employee) => (
                <NativeSelectOption key={employee.id} value={employee.id}>
                  {employee.label} - {employee.branchLabel}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Accion
              <NativeSelect name="action" defaultValue="TOGGLE" className="w-full" disabled={isSubmitting}>
                <NativeSelectOption value="TOGGLE">Entrada / salida automatica</NativeSelectOption>
                <NativeSelectOption value="CLOCK_IN">Registrar entrada</NativeSelectOption>
                <NativeSelectOption value="CLOCK_OUT">Registrar salida</NativeSelectOption>
              </NativeSelect>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Origen
              <NativeSelect name="source" defaultValue="APP" className="w-full" disabled={isSubmitting}>
                <NativeSelectOption value="APP">App</NativeSelectOption>
                <NativeSelectOption value="MANUAL">Manual</NativeSelectOption>
                <NativeSelectOption value="BIOMETRIC">Biometrico</NativeSelectOption>
              </NativeSelect>
            </label>
          </div>

          <label className="grid gap-2 text-sm font-medium">
            Notas
            <Input name="notes" maxLength={240} placeholder="Comentario opcional" disabled={isSubmitting} />
          </label>

          <StandardDialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || employees.length === 0}>
              <Clock />
              {isSubmitting ? "Registrando..." : "Registrar"}
            </Button>
          </StandardDialogFooter>
        </form>
      </StandardDialogContent>
    </Dialog>
  );
}
