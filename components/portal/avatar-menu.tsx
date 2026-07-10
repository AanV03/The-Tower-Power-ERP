"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";

interface AvatarMenuProps {
  basePortalPath: string;
}

export default function AvatarMenu({ basePortalPath }: AvatarMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 p-1 rounded-full bg-[var(--surface-color)] hover:bg-[var(--surface-color)]/80 border border-[var(--surface-color)]/50 transition-colors cursor-pointer"
        aria-label="Menú de usuario"
      >
        <div className="w-7 h-7 rounded-full bg-[var(--primary-color)] text-black flex items-center justify-center font-bold text-xs">
          US
        </div>
        <ChevronDown className="w-3.5 h-3.5 opacity-65 pr-0.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[var(--surface-color)] border border-[var(--border)] shadow-xl z-[999] py-1 text-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <Link
            href={`${basePortalPath}/profile` as any}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-[var(--text-color)] hover:bg-[var(--primary-color)] hover:text-black transition-colors text-left w-full"
          >
            <User className="w-4 h-4" />
            <span>Mi Perfil</span>
          </Link>
          
          <Link
            href={`${basePortalPath}/settings` as any}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-[var(--text-color)] hover:bg-[var(--primary-color)] hover:text-black transition-colors text-left w-full"
          >
            <Settings className="w-4 h-4" />
            <span>Configuración</span>
          </Link>
          
          <hr className="border-[var(--border)] my-1" />
          
          <button
            onClick={() => {
              setIsOpen(false);
              alert("Cerrando sesión en modo demo...");
            }}
            className="flex items-center gap-2.5 px-4 py-2.5 text-red-400 hover:bg-red-500/10 transition-colors text-left w-full cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}
    </div>
  );
}
