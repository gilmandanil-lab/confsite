import { useTranslation } from "react-i18next";
import { BanknotesIcon } from "@heroicons/react/24/outline";

export default function Fee() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="card relative overflow-hidden p-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.12),transparent_30%)]" />
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          {t("fee.title")}
        </h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">
          {t("fee.subtitle")}
        </p>
      </div>

      {/* Fee Categories */}
      <div className="space-y-4">
        {/* Regular Participants */}
        <div className="card overflow-hidden border-l-4 border-l-brand-500 p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 pt-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
                <BanknotesIcon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
            </div>
            <div className="flex-grow">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                {t("fee.regularParticipants")}
              </h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                {t("fee.regularDesc")}
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {t("fee.earlyBird")}
                  </span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400">
                    {t("fee.regularEarly")}
                  </span>
                </div>
                <div className="flex justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {t("fee.regularFee")}
                  </span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400">
                    {t("fee.regularLate")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Young Scientists */}
        <div className="card overflow-hidden border-l-4 border-l-emerald-500 p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 pt-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <BanknotesIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="flex-grow">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                {t("fee.youngScientists")}
              </h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                {t("fee.youngScientistsDesc")}
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {t("fee.earlyBird")}
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {t("fee.youngEarly")}
                  </span>
                </div>
                <div className="flex justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {t("fee.regularFee")}
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {t("fee.youngLate")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Graduate Students */}
        <div className="card overflow-hidden border-l-4 border-l-sky-500 p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 pt-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/30">
                <BanknotesIcon className="h-6 w-6 text-sky-600 dark:text-sky-400" />
              </div>
            </div>
            <div className="flex-grow">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                {t("fee.gradStudents")}
              </h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                {t("fee.gradStudentsDesc")}
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {t("fee.earlyBird")}
                  </span>
                  <span className="font-semibold text-sky-600 dark:text-sky-400">
                    {t("fee.gradEarly")}
                  </span>
                </div>
                <div className="flex justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {t("fee.regularFee")}
                  </span>
                  <span className="font-semibold text-sky-600 dark:text-sky-400">
                    {t("fee.gradLate")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Accompanying Persons */}
        <div className="card overflow-hidden border-l-4 border-l-violet-500 p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 pt-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">
                <BanknotesIcon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
            </div>
            <div className="flex-grow">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                {t("fee.accompanying")}
              </h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                {t("fee.accompanyingDesc")}
              </p>
              <div className="mt-4">
                <div className="flex justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {t("fee.fee")}
                  </span>
                  <span className="font-semibold text-violet-600 dark:text-violet-400">
                    {t("fee.accompanyingFee")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Important Notes */}
      <div className="space-y-3">
        <div className="card border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-transparent p-6 dark:from-amber-900/20 dark:to-transparent">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            <span className="font-semibold">{t("fee.deadline")}:</span> {t("fee.deadlineDate")}
          </p>
        </div>
        <div className="card border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50 to-transparent p-6 dark:from-emerald-900/20 dark:to-transparent">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {t("fee.schoolExemption")}
          </p>
        </div>
        <div className="card border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-transparent p-6 dark:from-blue-900/20 dark:to-transparent">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {t("fee.note")}
          </p>
        </div>
      </div>
    </div>
  );
}
