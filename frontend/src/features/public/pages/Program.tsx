import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import { fetchPublicProgramFile } from "../../../shared/api";

export default function Program() {
  const { t, i18n } = useTranslation();

  const programFileQuery = useQuery({
    queryKey: ["program-file"],
    queryFn: fetchPublicProgramFile,
  });

  if (programFileQuery.isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 rounded-xl bg-slate-200 dark:bg-slate-700" />
        <div className="h-40 rounded-xl bg-slate-200 dark:bg-slate-700" />
      </div>
    );
  }

  // Show file after admin uploads conference program.
  if (programFileQuery.data) {
    return (
      <div className="space-y-6">
        <div className="card p-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            {t("nav.program")}
          </h1>
        </div>

        <div className="card border-l-4 border-l-brand-500 p-8">
          <div className="flex items-start gap-4">
            <DocumentArrowDownIcon className="mt-1 h-8 w-8 flex-shrink-0 text-brand-600 dark:text-brand-400" />
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                {programFileQuery.data.filename}
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {t("program.uploaded")}{" "}
                {new Date(programFileQuery.data.uploadedAt).toLocaleDateString(
                  i18n.language
                )}
              </p>
              <a
                href={programFileQuery.data.filePath}
                download
                className="mt-4 inline-flex rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white transition hover:bg-brand-700"
              >
                <DocumentArrowDownIcon className="mr-2 h-5 w-5" />
                {t("program.programFile")}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card p-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          {t("nav.program")}
        </h1>
      </div>

      <div className="card border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-transparent p-8 dark:from-amber-900/20 dark:to-transparent">
        <p className="text-lg text-slate-700 dark:text-slate-300">
          {t("program.comingSoon")}
        </p>
      </div>
    </div>
  );
}
