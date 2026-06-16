import { AlertTriangle, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type HrContractRow = {
  id: string;
  employee: string;
  type: string;
  compensation: string;
  startDate: string;
  status: "VIGENTE" | "SIN_CONTRATO" | "VENCIDO";
};

export function ContractSummary({ contracts }: { contracts: HrContractRow[] }) {
  return (
    <Card className="rounded-lg">
      <CardHeader className="border-b pb-4">
        <CardTitle>Contratos</CardTitle>
        <p className="text-sm text-muted-foreground">Vigencia, modalidad y compensacion aplicable.</p>
      </CardHeader>
      <CardContent className="p-0">
        {contracts.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FileText className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="font-medium text-foreground">Sin contratos visibles</p>
            <p className="mt-1 text-sm text-muted-foreground">Los contratos activos se mostraran en este panel.</p>
          </div>
        ) : (
          <div className="divide-y">
            {contracts.map((contract) => (
              <div key={contract.id} className="grid gap-3 p-4 lg:grid-cols-[1fr_120px_130px_120px] lg:items-center">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{contract.employee}</p>
                  <p className="text-sm text-muted-foreground">{contract.type}</p>
                </div>
                <p className="text-sm font-medium">{contract.compensation}</p>
                <p className="text-sm text-muted-foreground">{contract.startDate}</p>
                <Badge
                  className="w-fit"
                  variant={contract.status === "VIGENTE" ? "secondary" : "destructive"}
                >
                  {contract.status !== "VIGENTE" && <AlertTriangle />}
                  {contract.status === "VIGENTE" ? "Vigente" : contract.status === "VENCIDO" ? "Vencido" : "Sin contrato"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
