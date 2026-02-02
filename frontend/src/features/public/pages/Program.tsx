import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { fetchPublicSections, fetchPublicProgram } from "../../../shared/api";
import { AdminTalkRow } from "../../../shared/types";
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";

interface TalkWithSection extends AdminTalkRow {
  sectionTitle: string;
}

interface ProgramFile {
  id: string;
  filename: string;
  file_path: string;
  uploaded_at: string;
}

export default function Program() {
  const { t, i18n } = useTranslation();

  const programFileQuery = useQuery({
    queryKey: ["program-file"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/public/program-file");
        if (!response.ok) return null;
        return (await response.json()) as ProgramFile;
      } catch {
        return null;
      }
    },
  });

  const sectionsQuery = useQuery({
    queryKey: ["public-sections"],
    queryFn: fetchPublicSections,
  });

  const talksQuery = useQuery({
    queryKey: ["public-program"],
    queryFn: fetchPublicProgram,
  });

  const groupedTalks = useMemo(() => {
    if (!talksQuery.data) return new Map<string, TalkWithSection[]>();

    const map = new Map<string, TalkWithSection[]>();
    
    talksQuery.data.forEach((talk) => {
      // Skip talks without section or schedule time
      if (!talk.sectionId) return;

      const sectionId = talk.sectionId;
      const sectionTitle = i18n.language === "en" ? talk.sectionTitleEn : talk.sectionTitleRu;
      
      if (!map.has(sectionId)) {
        map.set(sectionId, []);
      }

      map.get(sectionId)!.push({
        ...talk,
        sectionTitle: sectionTitle || "Unknown",
      });
    });

    // Sort talks within each section by schedule time
    map.forEach((talks) => {
      talks.sort((a, b) => {
        const timeA = a.scheduleTime ? new Date(a.scheduleTime).getTime() : Infinity;
        const timeB = b.scheduleTime ? new Date(b.scheduleTime).getTime() : Infinity;
        return timeA - timeB;
      });
    });

    return map;
  }, [talksQuery.data, i18n.language]);

  if (talksQuery.isLoading || sectionsQuery.isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-xl bg-slate-200 dark:bg-slate-700" />
        ))}
      </div>
    );
  }

  const sections = sectionsQuery.data || [];
  const sortedSections = sections.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  // If program file exists, show it
  if (programFileQuery.data) {
    return (
      <div className="space-y-6">
        <div className="card p-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            {t("nav.program")}
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">
            {t("program.subtitle")}
          </p>
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
                {new Date(programFileQuery.data.uploaded_at).toLocaleDateString(
                  i18n.language
                )}
              </p>
              <a
                href={programFileQuery.data.file_path}
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

  // Otherwise show placeholder message
  if (!talksQuery.isLoading && !sectionsQuery.isLoading && groupedTalks.size === 0) {
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

  // Show talks if available
  return (
    <div className="space-y-6">
      {sortedSections.map((section) => {
        const talks = groupedTalks.get(section.id) || [];
        const sectionTitle = i18n.language === "en" ? section.titleEn : section.titleRu;

        return (
          <div key={section.id} className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{sectionTitle}</h2>

            {talks.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400">{t("program.empty")}</p>
            ) : (
              <div className="space-y-3">
                {talks.map((talk) => {
                  const time = talk.scheduleTime ? new Date(talk.scheduleTime).toLocaleTimeString(i18n.language, {
                    hour: "2-digit",
                    minute: "2-digit",
                  }) : "-";

                  return (
                    <div key={talk.id} className="card space-y-2 border-l-4 border-brand-500 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">{time}</p>
                          <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{talk.title}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {talk.speakerFullName}
                            {talk.speakerAffiliation && ` • ${talk.speakerAffiliation}`}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          {t(`talks.kind.${talk.kind.toLowerCase()}`)}
                        </span>
                      </div>
                      {talk.abstract && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{talk.abstract}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
