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
    <aside className="sticky top-6 flex h-[calc(100vh-3rem)] w-56 shrink-0 flex-col gap-6 rounded-xl border border-border bg-card p-4 shadow-sm scrollbar-thin overflow-y-auto">
      <div className="flex items-center gap-3 px-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-xs font-black tracking-tight text-primary-foreground">
          YG
        </div>
        <div className="leading-tight">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">YOLO</div>
          <div className="text-sm font-bold text-foreground">Guard</div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon size={16} className={active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"} />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
