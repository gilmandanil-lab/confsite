import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { fetchPublicNewsItem } from "../../../shared/api";
import { MarkdownView } from "../../../shared/ui/MarkdownView";

export default function NewsDetailsPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const newsQuery = useQuery({
    queryKey: ["public-news", id, i18n.language],
    queryFn: () => fetchPublicNewsItem(id || ""),
    enabled: Boolean(id),
  });

  if (!id) return null;

  const date = newsQuery.data?.publishedAt ? new Date(newsQuery.data.publishedAt) : null;

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="text-sm font-semibold text-brand-700 hover:text-brand-900 dark:text-brand-200"
      >
        ← {t("actions.back")}
      </button>
      {newsQuery.isLoading ? (
        <div className="animate-pulse rounded-xl border border-dashed border-slate-300 p-6 text-slate-400 dark:border-slate-700">
          {t("actions.loading")}
        </div>
      ) : newsQuery.isError ? (
        <div className="rounded-xl border border-dashed border-red-200 bg-red-50/60 p-6 text-red-700 dark:border-red-800 dark:bg-red-900/40 dark:text-red-100">
          {t("news.notFound")}
        </div>
      ) : (
        <article className="card p-6">
          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-300">
            {date
              ? new Intl.DateTimeFormat(i18n.language || "ru", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }).format(date)
              : null}
            {newsQuery.data?.pinned ? (
              <span className="pill bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-100">
                {t("news.pinned")}
              </span>
            ) : null}
          </div>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{newsQuery.data?.title}</h1>
          <div className="mt-4">
            <MarkdownView content={newsQuery.data?.body || ""} />
          </div>
        </article>
      )}
    </div>
  );
}
