import { CheckCircle, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary, type Locale } from "@/lib/i18n";

export type PayrollSummaryData = {
  gross: string;
  overtime: string;
  commissions: string;
  deductions: string;
  net: string;
  incidents: number;
  activeStatus: "DRAFT" | "APPROVED" | "PAID" | "EMPTY";
};

export function PayrollSummary({ summary, locale }: { summary: PayrollSummaryData; locale: Locale }) {
  const t = getDictionary(locale).payroll;
  return (
    <Card className="rounded-lg">
      <CardHeader className="border-b pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{t.panels.summary}</CardTitle>
            <p className="text-sm text-muted-foreground">{t.help.totals}</p>
          </div>
          <Badge variant={summary.activeStatus === "PAID" ? "secondary" : summary.activeStatus === "APPROVED" ? "outline" : "destructive"}>
            {t.status[summary.activeStatus]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between gap-4"><span className="text-muted-foreground">{t.fields.base}</span><span className="font-medium">{summary.gross}</span></div>
          <div className="flex justify-between gap-4"><span className="text-muted-foreground">{t.fields.overtime}</span><span className="font-medium">{summary.overtime}</span></div>
          <div className="flex justify-between gap-4"><span className="text-muted-foreground">{t.commissions}</span><span className="font-medium">{summary.commissions}</span></div>
          <div className="flex justify-between gap-4"><span className="text-muted-foreground">{t.deductions}</span><span className="font-medium">{summary.deductions}</span></div>
          <div className="flex justify-between gap-4 border-t pt-3 text-base"><span className="font-medium">{t.fields.net}</span><span className="font-semibold">{summary.net}</span></div>
        </div>
        <div className="rounded-md border bg-muted/30 p-3">
          <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">{t.incidents}</p>
          <p className="mt-1 text-2xl font-semibold">{summary.incidents}</p>
        </div>
        <div className="grid gap-2">
          <Button disabled={summary.activeStatus !== "DRAFT"}><CheckCircle /> {t.actions.approve}</Button>
          <Button variant="outline" disabled={summary.activeStatus === "EMPTY"}><FileText /> {t.actions.viewDetails}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
