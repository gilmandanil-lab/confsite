import { useTranslation } from "react-i18next";
import { adminExportParticipantsCSV, adminExportParticipantsXLSX, adminExportTalksBySectionXLSX } from "../../../shared/api";

export default function Exports() {
  const { t } = useTranslation();

  return (
    <div className="card space-y-4 p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">{t("admin.exports")}</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("admin.exportsTitle")}</h1>
        <p className="text-slate-600 dark:text-slate-300">{t("admin.exportsHint")}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <button
          onClick={() => adminExportParticipantsCSV()}
          className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800 shadow hover:-translate-y-[1px] hover:shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          CSV · {t("admin.exportParticipants")}
        </button>
        <button
          onClick={() => adminExportParticipantsXLSX()}
          className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800 shadow hover:-translate-y-[1px] hover:shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          XLSX · {t("admin.exportParticipants")}
        </button>
        <button
          onClick={() => adminExportTalksBySectionXLSX()}
          className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800 shadow hover:-translate-y-[1px] hover:shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          XLSX · {t("admin.exportTalks")}
        </button>
      </div>
    </div>
  );
}
