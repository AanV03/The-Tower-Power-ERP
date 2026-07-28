import { CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary, type Locale } from "@/lib/i18n";

export type PayrollPeriodRow = {
  id: string;
  label: string;
  range: string;
  status: "DRAFT" | "APPROVED" | "PAID";
  employees: number;
  net: string;
};

export function PayrollPeriods({ periods, activePeriodId, locale }: { periods: PayrollPeriodRow[]; activePeriodId?: string; locale: Locale }) {
  const t = getDictionary(locale).payroll;
  return (
    <Card className="rounded-lg">
      <CardHeader className="border-b pb-4">
        <CardTitle>{t.panels.periods}</CardTitle>
        <p className="text-sm text-muted-foreground">{t.help.cycles}</p>
      </CardHeader>
      <CardContent className="p-0">
        {periods.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <CalendarDays className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="font-medium text-foreground">{t.empty.noPeriodsCreated}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t.empty.createPeriod}</p>
          </div>
        ) : (
          <div className="divide-y">
            {periods.map((period) => (
              <div
                key={period.id}
                className={period.id === activePeriodId ? "bg-muted/60 p-4" : "p-4"}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{period.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{period.range}</p>
                  </div>
                  <Badge variant={period.status === "PAID" ? "secondary" : period.status === "APPROVED" ? "outline" : "destructive"}>
                    {t.status[period.status]}
                  </Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">{t.fields.employees}</p>
                    <p className="font-medium">{period.employees}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t.fields.net}</p>
                    <p className="font-medium">{period.net}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
