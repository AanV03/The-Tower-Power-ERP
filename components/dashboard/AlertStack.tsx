import React from "react";

type AlertItem = {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  time?: string;
};

type Props = {
  items?: AlertItem[];
};

export default function AlertStack({ items = [] }: Props) {
  return (
    <aside className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Alertas</h4>
        <button className="text-xs text-slate-500">Ver todo</button>
      </div>
      <div className="space-y-2">
        {items.slice(0, 3).map((it) => (
          <div key={it.id} className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-md shadow-xs">
            <div className={`w-3 h-3 rounded-full ${it.severity === "critical" ? "bg-red-500" : it.severity === "warning" ? "bg-yellow-500" : "bg-blue-400"}`} />
            <div className="flex-1">
              <div className="text-sm font-medium">{it.title}</div>
              {it.time && <div className="text-xs text-slate-400">{it.time}</div>}
            </div>
            <div className="text-sm">
              <button className="text-indigo-600">Acción</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-slate-400">Sin alertas críticas</div>}
      </div>
    </aside>
  );
}
