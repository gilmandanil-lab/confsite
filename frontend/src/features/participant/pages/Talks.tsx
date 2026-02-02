import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { deleteTalk, fetchMyTalks, fetchPublicSections } from "../../../shared/api";
import { TalkDto } from "../../../shared/types";

export default function Talks() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const talksQuery = useQuery({
    queryKey: ["my-talks", i18n.language],
    queryFn: fetchMyTalks,
  });
  const sectionsQuery = useQuery({
    queryKey: ["public-sections", i18n.language],
    queryFn: fetchPublicSections,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTalk,
    onSuccess: () => talksQuery.refetch(),
  });

  const talkLimitReached = (talksQuery.data?.length || 0) >= 3;

  const resolveSection = (talk: TalkDto) => {
    if (!talk.sectionId) return "-";
    const sec = sectionsQuery.data?.find((s) => s.id === talk.sectionId);
    if (!sec) return "-";
    return sec.title;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">{t("cabinet.talks")}</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("talks.myTalks")}</h1>
          <p className="text-slate-600 dark:text-slate-300">{t("talks.rules")}</p>
        </div>
        <button
          onClick={() => navigate("/cabinet/talks/new")}
          disabled={talkLimitReached}
          className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-[2px] hover:shadow-xl disabled:opacity-50"
        >
          {t("actions.addTalk")}
        </button>
      </div>

      {talkLimitReached ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-100">
          {t("talks.limitReached")}
        </div>
      ) : null}

      {talksQuery.isLoading ? (
        <div className="animate-pulse rounded-xl border border-dashed border-slate-300 p-6 text-slate-400 dark:border-slate-700">
          {t("actions.loading")}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {(talksQuery.data || []).map((talk) => (
            <div key={talk.id} className="card space-y-2 p-4">
              <div className="flex items-center justify-between">
                <div className="pill bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-100">{t(`talks.kind.${talk.kind.toLowerCase()}`)}</div>
                <div className="text-xs uppercase text-slate-500 dark:text-slate-300">{resolveSection(talk)}</div>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{talk.title}</h3>
              <div className="text-sm text-slate-600 dark:text-slate-300">{talk.affiliation}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {talk.authors.map((a) => `${a.fullName} (${a.affiliation})`).join("; ")}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Link to={`/cabinet/talks/${talk.id}`} className="text-sm font-semibold text-brand-700 hover:text-brand-900 dark:text-brand-200">
                  {t("actions.edit")}
                </Link>
                <button
                  onClick={() => deleteMutation.mutate(talk.id)}
                  className="text-sm font-semibold text-red-600 hover:text-red-700 dark:text-red-300"
                >
                  {t("actions.delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
