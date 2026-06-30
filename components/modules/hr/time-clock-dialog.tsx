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
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  async function submitClockAction({
    employeeId,
    action,
    source,
    notes,
  }: {
    employeeId: string;
    action: "CLOCK_IN" | "CLOCK_OUT";
    source: "APP" | "MANUAL" | "BIOMETRIC";
    notes?: FormDataEntryValue | null;
  }) {
    const employee = employees.find((item) => item.id === employeeId);
    if (!employee) {
      toast.error("Selecciona un empleado valido.");
      return;
    }

    const normalizedNotes = typeof notes === "string" && notes.trim() ? notes.trim() : undefined;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/hr/time-clock", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: employee.id,
          branchId: employee.branchId,
          action,
          source,
          notes: normalizedNotes,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message ?? "No se pudo registrar la asistencia.");
      }

      toast.success("Asistencia registrada correctamente.");
      setOpen(false);
      setSelectedEmployeeId("");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo registrar la asistencia.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    await submitClockAction({
      employeeId: String(formData.get("employeeId") ?? ""),
      action: formData.get("action") as "CLOCK_IN" | "CLOCK_OUT",
      source: formData.get("source") as "APP" | "MANUAL" | "BIOMETRIC",
      notes: formData.get("notes"),
    });
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
          <label htmlFor="time-clock-employee" className="grid gap-2 text-sm font-medium">
            Empleado
            <NativeSelect
              id="time-clock-employee"
              name="employeeId"
              required
              className="w-full"
              value={selectedEmployeeId}
              onChange={(event) => setSelectedEmployeeId(event.target.value)}
              disabled={isSubmitting}
            >
              <NativeSelectOption value="">Selecciona empleado</NativeSelectOption>
              {employees.map((employee) => (
                <NativeSelectOption key={employee.id} value={employee.id}>
                  {employee.label} - {employee.branchLabel}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label htmlFor="time-clock-action" className="grid gap-2 text-sm font-medium">
              Accion
              <NativeSelect id="time-clock-action" name="action" defaultValue="CLOCK_IN" className="w-full" disabled={isSubmitting}>
                <NativeSelectOption value="CLOCK_IN">Registrar entrada</NativeSelectOption>
                <NativeSelectOption value="CLOCK_OUT">Registrar salida</NativeSelectOption>
              </NativeSelect>
            </label>
            <label htmlFor="time-clock-source" className="grid gap-2 text-sm font-medium">
              Origen
              <NativeSelect id="time-clock-source" name="source" defaultValue="APP" className="w-full" disabled={isSubmitting}>
                <NativeSelectOption value="APP">App</NativeSelectOption>
                <NativeSelectOption value="MANUAL">Manual</NativeSelectOption>
                <NativeSelectOption value="BIOMETRIC">Biometrico</NativeSelectOption>
              </NativeSelect>
            </label>
          </div>

          <label htmlFor="time-clock-notes" className="grid gap-2 text-sm font-medium">
            Notas
            <Input id="time-clock-notes" name="notes" maxLength={240} placeholder="Comentario opcional" disabled={isSubmitting} />
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
