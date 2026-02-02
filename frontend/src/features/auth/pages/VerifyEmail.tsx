import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { verifyEmail } from "../../../shared/api";

export default function VerifyEmail() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get("token") || "";

  const verifyQuery = useQuery({
    queryKey: ["verify-email", token, i18n.language],
    queryFn: () => verifyEmail(token),
    enabled: Boolean(token),
  });

  return (
    <div className="card space-y-4 p-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("auth.verifyTitle")}</h1>
      {verifyQuery.isLoading ? (
        <div className="text-slate-500 dark:text-slate-300">{t("actions.loading")}</div>
      ) : verifyQuery.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50/60 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/40 dark:text-red-100">
          {t("auth.verifyError")}
        </div>
      ) : (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100">
          {t("auth.verifySuccess")}
        </div>
      )}
      <div className="flex gap-3">
        <Link to="/login" className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow">
          {t("actions.login")}
        </Link>
        <Link to="/" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-100">
          {t("actions.back")}
        </Link>
      </div>
    </div>
  );
}
