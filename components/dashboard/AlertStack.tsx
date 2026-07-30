import type { Route } from "next";
import Link from "next/link";
import { BellOff, CircleAlert } from "lucide-react";

type AlertItem = {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  time?: string;
};

type Props = {
  items?: AlertItem[];
  locale: string;
};

const severityClass = {
  critical: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-sky-400",
};

export default function AlertStack({ items = [], locale }: Props) {
  return (
    <aside className="rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-foreground">Exception queue</h4>
          <p className="mt-1 text-xs text-muted-foreground">Critical items that need action</p>
        </div>
        <Link
          href={`/${locale}/notifications` as Route}
          className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          View all
        </Link>
      </div>

      <div className="mt-4 space-y-2">
        {items.slice(0, 3).map((item) => (
          <div key={item.id} className="flex items-start gap-3 rounded-xl border border-border bg-background/45 p-3">
            <div className={`mt-1 h-2.5 w-2.5 rounded-full ${severityClass[item.severity]}`} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-foreground">{item.title}</div>
              {item.time && <div className="text-xs text-muted-foreground">{item.time}</div>}
            </div>
            <CircleAlert className="size-4 text-muted-foreground" aria-hidden="true" />
          </div>
        ))}

        {items.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-background/35 p-5 text-center">
            <BellOff className="mx-auto size-5 text-emerald-400" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold text-foreground">No critical alerts</p>
            <p className="mt-1 text-xs text-muted-foreground">Everything important is quiet right now.</p>
          </div>
        )}
      </div>
    </aside>
  );
}
