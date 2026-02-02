import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { adminListAudit } from "../../../shared/api";
import { DataTable } from "../../../shared/ui/DataTable";
import { AuditLogEntry } from "../../../shared/types";

export default function Audit() {
  const { t, i18n } = useTranslation();
  const auditQuery = useQuery({
    queryKey: ["admin-audit", i18n.language],
    queryFn: adminListAudit,
  });

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">{t("admin.audit")}</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("admin.auditTitle")}</h1>
      </div>

      {auditQuery.isLoading ? (
        <div className="animate-pulse rounded-xl border border-dashed border-slate-300 p-6 text-slate-400 dark:border-slate-700">
          {t("actions.loading")}
        </div>
      ) : (
        <DataTable<AuditLogEntry>
          rows={auditQuery.data || []}
          empty={t("admin.empty")}
          columns={[
            { header: "ID", render: (r) => r.id.slice(0, 6) },
            { header: t("admin.actor"), render: (r) => r.actorUserID || "-" },
            { header: t("admin.action"), render: (r) => r.action },
            { header: t("admin.entity"), render: (r) => `${r.entity} ${r.entityID || ""}` },
            {
              header: t("admin.when"),
              render: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleString(i18n.language) : ""),
            },
          ]}
        />
      )}
    </div>
  );
}
