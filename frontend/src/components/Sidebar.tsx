"use client";

import { Activity, AlertTriangle, BarChart3, Camera, Cog, History, Layers, MonitorSmartphone, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

const navItems = [
  { href: "/", labelKey: "dashboard", icon: BarChart3 },
  { href: "/live", labelKey: "live", icon: MonitorSmartphone },
  { href: "/history", labelKey: "history", icon: History },
  { href: "/analytics", labelKey: "analytics", icon: Activity },
  { href: "/alerts", labelKey: "alerts", icon: AlertTriangle },
  { href: "/sources", labelKey: "sources", icon: Camera },
  { href: "/settings", labelKey: "settings", icon: Cog },
  { href: "/users", labelKey: "users", icon: Users },
  { href: "/models", labelKey: "models", icon: Layers }
];

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <aside className="surface-card scrollbar-thin sticky top-6 flex h-[calc(100vh-3rem)] w-60 shrink-0 flex-col gap-7 overflow-y-auto rounded-2xl p-4">
      <div className="flex items-center gap-3 px-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/30 bg-accent/15 text-xs font-black tracking-tight text-accent">
          YG
        </div>
        <div className="leading-tight">
          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">YOLO</div>
          <div className="text-2xl font-semibold tracking-tight text-foreground">Guard</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors ${
                active
                  ? "border border-accent/30 bg-accent/10 text-accent"
                  : "border border-transparent text-muted-foreground hover:border-border/70 hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              <Icon size={16} className={active ? "text-accent" : "text-muted-foreground group-hover:text-foreground"} />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
