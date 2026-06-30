"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Download, FileText, Plus } from "lucide-react";
import { toast } from "sonner";

import type { PayrollPeriodView } from "@/components/modules/payroll/payroll-dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { headerPrimaryActionClass } from "@/lib/utils";

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

function dateInputValue(date: Date) {
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
}

function currentMonthStart() {
  const date = new Date();
  date.setDate(1);
  return dateInputValue(date);
}

function currentMonthEnd() {
  const date = new Date();
  date.setMonth(date.getMonth() + 1, 0);
  return dateInputValue(date);
}

export function PayrollActionBar({
  periods,
  activePeriodId,
}: {
  periods: PayrollPeriodView[];
  activePeriodId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loadingAction, setLoadingAction] = useState<"period" | "preview" | "export" | null>(null);
  const [periodStart, setPeriodStart] = useState(() => currentMonthStart());
  const [periodEnd, setPeriodEnd] = useState(() => currentMonthEnd());
  const activePeriod = useMemo(
    () => periods.find((period) => period.id === activePeriodId) ?? periods.find((period) => period.status === "DRAFT") ?? periods[0],
    [activePeriodId, periods],
  );
  const [selectedPeriodId, setSelectedPeriodId] = useState(activePeriod?.id ?? "");

  useEffect(() => {
    setSelectedPeriodId(activePeriod?.id ?? "");
  }, [activePeriod?.id]);

  async function postJson(url: string, payload?: Record<string, unknown>) {
    const response = await fetch(url, {
      method: "POST",
      cache: "no-store",
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

  function navigateToPeriod(periodId: string) {
    setSelectedPeriodId(periodId);
    if (periodId) {
      const href = `${pathname}?payrollPeriodId=${encodeURIComponent(periodId)}` as Parameters<typeof router.replace>[0];
      router.replace(href, { scroll: false });
    }
  }

  async function handleCreatePeriod() {
    if (!periodStart || !periodEnd) {
      toast.error("Selecciona inicio y fin del periodo.");
      return;
    }

    setLoadingAction("period");
    try {
      const period = await postJson("/api/payroll/periods", {
        startDate: periodStart,
        endDate: periodEnd,
        status: "DRAFT",
      }) as { id?: string };
      toast.success("Periodo de nomina creado.");
      if (period.id) navigateToPeriod(period.id);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el periodo.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function handlePreview() {
    const periodId = selectedPeriodId || activePeriod?.id;
    if (!periodId) return;

    setLoadingAction("preview");
    try {
      await postJson(`/api/payroll/periods/${periodId}/preview`);
      toast.success("Vista previa de nomina generada.");
      navigateToPeriod(periodId);
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
        <Button type="button" onClick={handleCreatePeriod} disabled={loadingAction !== null} className={headerPrimaryActionClass}>
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
      <div className="grid w-full gap-2 sm:grid-cols-[minmax(150px,1fr)_minmax(150px,1fr)_minmax(180px,1fr)]">
        <Input
          type="date"
          value={periodStart}
          onChange={(event) => setPeriodStart(event.target.value)}
          disabled={loadingAction !== null}
          aria-label="Inicio del periodo"
        />
        <Input
          type="date"
          value={periodEnd}
          onChange={(event) => setPeriodEnd(event.target.value)}
          disabled={loadingAction !== null}
          aria-label="Fin del periodo"
        />
        <NativeSelect
          className="w-full"
          value={selectedPeriodId || "none"}
          onChange={(event) => navigateToPeriod(event.target.value)}
          disabled={loadingAction !== null || periods.length === 0}
          aria-label="Periodo activo"
        >
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
      </div>
    </div>
  );
}
