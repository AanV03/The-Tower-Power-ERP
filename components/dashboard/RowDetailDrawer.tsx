import React from "react";

type Props = {
  open?: boolean;
  id?: string | number;
  onClose?: () => void;
};

export default function RowDetailDrawer({ open = true, id, onClose }: Props) {
  // Render as an inline principal card by default to avoid fixed overlays.
  if (!open) return null;

  return (
    <section className="bg-white dark:bg-slate-900 p-6 rounded-md shadow-sm mt-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium">Detalle {id ?? ""}</h4>
        {onClose && <button onClick={onClose} className="text-sm text-slate-500">Cerrar</button>}
      </div>
      <div className="mt-4 text-sm text-slate-500">Información resumida (placeholder)</div>
    </section>
  );
}
