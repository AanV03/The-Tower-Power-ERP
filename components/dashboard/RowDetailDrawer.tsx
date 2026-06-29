import { BadgeCheck, CreditCard, DoorOpen, ShieldCheck } from "lucide-react";

type Props = {
  open?: boolean;
  id?: string | number;
  onClose?: () => void;
};

export default function RowDetailDrawer({ open = true, id, onClose }: Props) {
  if (!open) return null;

  return (
    <section className="h-full rounded-2xl border border-border bg-card/90 p-6 text-card-foreground shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-black uppercase tracking-[0.16em] text-emerald-600">
            <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_16px_rgba(16,185,129,0.8)]" />
            Live branch
          </p>
          <h4 className="mt-3 text-lg font-bold">Operational status {id ?? ""}</h4>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-sm font-semibold text-muted-foreground hover:text-foreground" type="button">
            Close
          </button>
        )}
      </div>

      <div className="mt-5 grid gap-3 text-sm">
        <div className="rounded-xl border border-border bg-background/70 p-3">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <DoorOpen className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold">Front desk clear</p>
              <p className="mt-1 text-xs text-muted-foreground">No access exceptions in the last hour.</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-background/70 p-3">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600">
              <CreditCard className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold">Revenue synced</p>
              <p className="mt-1 text-xs text-muted-foreground">POS and subscription totals are reconciled.</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-background/70 p-3">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <ShieldCheck className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold">Access devices online</p>
              <p className="mt-1 text-xs text-muted-foreground">Doors, scanners, and turnstiles are reporting normally.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-700">
        <div className="flex items-center gap-2 font-bold">
          <BadgeCheck className="size-4" aria-hidden="true" />
          Branch health: 94%
        </div>
      </div>
    </section>
  );
}
