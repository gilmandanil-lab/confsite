import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import ru from "./ru.json";

const saved =
  (typeof window !== "undefined" && window.localStorage.getItem("i18nextLng")) ||
  (typeof document !== "undefined" ? document.documentElement.lang : null);

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
  },
  lng: saved || "ru",
  fallbackLng: "ru",
  interpolation: {
    escapeValue: false,
  },
});

export { i18n };
