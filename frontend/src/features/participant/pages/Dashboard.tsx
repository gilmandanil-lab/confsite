import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../../../app/providers/AuthProvider";
import { fetchMyTalks, fetchProfile } from "../../../shared/api";

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const profileQuery = useQuery({
    queryKey: ["profile", i18n.language],
    queryFn: fetchProfile,
  });
  const talksQuery = useQuery({
    queryKey: ["my-talks", i18n.language],
    queryFn: fetchMyTalks,
  });

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">{t("cabinet.dashboard")}</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("cabinet.welcome")}</h1>
        <p className="text-slate-600 dark:text-slate-300">
          {t("cabinet.summary", {
            email: user?.email || "",
          })}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="card p-4">
          <div className="text-sm text-slate-500 dark:text-slate-300">{t("status.label")}</div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            {user ? t(`status.${user.status.toLowerCase()}`) : t("status.unknown")}
          </div>
          <Link to="/register" className="mt-3 inline-flex text-sm font-semibold text-brand-700 hover:text-brand-900 dark:text-brand-200">
            {t("cabinet.updateRegistration")} →
          </Link>
        </div>
        <div className="card p-4">
          <div className="text-sm text-slate-500 dark:text-slate-300">{t("cabinet.talks")}</div>
          <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{talksQuery.data?.length ?? 0}</div>
          <Link to="/cabinet/talks/new" className="mt-3 inline-flex text-sm font-semibold text-brand-700 hover:text-brand-900 dark:text-brand-200">
            {t("actions.addTalk")} →
          </Link>
        </div>
        <div className="card p-4">
          <div className="text-sm text-slate-500 dark:text-slate-300">{t("cabinet.profileCard")}</div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            {profileQuery.data?.surname} {profileQuery.data?.name}
          </div>
          <Link to="/cabinet/profile" className="mt-3 inline-flex text-sm font-semibold text-brand-700 hover:text-brand-900 dark:text-brand-200">
            {t("actions.edit")} →
          </Link>
        </div>
      </div>
    </div>
  );
}
