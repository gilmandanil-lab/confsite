import { useTranslation } from "react-i18next";
import { CalendarIcon } from "@heroicons/react/24/outline";

export default function History() {
  const { t } = useTranslation();

  const conferences = [
    { year: "1966", cityKey: "history.cityKiev", title: t("history.conf1") },
    { year: "1968", cityKey: "history.cityMinsk", title: t("history.conf2") },
    { year: "1971", cityKey: "history.cityMoscow", title: t("history.conf3") },
    { year: "1975", cityKey: "history.cityKiev", title: t("history.conf4") },
    { year: "1979", cityKey: "history.cityKiev", title: t("history.conf5") },
    { year: "1983", cityKey: "history.cityLeningrad", title: t("history.conf6") },
    { year: "1987", cityKey: "history.cityTashkent", title: t("history.conf7") },
    { year: "1991", cityKey: "history.cityMinsk", title: t("history.conf8") },
    { year: "1995, 2001, 2004, 2007, 2011", cityKey: "history.cityPetrozavodsk", title: t("history.confMultiple") },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="card relative overflow-hidden p-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.12),transparent_30%)]" />
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          {t("history.title")}
        </h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">
          {t("history.subtitle")}
        </p>
      </div>

      {/* Description */}
      <div className="card p-6">
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          {t("history.description")}
        </p>
        <p className="mt-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          {t("history.periodicity")}
        </p>
        <p className="mt-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          {t("history.since2014")}
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t("history.conferences")}
        </h2>
        
        <div className="space-y-3">
          {conferences.map((conf, index) => (
            <div
              key={index}
              className="card overflow-hidden border-l-4 border-l-brand-500 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 pt-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
                      <CalendarIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {conf.year}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {t(conf.cityKey)}
                    </div>
                  </div>
                </div>
                <div className="text-slate-700 dark:text-slate-300 font-medium">
                  {conf.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div className="card bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 p-6">
        <p className="text-slate-700 dark:text-slate-300">
          <span className="font-semibold text-brand-700 dark:text-brand-400">
            {t("history.note")}
          </span>
          {t("history.noteText")}
        </p>
      </div>
    </div>
  );
}
