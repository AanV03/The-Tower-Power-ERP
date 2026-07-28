"use client";

import type { JournalEntry, PayrollPeriod } from "@prisma/client";
import { useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CheckCircle2, Download, FileText, Plus, Send } from "lucide-react";
import { toast } from "sonner";

import type { PayrollPeriodView } from "@/components/modules/payroll/types";
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
import { Input } from "@/components/ui/input";
import type { postPayrollToAccounting } from "@/lib/accounting/payroll-posting";
import { headerPrimaryActionClass } from "@/lib/utils";

type PayrollPostingBackendResult = Awaited<ReturnType<typeof postPayrollToAccounting>>;
type PayrollPostingResult = Pick<PayrollPostingBackendResult, "created"> & {
  payrollPeriod: Pick<PayrollPeriod, "id" | "tenantId" | "status">;
  journalEntry: Pick<JournalEntry, "id" | "tenantId" | "sourceType" | "sourceId" | "status">;
};
type CreatePayrollPeriodResult = Pick<PayrollPeriod, "id" | "status">;

class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getIssueMessage(value: unknown) {
  if (!Array.isArray(value) || !isRecord(value[0])) return null;
  return typeof value[0].message === "string" ? value[0].message : null;
}

function isCreatePayrollPeriodResult(value: unknown): value is CreatePayrollPeriodResult {
  return isRecord(value) && typeof value.id === "string" && typeof value.status === "string";
}

function isPayrollPostingResult(value: unknown): value is PayrollPostingResult {
  return (
    isRecord(value) &&
    typeof value.created === "boolean" &&
    isRecord(value.payrollPeriod) &&
    typeof value.payrollPeriod.id === "string" &&
    typeof value.payrollPeriod.tenantId === "string" &&
    typeof value.payrollPeriod.status === "string" &&
    isRecord(value.journalEntry) &&
    typeof value.journalEntry.id === "string" &&
    typeof value.journalEntry.tenantId === "string" &&
    typeof value.journalEntry.sourceType === "string" &&
    typeof value.journalEntry.sourceId === "string" &&
    typeof value.journalEntry.status === "string"
  );
}

