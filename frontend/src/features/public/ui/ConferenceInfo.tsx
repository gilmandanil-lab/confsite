import { useTranslation } from "react-i18next";
import {
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

export function ConferenceInfo() {
  const { t } = useTranslation();

  const sections = [
    t("conference.section1"),
    t("conference.section2"),
    t("conference.section3"),
    t("conference.section4"),
    t("conference.section5"),
    t("conference.section6"),
    t("conference.section7"),
    t("conference.section8"),
    t("conference.section9"),
    t("conference.section10"),
    t("conference.section11"),
    t("conference.section12"),
  ];

  return (
    <div className="space-y-8">
      {/* Conference Header */}
      <div className="card p-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {t("conference.title")}
        </h2>
        <h3 className="mt-3 text-2xl font-bold text-blue-600 dark:text-blue-400">
          {t("conference.subtitle")}
        </h3>
        <p className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-300">
          {t("conference.dates")}
        </p>
      </div>

      {/* Committees */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Organizational Committee */}
        <div className="card p-6">
          <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
            {t("conference.orgCommittee")}
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                {t("conference.chair")}
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                {t("conference.petrov")}
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                {t("conference.viceChairs")}
              </p>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• {t("conference.kashapov")}</li>
                <li>• {t("conference.lebedev")}</li>
                <li>• {t("conference.abzalilova")}</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                {t("conference.scientificSecretary")}
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                {t("conference.chebakova")}
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                {t("conference.members")}
              </p>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• {t("conference.abdullin")}</li>
                <li>• {t("conference.akishev")}</li>
                <li>• {t("conference.aleksandrov")}</li>
                <li>• {t("conference.buznik")}</li>
                <li>• {t("conference.vasilevMM")}</li>
                <li>• {t("conference.vasilyak")}</li>
                <li>• {t("conference.gadzhiev")}</li>
                <li>• {t("conference.gaysin")}</li>
                <li>• {t("conference.golubev")}</li>
                <li>• {t("conference.zheltukhin")}</li>
                <li>• {t("conference.koval")}</li>
                <li>• {t("conference.lelevkin")}</li>
                <li>• {t("conference.ochkin")}</li>
                <li>• {t("conference.pominov")}</li>
                <li>• {t("conference.ramazanov")}</li>
                <li>• {t("conference.romanova")}</li>
                <li>• {t("conference.ryzhkov")}</li>
                <li>• {t("conference.smirnov")}</li>
                <li>• {t("conference.tarasenko")}</li>
                <li>• {t("conference.timerkaev")}</li>
                <li>• {t("conference.titov")}</li>
                <li>• {t("conference.khomich")}</li>
                <li>• {t("conference.shaekhov")}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Program Committee */}
        <div className="card p-6">
          <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
            {t("conference.programCommittee")}
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                {t("conference.chair")}
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                {t("conference.petrov")}
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                {t("conference.viceChairs")}
              </p>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• {t("conference.kashapov")}</li>
                <li>• {t("conference.lebedev")}</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                {t("conference.scientificSecretary")}
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                {t("conference.chebakova")}
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                {t("conference.members")}
              </p>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• {t("conference.abdullin")}</li>
                <li>• {t("conference.akishev")}</li>
                <li>• {t("conference.aleksandrov")}</li>
                <li>• {t("conference.buznik")}</li>
                <li>• {t("conference.vasilevMM")}</li>
                <li>• {t("conference.vasilyak")}</li>
                <li>• {t("conference.gadzhiev")}</li>
                <li>• {t("conference.gaysin")}</li>
                <li>• {t("conference.golubev")}</li>
                <li>• {t("conference.zheltukhin")}</li>
                <li>• {t("conference.koval")}</li>
                <li>• {t("conference.lelevkin")}</li>
                <li>• {t("conference.ochkin")}</li>
                <li>• {t("conference.pominov")}</li>
                <li>• {t("conference.ramazanov")}</li>
                <li>• {t("conference.romanova")}</li>
                <li>• {t("conference.ryzhkov")}</li>
                <li>• {t("conference.smirnov")}</li>
                <li>• {t("conference.tarasenko")}</li>
                <li>• {t("conference.timerkaev")}</li>
                <li>• {t("conference.titov")}</li>
                <li>• {t("conference.khomich")}</li>
                <li>• {t("conference.shaekhov")}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technical Committee */}
        <div className="card p-6">
          <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
            {t("conference.technicalCommittee")}
          </h3>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>• {t("conference.andrianov")}</li>
            <li>• {t("conference.akhmetov")}</li>
            <li>• {t("conference.kormushkin")}</li>
            <li>• {t("conference.pekunov")}</li>
            <li>• {t("conference.kashapovLN")}</li>
          </ul>
        </div>
      </div>

      {/* Conference Sections */}
      <div className="card p-8">
        <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
          {t("conference.sectionsConference")}
        </h3>
        <div className="grid gap-2 md:grid-cols-2">
          {sections.map((section, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <span className="mt-1 flex-shrink-0 text-blue-600 dark:text-blue-400">●</span>
              <span className="text-slate-700 dark:text-slate-300">{section}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Young Scientists School */}
      <div className="card border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-transparent p-8 dark:from-amber-900/20 dark:to-transparent">
        <h3 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">
          {t("conference.youngSchool")}
        </h3>
        <p className="font-semibold text-slate-800 dark:text-slate-200">
          {t("conference.youngSchoolSubtitle")}
        </p>
        <p className="mt-4 text-slate-700 dark:text-slate-300">
          {t("conference.youngSchoolGoal")}
        </p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {t("conference.youngSchoolParticipation")}
        </p>
      </div>

      {/* Important Note */}
      <div className="card border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-transparent p-6 dark:from-red-900/20 dark:to-transparent">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
           {t("conference.accommodation")}
        </p>
      </div>

      {/* Contacts */}
      <div id="contacts" className="card scroll-mt-28 p-8">
        <h3 className="mb-6 text-lg font-bold text-slate-900 dark:text-white">
          {t("conference.contacts")}
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex gap-4">
            <EnvelopeIcon className="mt-1 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("conference.email")}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                vchebakova1@yandex.ru
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <PhoneIcon className="mt-1 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("conference.phone")}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                +7 905 319-96-52
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <UserIcon className="mt-1 h-5 w-5 flex-shrink-0 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("conference.scientificSecretaryContact")}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("conference.violetta")}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <UserIcon className="mt-1 h-5 w-5 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("conference.conferenceSecretary")}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("conference.violetta")}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                +7 905 319-96-52
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
