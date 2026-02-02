import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { adminCreateSection, adminListSections } from "../../../shared/api";
import { DataTable } from "../../../shared/ui/DataTable";
import { SectionDto } from "../../../shared/types";

type SectionForm = { titleRu: string; titleEn: string; sortOrder: number };

export default function Sections() {
  const { t } = useTranslation();
  const sectionsQuery = useQuery({
    queryKey: ["admin-sections"],
    queryFn: adminListSections,
  });

  const { register, handleSubmit, reset } = useForm<SectionForm>({
    defaultValues: { sortOrder: 0 },
  });

  const mutation = useMutation({
    mutationFn: adminCreateSection,
    onSuccess: () => {
      sectionsQuery.refetch();
      reset({ titleRu: "", titleEn: "", sortOrder: 0 });
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    await mutation.mutateAsync({
      titleRu: data.titleRu,
      titleEn: data.titleEn,
      sortOrder: Number(data.sortOrder) || 0,
    });
  });

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">{t("admin.sections")}</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("admin.sectionsTitle")}</h1>
      </div>

      <form onSubmit={onSubmit} className="card grid gap-3 p-4 md:grid-cols-[1fr_1fr_auto]">
        <input
          placeholder={t("admin.sectionRuPlaceholder")}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
          {...register("titleRu", { required: true })}
        />
        <input
          placeholder={t("admin.sectionEnPlaceholder")}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
          {...register("titleEn", { required: true })}
        />
        <input
          type="number"
          placeholder={t("admin.sort")}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
          {...register("sortOrder")}
        />
        <button
          type="submit"
          className="md:col-span-3 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow hover:-translate-y-[1px] hover:shadow-lg"
        >
          {t("actions.add")}
        </button>
      </form>

      {sectionsQuery.isLoading ? (
        <div className="animate-pulse rounded-xl border border-dashed border-slate-300 p-6 text-slate-400 dark:border-slate-700">
          {t("actions.loading")}
        </div>
      ) : (
        <DataTable<SectionDto>
          rows={sectionsQuery.data || []}
          empty={t("admin.empty")}
          columns={[
            { header: "ID", render: (s) => s.id.slice(0, 8) },
            { header: t("admin.sectionRu"), render: (s) => s.titleRu },
            { header: t("admin.sectionEn"), render: (s) => s.titleEn },
            { header: t("admin.sort"), render: (s) => s.sortOrder ?? 0 },
          ]}
        />
      )}
    </div>
  );
}
