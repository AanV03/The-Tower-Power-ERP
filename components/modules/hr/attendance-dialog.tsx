"use client";

import { useState, useId } from "react";
import { Clock } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

type EmployeeOption = {
  id: string;
  name: string;
};

export function AttendanceDialog({ employees }: { employees: EmployeeOption[] }) {
  const router = useRouter();
  const formId = useId();
  const [open, setOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [action, setAction] = useState<"clock-in" | "clock-out">("clock-in");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeId) {
      toast.error("Por favor, selecciona un empleado");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/hr/time-clock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          action: action === "clock-in" ? "CLOCK_IN" : "CLOCK_OUT",
          source: "MANUAL",
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Error al registrar la asistencia");
      }

      toast.success(
        action === "clock-in"
          ? `Entrada registrada para ${result.data?.employee?.firstName ?? "colaborador"}`
          : `Salida registrada para ${result.data?.employee?.firstName ?? "colaborador"}`
      );
      setOpen(false);
      setEmployeeId("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline">
            <Clock className="size-4" />
            Registrar
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Asistencia</DialogTitle>
          <DialogDescription>
            Registra la entrada (Clock-In) o salida (Clock-Out) de un colaborador de forma manual.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <label className="grid gap-1.5 text-sm font-medium text-foreground" htmlFor={`${formId}-employee`}>
            <span>Empleado</span>
            <NativeSelect
              id={`${formId}-employee`}
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
              aria-label="Seleccionar empleado"
            >
              <NativeSelectOption value="">Seleccionar colaborador...</NativeSelectOption>
              {employees.map((emp) => (
                <NativeSelectOption key={emp.id} value={emp.id}>
                  {emp.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-foreground" htmlFor={`${formId}-action`}>
            <span>Acción</span>
            <NativeSelect
              id={`${formId}-action`}
              value={action}
              onChange={(e) => setAction(e.target.value as "clock-in" | "clock-out")}
              required
              aria-label="Seleccionar acción"
            >
              <NativeSelectOption value="clock-in">Entrada (Clock-In)</NativeSelectOption>
              <NativeSelectOption value="clock-out">Salida (Clock-Out)</NativeSelectOption>
            </NativeSelect>
          </label>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setEmployeeId("");
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Registrando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
