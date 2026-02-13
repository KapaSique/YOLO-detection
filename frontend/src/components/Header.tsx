"use client";

import { Bell, CircleUser } from "lucide-react";
import { useTranslation } from "react-i18next";

import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const { t } = useTranslation();

  return (
    <header className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("welcome")}</p>
        <h1 className="text-xl font-semibold text-foreground">Real-time Object Detection</h1>
      </div>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
        <button className="rounded-md border border-border p-2 hover:bg-accent" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2 rounded-md border border-border px-3 py-1">
          <CircleUser size={18} />
          <span className="text-sm font-medium">Operator</span>
        </div>
      </div>
    </header>
  );
}
