"use client";

import { Activity, AlarmClock, GaugeCircle, Signal } from "lucide-react";
import { useTranslation } from "react-i18next";

import { AnalyticsPreview } from "../components/AnalyticsPreview";
import { EventList } from "../components/EventList";
import { Header } from "../components/Header";
import { LivePreview } from "../components/LivePreview";
import { Sidebar } from "../components/Sidebar";
import { StatCard } from "../components/StatCard";

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f2ff] to-[#f8f9ff] text-neutral-900 dark:from-[#050b16] dark:to-[#0a1022] dark:text-white">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <Sidebar />

        <main className="flex-1 space-y-4">
          <Header />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title={t("activeSource")} value="Dock-RTSP" secondary="Running" icon={<GaugeCircle size={18} />} />
            <StatCard title={t("fps")} value="18.3" secondary="Target 24" icon={<Signal size={18} />} />
            <StatCard title={t("latency")} value="41 ms" secondary="P95 last 5 min" icon={<Activity size={18} />} />
            <StatCard title={t("detections24h")} value="5,124" secondary={`${t("alerts24h")}: 12`} icon={<AlarmClock size={18} />} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <LivePreview />
            </div>
            <div className="space-y-4">
              <EventList />
              <AnalyticsPreview />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
