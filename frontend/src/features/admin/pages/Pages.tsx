import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { adminListPages, adminUpsertPage } from "../../../shared/api";
import { DataTable } from "../../../shared/ui/DataTable";
import { PageDto } from "../../../shared/types";

type PageForm = {
  slug: string;
  titleRu: string;
  bodyRu: string;
  titleEn: string;
  bodyEn: string;
};

export default function PagesAdmin() {
  const { t } = useTranslation();
  const [editing, setEditing] = useState<PageDto | null>(null);

  const pagesQuery = useQuery({
    queryKey: ["admin-pages"],
    queryFn: adminListPages,
  });

  const { register, handleSubmit, reset } = useForm<PageForm>();

  useEffect(() => {
    if (editing) {
      reset({
        slug: editing.slug,
        titleRu: editing.titleRu,
        bodyRu: editing.bodyRu,
        titleEn: editing.titleEn,
        bodyEn: editing.bodyEn,
      });
    } else {
      reset({ slug: "", titleRu: "", bodyRu: "", titleEn: "", bodyEn: "" });
    }
  }, [editing, reset]);

  const mutation = useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: Omit<PageDto, "slug"> }) => adminUpsertPage(slug, data),
    onSuccess: () => {
      pagesQuery.refetch();
      setEditing(null);
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    const slug = data.slug.trim();
    if (!slug) return;
    await mutation.mutateAsync({
      slug,
      data: {
        titleRu: data.titleRu,
        bodyRu: data.bodyRu,
        titleEn: data.titleEn,
        bodyEn: data.bodyEn,
      },
    });
  });

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">{t("admin.pages")}</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("admin.pagesTitle")}</h1>
      </div>

      <form onSubmit={onSubmit} className="card space-y-3 p-4">
        <input
          placeholder={t("admin.pageSlug")}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
          {...register("slug", { required: true })}
          disabled={Boolean(editing)}
        />
        <div className="grid gap-3 md:grid-cols-2">
          <input
            placeholder={t("admin.pageTitleRu")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
            {...register("titleRu", { required: true })}
          />
          <input
            placeholder={t("admin.pageTitleEn")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
            {...register("titleEn", { required: true })}
          />
        </div>
        <textarea
          rows={4}
          placeholder={t("admin.pageBodyRu")}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
          {...register("bodyRu", { required: true })}
        />
        <textarea
          rows={4}
          placeholder={t("admin.pageBodyEn")}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
          {...register("bodyEn", { required: true })}
        />
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

      {pagesQuery.isLoading ? (
        <div className="animate-pulse rounded-xl border border-dashed border-slate-300 p-6 text-slate-400 dark:border-slate-700">
          {t("actions.loading")}
        </div>
      ) : (
        <DataTable<PageDto>
          rows={pagesQuery.data || []}
          empty={t("admin.empty")}
          columns={[
            { header: "Slug", render: (p) => p.slug },
            { header: t("admin.pageTitleRu"), render: (p) => p.titleRu },
            { header: t("admin.pageTitleEn"), render: (p) => p.titleEn },
            {
              header: t("actions.actions"),
              render: (p) => (
                <button
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100"
                  onClick={() => setEditing(p)}
                >
                  {t("actions.edit")}
                </button>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
