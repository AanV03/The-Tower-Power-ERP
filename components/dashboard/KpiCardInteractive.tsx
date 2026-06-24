import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"

export default function KpiCardInteractive({
  label,
  value,
  change,
  tone,
  locale,
}: {
  label: string
  value: string | number
  change?: string | number
  tone?: "neutral" | "positive" | "negative"
  locale?: string
}) {
  const toneClass = tone === "positive" ? "text-green-500" : tone === "negative" ? "text-red-500" : "text-foreground"

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardDescription className={toneClass}>
          {typeof value === "number" ? value.toLocaleString(locale) : value}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {change !== undefined && (
          <div className="text-sm text-muted-foreground">{change}%</div>
        )}
      </CardContent>
    </Card>
  )
}
