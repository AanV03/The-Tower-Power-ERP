"use client";

import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { NativeSelect } from "@/components/ui/native-select";
import { scopeOptions, tenantOptions } from "@/data/navigation";
import { getDictionary, type Locale } from "@/lib/i18n";

export function BranchScopeSelector({
  locale,
  inHeader = false,
}: {
  locale: Locale;
  inHeader?: boolean;
}) {
  const dictionary = getDictionary(locale);
  const iconClass = inHeader
    ? "pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-white/70"
    : "pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground";

  const tenantClass = cn("w-36 md:w-40", inHeader ? "pl-9 bg-transparent border border-white/10 text-white" : "pl-9");
  const scopeClass = cn("w-36 md:w-40", inHeader ? "bg-transparent border border-white/10 text-white" : undefined);

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <label className="sr-only" htmlFor="tenant-selector">
        {dictionary.common.tenant}
      </label>
      <div className="relative">
        <Building2 aria-hidden="true" className={iconClass} />
        <NativeSelect id="tenant-selector" className={tenantClass} defaultValue="gerpy-hq">
          {tenantOptions.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.label}
            </option>
          ))}
        </NativeSelect>
      </div>

      <label className="sr-only" htmlFor="scope-selector">
        {dictionary.common.scope}
      </label>
      <NativeSelect id="scope-selector" className={scopeClass} defaultValue="consolidated">
        {scopeOptions.map((scope) => (
          <option key={scope.id} value={scope.id}>
            {scope.label[locale]}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}
