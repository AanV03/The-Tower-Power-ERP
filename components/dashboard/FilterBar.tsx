import React from "react";

export default function FilterBar() {
  return (
    <div className="fixed top-16 left-0 right-0 z-40">{/* fixed under Topbar (h-16) */}
      <div className="container mx-auto px-4 lg:px-6">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-3 rounded-md shadow-sm flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-500" aria-hidden>Rango</label>
          <select className="text-sm bg-transparent">
            <option>Últimos 7 días</option>
            <option>Últimos 30 días</option>
            <option>Este año</option>
          </select>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <button className="text-sm text-slate-500">Exportar</button>
          <button className="text-sm text-indigo-600">Guardar vista</button>
        </div>
        </div>
      </div>
    </div>
  );
}
