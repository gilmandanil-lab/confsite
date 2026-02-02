import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { fetchPublicNewsList } from "../../../shared/api";
import { NewsList } from "../ui/NewsList";

export default function NewsListPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const newsQuery = useQuery({
    queryKey: ["public-news", i18n.language],
    queryFn: fetchPublicNewsList,
  });

  const sorted = useMemo(() => {
    const items = newsQuery.data || [];
    return [...items].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  }, [newsQuery.data]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">{t("news.subtitle")}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{t("news.title")}</h1>
      </div>
      {newsQuery.isLoading ? (
        <div className="animate-pulse rounded-xl border border-dashed border-slate-300 p-6 text-slate-400 dark:border-slate-700">
          {t("actions.loading")}
        </div>
      ) : sorted.length ? (
        <NewsList items={sorted} onSelect={(id) => navigate(`/news/${id}`)} />
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 p-4 text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {t("news.empty")}
        </div>
      )}
    </div>
  );
}
