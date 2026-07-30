"use client";

import { useEffect, useRef, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";

type AvatarMenuProps = {
  basePortalPath: string;
  loginPath: string;
  initials: string;
  memberName: string;
};

export default function AvatarMenu({
  basePortalPath,
  loginPath,
  initials,
  memberName,
}: AvatarMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    setIsOpen(false);
    setIsSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign(loginPath);
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen((value) => !value)}
        className="flex items-center gap-1 p-1 rounded-full bg-[var(--surface-color)] hover:bg-[var(--surface-color)]/80 border border-[var(--surface-color)]/50 transition-colors cursor-pointer"
        aria-label={`Menu de ${memberName}`}
      >
        <div className="w-7 h-7 rounded-full bg-[var(--primary-color)] text-black flex items-center justify-center font-bold text-xs">
          {initials}
        </div>
        <ChevronDown className="w-3.5 h-3.5 opacity-65 pr-0.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[var(--surface-color)] border border-[var(--border)] shadow-xl z-[999] py-1 text-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <Link
            href={`${basePortalPath}/profile` as Route}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-[var(--text-color)] hover:bg-[var(--primary-color)] hover:text-black transition-colors text-left w-full"
          >
            <User className="w-4 h-4" />
            <span>Mi Perfil</span>
          </Link>
          <Link
            href={`${basePortalPath}/settings` as Route}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-[var(--text-color)] hover:bg-[var(--primary-color)] hover:text-black transition-colors text-left w-full"
          >
            <Settings className="w-4 h-4" />
            <span>Configuracion</span>
          </Link>
          <hr className="border-[var(--border)] my-1" />
          <button
            disabled={isSigningOut}
            onClick={handleSignOut}
            className="flex items-center gap-2.5 px-4 py-2.5 text-red-400 hover:bg-red-500/10 transition-colors text-left w-full cursor-pointer disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            <span>{isSigningOut ? "Cerrando..." : "Cerrar Sesion"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
