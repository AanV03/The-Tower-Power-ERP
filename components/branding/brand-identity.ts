"use client";

import { useEffect, useState } from "react";

import { defaultBrand } from "@/lib/branding";

export const BRAND_IDENTITY_STORAGE_KEY = "gerpy-brand-identity";

export type BrandIdentity = {
  name: string;
  subtitle: string;
  logoText: string;
  logoDataUrl?: string;
};

export const DEFAULT_BRAND_IDENTITY: BrandIdentity = {
  name: defaultBrand.name,
  subtitle: "Gimnasio ERP",
  logoText: defaultBrand.logoText,
};

export function normalizeBrandIdentity(
  identity: Partial<BrandIdentity> | null | undefined,
): BrandIdentity {
  return {
    ...DEFAULT_BRAND_IDENTITY,
    ...(identity ?? {}),
  };
}

export function loadBrandIdentity(): BrandIdentity {
  if (typeof window === "undefined") return DEFAULT_BRAND_IDENTITY;

  try {
    const raw = localStorage.getItem(BRAND_IDENTITY_STORAGE_KEY);
    if (!raw) return DEFAULT_BRAND_IDENTITY;
    return normalizeBrandIdentity(JSON.parse(raw) as Partial<BrandIdentity>);
  } catch {
    return DEFAULT_BRAND_IDENTITY;
  }
}

export async function persistBrandIdentity(identity: BrandIdentity) {
  localStorage.setItem(BRAND_IDENTITY_STORAGE_KEY, JSON.stringify(identity));

  if (typeof window !== "undefined") {
    await fetch("/api/admin/tenant", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandIdentity: identity }),
    }).catch(() => {});
  }
}

export function resetBrandIdentity() {
  localStorage.removeItem(BRAND_IDENTITY_STORAGE_KEY);
  document.dispatchEvent(new CustomEvent("brand:identity:reset"));
}

export function useBrandIdentity(serverIdentity?: BrandIdentity | null) {
  const [identity, setIdentity] = useState<BrandIdentity>(serverIdentity || DEFAULT_BRAND_IDENTITY);

  useEffect(() => {
    // Only load from local storage if there's no server identity provided,
    // or if we want to sync. But server is source of truth.
    if (!serverIdentity) {
      setIdentity(loadBrandIdentity());
    }

    const onUpdate = (event: Event) => {
      if (event instanceof CustomEvent) {
        setIdentity(normalizeBrandIdentity(event.detail as Partial<BrandIdentity>));
      }
    };

    const onReset = () => setIdentity(DEFAULT_BRAND_IDENTITY);

    document.addEventListener("brand:identity:update", onUpdate);
    document.addEventListener("brand:identity:reset", onReset);
    return () => {
      document.removeEventListener("brand:identity:update", onUpdate);
      document.removeEventListener("brand:identity:reset", onReset);
    };
  }, []);

  return identity;
}
