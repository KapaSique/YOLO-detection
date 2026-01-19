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
    <aside className="card flex h-screen w-64 flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <div className="gradient-pill h-10 w-10 rounded-xl" />
        <div>
          <div className="text-sm uppercase tracking-wide text-neutral-500">YOLO</div>
          <div className="text-lg font-bold text-neutral-900 dark:text-white">Guard</div>
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
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                active ? "bg-brand/10 text-brand" : "text-neutral-600 hover:bg-black/5 dark:text-neutral-200"
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
