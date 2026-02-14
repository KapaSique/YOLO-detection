"use client";

import { Bell, CircleUser } from "lucide-react";
import { useTranslation } from "react-i18next";

import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const { t } = useTranslation();

  return (
    <header className="surface-card flex items-center justify-between rounded-2xl px-5 py-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{t("welcome")}</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Real-time Object Detection</h1>
      </div>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
        <button
          className="rounded-xl border border-border/80 p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell size={16} />
        </button>
        <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-muted/45 px-3 py-1.5">
          <CircleUser size={16} className="text-accent" />
          <span className="text-sm font-medium tracking-wide">Operator</span>
        </div>
      </div>
    </header>
  );
}
