import React from "react";

export default function FilterBar() {
  return (
    <div className="w-full z-10 relative">
      <div className="bg-card text-card-foreground p-3 rounded-xl border border-border shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label htmlFor="rango-select" className="text-sm text-muted-foreground" aria-hidden>
            Rango
          </label>
          <select
            id="rango-select"
            className="text-sm bg-transparent border-none outline-none focus:ring-0 cursor-pointer font-medium text-foreground"
          >
            <option className="bg-card text-foreground">Últimos 7 días</option>
            <option className="bg-card text-foreground">Últimos 30 días</option>
            <option className="bg-card text-foreground">Este año</option>
          </select>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium cursor-pointer">
            Exportar
          </button>
          <button className="text-sm text-primary hover:brightness-110 font-semibold transition-all cursor-pointer">
            Guardar vista
          </button>
        </div>
      </div>
    </div>
  );
}
