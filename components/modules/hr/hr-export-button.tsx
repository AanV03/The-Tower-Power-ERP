"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

import type { HrAttendanceRow } from "@/components/modules/hr/attendance-panel";
import type { HrContractRow } from "@/components/modules/hr/contract-summary";
import type { HrEmployeeRow } from "@/components/modules/hr/employee-table";
import { Button } from "@/components/ui/button";

function csvCell(value: string | number | null | undefined) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function downloadCsv(filename: string, rows: Array<Array<string | number | null | undefined>>) {
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function HrExportButton({
  employees,
  attendance,
  contracts,
}: {
  employees: HrEmployeeRow[];
  attendance: HrAttendanceRow[];
  contracts: HrContractRow[];
}) {
  const [isExporting, setIsExporting] = useState(false);

  function handleExport() {
    setIsExporting(true);

    try {
      downloadCsv("gerpy-hr-export.csv", [
        ["Section", "ID", "Name/Employee", "Phone", "Detail 1", "Detail 2", "Status"],
        ...employees.map((employee) => [
          "Employees",
          employee.id,
          employee.name,
          employee.phone,
          employee.position,
          employee.branch,
          employee.status,
        ]),
        ...attendance.map((record) => [
          "Attendance",
          record.id,
          record.employee,
          "",
          record.clockIn,
          record.clockOut,
          record.status,
        ]),
        ...contracts.map((contract) => [
          "Contracts",
          contract.id,
          contract.employee,
          "",
          contract.type,
          contract.compensation,
          contract.status,
        ]),
      ]);

      toast.success("Exportacion de RH generada.");
    } catch {
      toast.error("No se pudo generar la exportacion de RH.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Button
      size="icon-sm"
      variant="outline"
      aria-label="Exportar RH"
      type="button"
      onClick={handleExport}
      disabled={isExporting}
    >
      <Download aria-hidden="true" />
    </Button>
  );
}
