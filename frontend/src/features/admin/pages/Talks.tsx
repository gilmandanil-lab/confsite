import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { adminListTalks, adminUpdateTalk, adminListSections } from "../../../shared/api";
import { DataTable } from "../../../shared/ui/DataTable";
import { AdminTalkRow, TalkAuthor, SectionDto } from "../../../shared/types";

type UpdateTalkForm = {
  sectionId?: string;
  scheduleTime?: string;
};

export default function AdminTalks() {
  const { t, i18n } = useTranslation();
  const [editing, setEditing] = useState<AdminTalkRow | null>(null);

  const talksQuery = useQuery({
    queryKey: ["admin-talks", i18n.language],
    queryFn: adminListTalks,
  });

  const sectionsQuery = useQuery({
    queryKey: ["admin-sections"],
    queryFn: adminListSections,
  });

  const { register, handleSubmit, reset } = useForm<UpdateTalkForm>();

  useEffect(() => {
    if (editing) {
      const scheduleDateStr = editing.scheduleTime 
        ? new Date(editing.scheduleTime).toISOString().slice(0, 16)
        : "";
      reset({
        sectionId: editing.sectionId || "",
        scheduleTime: scheduleDateStr,
      });
    } else {
      reset({ sectionId: "", scheduleTime: "" });
    }
  }, [editing, reset]);

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTalkForm }) =>
      adminUpdateTalk(id, {
        sectionId: data.sectionId || null,
        scheduleTime: data.scheduleTime ? data.scheduleTime : null,
      }),
    onSuccess: () => {
      console.log("Talk updated successfully");
      talksQuery.refetch();
      setEditing(null);
    },
    onError: (error) => {
      console.error("Error updating talk:", error);
    },
  });

  const onSubmit = handleSubmit((data) => {
    if (!editing) return;
    mutation.mutate({ id: editing.id, data });
  });

  const rows = useMemo(() => {
    return (talksQuery.data || []).map((t) => ({
      ...t,
      authors: parseAuthors(t.authorsJSON),
    }));
  }, [talksQuery.data]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">{t("admin.talks")}</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("admin.talksTitle")}</h1>
      </div>

      {editing && (
        <form onSubmit={onSubmit} className="card space-y-3 p-4">
          <div className="mb-3 border-b border-slate-200 pb-3 dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{editing.title}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">{editing.speakerFullName}</p>
          </div>

          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
            {...register("sectionId")}
          >
            <option value="">{t("admin.noSection")}</option>
            {(sectionsQuery.data || []).map((s) => (
              <option key={s.id} value={s.id}>
                {i18n.language === "en" ? s.titleEn : s.titleRu}
              </option>
            ))}
          </select>

          <input
            type="datetime-local"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
            {...register("scheduleTime")}
            placeholder="Schedule time"
          />

          <div className="flex gap-3">
            <button type="submit" className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow">
              {t("actions.save")}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              {t("actions.cancel")}
            </button>
          </div>
        </form>
      )}

      {talksQuery.isLoading ? (
        <div className="animate-pulse rounded-xl border border-dashed border-slate-300 p-6 text-slate-400 dark:border-slate-700">
          {t("actions.loading")}
        </div>
      ) : (
        <DataTable<
          AdminTalkRow & {
            authors: TalkAuthor[];
          }
        >
          rows={rows}
          empty={t("admin.empty")}
          columns={[
            { header: t("talks.title"), render: (r) => r.title },
            { header: t("talks.kind.label"), render: (r) => t(`talks.kind.${r.kind.toLowerCase()}`) },
            {
              header: t("talks.section"),
              render: (r) => {
                const title = i18n.language === "en" ? r.sectionTitleEn : r.sectionTitleRu;
                return title || "-";
              },
            },
            { header: t("admin.speaker"), render: (r) => r.speakerFullName },
            { header: t("participants.city"), render: (r) => r.speakerCity },
            { header: t("participants.affiliation"), render: (r) => r.speakerAffiliation },
            {
              header: t("talks.authors"),
              render: (r) => r.authors.map((a) => `${a.fullName} (${a.affiliation})`).join("; "),
            },
            {
              header: t("talks.abstract"),
              render: (r) => (
                <span className="line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
                  {r.abstract || "-"}
                </span>
              ),
            },
            {
              header: t("talks.file"),
              render: (r) => (
                r.fileUrl ? (
                  <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600 hover:underline dark:text-brand-400">
                    {t("actions.download")}
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">-</span>
                )
              ),
            },
            {
              header: t("actions.actions"),
              render: (r) => (
                <button
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100"
                  onClick={() => setEditing(r)}
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

function parseAuthors(raw: string): TalkAuthor[] {
  try {
    const val = typeof raw === "string" ? JSON.parse(raw) : [];
    if (Array.isArray(val)) return val;
    return [];
  } catch {
    return [];
  }
}
