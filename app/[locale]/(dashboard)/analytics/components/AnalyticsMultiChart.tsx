"use client";

import type { ComponentType } from "react";
import {
  Area,
  Line,
  ComposedChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartSkeleton } from "@/components/skeletons";
import { NoDataEmpty } from "@/components/empty-state";
import { getDictionary, type Locale } from "@/lib/i18n";

const ChartArea = Area as unknown as ComponentType<any>;
const ChartLine = Line as unknown as ComponentType<any>;
const ChartTooltip = Tooltip as unknown as ComponentType<any>;
const ChartXAxis = XAxis as unknown as ComponentType<any>;
const ChartYAxis = YAxis as unknown as ComponentType<any>;
const ChartLegend = Legend as unknown as ComponentType<any>;

type AnalyticsMultiChartProps = {
  title: string;
  description: string;
  data: { label: string; value: number; retention: number; churn: number }[];
  locale: Locale;
  isLoading?: boolean;
};

export function AnalyticsMultiChart({
  title,
  description,
  data,
  locale,
  isLoading = false,
}: AnalyticsMultiChartProps) {
  const dictionary = getDictionary(locale);

  if (isLoading) {
    return (
      <Card className="min-h-[400px] glass-effect">
        <CardHeader>
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="min-h-[400px] glass-effect">
        <CardHeader>
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center min-h-[280px]">
          <NoDataEmpty title={dictionary.moduleChart.noData} description={dictionary.moduleChart.noDataDesc} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-h-[400px] glass-effect">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">{title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full" role="img" aria-label={title}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ left: -16, right: 8, top: 12, bottom: 0 }}>
              <defs>
                <linearGradient id="retentionAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--brand-green)" stopOpacity={0.24} />
                  <stop offset="95%" stopColor="var(--brand-green)" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="churnAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--brand-red)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--brand-red)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.6} />
              
              <ChartXAxis 
                dataKey="label" 
                tickLine={false} 
                axisLine={false} 
                fontSize={12} 
                stroke="var(--text-muted)" 
              />
              <ChartYAxis 
                tickLine={false} 
                axisLine={false} 
                fontSize={12} 
                stroke="var(--text-muted)"
                domain={[0, 100]}
                unit="%"
              />
              
              <ChartTooltip
                cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                  boxShadow: "var(--glass-shadow)"
                }}
              />
              
              <ChartLegend 
                verticalAlign="top" 
                height={36} 
                iconType="circle"
                iconSize={8}
                fontSize={12}
              />
              
              {/* Retention Series: Filled Area + Line */}
              <ChartArea
                name={dictionary.analytics.charts.retentionLine}
                type="monotone"
                dataKey="retention"
                stroke="var(--brand-green)"
                strokeWidth={2.5}
                fill="url(#retentionAreaGrad)"
                activeDot={{ r: 6 }}
              />

              {/* Churn Series: Red Line */}
              <ChartLine
                name={dictionary.analytics.charts.churnLine}
                type="monotone"
                dataKey="churn"
                stroke="var(--brand-red)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
