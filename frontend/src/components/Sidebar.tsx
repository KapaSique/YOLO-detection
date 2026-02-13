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
    <aside className="flex h-screen w-64 flex-col gap-4 rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
          YG
        </div>
        <div>
          <div className="text-sm uppercase tracking-wide text-muted-foreground">YOLO</div>
          <div className="text-lg font-bold text-foreground">Guard</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Icon size={16} />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
