import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { adminListSectionResponsibles, adminSetSectionResponsibles } from "../../../shared/api";

export default function Responsibles() {
  const { t, i18n } = useTranslation();

  const query = useQuery({
    queryKey: ["admin-section-responsibles", i18n.language],
    queryFn: adminListSectionResponsibles,
  });

  const saveMutation = useMutation({
    mutationFn: ({ sectionId, emails }: { sectionId: string; emails: string[] }) => adminSetSectionResponsibles(sectionId, emails),
    onSuccess: () => query.refetch(),
  });

  const rows = useMemo(() => query.data || [], [query.data]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">{t("admin.responsibles")}</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("admin.responsiblesTitle")}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">{t("admin.responsiblesHint")}</p>
      </div>

      {query.isLoading ? (
        <div className="animate-pulse rounded-xl border border-dashed border-slate-300 p-6 text-slate-400 dark:border-slate-700">
          {t("actions.loading")}
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <ResponsibleCard
              key={row.sectionId}
              sectionTitle={i18n.language === "en" ? row.sectionTitleEn : row.sectionTitleRu}
              emails={row.emails}
              onSave={(emails) => saveMutation.mutate({ sectionId: row.sectionId, emails })}
              saving={saveMutation.isPending && saveMutation.variables?.sectionId === row.sectionId}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type CardProps = {
  sectionTitle: string;
  emails: string[];
  onSave: (emails: string[]) => void;
  saving: boolean;
  t: (key: string) => string;
};

function ResponsibleCard({ sectionTitle, emails, onSave, saving, t }: CardProps) {
  const [values, setValues] = useState<string[]>(["", "", ""]);

  useEffect(() => {
    setValues([emails[0] || "", emails[1] || "", emails[2] || ""]);
  }, [emails]);

  return (
    <div className="card space-y-3 p-4">
      <div className="text-sm font-semibold text-slate-900 dark:text-white">{sectionTitle}</div>
      <div className="grid gap-2 md:grid-cols-3">
        {values.map((value, idx) => (
          <input
            key={idx}
            id={`responsible-${sectionTitle}-${idx}`}
            value={value}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
            placeholder={t("fields.email")}
            onChange={(e) =>
              setValues((prev) => prev.map((v, i) => (i === idx ? e.target.value : v)))
            }
          />
        ))}
      </div>
      <button
        type="button"
        disabled={saving}
        onClick={() => onSave(values.filter((x) => x.trim().length > 0))}
        className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-60"
      >
        {saving ? t("actions.loading") : t("actions.save")}
      </button>
    </div>
  );
}
