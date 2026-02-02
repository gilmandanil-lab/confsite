import { useTranslation } from "react-i18next";

const LANGS: Array<"ru" | "en"> = ["ru", "en"];

export function LanguageSwitch() {
  const { i18n } = useTranslation();
  const current = (i18n.language as "ru" | "en") || "ru";

  const setLang = (lng: "ru" | "en") => {
    i18n.changeLanguage(lng);
    if (typeof document !== "undefined") {
      document.documentElement.lang = lng;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem("i18nextLng", lng);
    }
  };

  return (
    <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 p-1 text-xs font-semibold dark:bg-slate-800">
      {LANGS.map((lng) => (
        <button
          key={lng}
          onClick={() => setLang(lng)}
          className={`rounded-md px-3 py-1.5 transition-all duration-300 ${
            current === lng
              ? "bg-gradient-brand text-white shadow-md shadow-brand-600/40 dark:shadow-brand-500/40"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
          title={`Switch to ${lng === 'ru' ? 'Russian' : 'English'}`}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
