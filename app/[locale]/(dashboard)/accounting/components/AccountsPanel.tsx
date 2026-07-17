"use client";

import { Lock, WalletCards } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AccountingStateBlock } from "./AccountingStateBlock";
import type { AccountStatus, AccountsPanelProps } from "./types";

const accountStatusClass: Record<AccountStatus, string> = {
  active: "bg-emerald-500/15 text-emerald-600",
  inactive: "border-border text-muted-foreground",
  locked: "bg-[var(--brand-yellow)] text-[var(--brand-ink)]",
};

const accountStatusLabel: Record<AccountStatus, string> = {
  active: "Activa",
  inactive: "Inactiva",
  locked: "Bloqueada",
};

export function AccountsPanel({
  accounts,
  status,
  labels,
  actions,
  accountTypeLabels,
  normalBalanceLabels,
}: AccountsPanelProps) {
  const resolvedStatus = accounts.length === 0 && status === "idle" ? "empty" : status;
  const showStateBlock = resolvedStatus !== "idle";

  return (
    <Card className="border-border/70 bg-card/80 shadow-xs ring-1 ring-foreground/5">
      <CardHeader className="space-y-2 pb-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <WalletCards className="size-4 text-primary" aria-hidden="true" />
            {labels.accountsTitle}
          </CardTitle>
        </div>
        <CardDescription>{labels.accountsDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {showStateBlock ? (
          <AccountingStateBlock
            status={resolvedStatus}
            emptyTitle={labels.emptyAccountsTitle}
            emptyDescription={labels.emptyAccountsDescription}
            errorTitle={labels.errorTitle}
            retryLabel={labels.retry}
            onRetry={actions?.onRetry}
          />
        ) : (
          accounts.map((account) => (
            <button
              key={account.id}
              type="button"
              className="w-full rounded-lg border border-border bg-background p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => actions?.onSelectAccount?.(account.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {account.code} - {account.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {accountTypeLabels[account.type]} -{" "}
                    {normalBalanceLabels[account.normalBalance]} - {account.branchScope}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn("shrink-0", accountStatusClass[account.status])}
                >
                  {account.status === "locked" ? (
                    <Lock className="size-3" aria-hidden="true" />
                  ) : null}
                  {accountStatusLabel[account.status]}
                </Badge>
              </div>
            </button>
          ))
        )}
      </CardContent>
    </Card>
  );
}
