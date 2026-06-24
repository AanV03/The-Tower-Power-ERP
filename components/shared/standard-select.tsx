"use client"

import type * as React from "react"

import {
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

function StandardSelectTrigger({
  className,
  ...props
}: React.ComponentProps<typeof SelectTrigger>) {
  return (
    <SelectTrigger
      className={cn(
        "w-full bg-background text-foreground dark:bg-input/30 dark:text-foreground",
        className,
      )}
      {...props}
    />
  )
}

function StandardSelectContent({
  className,
  ...props
}: React.ComponentProps<typeof SelectContent>) {
  return (
    <SelectContent
      className={cn(
        "border border-border bg-popover text-popover-foreground shadow-lg",
        className,
      )}
      {...props}
    />
  )
}

function StandardSelectValue(props: React.ComponentProps<typeof SelectValue>) {
  return <SelectValue {...props} />
}

export {
  StandardSelectContent,
  StandardSelectTrigger,
  StandardSelectValue,
}
