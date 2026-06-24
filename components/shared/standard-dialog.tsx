"use client"

import type * as React from "react"

import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

function StandardDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  return (
    <DialogContent
      className={cn(
        "max-w-2xl gap-5 rounded-lg border border-border bg-background text-foreground shadow-xl dark:border-border dark:bg-popover dark:text-popover-foreground",
        className,
      )}
      {...props}
    />
  )
}

function StandardDialogHeader({
  className,
  ...props
}: React.ComponentProps<typeof DialogHeader>) {
  return (
    <DialogHeader
      className={cn("gap-1.5 border-b border-border pb-4", className)}
      {...props}
    />
  )
}

function StandardDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogTitle>) {
  return (
    <DialogTitle
      className={cn("font-heading text-lg font-semibold leading-normal", className)}
      {...props}
    />
  )
}

function StandardDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogDescription>) {
  return (
    <DialogDescription
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function StandardDialogFooter({
  className,
  ...props
}: React.ComponentProps<typeof DialogFooter>) {
  return (
    <DialogFooter
      className={cn("border-t border-border pt-4", className)}
      {...props}
    />
  )
}

export {
  StandardDialogContent,
  StandardDialogDescription,
  StandardDialogFooter,
  StandardDialogHeader,
  StandardDialogTitle,
}
