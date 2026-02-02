import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { adminCreateNews, adminDeleteNews, adminListNews, adminUpdateNews } from "../../../shared/api";
import { DataTable } from "../../../shared/ui/DataTable";
import { NewsDto } from "../../../shared/types";

type NewsForm = {
  titleRu: string;
  bodyRu: string;
  titleEn: string;
  bodyEn: string;
  pinned: boolean;
};

export default function NewsAdmin() {
  const { t } = useTranslation();
  const [editing, setEditing] = useState<NewsDto | null>(null);

  const newsQuery = useQuery({
    queryKey: ["admin-news"],
    queryFn: adminListNews,
  });

  const { register, handleSubmit, reset } = useForm<NewsForm>();

  useEffect(() => {
    if (editing) {
      reset({
        titleRu: editing.titleRu,
        bodyRu: editing.bodyRu,
        titleEn: editing.titleEn,
        bodyEn: editing.bodyEn,
        pinned: editing.pinned,
      });
    } else {
      reset({
        titleRu: "",
        bodyRu: "",
        titleEn: "",
        bodyEn: "",
        pinned: false,
      });
    }
  }, [editing, reset]);

  const createMutation = useMutation({
    mutationFn: adminCreateNews,
    onSuccess: () => {
      newsQuery.refetch();
      setEditing(null);
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: NewsForm }) => adminUpdateNews(id, data),
    onSuccess: () => {
      newsQuery.refetch();
      setEditing(null);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: adminDeleteNews,
    onSuccess: () => newsQuery.refetch(),
  });

  const onSubmit = handleSubmit(async (data) => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  });

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">{t("admin.news")}</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("admin.newsTitle")}</h1>
      </div>

      <form onSubmit={onSubmit} className="card space-y-3 p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <input
            placeholder={t("admin.newsTitleRu")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
            {...register("titleRu", { required: true })}
          />
          <input
            placeholder={t("admin.newsTitleEn")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
            {...register("titleEn", { required: true })}
          />
        </div>
        <textarea
          rows={4}
          placeholder={t("admin.newsBodyRu")}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
          {...register("bodyRu", { required: true })}
        />
        <textarea
          rows={4}
          placeholder={t("admin.newsBodyEn")}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
          {...register("bodyEn", { required: true })}
        />
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <input type="checkbox" className="h-4 w-4" {...register("pinned")} />
          {t("news.pinned")}
        </label>
        <div className="flex gap-3">
          <button type="submit" className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow">
            {editing ? t("actions.save") : t("actions.create")}
          </button>
          {editing ? (
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              {t("actions.cancel")}
            </button>
          ) : null}
        </div>
      </form>

      {newsQuery.isLoading ? (
        <div className="animate-pulse rounded-xl border border-dashed border-slate-300 p-6 text-slate-400 dark:border-slate-700">
          {t("actions.loading")}
        </div>
      ) : (
        <DataTable<NewsDto>
          rows={newsQuery.data || []}
          empty={t("admin.empty")}
          columns={[
            { header: "ID", render: (n) => n.id.slice(0, 6) },
            { header: t("admin.newsTitleRu"), render: (n) => n.titleRu },
            { header: t("admin.newsTitleEn"), render: (n) => n.titleEn },
            { header: t("news.pinned"), render: (n) => (n.pinned ? "✓" : "-") },
            {
              header: t("actions.actions"),
              render: (n) => (
                <div className="flex gap-2">
                  <button
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100"
                    onClick={() => setEditing(n)}
                  >
                    {t("actions.edit")}
                  </button>
                  <button
                    className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-100"
                    onClick={() => deleteMutation.mutate(n.id)}
                  >
                    {t("actions.delete")}
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
