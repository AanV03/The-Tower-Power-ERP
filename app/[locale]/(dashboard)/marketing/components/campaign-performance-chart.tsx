"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const CAMPAIGN_DATA = [
  { week: "Sem 1", enviados: 3200, abiertos: 2100, convertidos: 280 },
  { week: "Sem 2", enviados: 4100, abiertos: 2800, convertidos: 390 },
  { week: "Sem 3", enviados: 3700, abiertos: 2350, convertidos: 315 },
  { week: "Sem 4", enviados: 5200, abiertos: 3600, convertidos: 480 },
  { week: "Sem 5", enviados: 4800, abiertos: 3200, convertidos: 430 },
  { week: "Sem 6", enviados: 6100, abiertos: 4100, convertidos: 560 },
  { week: "Sem 7", enviados: 5600, abiertos: 3800, convertidos: 510 },
  { week: "Sem 8", enviados: 7200, abiertos: 5000, convertidos: 680 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border bg-card/95 backdrop-blur-sm px-4 py-3 shadow-lg text-xs space-y-1.5">
        <p className="font-bold text-foreground">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2">
            <span
              className="inline-block size-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-semibold text-foreground tabular-nums">
              {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function CampaignPerformanceChart() {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            Rendimiento de Campañas
          </CardTitle>
          <CardDescription>
            Métricas acumuladas de envíos, aperturas y conversiones — últimas 8 semanas.
          </CardDescription>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-full bg-blue-500" />
            Enviados
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-full bg-emerald-500" />
            Abiertos
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-full bg-amber-500" />
            Convertidos
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={CAMPAIGN_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradSent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradOpen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradConv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.07} />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="enviados"
                name="Enviados"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#gradSent)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="abiertos"
                name="Abiertos"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#gradOpen)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="convertidos"
                name="Convertidos"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#gradConv)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
