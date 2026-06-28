"use client";

import type { ComponentType } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

const BRANCH_DATA = [
  { branch: "Centro", miembros: 1240, retencion: 87, ingresos: 148 },
  { branch: "Norte", miembros: 890, retencion: 82, ingresos: 102 },
  { branch: "Campus", miembros: 1560, retencion: 91, ingresos: 204 },
  { branch: "Sur", miembros: 620, retencion: 76, ingresos: 78 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border bg-card/95 backdrop-blur-sm px-4 py-3 shadow-lg text-xs space-y-1.5">
        <p className="font-bold text-foreground flex items-center gap-1.5">
          <Building2 className="size-3" />
          {label}
        </p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block size-2 rounded-sm"
                style={{ backgroundColor: entry.fill }}
              />
              <span className="text-muted-foreground">{entry.name}</span>
            </div>
            <span className="font-semibold text-foreground tabular-nums">
              {entry.name === "Retención" ? `${entry.value}%` : entry.name === "Ingresos" ? `$${entry.value}k` : entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function BranchComparisonChart() {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-4 text-primary" />
            Comparativa por Sucursal
          </CardTitle>
          <CardDescription>
            Miembros activos, tasa de retención e ingresos mensuales por sucursal.
          </CardDescription>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-sm bg-blue-500" />
            Miembros
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-sm bg-emerald-500" />
            Retención %
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-sm bg-amber-500" />
            Ingresos $k
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={BRANCH_DATA}
              margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
              barCategoryGap="24%"
              barGap={3}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.07} vertical={false} />
              <XAxis
                dataKey="branch"
                tick={{ fontSize: 12, fill: "currentColor", opacity: 0.6 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "currentColor", opacity: 0.04 }} />
              <Bar
                dataKey="miembros"
                name="Miembros"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
              <Bar
                dataKey="retencion"
                name="Retención"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
              <Bar
                dataKey="ingresos"
                name="Ingresos"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
