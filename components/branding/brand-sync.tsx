"use client";

import { useEffect, useRef } from "react";
import { BRAND_STORAGE_KEY } from "./brand-color-applier";
import { BRAND_IDENTITY_STORAGE_KEY } from "./brand-identity";

export function BrandSync({
  serverColors,
  serverIdentity,
}: {
  serverColors: any;
  serverIdentity: any;
}) {
  const synced = useRef(false);

  useEffect(() => {
    if (synced.current) return;
    synced.current = true;

    if (serverColors) {
      localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(serverColors));
      document.dispatchEvent(new CustomEvent("brand:update", { detail: serverColors }));
    }
    
    if (serverIdentity) {
      localStorage.setItem(BRAND_IDENTITY_STORAGE_KEY, JSON.stringify(serverIdentity));
      document.dispatchEvent(new CustomEvent("brand:identity:update", { detail: serverIdentity }));
    }
  }, [serverColors, serverIdentity]);

  return null;
}
