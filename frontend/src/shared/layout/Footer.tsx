import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { LanguageSwitch } from "../controls/LanguageSwitch";
import { ThemeSwitch } from "../controls/ThemeSwitch";

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="relative mt-16 overflow-hidden border-t border-brand-200/30 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-950 dark:border-brand-900/30">
      <div className="absolute inset-0 opacity-20 dark:opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-400 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400 rounded-full blur-3xl opacity-20"></div>
      </div>
      
      <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-xs font-bold text-white shadow-lg">
                CS
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">ConfSite</div>
                <div className="text-xs text-brand-600 dark:text-brand-400 font-semibold">Summit</div>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("app.tagline")}</p>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t("nav.menu")}</h3>
            <div className="flex flex-col gap-2">
              <Link to="/page/contacts" className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                {t("nav.contacts")}
              </Link>
              <Link to="/news" className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                {t("nav.news")}
              </Link>
              <Link to="/participants" className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                {t("nav.participants")}
              </Link>
              <Link to="/program" className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                {t("nav.program")}
              </Link>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t("nav.additional")}</h3>
            <div className="flex items-center gap-2">
              <LanguageSwitch />
              <ThemeSwitch />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-4">© 2025 ConfSite. All rights reserved.</p>
          </div>
        </div>
        
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
          <p className="text-xs text-center text-slate-500 dark:text-slate-400">
            Made with <span className="text-red-500">♥</span> for amazing conferences
          </p>
        </div>
      </div>
    </footer>
  );
}
