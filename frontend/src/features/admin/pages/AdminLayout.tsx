import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

const NAV = [
  { to: "/admin/users", key: "admin.users" },
  { to: "/admin/sections", key: "admin.sections" },
  { to: "/admin/news", key: "admin.news" },
  { to: "/admin/pages", key: "admin.pages" },
  { to: "/admin/talks", key: "admin.talks" },
  { to: "/admin/materials", key: "admin.materials" },
  { to: "/admin/documents", key: "admin.documents" },
  { to: "/admin/program", key: "nav.program" },
  { to: "/admin/audit", key: "admin.audit" },
  { to: "/admin/exports", key: "admin.exports" },
];

export default function AdminLayout() {
  const { t } = useTranslation();
  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="card h-fit p-4">
        <div className="text-sm font-semibold text-slate-500 dark:text-slate-300">{t("admin.menu")}</div>
        <nav className="mt-3 flex flex-col gap-2">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-brand-700 text-white shadow"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                }`
              }
            >
              {t(item.key)}
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
