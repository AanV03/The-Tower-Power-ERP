import { FileText, MoreHorizontal, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMessage, getDictionary, type Locale } from "@/lib/i18n";

export type PayrollItemRow = {
  id: string;
  employee: string;
  position: string;
  base: string;
  overtime: string;
  commissions: string;
  deductions: string;
  net: string;
  status: "DRAFT" | "APPROVED" | "PAID";
};

export function PayrollTable({ items, locale }: { items: PayrollItemRow[]; locale: Locale }) {
  const t = getDictionary(locale).payroll;
  return (
    <Card className="rounded-lg">
      <CardHeader className="gap-4 border-b pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{t.panels.periodReceipts}</CardTitle>
            <p className="text-sm text-muted-foreground">{t.help.receiptTable}</p>
          </div>
          <div className="relative min-w-0 sm:w-72">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-8" placeholder={t.searchEmployee} aria-label={t.searchReceipt} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FileText className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="font-medium text-foreground">{t.empty.noReceipts}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t.empty.receiptPreview}</p>
          </div>
        ) : (
          <>
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.fields.employee}</TableHead>
                    <TableHead className="text-right">{t.fields.base}</TableHead>
                    <TableHead className="text-right">{t.fields.overtime}</TableHead>
                    <TableHead className="text-right">{t.commissions}</TableHead>
                    <TableHead className="text-right">{t.deductions}</TableHead>
                    <TableHead className="text-right">{t.fields.net}</TableHead>
                    <TableHead>{t.fields.status}</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{item.employee}</p>
                          <p className="text-xs text-muted-foreground">{item.position}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{item.base}</TableCell>
                      <TableCell className="text-right">{item.overtime}</TableCell>
                      <TableCell className="text-right">{item.commissions}</TableCell>
                      <TableCell className="text-right">{item.deductions}</TableCell>
                      <TableCell className="text-right font-medium">{item.net}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === "PAID" ? "secondary" : item.status === "APPROVED" ? "outline" : "destructive"}>
                          {t.status[item.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon-sm" aria-label={formatMessage(t.receiptActions, { employee: item.employee })}>
                          <MoreHorizontal />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="divide-y lg:hidden">
              {items.map((item) => (
                <div key={item.id} className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{item.employee}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.position}</p>
                    </div>
                    <Badge variant={item.status === "PAID" ? "secondary" : item.status === "APPROVED" ? "outline" : "destructive"}>
                      {t.status[item.status]}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-xs text-muted-foreground">{t.fields.base}</p><p>{item.base}</p></div>
                    <div><p className="text-xs text-muted-foreground">{t.fields.overtime}</p><p>{item.overtime}</p></div>
                    <div><p className="text-xs text-muted-foreground">{t.commissions}</p><p>{item.commissions}</p></div>
                    <div><p className="text-xs text-muted-foreground">{t.deductions}</p><p>{item.deductions}</p></div>
                    <div className="col-span-2"><p className="text-xs text-muted-foreground">{t.fields.net}</p><p className="font-medium">{item.net}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
