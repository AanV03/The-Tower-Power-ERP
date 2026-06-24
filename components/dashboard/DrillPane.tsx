import React from "react";

type Props = {
  open?: boolean;
  title?: string;
  onClose?: () => void;
};

export default function DrillPane({ open = false, title = "Detalle", onClose }: Props) {
  return (
    <aside className={`transition-transform ${open ? "translate-x-0" : "translate-x-full"} fixed right-0 top-0 h-full w-full md:w-[520px] bg-white dark:bg-slate-900 shadow-lg z-40`} aria-hidden={!open}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-sm text-slate-500">Cerrar</button>
        </div>
      </div>
      <div className="p-4 overflow-auto">Contenido de detalle (placeholder)</div>
    </aside>
  );
}
