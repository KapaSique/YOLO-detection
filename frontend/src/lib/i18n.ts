import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      dashboard: "Dashboard",
      live: "Live",
      history: "History",
      analytics: "Analytics",
      alerts: "Alerts",
      sources: "Sources",
      settings: "Settings",
      users: "Users",
      welcome: "YOLO Guard",
      activeSource: "Active source",
      fps: "FPS",
      latency: "Latency",
      detections24h: "Detections (24h)",
      topClass: "Top class (1h)",
      alerts24h: "Alerts (24h)",
      startStream: "Start",
      stopStream: "Stop",
      confThreshold: "Confidence",
      iouThreshold: "IoU threshold",
      language: "Language",
      theme: "Theme"
    }
  },
  ru: {
    translation: {
      dashboard: "Дашборд",
      live: "Онлайн",
      history: "История",
      analytics: "Аналитика",
      alerts: "Алерты",
      sources: "Источники",
      settings: "Настройки",
      users: "Пользователи",
      welcome: "YOLO Guard",
      activeSource: "Активный источник",
      fps: "FPS",
      latency: "Задержка",
      detections24h: "Детекции (24ч)",
      topClass: "Топ класс (1ч)",
      alerts24h: "Алерты (24ч)",
      startStream: "Старт",
      stopStream: "Стоп",
      confThreshold: "Порог уверенности",
      iouThreshold: "Порог IoU",
      language: "Язык",
      theme: "Тема"
    }
  }
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });
}

export { i18n };
