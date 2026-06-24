import { Download, FileText, Plus, Search } from "lucide-react";

import type { PayrollPeriodView } from "@/components/modules/payroll/payroll-dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

export function PayrollActionBar({ periods }: { periods: PayrollPeriodView[] }) {
  return (
    <div className="flex w-full flex-col gap-3 lg:max-w-3xl lg:items-end">
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled>
          <Plus className="size-4" aria-hidden="true" />
          Crear periodo
        </Button>
        <Button type="button" variant="outline" disabled>
          <FileText className="size-4" aria-hidden="true" />
          Vista previa
        </Button>
        <Button type="button" variant="outline" disabled>
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
