import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import {
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { apiDelete, apiUpload } from "../../../shared/api/client";
import { fetchPublicProgramFile } from "../../../shared/api";

export function ProgramFileManager() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const programFileQuery = useQuery({
    queryKey: ["admin-program-file"],
    queryFn: fetchPublicProgramFile,
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await apiUpload<{ ok: boolean }>("/api/admin/program/file", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-program-file"] });
      queryClient.invalidateQueries({ queryKey: ["program-file"] });
      setFile(null);
      setUploadError(null);
    },
    onError: (error: Error) => {
      setUploadError(error.message || t("admin.uploadError"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await apiDelete<{ ok: boolean }>("/api/admin/program/file");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-program-file"] });
      queryClient.invalidateQueries({ queryKey: ["program-file"] });
    },
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploadError(null);
    const formData = new FormData();
    formData.append("file", file);
    uploadMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Управление программой конференции
        </h3>

        {programFileQuery.data ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <DocumentArrowDownIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {programFileQuery.data.filename}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Загруженно:{" "}
                    {new Date(programFileQuery.data.uploadedAt).toLocaleDateString(
                      "ru-RU"
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>

            <details className="cursor-pointer rounded-lg border border-slate-200 p-4 dark:border-slate-700">
              <summary className="font-semibold text-slate-900 dark:text-white">
                Заменить файл
              </summary>
              <div className="mt-4 space-y-3">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-slate-600 dark:text-slate-400"
                />
                <button
                  onClick={handleUpload}
                  disabled={!file || uploadMutation.isPending}
                  className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
                >
                  <DocumentArrowUpIcon className="mr-2 inline h-4 w-4" />
                  Загрузить
                </button>
              </div>
            </details>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-400">
              Программа конференции еще не загружена
            </p>
            <div className="space-y-3">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-600 dark:text-slate-400"
              />
              <button
                onClick={handleUpload}
                disabled={!file || uploadMutation.isPending}
                className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
              >
                <DocumentArrowUpIcon className="mr-2 inline h-4 w-4" />
                Загрузить программу
              </button>
            </div>
          </div>
        )}
        {uploadError ? (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{uploadError}</p>
        ) : null}
      </div>
    </div>
  );
}
