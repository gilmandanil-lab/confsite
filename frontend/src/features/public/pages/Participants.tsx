import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { fetchPublicParticipants } from "../../../shared/api";
import { DataTable } from "../../../shared/ui/DataTable";
import { PublicParticipant } from "../../../shared/types";

export default function Participants() {
  const { t, i18n } = useTranslation();
  const participantsQuery = useQuery({
    queryKey: ["public-participants", i18n.language],
    queryFn: fetchPublicParticipants,
  });

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">{t("participants.subtitle")}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{t("participants.title")}</h1>
      </div>

      {participantsQuery.isLoading ? (
        <div className="animate-pulse rounded-xl border border-dashed border-slate-300 p-6 text-slate-400 dark:border-slate-700">
          {t("actions.loading")}
        </div>
      ) : (
        <DataTable<PublicParticipant>
          rows={participantsQuery.data || []}
          empty={t("participants.empty")}
          columns={[
            { header: t("participants.fullName"), render: (p) => p.fullName },
            { header: t("participants.affiliation"), render: (p) => p.affiliation },
            { header: t("participants.city"), render: (p) => p.city },
          ]}
        />
      )}
    </div>
  );
}
