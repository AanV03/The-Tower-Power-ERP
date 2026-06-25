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
    <section className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-xs">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="mt-1 text-3xl font-bold text-foreground">{value}</div>
          {subtitle && <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div>}
        </div>
        <div className="text-right text-sm text-muted-foreground">{meta}</div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </section>
  );
}
