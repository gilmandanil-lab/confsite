import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { fetchPublicPage } from "../../../shared/api";
import { MarkdownView } from "../../../shared/ui/MarkdownView";

export default function Page() {
  const { slug = "" } = useParams();
  const { t, i18n } = useTranslation();

  const pageQuery = useQuery({
    queryKey: ["public-page", slug, i18n.language],
    queryFn: () => fetchPublicPage(slug),
    enabled: Boolean(slug),
  });

  if (!slug) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">{t("pages.subtitle")}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{t("pages.title")}</h1>
        </div>
        <div className="pill bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-100">{slug}</div>
      </div>
      {pageQuery.isLoading ? (
        <div className="animate-pulse rounded-xl border border-dashed border-slate-300 p-6 text-slate-400 dark:border-slate-700">
          {t("actions.loading")}
        </div>
      ) : pageQuery.isError ? (
        <div className="rounded-xl border border-dashed border-red-200 bg-red-50/60 p-6 text-red-700 dark:border-red-800 dark:bg-red-900/40 dark:text-red-100">
          {t("pages.notFound")}
        </div>
      ) : (
        <div className="card p-6">
          <MarkdownView content={`# ${pageQuery.data?.title}\n\n${pageQuery.data?.body}`} />
        </div>
      )}
    </div>
  );
}
