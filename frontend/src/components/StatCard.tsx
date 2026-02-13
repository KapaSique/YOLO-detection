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
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold text-card-foreground">{value}</p>
          {secondary ? <p className="text-sm text-muted-foreground">{secondary}</p> : null}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">{icon}</div>
      </div>
    </div>
  );
}
