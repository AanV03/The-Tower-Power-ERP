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

export function persistBrandIdentity(identity: BrandIdentity) {
  localStorage.setItem(BRAND_IDENTITY_STORAGE_KEY, JSON.stringify(identity));
  document.dispatchEvent(new CustomEvent("brand:identity:update", { detail: identity }));
}

export function resetBrandIdentity() {
  localStorage.removeItem(BRAND_IDENTITY_STORAGE_KEY);
  document.dispatchEvent(new CustomEvent("brand:identity:reset"));
}

export function useBrandIdentity() {
  const [identity, setIdentity] = useState<BrandIdentity>(DEFAULT_BRAND_IDENTITY);

  useEffect(() => {
    setIdentity(loadBrandIdentity());

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
