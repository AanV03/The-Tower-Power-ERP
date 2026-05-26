import { ReactNode } from "react";
import { Package, AlertCircle, Inbox, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { defaultLocale, formatMessage, getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: "default" | "search" | "error" | "no-data";
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "default",
  className,
}: EmptyStateProps) {
  const defaultIcons = {
    default: <Package className="w-12 h-12 text-muted-foreground" aria-hidden="true" />,
    search: <Search className="w-12 h-12 text-muted-foreground" aria-hidden="true" />,
    error: <AlertCircle className="w-12 h-12 text-destructive" aria-hidden="true" />,
    "no-data": <Inbox className="w-12 h-12 text-muted-foreground" aria-hidden="true" />,
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 rounded-lg glass-effect border border-[var(--sidebar-border-color)]",
        className,
      )}
      role="status"
      aria-label={title}
    >
      <div className="flex justify-center mb-4">
        {icon || defaultIcons[variant]}
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2 text-center">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
          {description}
        </p>
      )}

      {action && (
        <Button
          onClick={action.onClick}
          variant="default"
          size="sm"
          className="mt-2"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function NoResultsEmpty({
  query,
  onClear,
  locale = defaultLocale,
}: {
  query: string;
  onClear: () => void;
  locale?: Locale;
}) {
  const dictionary = getDictionary(locale);

  return (
    <EmptyState
      variant="search"
      title={dictionary.emptyState.noResults}
      description={formatMessage(dictionary.emptyState.noResultsDescription, { query })}
      action={{
        label: dictionary.emptyState.clearSearch,
        onClick: onClear,
      }}
    />
  );
}

export function NoDataEmpty({
  title,
  description,
  action,
  locale = defaultLocale,
}: {
  title?: string;
  description?: string;
  action?: EmptyStateProps["action"];
  locale?: Locale;
}) {
  const dictionary = getDictionary(locale);

  return (
    <EmptyState
      variant="no-data"
      title={title ?? dictionary.emptyState.noData}
      description={description ?? dictionary.emptyState.noDataDescription}
      action={action}
    />
  );
}

export function ErrorEmpty({
  title,
  description,
  action,
  locale = defaultLocale,
}: {
  title?: string;
  description?: string;
  action?: EmptyStateProps["action"];
  locale?: Locale;
}) {
  const dictionary = getDictionary(locale);

  return (
    <EmptyState
      variant="error"
      title={title ?? dictionary.emptyState.error}
      description={description ?? dictionary.emptyState.errorDescription}
      action={action}
    />
  );
}
