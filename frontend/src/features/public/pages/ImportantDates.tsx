import { useTranslation } from "react-i18next";
import { CalendarIcon } from "@heroicons/react/24/outline";

export default function ImportantDates() {
  const { t } = useTranslation();

  const dates = [
    {
      event: t("importantDates.firstNotification"),
      date: t("importantDates.firstNotificationDate"),
    },
    {
      event: t("importantDates.secondNotification"),
      date: t("importantDates.secondNotificationDate"),
    },
    {
      event: t("importantDates.registration"),
      date: t("importantDates.registrationDate"),
    },
    {
      event: t("importantDates.abstracts"),
      date: t("importantDates.abstractsDate"),
    },
    {
      event: t("importantDates.fee"),
      date: t("importantDates.feeDate"),
    },
    {
      event: t("importantDates.invitations"),
      date: t("importantDates.invitationsDate"),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="card relative overflow-hidden p-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.12),transparent_30%)]" />
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          {t("importantDates.title")}
        </h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">
          {t("importantDates.subtitle")}
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {dates.map((item, index) => (
          <div
            key={index}
            className="card flex gap-4 border-l-4 border-l-brand-500 p-6 transition hover:shadow-lg"
          >
            <div className="flex-shrink-0 pt-1">
              <CalendarIcon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {item.event}
              </h3>
              <p className="mt-1 text-base font-medium text-brand-600 dark:text-brand-400">
                {item.date}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Important Note */}
      <div className="card border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-transparent p-6 dark:from-amber-900/20 dark:to-transparent">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          <span className="font-semibold">💡 Note:</span> All dates are indicated as deadlines. Please submit all
          required materials before these dates to ensure timely processing.
        </p>
      </div>
    </div>
  );
}
