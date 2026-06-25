"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FileText, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import type { PayrollPeriodView } from "@/components/modules/payroll/payroll-dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

export function PayrollActionBar({ periods }: { periods: PayrollPeriodView[] }) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<"period" | "preview" | "export" | null>(null);
  const activePeriod = useMemo(
    () => periods.find((period) => period.status === "DRAFT") ?? periods[0],
    [periods],
  );

  async function postJson(url: string, payload?: Record<string, unknown>) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload ? JSON.stringify(payload) : undefined,
    });
    const result = await response.json();

    if (!response.ok || !result.ok) {
      const issue = Array.isArray(result.issues) ? result.issues[0]?.message : undefined;
      throw new Error(issue ?? result.message ?? "No se pudo completar la operacion.");
    }

    return result.data;
  }

  async function handleCreatePeriod() {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    setLoadingAction("period");
    try {
      await postJson("/api/payroll/periods", {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: "DRAFT",
      });
      toast.success("Periodo de nomina creado.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el periodo.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function handlePreview() {
    if (!activePeriod) return;

    setLoadingAction("preview");
    try {
      await postJson(`/api/payroll/periods/${activePeriod.id}/preview`);
      toast.success("Vista previa de nomina generada.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo generar la vista previa.");
    } finally {
      setLoadingAction(null);
    }
  }

  function handleExport() {
    setLoadingAction("export");
    try {
      const rows = [
        ["Periodo", "Rango", "Estado", "Empleados", "Neto"],
        ...periods.map((period) => [
          period.label,
          period.range,
          period.status,
          String(period.employeeCount),
          period.netTotalLabel,
        ]),
      ];
      const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "nomina-periodos.csv";
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Exportacion preparada.");
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="flex w-full flex-col gap-3 lg:max-w-3xl lg:items-end">
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={handleCreatePeriod} disabled={loadingAction !== null}>
          <Plus className="size-4" aria-hidden="true" />
          {loadingAction === "period" ? "Creando..." : "Crear periodo"}
        </Button>
        <Button type="button" variant="outline" onClick={handlePreview} disabled={loadingAction !== null || !activePeriod}>
          <FileText className="size-4" aria-hidden="true" />
          {loadingAction === "preview" ? "Calculando..." : "Vista previa"}
        </Button>
        <Button type="button" variant="outline" onClick={handleExport} disabled={loadingAction !== null || periods.length === 0}>
          <Download className="size-4" aria-hidden="true" />
          Exportar
        </Button>
      </div>
      <div className="grid w-full gap-2 sm:grid-cols-[minmax(220px,1fr)_180px_150px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input className="pl-8" placeholder="Buscar empleado" disabled />
        </div>
        <NativeSelect className="w-full" disabled defaultValue={periods[0]?.id ?? "none"}>
          {periods.length > 0 ? (
            periods.map((period) => (
              <NativeSelectOption key={period.id} value={period.id}>
                {period.range}
              </NativeSelectOption>
            ))
          ) : (
            <NativeSelectOption value="none">Sin periodos</NativeSelectOption>
          )}
        </NativeSelect>
        <NativeSelect className="w-full" disabled defaultValue="all">
          <NativeSelectOption value="all">Todos</NativeSelectOption>
          <NativeSelectOption value="DRAFT">Borrador</NativeSelectOption>
          <NativeSelectOption value="APPROVED">Aprobado</NativeSelectOption>
          <NativeSelectOption value="PAID">Pagado</NativeSelectOption>
        </NativeSelect>
      </div>
    </div>
  );
}
