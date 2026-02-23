import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { adminListTalks, adminUpdateTalk, adminListSections, adminSetTalkStatus } from "../../../shared/api";
import { DataTable } from "../../../shared/ui/DataTable";
import { AdminTalkRow, TalkAuthor, UserStatus } from "../../../shared/types";

type UpdateTalkForm = {
  sectionId?: string;
  scheduleTime?: string;
};

export default function AdminTalks() {
  const { t, i18n } = useTranslation();
  const [editing, setEditing] = useState<AdminTalkRow | null>(null);
  const [abstractModal, setAbstractModal] = useState<{ title: string; abstract: string } | null>(null);

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

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) => adminSetTalkStatus(id, status),
    onSuccess: () => {
      talksQuery.refetch();
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
              header: t("status.label"),
              render: (r) => (
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    r.status === "APPROVED"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
                      : r.status === "REJECTED"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200"
                  }`}
                >
                  {t(`status.${r.status.toLowerCase()}`)}
                </span>
              ),
            },
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
                r.abstract ? (
                  <button
                    className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
                    onClick={() => setAbstractModal({ title: r.title, abstract: r.abstract })}
                  >
                    {t("actions.expand")}
                  </button>
                ) : (
                  <span className="text-xs text-slate-400">-</span>
                )
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
                <div>
                  <button
                    type="button"
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100"
                    onClick={() => setEditing(r)}
                  >
                    {t("actions.edit")}
                  </button>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(["WAITING", "APPROVED", "REJECTED"] as UserStatus[]).map((status) => (
                      <button
                        type="button"
                        key={status}
                        onClick={() => statusMutation.mutate({ id: r.id, status })}
                        className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                          r.status === status
                            ? "bg-brand-700 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100"
                        }`}
                      >
                        {t(`status.${status.toLowerCase()}`)}
                      </button>
                    ))}
                  </div>
                </div>
              ),
            },
          ]}
        />
      )}

      {abstractModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setAbstractModal(null)}>
          <div
            className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{abstractModal.title}</h2>
              <button
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                onClick={() => setAbstractModal(null)}
              >
                {t("actions.close")}
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">
              {abstractModal.abstract}
            </div>
          </div>
        </div>
      ) : null}
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
