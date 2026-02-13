"use client";

import { Bell, CircleUser } from "lucide-react";
import { useTranslation } from "react-i18next";

import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const { t } = useTranslation();

  return (
    <header className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3 shadow-sm">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{t("welcome")}</p>
        <h1 className="text-lg font-semibold text-foreground">Real-time Object Detection</h1>
      </div>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
        <button
          className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell size={16} />
        </button>
        <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5">
          <CircleUser size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium">Operator</span>
        </div>
      </div>
    </header>
  );
}
