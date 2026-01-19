"use client";

import { Bell, CircleUser } from "lucide-react";
import { useTranslation } from "react-i18next";

import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const { t } = useTranslation();

  return (
    <header className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/50 px-4 py-3 backdrop-blur dark:bg-[#0c1220]/70">
      <div>
        <p className="text-xs uppercase tracking-wide text-neutral-500">{t("welcome")}</p>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Real-time Object Detection</h1>
      </div>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
        <button className="rounded-full border border-white/10 p-2 hover:border-brand" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1">
          <CircleUser size={18} />
          <span className="text-sm font-semibold">Operator</span>
        </div>
      </div>
    </header>
  );
}
