"use client";

import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  secondary?: string;
  icon?: ReactNode;
}

export function StatCard({ title, value, secondary, icon }: StatCardProps) {
  return (
    <div className="surface-card group rounded-2xl p-4 transition-colors hover:border-accent/30">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-card-foreground">{value}</p>
          {secondary && <p className="text-xs text-muted-foreground">{secondary}</p>}
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
          {icon}
        </div>
      </div>
    </div>
  );
}
