"use client";

import { ErrorEmpty, NoDataEmpty } from "@/components/empty-state";
import { ListSkeleton } from "@/components/skeletons";
import type { AccountingUiStatus } from "./types";

export function AccountingStateBlock({
  status,
  emptyTitle,
  emptyDescription,
  errorTitle,
  retryLabel,
  onRetry,
}: {
  status: AccountingUiStatus;
  emptyTitle: string;
  emptyDescription: string;
  errorTitle: string;
  retryLabel: string;
  onRetry?: () => void;
}) {
  if (status === "loading") return <ListSkeleton items={5} />;

  if (status === "error") {
    return (
      <ErrorEmpty
        title={errorTitle}
        action={onRetry ? { label: retryLabel, onClick: onRetry } : undefined}
      />
    );
  }

  if (status === "empty") {
    return <NoDataEmpty title={emptyTitle} description={emptyDescription} />;
  }

  return null;
}