function paymentErrorMessage(error: unknown) {
  if (error instanceof ApiRequestError && error.status === 409) {
    return "Pago ya procesado o en curso";
  }

  if (error instanceof ApiRequestError && error.status === 403) {
    return "Permisos insuficientes en esta sucursal";
  }

  return error instanceof Error ? error.message : "No se pudo marcar como pagado.";
}

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
  canApprove,
}: {
  periods: PayrollPeriodView[];
  activePeriodId?: string;
  canApprove: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loadingAction, setLoadingAction] = useState<"period" | "preview" | "approve" | "pay" | "export" | null>(null);
  const paymentRequestInFlight = useRef(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const activePeriod = useMemo(
    () => periods.find((period) => period.id === activePeriodId) ?? periods.find((period) => period.status === "DRAFT") ?? periods[0],
    [activePeriodId, periods],
  );
  const [periodStart, setPeriodStart] = useState(() => currentMonthStart());
  const [periodEnd, setPeriodEnd] = useState(() => currentMonthEnd());
  const actionPeriod = activePeriod;
  const isLoading = loadingAction !== null;

  async function postJson<T>(url: string, payload?: Record<string, unknown>): Promise<T> {
    const response = await fetch(url, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: payload ? JSON.stringify(payload) : undefined,
    });
    const result: unknown = await response.json().catch(() => null);

    if (!isRecord(result)) {
      throw new ApiRequestError(
        "La API devolvió una respuesta inválida.",
        response.status,
        "INVALID_API_RESPONSE",
      );
    }

    if (!response.ok || result.ok !== true) {
      const issue = getIssueMessage(result.issues);
      const message = typeof result.message === "string"
        ? result.message
        : "No se pudo completar la operación.";
      const code = typeof result.error === "string" ? result.error : "API_REQUEST_FAILED";

      throw new ApiRequestError(issue ?? message, response.status, code);
    }

    if (!("data" in result)) {
      throw new ApiRequestError(
        "La API no devolvió datos.",
        response.status,
        "MISSING_API_DATA",
      );
    }

    return result.data as T;
  }

  function navigateToPeriod(periodId: string) {
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
      const period = await postJson<unknown>("/api/payroll/periods", {
        startDate: periodStart,
        endDate: periodEnd,
        status: "DRAFT",
      });
      if (!isCreatePayrollPeriodResult(period)) {
        throw new ApiRequestError(
          "La API devolvió un periodo inválido.",
          502,
          "INVALID_PAYROLL_PERIOD_RESPONSE",
        );
      }

      toast.success("Periodo de nomina creado.");
      if (period.id) navigateToPeriod(period.id);
      setCreateDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el periodo.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function handlePreview() {
    const periodId = actionPeriod?.id;
    if (!periodId) return;

    setLoadingAction("preview");
    try {
      await postJson<unknown>(`/api/payroll/periods/${periodId}/preview`);
      toast.success("Vista previa de nomina generada.");
      navigateToPeriod(periodId);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo generar la vista previa.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleApprove() {
    const periodId = actionPeriod?.id;
    if (!periodId) return;

    setLoadingAction("approve");
    try {
      await postJson<unknown>(`/api/payroll/periods/${periodId}/approve`);
      toast.success("Periodo de nomina aprobado.");
      navigateToPeriod(periodId);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo aprobar el periodo.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function handlePay() {
    const periodId = actionPeriod?.id;
    if (!periodId || paymentRequestInFlight.current) return;

    paymentRequestInFlight.current = true;
    setLoadingAction("pay");
    try {
      const result = await postJson<unknown>(
        `/api/payroll/periods/${encodeURIComponent(periodId)}/pay`,
      );
      if (!isPayrollPostingResult(result)) {
        throw new ApiRequestError(
          "La API devolvió una contabilización inválida.",
          502,
          "INVALID_PAYROLL_POSTING_RESPONSE",
        );
      }

      if (result.created) {
        toast.success("Periodo marcado como pagado.");
      } else {
        toast.info("Pago ya procesado o en curso");
      }
      navigateToPeriod(periodId);
      router.refresh();
    } catch (error) {
      toast.error(paymentErrorMessage(error));
    } finally {
      paymentRequestInFlight.current = false;
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
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger
            render={
              <Button type="button" disabled={isLoading} className={headerPrimaryActionClass}>
                <Plus className="size-4" aria-hidden="true" />
                Crear periodo
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="pr-8">
              <DialogTitle>Crear periodo</DialogTitle>
              <DialogDescription>
                Define el rango del corte de nomina. El periodo quedara en borrador para generar la vista previa.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5" htmlFor="payroll-period-start">
                <span className="text-xs font-semibold uppercase text-muted-foreground">Inicio</span>
                <Input
                  id="payroll-period-start"
                  type="date"
                  value={periodStart}
                  onChange={(event) => setPeriodStart(event.target.value)}
                  disabled={isLoading}
                  aria-label="Inicio del periodo"
                />
              </label>
              <label className="space-y-1.5" htmlFor="payroll-period-end">
                <span className="text-xs font-semibold uppercase text-muted-foreground">Fin</span>
                <Input
                  id="payroll-period-end"
                  type="date"
                  value={periodEnd}
                  onChange={(event) => setPeriodEnd(event.target.value)}
                  disabled={isLoading}
                  aria-label="Fin del periodo"
                />
              </label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={handleCreatePeriod}
                disabled={isLoading}
                className={headerPrimaryActionClass}
              >
                <Plus className="size-4" aria-hidden="true" />
                {loadingAction === "period" ? "Creando..." : "Crear periodo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button type="button" variant="outline" onClick={handlePreview} disabled={isLoading || !actionPeriod}>
          <FileText className="size-4" aria-hidden="true" />
          {loadingAction === "preview" ? "Calculando..." : "Vista previa"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleApprove}
          disabled={isLoading || !actionPeriod || actionPeriod.status !== "DRAFT" || !canApprove}
        >
          <CheckCircle2 className="size-4" aria-hidden="true" />
          {loadingAction === "approve" ? "Aprobando..." : "Aprobar periodo"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handlePay}
          disabled={isLoading || !actionPeriod || actionPeriod.status !== "APPROVED"}
          data-testid="payroll-pay-button"
          data-period-id={actionPeriod?.id ?? ""}
          data-pending={loadingAction === "pay" ? "true" : "false"}
        >
          <Send className="size-4" aria-hidden="true" />
          {loadingAction === "pay" ? "Marcando..." : "Marcar pagado"}
        </Button>
        <Button type="button" variant="outline" onClick={handleExport} disabled={isLoading || periods.length === 0}>
          <Download className="size-4" aria-hidden="true" />
          Exportar
        </Button>
      </div>
    </div>
  );
}
