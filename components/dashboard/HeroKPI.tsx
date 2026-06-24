import React from "react";

type Props = {
  title: string;
  value: string | number;
  subtitle?: string;
  meta?: string;
  children?: React.ReactNode;
};

export default function HeroKPI({ title, value, subtitle, meta, children }: Props) {
  return (
    <section className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-slate-500">{title}</h3>
          <div className="mt-1 text-3xl font-semibold text-slate-900">{value}</div>
          {subtitle && <div className="mt-1 text-sm text-slate-500">{subtitle}</div>}
        </div>
        <div className="text-right text-sm text-slate-400">{meta}</div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </section>
  );
}
