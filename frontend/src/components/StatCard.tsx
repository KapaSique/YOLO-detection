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
    <div className="group rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-card-foreground">{value}</p>
          {secondary && <p className="text-xs text-muted-foreground">{secondary}</p>}
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}
