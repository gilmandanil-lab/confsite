import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";
import { LanguageSwitch } from "../controls/LanguageSwitch";
import { ThemeSwitch } from "../controls/ThemeSwitch";

const NAV_LINKS = [
  { to: "/", label: "nav.home" },
  { to: "/program", label: "nav.program" },
  { to: "/history", label: "nav.history" },
  { to: "/fee", label: "nav.fee" },
  { to: "/news", label: "nav.news" },
  { to: "/participants", label: "nav.participants" },
  { to: "/contacts", label: "nav.contacts" },
];

export function Header() {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const activePath = useMemo(() => location.pathname, [location.pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-brand-200/20 bg-white/95 shadow-lg backdrop-blur-md dark:border-brand-900/20 dark:bg-slate-950/95 dark:shadow-2xl">
      <div className="mx-auto flex items-center justify-between gap-4 px-4 py-4 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-3 font-bold">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-brand text-xs font-bold text-white shadow-lg shadow-brand-600/40 dark:shadow-brand-500/40">
            CS
          </div>
          <div className="hidden leading-tight sm:block">
            <div className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">Summit</div>
            <div className="text-base font-bold text-slate-900 dark:text-white">Conference</div>
          </div>
        </Link>
        <nav className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto scrollbar-hide">
          {NAV_LINKS.map((item) => {
            const active = activePath === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-300 lg:px-4 lg:py-2.5 lg:text-sm ${
                  active
                    ? "bg-gradient-brand text-white shadow-lg shadow-brand-600/30 dark:shadow-brand-500/30"
                    : "text-slate-700 hover:text-brand-700 hover:bg-brand-100/50 dark:text-slate-300 dark:hover:bg-brand-900/20 dark:hover:text-brand-300"
                }`}
              >
                {t(item.label)}
                {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-400 to-indigo-500 rounded-full" />}
              </Link>
            );
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-2 lg:gap-3">
          <LanguageSwitch />
          <ThemeSwitch />
          {isAuthenticated ? (
            <div className="hidden items-center gap-2 lg:flex">
              {user?.status && (
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    user.status === "APPROVED"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : user.status === "REJECTED"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                  }`}
                >
                  {t(`status.${user.status.toLowerCase()}`)}
                </span>
              )}
              <Link
                to="/cabinet"
                className="rounded-lg bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/40 hover:shadow-brand-600/60 hover:-translate-y-0.5 transition-all dark:shadow-brand-500/40 dark:hover:shadow-brand-500/60"
              >
                {t("nav.cabinet")}
              </Link>
              {user?.roles?.includes("ADMIN") && (
                <Link
                  to="/admin"
                  className="rounded-lg border-2 border-brand-300 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 hover:border-brand-400 transition-all dark:border-brand-700 dark:text-brand-300 dark:hover:bg-brand-950/40 dark:hover:border-brand-600"
                >
                  {t("nav.admin")}
                </Link>
              )}
              <button
                onClick={() => logout()}
                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {t("actions.logout")}
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-gradient-brand px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-brand-600/40 hover:shadow-brand-600/60 hover:-translate-y-0.5 transition-all lg:px-5 lg:py-2.5 lg:text-sm dark:shadow-brand-500/40 dark:hover:shadow-brand-500/60"
            >
              {t("actions.login")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
