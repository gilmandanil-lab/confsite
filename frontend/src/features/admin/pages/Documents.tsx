import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { apiUpload } from "../../../shared/api/client";
import { fetchAdminDocumentTemplates } from "../../../shared/api";

export default function Documents() {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const documentsQuery = useQuery({
    queryKey: ["admin-documents"],
    queryFn: fetchAdminDocumentTemplates,
  });

  const uploadMutation = useMutation({
    mutationFn: (payload: { file: File; documentType: string }) => {
      const formData = new FormData();
      formData.append("file", payload.file);
      formData.append("type", payload.documentType);
      return apiUpload<{ ok: boolean; url: string }>(
        "/api/admin/documents/template",
        formData
      );
    },
    onSuccess: () => {
      documentsQuery.refetch();
      setUploading(false);
      setError(null);
    },
    onError: (err: any) => {
      setError(err?.message || t("admin.uploadError"));
      setUploading(false);
    },
  });

  const handleUpload = async (
    file: File | undefined,
    documentType: string
  ) => {
    if (!file) return;

    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.type)) {
      setError(t("registration.badFile"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(t("registration.fileTooLarge"));
      return;
    }

    setUploading(true);
    await uploadMutation.mutateAsync({ file, documentType });
  };

  const documentTypes = [
    { id: "CONSENT_DATA_PROCESSING", label: "Consent to Data Processing" },
    { id: "CONSENT_DATA_TRANSFER", label: "Consent to Data Transfer" },
    { id: "ABSTRACT_TEMPLATE", label: "Abstract Template" },
    { id: "LICENSE_AGREEMENT", label: "License Agreement" },
  ];

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Document Templates
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          Upload and manage document templates for conference participants
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/40 dark:text-red-100">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {documentTypes.map((docType) => {
          const template = documentsQuery.data?.find(
            (t) => t.documentType === docType.id
          );
          return (
            <div key={docType.id} className="card p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {docType.label}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                {docType.id}
              </p>

              {template ? (
                <div className="space-y-2 mb-4">
                  <div className="text-xs">
                    <p className="text-slate-600 dark:text-slate-300">
                      <span className="font-semibold">Version:</span>{" "}
                      {template.version}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      <span className="font-semibold">Updated:</span>{" "}
                      {new Date(template.updatedAt).toLocaleDateString()}
                    </p>
                    {template.fileSize && (
                      <p className="text-slate-600 dark:text-slate-300">
                        <span className="font-semibold">Size:</span>{" "}
                        {(template.fileSize / 1024).toFixed(2)} KB
                      </p>
                    )}
                  </div>
                  {template.fileURL && (
                    <a
                      href={template.fileURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-xs text-brand-600 hover:text-brand-700 underline dark:text-brand-400"
                    >
                      View current →
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  No template uploaded
                </p>
              )}

              <label className="inline-block cursor-pointer rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition">
                {uploading ? t("actions.loading") : t("actions.upload")}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => handleUpload(e.target.files?.[0], docType.id)}
                />
              </label>
            </div>
          );
        })}
      </div>

      {documentsQuery.isLoading && (
        <div className="text-center text-slate-500">{t("actions.loading")}</div>
      )}
    </div>
  );
}
