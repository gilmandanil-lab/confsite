import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ParticipantLayout() {
  const { t } = useTranslation();
  const nav = [
    { to: "/cabinet", label: t("cabinet.dashboard") },
    { to: "/cabinet/profile", label: t("cabinet.profile") },
    { to: "/cabinet/talks", label: t("cabinet.talks") },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="card h-fit p-4">
        <div className="text-sm font-semibold text-slate-500 dark:text-slate-300">{t("cabinet.menu")}</div>
        <nav className="mt-3 flex flex-col gap-2">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/cabinet"}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-brand-700 text-white shadow"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="space-y-4">
        <Outlet />
      </div>
    </div>
  );
}
