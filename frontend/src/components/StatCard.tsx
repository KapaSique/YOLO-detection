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
    <div className="card relative overflow-hidden p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
          {secondary ? <p className="text-sm text-neutral-500">{secondary}</p> : null}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">{icon}</div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-r from-brand/10 to-brand/0" />
    </div>
  );
}
