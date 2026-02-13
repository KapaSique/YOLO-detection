"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  useEffect(() => {
    const saved = localStorage.getItem("yolo-lang");
    if (saved && saved !== i18n.language) {
      i18n.changeLanguage(saved);
    }
  }, [i18n]);

  const toggle = () => {
    const next = i18n.language === "en" ? "ru" : "en";
    i18n.changeLanguage(next);
    localStorage.setItem("yolo-lang", next);
  };

  return (
    <button
      className="rounded-md border border-border px-3 py-1 text-sm font-medium hover:bg-accent"
      onClick={toggle}
      aria-label={t("language")}
    >
      {i18n.language.toUpperCase()}
    </button>
  );
}
