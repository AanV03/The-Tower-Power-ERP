"use client";

import type { ComponentType } from "react";
import {
  Area as RechartsArea,
  AreaChart as RechartsAreaChart,
  Bar as RechartsBar,
  BarChart as RechartsBarChart,
  CartesianGrid as RechartsCartesianGrid,
  ResponsiveContainer as RechartsResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
} from "recharts";

const Area = RechartsArea as any;
const AreaChart = RechartsAreaChart as any;
const Bar = RechartsBar as any;
const BarChart = RechartsBarChart as any;
const CartesianGrid = RechartsCartesianGrid as any;
const ResponsiveContainer = RechartsResponsiveContainer as any;
const Tooltip = RechartsTooltip as any;
const XAxis = RechartsXAxis as any;
const YAxis = RechartsYAxis as any;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartSkeleton } from "@/components/skeletons";
import { NoDataEmpty } from "@/components/empty-state";
import { getDictionary, type Locale } from "@/lib/i18n";

const ChartArea = Area as unknown as ComponentType<any>;
const ChartBar = Bar as unknown as ComponentType<any>;
const ChartTooltip = Tooltip as unknown as ComponentType<any>;
const ChartXAxis = XAxis as unknown as ComponentType<any>;
const ChartYAxis = YAxis as unknown as ComponentType<any>;

export function ModuleChart({
  title,
  description,
  data,
  locale,
  type = "area",
  isLoading = false,
}: {
  title: string;
  description: string;
  data: { label: string; value: number }[];
  locale: Locale;
  type?: "area" | "bar";
  isLoading?: boolean;
}) {
  const dictionary = getDictionary(locale);

  if (isLoading) {
    return (
      <Card className="min-h-[342px]">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
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
      <Card className="min-h-[342px]">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <NoDataEmpty title={dictionary.moduleChart.noData} description={dictionary.moduleChart.noDataDesc} />
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="min-h-[342px]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-56 w-full" role="img" aria-label={title}>
          <ResponsiveContainer width="100%" height="100%">
            {type === "area" ? (
              <AreaChart data={data} margin={{ left: -24, right: 4, top: 8 }}>
                <defs>
                  <linearGradient id="moduleArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-orange)" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="var(--brand-orange)" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <ChartXAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <ChartYAxis tickLine={false} axisLine={false} fontSize={12} />
                <ChartTooltip
                  cursor={{ stroke: "var(--brand-orange)", strokeWidth: 1 }}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <ChartArea
                  type="monotone"
                  dataKey="value"
                  stroke="var(--brand-orange)"
                  strokeWidth={2}
                  fill="url(#moduleArea)"
                />
              </AreaChart>
            ) : (
              <BarChart data={data} margin={{ left: -24, right: 4, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <ChartXAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <ChartYAxis tickLine={false} axisLine={false} fontSize={12} />
                <ChartTooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <ChartBar dataKey="value" fill="var(--brand-green)" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
