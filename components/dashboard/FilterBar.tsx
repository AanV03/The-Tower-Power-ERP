import { Download, Save, SlidersHorizontal } from "lucide-react";

export default function FilterBar() {
  return (
    <div className="relative z-10 w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/95 p-3 text-card-foreground shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[var(--brand-orange)]/10 text-[var(--brand-orange)]">
            <SlidersHorizontal className="size-4" aria-hidden="true" />
          </div>
          <label htmlFor="range-select" className="text-sm font-medium text-muted-foreground">
            Range
          </label>
          <select
            id="range-select"
            className="cursor-pointer rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
          >
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>This year</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" type="button">
            <Download className="size-4" aria-hidden="true" />
            Export
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-orange)] px-3 py-2 text-sm font-bold text-black transition-all hover:brightness-110" type="button">
            <Save className="size-4" aria-hidden="true" />
            Save view
          </button>
        </div>
      </div>
    </div>
  );
}
