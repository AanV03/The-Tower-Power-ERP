import { SlidersHorizontal } from "lucide-react";

export default function FilterBar() {
  return (
    <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end" aria-label="Dashboard filters">
      <div className="flex min-w-0 items-center gap-2 text-card-foreground">
        <SlidersHorizontal className="size-4 shrink-0 text-primary" aria-hidden="true" />
        <label htmlFor="range-select" className="text-sm font-medium text-muted-foreground">
          Range
        </label>
        <select
          id="range-select"
          className="h-11 cursor-pointer rounded-lg border border-input bg-background px-3 text-sm font-semibold text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
        >
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>This year</option>
        </select>
      </div>
    </div>
  );
}