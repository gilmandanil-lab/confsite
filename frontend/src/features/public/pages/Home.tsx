import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { fetchPublicNewsList } from "../../../shared/api";
import { NewsList } from "../ui/NewsList";
import { ConferenceInfo } from "../ui/ConferenceInfo";

export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const newsQuery = useQuery({
    queryKey: ["public-news", i18n.language],
    queryFn: fetchPublicNewsList,
  });

  const pinnedNews = (newsQuery.data || []).filter((n) => n.pinned).slice(0, 3);

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-700/60 dark:bg-brand-900/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t("home.infoLetterTitle")}</h2>
          <a
            href="/docs/information-letter-fntp-2026.pdf"
            download
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-500"
          >
            {t("home.infoLetterDownload")}
          </a>
        </div>
      </section>

      <ConferenceInfo />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t("home.newsTitle")}</h2>
          <button onClick={() => navigate("/news")} className="text-sm font-semibold text-brand-700 hover:text-brand-900 dark:text-brand-200">
            {t("actions.viewAll")}
          </button>
        </div>
        {newsQuery.isLoading ? (
          <div className="animate-pulse rounded-xl border border-dashed border-slate-300 p-6 text-slate-400 dark:border-slate-700" />
        ) : pinnedNews.length ? (
          <NewsList items={pinnedNews} onSelect={(id) => navigate(`/news/${id}`)} />
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 p-4 text-slate-500 dark:border-slate-700 dark:text-slate-400">
            {t("news.empty")}
          </div>
        )}
      </div>
    </div>
  );
}
